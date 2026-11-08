// Ball display stand: a pedestal that holds a ball on a ring, sized to the ball; one or a row of them.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: ball-stand.
const ballD = 74;   // [30:250] ball diameter, mm
const height = 30;  // [10:150] stand height, mm
const wall = 3;     // [1.6:8] ring thickness, mm
const seat = 0.5;   // [0.3:0.7] ring size, as a share of the ball
const count = 1;    // [1:6] how many balls in a row

const Rb = ballD / 2;
const rs = Rb * seat;                                     // the ring the ball sits on
const sag = Rb - Math.sqrt(Rb * Rb - rs * rs);            // how far the ball dips below the ring
const ro = rs + wall;
const rw = Math.max(rs * 0.55, 5);                        // waist
const k = Math.tan(52 * Math.PI / 180);
const flare = (ro - rw) * k;                              // the flare up to the ring
const baseR = Math.max(ro * 1.05, rw + 10), baseT = 4;
const H = Math.max(height, baseT + (baseR - rw) + flare + 2);
const dish = Math.min(H - 2, sag + 2);                    // a cone inside the ring, clear of the ball
const one = revolve(360, polygon([
  [0, 0], [baseR, 0], [baseR, baseT], [rw, baseT + baseR - rw], [rw, H - flare], [ro, H], [rs, H], [0, H - dish],
]));
if (count <= 1) return one;
const pitch = Math.max(ballD + 4, 2 * baseR + 2);
const span = (count - 1) * pitch;
const bar = translate([-span / 2, -baseR * 0.6, 0], cube([span, baseR * 1.2, baseT]));
return union(bar, ...Array.from({ length: count }, (_, i) => translate([-span / 2 + i * pitch, 0, 0], one)));
