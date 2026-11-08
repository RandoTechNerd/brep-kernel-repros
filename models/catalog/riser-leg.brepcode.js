// Monitor riser legs: legs that hold a wooden board up as a monitor riser or desk shelf, with lips that keep the board in place.
// Print: lying on their side as shown, no supports. Print one per end (two for a short board, three for a long one).
// Every number below is a slider (Params). From the BREPcode catalog: riser-leg.
const height = 100;  // [30:200] height under the board, mm
const boardD = 220;  // [80:300] board depth front to back, mm
const legW = 40;     // [15:100] leg width, mm
const wall = 8;      // [4:16] frame thickness, mm
const lipH = 8;      // [0:30] lip height above the board's underside, mm
const pieces = 2;    // [1:4] legs

// side profile: x runs front to back, y runs up (the board's underside at y = height)
const D = boardD + 1 + 2 * wall;                 // 0.5 mm of room each side of the board
const top = height + lipH;
const outline = [[0, 0], [D, 0], [D, top], [D - wall, top], [D - wall, height], [wall, height], [wall, top], [0, top]];
// a window through the frame, its corners cut at 45 degrees so they stay strong
const m = Math.max(wall * 1.5, 6);
const ww = D - 2 * m, wh = height - 2 * m;
const leg = () => {
  const frame = linearExtrude({ h: legW }, polygon(outline));
  if (ww < 12 || wh < 12) return frame;
  const c = Math.min(ww, wh) / 3;
  const win = [[m + c, m], [D - m - c, m], [D - m, m + c], [D - m, height - m - c], [D - m - c, height - m],
    [m + c, height - m], [m, height - m - c], [m, m + c]];
  return difference(frame, translate([0, 0, -1], linearExtrude({ h: legW + 2 }, polygon(win))));
};
const legs = Array.from({ length: pieces }, (_, i) => translate([-D / 2, i * (top + 10), 0], leg()));
return translate([0, -(pieces * (top + 10) - 10) / 2, 0], group(...legs));
