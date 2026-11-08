// Bridge test: posts with flat bridges between them, each gap longer than the last, to see how far your printer can bridge.
// Print: flat as shown. The bridges are the test: no supports.
// Every number below is a slider (Params). From the BREPcode catalog: bridge-test.
const spanMin = 10;   // [5:40] shortest bridge, mm
const spanStep = 10;  // [5:30] each bridge longer by, mm
const steps = 5;      // [2:8] how many bridges
const height = 10;    // [4:30] post height, mm
const depth = 10;     // [5:30] bridge width, mm
const postW = 5;      // [3:10] post width, mm
const bridgeT = 1.2;  // [0.6:3] bridge thickness, mm

const spans = Array.from({ length: steps }, (_, i) => spanMin + i * spanStep);
const L = spans.reduce((a, b) => a + b, 0) + (steps + 1) * postW;
const baseT = Math.min(1.2, height / 3);
const parts = [
  cube([L, depth, baseT]),
  translate([0, 0, height], cube([L, depth, bridgeT])),
];
// post i stands after i posts and the first i spans
const postX = (i) => i * postW + spans.slice(0, i).reduce((a, b) => a + b, 0);
for (let i = 0; i <= steps; i++) {
  parts.push(translate([postX(i), 0, baseT - 0.01], cube([postW, depth, height - baseT + 0.02])));
}
return translate([-L / 2, -depth / 2, 0], union(...parts));
