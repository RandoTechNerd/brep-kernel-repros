// Coffee pod dispenser: a stacking tower for coffee pods or capsules that hands out the bottom one, with a slot to see how many are left.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: pod-tower.
const podD = 37;        // [20:110] pod diameter (at its rim), mm
const podH = 30;        // [3:60] one pod's height (sets the doorway), mm
const height = 220;     // [50:250] tower height, mm
const wall = 2;         // [1.6:4] wall thickness, mm
const foot = 14;        // [0:40] foot that sticks out past the tube, mm
const viewSlot = 8;     // [0:20] viewing slot up the front (0 = none), mm
const mount = "stand";  // [stand, wall] free standing, or a flat back for wall tape

const ri = podD / 2 + 1.2;                       // inside of the tube
const ro = ri + wall;
const floorT = Math.max(2, wall);
const backY = ro + 3;                            // the flat back, when it goes on a wall
const rf = mount === "wall" ? ro : ro + foot;
let tower = union(
  cylinder({ r: rf, h: floorT, $fn: 64 }),
  cylinder({ r: ro, h: height, $fn: 64 }),
);
if (mount === "wall") tower = union(tower, translate([-ro * 0.6, 0, 0], cube([ro * 1.2, backY, height])));
tower = difference(tower, translate([0, 0, floorT], cylinder({ r: ri, h: height, $fn: 64 })));

// an opening in the wall on the -y (front) or +y (back) side: straight sides, a pointed top
const arch = (w, z0, z1, side) => {
  const apex = z1 + w * 0.6;                     // steeper than 45 degrees: no overhang
  const prism = rotate([90, 0, 0], linearExtrude({ h: ro + 4 }, polygon([[-w / 2, z0], [w / 2, z0], [w / 2, z1], [0, apex], [-w / 2, z1]])));
  return side < 0 ? translate([0, 0.01, 0], prism) : translate([0, -0.01, 0], mirror([0, 1, 0], prism));
};
const doorW = Math.min(2 * ri * 0.85, 2 * ri - 4);
const doorTop = floorT + podH + 3;
const cuts = [arch(doorW, floorT, doorTop, -1)];
if (mount !== "wall") cuts.push(arch(Math.max(8, doorW * 0.45), floorT, doorTop, 1));
const slitBottom = doorTop + doorW * 0.6 + 6;
const slitTop = height - 10 - viewSlot * 0.6;
if (viewSlot > 0 && slitTop - slitBottom > 10) cuts.push(arch(Math.min(viewSlot, doorW * 0.6), slitBottom, slitTop, -1));
return difference(tower, ...cuts);
