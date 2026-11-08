// Building brick: a stud-compatible building brick, plate or tile of any size (8 mm stud pitch).
// Print: upright as shown; the inside ceiling bridges, no supports. Small bricks are small parts: ages 3 and up.
// Every number below is a slider (Params). From the BREPcode catalog: building-brick.
const studsX = 4;         // [1:16] studs long
const studsY = 2;         // [1:16] studs wide
const plates = 3;         // [1:6] height in plates (3 = a brick)
const studs = "yes";      // [yes, no] studs on top (no = a tile)
const bottom = "hollow";  // [hollow, solid] hollow with tubes, or solid (a base plate)
const studD = 4.8;        // [4.5:5.1] stud diameter (nudge for clutch), mm
const tubeD = 6.51;       // [6.2:6.8] underside tube diameter, mm
const wall = 1.2;         // [1:2] wall thickness, mm
const fit = 0.1;          // [0:0.3] outside trim per side, mm

// the system's fixed sizes are the helper's defaults: an 8 mm pitch, 3.2 mm plates, a 1 mm top, 1.8 mm studs
// many small parts that never touch are cheap to join to each other, and then to the brick in one go
const join = (list) => (list.length > 1 ? union(...list) : list[0]);
const brick = (P = 8, plateH = 3.2, top = 1, studH = 1.8) => {
  const W = studsX * P - 2 * fit, D = studsY * P - 2 * fit, H = plates * plateH;
  const ceiling = H - top;
  const parts = [bottom === "solid" ? cube([W, D, H]) : difference(cube([W, D, H]), translate([wall, wall, -1], cube([W - 2 * wall, D - 2 * wall, ceiling + 1])))];
  const under = [];
  if (bottom !== "solid" && studsX > 1 && studsY > 1) {
    // tubes where four studs meet, from the floor up into the ceiling
    for (let i = 1; i < studsX; i++) for (let j = 1; j < studsY; j++)
      under.push(translate([i * P - fit, j * P - fit, 0], difference(cylinder({ r: tubeD / 2, h: ceiling + 0.5, $fn: 24 }), translate([0, 0, -1], cylinder({ r: studD / 2, h: ceiling + 1, $fn: 24 })))));
  } else if (bottom !== "solid" && (studsX > 1 || studsY > 1)) {
    // a one-wide brick has thin pins between its studs instead
    for (let i = 1; i < Math.max(studsX, studsY); i++)
      under.push(translate(studsX > 1 ? [i * P - fit, D / 2, 0] : [W / 2, i * P - fit, 0], cylinder({ r: 1.6, h: ceiling + 0.5, $fn: 16 })));
  }
  if (under.length) parts.push(join(under));
  if (studs === "yes") {
    const tops = [];
    for (let i = 0; i < studsX; i++) for (let j = 0; j < studsY; j++)
      tops.push(translate([P / 2 - fit + i * P, P / 2 - fit + j * P, H - 0.5], cylinder({ r: studD / 2, h: studH + 0.5, $fn: 24 })));
    parts.push(join(tops));
  }
  return translate([-W / 2, -D / 2, 0], join(parts));
};
return brick();
