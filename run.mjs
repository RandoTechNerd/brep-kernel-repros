// Run the cases and models through a build of the next.BREP.io Rust kernel.
//
//   node run.mjs <kernel dir> [cases|models|all] [name ...]
//   node run.mjs <kernel dir> models --baseline     (re-record models/baseline.json)
//
// <kernel dir> holds brep_kernel.js + brep_kernel_bg.wasm (wasm-pack --target web).
// cases/: small models for one behaviour each, checked against case.json.
// models/: every BREPcode catalog model and example, checked against the volume
// recorded in models/baseline.json. Nothing here needs anything but the kernel.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { resolve, join, dirname } from "node:path";

const args = process.argv.slice(2);
const record = args.includes("--baseline");
const [kernelDir, suiteArg, ...only] = args.filter((a) => a !== "--baseline");
if (!kernelDir) {
  console.error("usage: node run.mjs <kernel pkg dir> [cases|models|all] [name ...]");
  process.exit(2);
}
const suite = ["cases", "models", "all"].includes(suiteArg) ? suiteArg : "all";
if (suiteArg && suite === "all" && suiteArg !== "all") only.unshift(suiteArg);
const rk = await import(pathToFileURL(resolve(kernelDir, "brep_kernel.js")).href);
rk.initSync({ module: readFileSync(resolve(kernelDir, "brep_kernel_bg.wasm")) });
const here = dirname(fileURLToPath(import.meta.url));

// run one history; the solids left standing, with their exact volume
function execute(file) {
  const doc = readFileSync(file, "utf8");
  rk.clear_history_cache_json?.();
  const t0 = performance.now();
  let res;
  try { res = JSON.parse(rk.execute_history_json(doc)); }
  catch (e) { return { error: String(e?.message || e) }; }
  const ms = performance.now() - t0;
  const live = new Map();
  for (const r of res.results) {
    if (r.error) return { error: `${r.feature_type} ${r.id}: ${r.error}` };
    for (const n of r.removed) live.delete(n);
    for (const a of r.added) live.set(a.name, a);
  }
  let volume = 0;
  for (const a of live.values()) volume += JSON.parse(rk.mass_properties_handle(a.handle)).volume;
  return { volume, solids: live.size, ms };
}

const fmt = (v) => (v == null ? "-" : Math.abs(v) < 0.01 && v !== 0 ? v.toExponential(6) : v.toFixed(3));
const near = (v, c) => Math.abs(v - c.expected) <= (c.relTolerance != null ? c.relTolerance * Math.max(Math.abs(c.expected), 1e-300) : c.tolerance);
let pass = 0, fail = 0;

if (suite !== "models") {
  console.log("cases/\n");
  const dir = join(here, "cases");
  for (const name of readdirSync(dir).sort()) {
    if (only.length && !only.includes(name)) continue;
    const spec = JSON.parse(readFileSync(join(dir, name, "case.json"), "utf8"));
    const run = Object.fromEntries(Object.keys(spec.histories).map((k) => [k, execute(join(dir, name, `${k}.json`))]));
    const err = Object.entries(run).find(([, r]) => r.error);
    const c = spec.check;
    let ok, detail;
    if (err) {
      ok = false;
      detail = `${err[0]} refused: ${err[1].error}`;
    } else if (c.type === "volume") {
      const v = run[c.of].volume;
      ok = near(v, c);
      detail = `${c.of} ${fmt(v)} mm³, expected ${fmt(c.expected)}`;
    } else if (c.type === "grows") {
      // no closed form: more than the part it started from, less than the cap
      const v = run[c.of].volume, v0 = run[c.from].volume;
      ok = v > v0 + 1 && v < c.below;
      detail = `${c.of} ${fmt(v)} mm³, must be between ${fmt(v0)} and ${c.below}`;
    } else if (c.type === "builds") {
      ok = run[c.of].solids > 0;
      detail = `${c.of} built, ${fmt(run[c.of].volume)} mm³`;
    }
    ok ? pass++ : fail++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
  }
}

if (suite !== "cases") {
  console.log("\nmodels/ (volume against models/baseline.json)\n");
  const basePath = join(here, "models", "baseline.json");
  const base = existsSync(basePath) && !record ? JSON.parse(readFileSync(basePath, "utf8")) : { kernel: kernelDir, models: {} };
  const index = JSON.parse(readFileSync(join(here, "models", "index.json"), "utf8")).filter((r) => r.file);
  let ms = 0;
  for (const m of index) {
    const key = `${m.kind}/${m.id}`;
    if (only.length && !only.includes(m.id) && !only.includes(key)) continue;
    const r = execute(join(here, "models", m.file));
    if (record) {
      base.models[key] = r.error ? { refused: r.error.slice(0, 300) } : { volume: r.volume, solids: r.solids };
      console.log(`${r.error ? "REFUSED" : "built  "}  ${key}${r.error ? `: ${r.error.slice(0, 120)}` : ` ${fmt(r.volume)} mm³`}`);
      continue;
    }
    const b = base.models[key];
    let ok, detail;
    if (r.error) {
      ok = false;
      detail = `refused: ${r.error.slice(0, 200)}${b?.refused ? " (refused in the baseline too)" : ""}`;
    } else {
      ms += r.ms;
      if (!b || b.refused) { ok = true; detail = `${fmt(r.volume)} mm³ (${b ? "refused" : "missing"} in the baseline)`; }
      else {
        const rel = Math.abs(r.volume - b.volume) / Math.max(Math.abs(b.volume), 1);
        ok = rel <= 1e-6 && r.solids === b.solids;
        detail = `${fmt(r.volume)} mm³, ${r.solids} solid(s); baseline ${fmt(b.volume)}, ${b.solids}${ok ? "" : ` (off by ${(rel * 100).toFixed(4)}%)`}`;
      }
    }
    ok ? pass++ : fail++;
    if (!ok || only.length) console.log(`${ok ? "PASS" : "FAIL"}  ${key}\n      ${detail}`);
  }
  if (record) {
    base.when = new Date().toISOString().slice(0, 10);
    writeFileSync(basePath, JSON.stringify(base, null, 1) + "\n");
    console.log(`\nbaseline written: ${Object.keys(base.models).length} models`);
    process.exit(0);
  }
  console.log(`(passing models not listed; kernel time for the ones that built: ${(ms / 1000).toFixed(1)} s)`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
