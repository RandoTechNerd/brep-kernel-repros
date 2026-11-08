// Tire lever: a bike tire lever with a lipped tip for the bead and a spoke hook at the other end.
// Print: on its side as shown, no supports. PETG or nylon: PLA snaps. Print two or three.
// Every number below is a slider (Params). From the BREPcode catalog: tire-lever.
const length = 110;  // [70:180] length, mm
const width = 18;    // [10:30] width, mm
const thick = 5;     // [3:8] thickness, mm
const tipT = 1.6;    // [1:3] tip thickness, mm
const hookDrop = 7;  // [0:12] spoke hook depth (0 = none), mm

// side profile: x along the lever from the tip, y through its thickness (bead side up)
const L = length;
const ramp = Math.min(30, L / 3);                // the tip thickens to full over this
// the lip at the very tip, 1.3 mm proud, catches the bead
const tip = [[3, tipT], [2.2, tipT + 1.3], [0, tipT + 1.3]];
const hd = hookDrop;
const bottom = hd > 0
  ? [[0, 0], [L - 18 - hd, 0], [L - 18, -hd], [L - 11, -hd], [L - 11, 1], [L - 7, 1], [L - 7, -hd], [L, -hd]]
  : [[0, 0], [L, 0]];
const outline = [...bottom, [L, thick], [ramp, thick], ...tip];
return translate([-L / 2, 0, 0], linearExtrude({ h: width }, polygon(outline)));
