# next.BREP.io kernel repro cases

Small test models for two things the next.BREP.io Rust kernel refuses, found
while moving BREPcode onto it. Each case is a feature history exactly as it was
passed to `execute_history_json`, plus a `case.json` that says what the right
answer is. Every failing case comes with a passing control next to it, so the
difference between them shows what triggers the refusal.

Seen on BREP_kernel **0.13.2** and **0.11.0** (same results on both, see
`results/`).

## Running them

```bash
node run.mjs <folder with brep_kernel.js + brep_kernel_bg.wasm>
node run.mjs <folder> delete-top-chamfer-faces     # just one case
```

The runner needs only Node 18+ and a `wasm-pack --target web` build of the
kernel. It runs each history, reads the exact volume of the solids left
standing with `mass_properties_handle`, and checks it against `case.json`.

## 1. Deleting a chamfer face is refused where chamfers meet at a corner

A 40 x 30 x 20 block with its four **top** edges chamfered 3 mm, then `DF` on
the chamfer faces. Deleting them should heal the block back to sharp,
24000 mm³. The kernel refuses:

```
delete_face_and_heal: moved edge 19 leaves face 129 by 3.000e0 ... a blend's end
runs into a vertex of a face the heal does not read as its neighbour
```

| Case | Result |
|---|---|
| `delete-top-chamfer-faces` | refused (all 4 top chamfers) |
| `delete-one-top-chamfer-face` | refused (just 1 of the 4) |
| `step-delete-top-chamfer-faces` | refused, same block read in from STEP |
| `step-delete-one-top-chamfer-face` | refused, from STEP |
| `delete-upright-chamfer-faces-control` | passes: chamfers on the 4 upright edges, which never meet, heal to 24000 |
| `delete-one-upright-chamfer-face-control` | passes |
| `delete-fillet-faces-control` | passes: the same with r4 fillets heals to 24000 |
| `step-delete-*-control` | the same three controls from STEP, all pass |

So it isn't chamfers as such. The refusal comes when the chamfer's end runs
into another chamfer at the corner. The `step-` cases carry `part.step` (the
file BREPcode wrote) and import it through `IMPORT3D` with `stepText`; the
others build the chamfer in the history itself.

## 2. Intersecting with a box that only touches on a face is refused

`intersect-face-touching`: the block (x 0 to 40) `INTERSECT` a box at x -50 to
0. They share only the plane x = 0, so the answer is empty. The kernel refuses:

```
boolean Intersect on 'P.CU2' failed: boolean assembly: operation produced no boundary faces
```

An empty result (no solid, or a zero-volume one) would be the natural answer.
The runner counts zero solids as volume 0, which passes. BREPcode hit this
when splitting a part with two half-space boxes at a plane that lay exactly on
one of the part's faces.

Controls that pass: `intersect-shared-planes-control` (a box sharing five face
planes with the block) and `intersect-box-starting-on-face-control` (a box
that starts exactly on the block's x = 0 face and overlaps it).

## Files

```
cases/<name>/case.json      what the case is and the expected answer
cases/<name>/<step>.json    feature histories (execute_history_json input)
cases/<name>/part.step      the STEP file, for the step- cases
run.mjs                     the runner
results/<version>.txt       runner output per kernel version
```

The histories were made by BREPcode (brepcode.com), compiled to the kernel's
own feature dialect. They need nothing from BREPcode to run.
