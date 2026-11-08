// Candle holder: a holder for one or more candles: tealights, tapers or pillars, in a row or a ring.
// Print: upright as shown, no supports. Keep flames clear of plastic: PLA softens at 60 C, so use tealights in metal cups or LED candles.
// Every number below is a slider (Params). From the BREPcode catalog: candle-holder.
const candleD = 39.5;   // [5:90] candle diameter (the cup), mm
const cupDepth = 12;    // [3:60] cup depth, mm
const count = 1;        // [1:12] candles
const arrange = "row";  // [row, ring] arrangement
const spacing = 12;     // [2:60] gap between cups, mm
const stemH = 0;        // [0:200] stem height (0 = cups on the base), mm
const centerLift = 0;   // [0:60] extra height for the middle candle, mm
const wall = 2.4;       // [1.6:6] cup wall, mm
const baseT = 4;        // [2:12] base thickness, mm
const margin = 8;       // [2:40] base border round the cups, mm

const rin = candleD / 2;
const rout = rin + wall;
const pitch = 2 * rout + spacing;
const mid = count % 2 === 1 ? (count - 1) / 2 : -1;
// where each cup stands: a row along x, or a ring
const ringR = count < 2 ? 0 : Math.max(pitch / (2 * Math.sin(Math.PI / count)), rout + spacing / 2);
const spots = Array.from({ length: count }, (_, i) => arrange === "ring" && count > 1
  ? [ringR * Math.cos(2 * Math.PI * i / count), ringR * Math.sin(2 * Math.PI * i / count), 0]
  : [(i - (count - 1) / 2) * pitch, 0, arrange === "row" && i === mid && count > 2 ? centerLift : 0]);
// one holder: an optional stem that flares at 45 degrees into the cup
const stemR = Math.max(4, Math.min(rout * 0.4, rout - 2));
const holderAt = (lift) => {
  const col = stemH + lift;
  const r0 = col > 0 && stemH > 0 ? stemR : rout;
  const flare = col > 0 && stemH > 0 ? rout - r0 : 0;
  const zCup = baseT + col + flare;                  // the cup's floor
  const top = zCup + cupDepth;
  const pts = r0 < rout
    ? [[0, baseT - 0.5], [r0, baseT - 0.5], [r0, baseT + col], [rout, zCup], [rout, top], [rin, top], [rin, zCup], [0, zCup]]
    : [[0, baseT - 0.5], [rout, baseT - 0.5], [rout, top], [rin, top], [rin, zCup], [0, zCup]];
  return revolve(360, polygon(pts));
};
const base = count === 1 || arrange === "ring"
  ? cylinder({ r: ringR + rout + margin, h: baseT, $fn: 96 })
  : hull(translate([-(count - 1) / 2 * pitch, 0, 0], cylinder({ r: rout + margin, h: baseT, $fn: 64 })),
    translate([(count - 1) / 2 * pitch, 0, 0], cylinder({ r: rout + margin, h: baseT, $fn: 64 })));
return union(base, ...spots.map(([x, y, lift]) => translate([x, y, 0], holderAt(lift))));
