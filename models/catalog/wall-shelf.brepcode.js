// Wall shelf: a small shelf with built-in brackets that hangs on two keyhole slots.
// Print: lying on its back plate as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: wall-shelf.
const length = 200;  // [60:300] shelf length, mm
const depth = 100;   // [40:220] how far it sticks out, mm
const shelfT = 5;    // [3:10] shelf board thickness, mm
const backH = 60;    // [30:160] back plate height, mm
const plateT = 4;    // [3:8] back plate thickness, mm
const lipH = 0;      // [0:30] front lip height (0 = none), mm
const screwD = 4.5;  // [3:6] screw shank diameter, mm

// print orientation: x along the shelf, y up the wall, z out from the wall
const gT = Math.max(4, plateT);                     // gusset thickness
const shelfY = backH - shelfT;                      // underside of the shelf board
const gD = depth * 0.8;                             // how far out the gussets reach
const gH = Math.min(shelfY - 3, gD * 0.9);          // and how far down the wall
const gN = Math.max(2, Math.ceil(length / 150) + 1);
// a triangle drawn in (y, z) and stood up at x
// rotate([90, 90, 0]) sends the profile's x to y, its y to z, and the extrusion to +x
const inYZ = (pts, x, w) => translate([x, 0, 0], rotate([90, 90, 0], linearExtrude({ h: w }, polygon(pts))));
const gussets = Array.from({ length: gN }, (_, i) =>
  inYZ([[shelfY + 0.01, plateT - 0.01], [shelfY + 0.01, gD], [shelfY - gH, plateT - 0.01]], i * (length - gT) / (gN - 1), gT));
const parts = [
  cube([length, backH, plateT]),                    // back plate
  translate([0, shelfY, 0], cube([length, shelfT, depth])),
  ...gussets,
];
if (lipH > 0) {
  // a 45 degree lip, so it prints standing without a ledge
  parts.push(inYZ([[backH - 0.01, depth - 3 - lipH], [backH + lipH, depth - 3], [backH + lipH, depth], [backH - 0.01, depth]], 0, length));
}

// keyholes: the head goes in the round end, then the shelf drops so the
// shank rides up the slot with the head trapped in the recess behind it
const head = screwD * 2;
const keyY = Math.max(head, shelfY - gH - head * 1.5);
const keyX = [length * 0.2, length * 0.8];
const keys = keyX.flatMap((x) => [
  translate([x, keyY, -1], cylinder({ d: head, h: plateT + 2, $fn: 32 })),
  translate([x - screwD / 2, keyY, -1], cube([screwD, head, plateT + 2])),
  translate([x - head / 2, keyY, -1], cube([head, head, plateT - 1.6 + 1])),
]);
return translate([-length / 2, -backH / 2, 0], difference(union(...parts), ...keys));
