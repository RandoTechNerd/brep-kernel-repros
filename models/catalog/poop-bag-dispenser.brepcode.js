// Poop bag dispenser: a tube for a refill roll of dog waste bags, with a pull-out slot, a leash loop and a push-fit cap.
// Print: upright as shown, cap beside it, no supports. PETG takes knocks and cold best.
// Every number below is a slider (Params). From the BREPcode catalog: poop-bag-dispenser.
const rollD = 33;      // [20:60] bag roll diameter, mm
const rollL = 58;      // [30:120] bag roll length, mm
const fit = 1.5;       // [0.5:4] room around the roll, mm
const wall = 2;        // [1.2:4] wall thickness, mm
const slotW = 4;       // [2:10] width of the slot the bags pull through, mm
const loop = "leash";  // [leash, none] leash loop on the side, or none
const strapW = 26;     // [10:50] leash or strap width the loop takes, mm
const strapT = 5;      // [3:12] room for the strap's thickness, mm
const capFit = 0.25;   // [0.1:0.8] cap clearance per side (more = looser), mm

const Ri = rollD / 2 + fit, Ro = Ri + wall;
const floorT = Math.max(1.6, wall);
const lipD = Math.min(8, Math.max(4, rollD * 0.18));      // how far the cap plugs in
const H = floorT + rollL + 2 * fit + lipD + 1;
const can = revolve(360, polygon([[0, 0], [Ro, 0], [Ro, H], [Ri, H], [Ri, floorT], [0, floorT]]));
const parts = [can];
const cuts = [];
// the slot the bags pull out of, down the +x side
const z0 = floorT + 2, z1 = Math.min(floorT + rollL, H - lipD - 3);
cuts.push(translate([Ri - 1, -slotW / 2, z0], cube([wall + 2, slotW, z1 - z0])));
if (loop === "leash") {
  // a fin on the -x side with a tall window the strap threads through
  const finT = Math.max(4, wall * 2), border = 4;
  const finH = Math.min(H, strapW + 2 * border);
  const xWin = Ro + 0.8;                                   // keep a web between window and tube
  const finOut = xWin + strapT + border;
  parts.push(translate([-finOut, -finT / 2, 0], cube([finOut - Ri - wall / 2, finT, finH])));
  cuts.push(translate([-(xWin + strapT), -finT / 2 - 1, border], cube([strapT, finT + 2, finH - 2 * border])));
}
const dispenser = difference(union(...parts), ...cuts);
// the cap, upside down beside it: a disc a little wider than the tube, and a plug ring
const capT = Math.max(2, wall), ro = Ri - capFit, ri = ro - 1.6;
const cap = revolve(360, polygon([[0, 0], [Ro + 1, 0], [Ro + 1, capT], [ro, capT], [ro, capT + lipD], [ri, capT + lipD], [ri, capT], [0, capT]]));
return group(dispenser, translate([0, 2 * Ro + 8, 0], cap));
