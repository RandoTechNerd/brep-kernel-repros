// Spacer: a round, hex or square spacer, washer or bushing, sized to its bolt.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: spacer.
const outerD = 12;      // [3:100] outside diameter, mm
const innerD = 5.3;     // [0:90] bore (0 = solid), mm
const height = 5;       // [0.4:100] thickness, mm
const shape = "round";  // [round, hex, square] outside shape
const count = 1;        // [1:24] how many

const od = Math.max(outerD, innerD + 2.4);              // at least 1.2 mm of ring each side
const outline = shape === "hex"
  ? polygon(Array.from({ length: 6 }, (_, i) => [od / Math.sqrt(3) * Math.cos(Math.PI * i / 3), od / Math.sqrt(3) * Math.sin(Math.PI * i / 3)]))
  : null;
const one = () => {
  const solid = shape === "hex" ? linearExtrude({ h: height }, outline)
    : shape === "square" ? translate([-od / 2, -od / 2, 0], cube([od, od, height]))
    : cylinder({ r: od / 2, h: height, $fn: 64 });
  return innerD > 0 ? difference(solid, translate([0, 0, -1], cylinder({ r: innerD / 2, h: height + 2, $fn: 48 }))) : solid;
};
// lay them out in a grid, a few millimetres apart
const cols = Math.ceil(Math.sqrt(count));
const step = (shape === "hex" ? od * 1.16 : od) + 4;
const pieces = Array.from({ length: count }, (_, i) => translate([(i % cols) * step, Math.floor(i / cols) * step, 0], one()));
return pieces.length > 1 ? group(...pieces) : pieces[0];
