// Run every case in cases/ through a build of the next.BREP.io Rust kernel.
//
//   node run.mjs <folder with brep_kernel.js + brep_kernel_bg.wasm> [case ...]
//
// Each case folder holds one or more feature histories (*.json, exactly what
// was passed to execute_history_json) and case.json, which says what the
// right answer is. Nothing here needs anything but the kernel's wasm build.
import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { resolve, join, dirname } from "node:path";

const [kernelDir, ...only] = process.argv.slice(2);
if (!kernelDir) {
  console.error("usage: node run.mjs <kernel pkg dir> [case ...]");
  process.exit(2);
}
const rk = await import(pathToFileURL(resolve(kernelDir, "brep_kernel.js")).href);
rk.initSync({ module: readFileSync(resolve(kernelDir, "brep_kernel_bg.wasm")) });

const here = dirname(fileURLToPath(import.meta.url));
const casesDir = join(here, "cases");

// run one history; the solids left standing, with their exact volume
function execute(file) {
  const doc = readFileSync(file, "utf8");
  let res;
  try { res = JSON.parse(rk.execute_history_json(doc)); }
  catch (e) { return { error: String(e?.message || e) }; }
  const live = new Map();
  for (const r of res.results) {
    if (r.error) return { error: `${r.feature_type} ${r.id}: ${r.error}` };
    for (const n of r.removed) live.delete(n);
    for (const a of r.added) live.set(a.name, a);
  }
  let volume = 0;
  for (const a of live.values()) volume += JSON.parse(rk.mass_properties_handle(a.handle)).volume;
  return { volume, solids: live.size };
}

const fmt = (v) => (v == null ? "-" : v.toFixed(3));
let pass = 0, fail = 0;
for (const name of readdirSync(casesDir).sort()) {
  if (only.length && !only.includes(name)) continue;
  const spec = JSON.parse(readFileSync(join(casesDir, name, "case.json"), "utf8"));
  const run = Object.fromEntries(Object.keys(spec.histories).map((k) => [k, execute(join(casesDir, name, `${k}.json`))]));
  const err = Object.entries(run).find(([, r]) => r.error);
  let ok, detail;
  if (err) {
    ok = false;
    detail = `${err[0]} refused: ${err[1].error}`;
  } else if (spec.check.type === "volume") {
    const v = run[spec.check.of].volume;
    ok = Math.abs(v - spec.check.expected) <= spec.check.tolerance;
    detail = `${spec.check.of} ${fmt(v)} mm³, expected ${spec.check.expected}`;
  } else if (spec.check.type === "grows") {
    // no closed form: more than the part it started from, less than the cap
    const v = run[spec.check.of].volume, v0 = run[spec.check.from].volume;
    ok = v > v0 + 1 && v < spec.check.below;
    detail = `${spec.check.of} ${fmt(v)} mm³, must be between ${fmt(v0)} and ${spec.check.below}`;
  }
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
