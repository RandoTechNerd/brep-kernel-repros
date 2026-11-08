// Key turner: a big paddle that clamps a key's head between two bolted halves, for turning keys with a weak grip.
// Print: both halves flat as shown, pockets up, no supports. Two M3 bolts and nuts clamp the key between them.
// Every number below is a slider (Params). From the BREPcode catalog: key-turner.
const keyW = 26;    // [15:45] key head width, mm
const keyL = 28;    // [15:50] key head length, mm
const keyT = 2.6;   // [1.5:6] key thickness, mm
const gripL = 70;   // [30:140] handle length beyond the key, mm
const gripW = 55;   // [30:100] handle width, mm
const halfT = 5;    // [3:10] thickness of each half, mm
const boltD = 3.4;  // [2.5:5.5] bolt hole diameter, mm

// one half, lying flat: x runs from the key's tip end along the handle, y across
const m = boltD / 2 + 3;                         // room for a bolt beside the key head
const W0 = keyW + 2 * (2 * m);                   // width at the key end
const L = keyL + gripL;
const r = Math.min(14, gripW / 4);
const half = () => {
  const plate = hull(
    translate([0, -W0 / 2, 0], cube([1, W0, halfT])),
    ...[-1, 1].map((s) => translate([L - r, s * (gripW / 2 - r), 0], cylinder({ r, h: halfT, $fn: 32 }))));
  const pocket = translate([-1, -(keyW + 0.8) / 2, halfT - keyT / 2 - 0.2], cube([keyL + 1, keyW + 0.8, keyT]));
  const holes = [-1, 1].map((s) => translate([keyL * 0.55, s * (keyW / 2 + 0.4 + m), -1], cylinder({ r: boltD / 2, h: halfT + 2, $fn: 20 })));
  const hang = translate([L - r, 0, -1], cylinder({ r: Math.min(4, r / 2), h: halfT + 2, $fn: 20 }));
  return difference(plate, pocket, ...holes, hang);
};
const pitch = Math.max(W0, gripW) + 8;
return translate([-L / 2, -pitch / 2, 0], group(half(), translate([0, pitch, 0], half())));
