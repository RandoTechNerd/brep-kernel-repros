// Phone finger loop: a finger loop that sticks to the back of a phone, tablet or remote, for holding it without a firm grip.
// Print: lying on its side as shown, no supports. Stick it on with strong double-sided tape (VHB).
// Every number below is a slider (Params). From the BREPcode catalog: phone-grip.
const span = 55;     // [30:120] loop length, mm
const loopH = 18;    // [10:40] loop height, mm
const band = 3;      // [2:6] band thickness, mm
const loopW = 22;    // [12:50] width, mm
const plateL = 70;   // [40:150] pad length, mm
const plateT = 2.4;  // [1.6:5] pad thickness, mm

// side profile: x runs along the phone, y runs out from its back; printed lying on it, `loopW` wide
const sp = Math.min(span, plateL - 4);
const arch = (a, b, n = 32) => Array.from({ length: n + 1 }, (_, i) => {
  const t = Math.PI * i / n;
  return [a * Math.cos(t), plateT + b * Math.sin(t)];
});
const outer = [[-plateL / 2, 0], [plateL / 2, 0], [plateL / 2, plateT], [sp / 2, plateT], ...arch(sp / 2, loopH).slice(1, -1), [-sp / 2, plateT], [-plateL / 2, plateT]];
const inner = [...arch(sp / 2 - band, loopH - band), [-(sp / 2 - band), plateT - 0.01], [sp / 2 - band, plateT - 0.01]];
const piece = difference(linearExtrude({ h: loopW }, polygon(outer)), translate([0, 0, -1], linearExtrude({ h: loopW + 2 }, polygon(inner))));
return translate([0, -(plateT + loopH) / 2, 0], piece);
