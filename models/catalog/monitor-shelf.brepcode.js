// Monitor top shelf: a small shelf that hooks over the top edge of a monitor, for a webcam, phone or speaker.
// Print: lying on its side as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: monitor-shelf.
const monitorT = 22;   // [4:80] monitor thickness at the top edge, mm
const shelfD = 90;     // [20:220] shelf depth, mm
const width = 100;     // [30:250] shelf width, mm
const frontDrop = 10;  // [3:40] front tab down the bezel, mm
const backDrop = 45;   // [10:150] back leg down the monitor, mm
const wall = 4;        // [2.4:10] thickness, mm
const lipH = 5;        // [0:30] lip round the shelf top, mm

// side profile: x runs front to back, y runs up (the monitor's top edge at y = 0)
const xb = wall + monitorT;                      // inside face of the back leg
const depth = Math.max(shelfD, xb + wall);
const top = wall + (lipH > 0 ? lipH : 0);
const g = Math.max(0, Math.min(depth - xb - wall - 2, backDrop - 2, 40));   // gusset under the overhang
const outline = [[0, -frontDrop], [wall, -frontDrop], [wall, 0], [xb, 0], [xb, -backDrop], [xb + wall, -backDrop],
  ...(g > 4 ? [[xb + wall, -g], [xb + wall + g, 0]] : depth > xb + wall + 0.01 ? [[xb + wall, 0]] : []),
  [depth, 0]];
if (lipH > 0) outline.push([depth, top], [depth - wall, top], [depth - wall, wall], [wall, wall], [wall, top], [0, top]);
else outline.push([depth, wall], [0, wall]);
return translate([-depth / 2, (backDrop - top) / 2, 0], linearExtrude({ h: width }, polygon(outline)));
