// Button hook: a fat-handled button hook with a thin wire loop, and a zip hook on the other end.
// Print: flat as shown, no supports. PETG is tougher than PLA for the thin loop.
// Every number below is a slider (Params). From the BREPcode catalog: button-hook.
const handleL = 110;  // [60:200] handle length, mm
const gripW = 24;     // [14:40] handle width, mm
const gripT = 14;     // [8:25] handle thickness, mm
const loopL = 34;     // [20:50] loop length, mm
const loopW = 14;     // [8:24] loop width, mm
const wireT = 2.6;    // [1.8:4] loop wire thickness, mm
const zip = "yes";    // [no, yes] zip hook on the other end

// lying flat: x runs from the zip-hook end to the loop's tip, y across
const r = gripW / 2;
const grip = hull(translate([r, 0, 0], cylinder({ r, h: gripT, $fn: 40 })), translate([handleL - r, 0, 0], cylinder({ r, h: gripT, $fn: 40 })));
// the loop: a teardrop of wire running back into the end of the handle
const tipX = handleL + loopL - loopW / 2;
const outer = hull(translate([handleL - r, 0, 0], cylinder({ r: Math.min(r, loopW / 2), h: wireT, $fn: 24 })),
  translate([tipX, 0, 0], cylinder({ r: loopW / 2, h: wireT, $fn: 40 })));
const eye = hull(translate([handleL + 3, 0, -1], cylinder({ r: 0.8, h: wireT + 2, $fn: 12 })),
  translate([tipX, 0, -1], cylinder({ r: loopW / 2 - wireT, h: wireT + 2, $fn: 40 })));
const parts = [grip, difference(outer, eye)];
if (zip === "yes") {
  // a small open ring off the far end of the handle, for a zip pull
  const zr = 7, zt = Math.min(4, gripT);
  parts.push(difference(
    hull(translate([2, 0, 0], cylinder({ r: zr * 0.6, h: zt, $fn: 24 })), translate([-zr + 1, 0, 0], cylinder({ r: zr, h: zt, $fn: 32 }))),
    translate([-zr + 1, 0, -1], cylinder({ r: zr - 2.6, h: zt + 2, $fn: 32 })),
    translate([-zr + 1, -zr - 1, -1], cube([2.4, zr + 1, zt + 2]))));
}
return translate([-(handleL + loopL) / 2, 0, 0], union(...parts));
