// Light clip: a gutter, shingle or fence clip that holds a string of holiday lights.
// Print: on its side as shown, no supports. PETG or ASA outdoors; print a bag of them.
// Every number below is a slider (Params). From the BREPcode catalog: light-clip.
const mount = "gutter";  // [gutter, shingle, fence] what it clips on
const edgeT = 3;         // [1:40] thickness of the edge it goes over, mm
const depth = 15;        // [6:50] how far it reaches down over the edge, mm
const wireD = 5;         // [2:14] light wire diameter, mm
const width = 10;        // [6:25] clip width, mm
const thick = 2;         // [1.4:4] clip thickness, mm

// side profile, printed lying on it: the edge it grips is x = 0 to edgeT,
// its top at y = 0; the wire clip hangs on the outside (negative x)
const T = thick;
const c = T * 0.15;                                  // a little room over the edge
const E = mount === "shingle" ? 1.5 : edgeT;
const parts = [];
if (mount === "shingle") {
  // a flat tab that slides up under a shingle, with a stop at its end
  parts.push(polygon([[-T, -T], [32, -T], [32, 0], [3, 0], [3, 1.5], [0, 1.5], [0, 0], [-T, 0]]));
} else {
  // an inverted U: a short leg inside, the outside leg down to the clip
  parts.push(polygon([[-T, T], [E + c + T, T], [E + c + T, -depth * 0.6], [E + c, -depth * 0.6], [E + c, 0], [0, 0], [0, -depth], [-T, -depth]]));
}
// the C for the wire: a ring with its mouth facing away from the edge
const rw = wireD / 2 + 0.2;
const yTop = mount === "shingle" ? -T : -depth;
const cx = -T - rw, cy = yTop - rw - T * 0.5;
const mouth = Math.asin(Math.min(0.9, 0.38 * wireD / rw));   // the opening is about 3/4 of the wire
const N = Math.max(24, Math.round(rw * 8));
const a0 = Math.PI + mouth, a1 = 3 * Math.PI - mouth;       // round from just past the mouth back to it
parts.push(polygon([
  ...Array.from({ length: N + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / N; return [cx + (rw + T) * Math.cos(a), cy + (rw + T) * Math.sin(a)]; }),
  ...Array.from({ length: N + 1 }, (_, i) => { const a = a1 - (a1 - a0) * i / N; return [cx + rw * Math.cos(a), cy + rw * Math.sin(a)]; }),
]));
// a neck joining the C to the leg (it stays clear of the C's hole)
parts.push(polygon([[-T, cy], [0, cy], [0, yTop + 0.5], [-T, yTop + 0.5]]));
return union(...parts.map((p) => linearExtrude({ h: width }, p)));
