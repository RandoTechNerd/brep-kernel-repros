// Keyboard wrist rest: a rounded wrist rest the length of your keyboard, in dovetailed pieces when it is longer than the bed.
// Print: flat side down as shown, no supports. The pieces slide together on their dovetails (a drop of glue makes it permanent).
// Every number below is a slider (Params). From the BREPcode catalog: wrist-rest.
const length = 440;  // [60:600] total length, mm
const depth = 80;    // [40:140] depth front to back, mm
const height = 20;   // [8:45] height at the crown, mm
const edgeH = 6;     // [2:20] height at the front and back edges, mm
const pieces = 2;    // [1:4] pieces

// cross-section: x runs front to back, y runs up
const crown = (t) => edgeH + (height - edgeH) * Math.pow(Math.sin(Math.PI * t), 0.6);
const section = (n = 28) => [[0, 0], [depth, 0], ...Array.from({ length: n + 1 }, (_, i) => [depth * (1 - i / n), crown(1 - i / n)])];
// the section pushed along x from x0 to x1
const run = (x0, x1) => translate([x0, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: x1 - x0 }, polygon(section())))));
const Lp = length / pieces;
const yc = depth / 2, nw = depth * 0.22, hw = depth * 0.32, tl = Math.min(12, Lp * 0.15), cl = 0.25;
const piece = (i) => {
  const x0 = i * Lp, x1 = x0 + Lp, first = i === 0, last = i === pieces - 1;
  if (first && last) return run(x0, x1);
  const plan = [[x0, -1], [x1, -1]];
  if (!last) plan.push([x1, yc - nw / 2], [x1 + tl, yc - hw / 2], [x1 + tl, yc + hw / 2], [x1, yc + nw / 2]);
  plan.push([x1, depth + 1], [x0, depth + 1]);
  if (!first) plan.push([x0, yc + nw / 2 + cl], [x0 + tl + cl, yc + hw / 2 + cl], [x0 + tl + cl, yc - hw / 2 - cl], [x0, yc - nw / 2 - cl]);
  return intersection(run(x0 - 1, x1 + tl + 1), translate([0, 0, -1], linearExtrude({ h: height + 2 }, polygon(plan))));
};
const parts = Array.from({ length: pieces }, (_, i) => translate([-i * Lp, i * (depth + 8), 0], piece(i)));
return translate([-Lp / 2, -(pieces * (depth + 8) - 8) / 2, 0], group(...parts));
