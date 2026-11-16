/* Animated exercise illustrations: a simple mannequin drawn with SVG, side view, facing right.
   Every exercise is a pattern (start pose A, end pose B, equipment props). Our own drawings, no photos. */
window.FIG = (function () {
  "use strict";
  const L = {torso: 50, ua: 29, fa: 27, th: 40, sh: 38, neck: 4, head: 10.5};
  const RAD = Math.PI / 180;
  const dir = T => [Math.sin(T * RAD), -Math.cos(T * RAD)];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const SH = (hip, T) => add(hip, dir(T), L.torso);
  const lerp = (a, b, t) => a + (b - a) * t;

  function ik(root, target, l1, l2, bend) {
    const dx = target[0] - root[0], dy = target[1] - root[1];
    let d = Math.hypot(dx, dy);
    d = Math.max(Math.abs(l1 - l2) + .5, Math.min(l1 + l2 - .3, d));
    const a = Math.atan2(dy, dx);
    const c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
    const th = Math.acos(Math.max(-1, Math.min(1, c)));
    const ang = a + bend * th;
    const j = [root[0] + l1 * Math.cos(ang), root[1] + l1 * Math.sin(ang)];
    const a2 = Math.atan2(target[1] - j[1], target[0] - j[0]);
    return [j, [j[0] + l2 * Math.cos(a2), j[1] + l2 * Math.sin(a2)]];
  }

  function solve(p) {
    let T = p.T || 0;
    const hip = p.hip;
    if (p.S) T = Math.atan2(p.S[0] - hip[0], -(p.S[1] - hip[1])) / RAD;
    const d = dir(T);
    let S = add(hip, d, L.torso);
    if (p.sh) S = [S[0], S[1] + p.sh];
    const head = add(S, d, L.neck + L.head + 1.5);
    const kb = p.kb == null ? -1 : p.kb, eb = p.eb == null ? 1 : p.eb;
    const [knee, ankle] = ik(hip, p.foot, L.th, L.sh, kb);
    const [knee2, ankle2] = ik(hip, p.foot2 || p.foot, L.th, L.sh, p.kb2 == null ? kb : p.kb2);
    const [elbow, hand] = ik(S, p.hand, L.ua, L.fa, eb);
    const [elbow2, hand2] = ik(S, p.hand2 || p.hand, L.ua, L.fa, p.eb2 == null ? eb : p.eb2);
    const to = p.to || [13, 4], to2 = p.to2 || to;
    return {T, d, hip, S, head, knee, ankle, toe: add(ankle, to), knee2, ankle2, toe2: add(ankle2, to2), elbow, hand, elbow2, hand2};
  }

  function mix(A, B, t) {
    const o = {};
    for (const k in A) {
      const a = A[k], b = B[k];
      if (b === undefined) o[k] = a;
      else if (Array.isArray(a)) o[k] = [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
      else if (typeof a === "number") o[k] = lerp(a, b, t);
      else o[k] = a;
    }
    for (const k in B) if (!(k in o)) o[k] = B[k];
    return o;
  }

  // ---------- drawing ----------
  const C = {fig: "var(--fig, #12a150)", fig2: "var(--fig2, #9fd8b6)", skin: "var(--fig, #12a150)", eq: "var(--eq, #3a4743)", eq2: "var(--eq2, #b9c4bf)", plate: "var(--plate, #2b3532)"};
  const ln = (a, b, w, c, extra = "") => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (p, r, fill, extra = "") => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${fill}" ${extra}/>`;
  function ref(J, v, off) {
    let p = typeof v === "string" ? J[v] : v;
    if (!p) p = [0, 0];
    return off ? add(p, off) : p;
  }
  function prop(J, pr) {
    const at = pr.at ? ref(J, pr.at, pr.off) : null;
    switch (pr.t) {
      case "pad": return ln(ref(J, pr.a, pr.ao), ref(J, pr.b, pr.bo), pr.w || 9, C.eq2);
      case "post": return ln(ref(J, pr.a, pr.ao), ref(J, pr.b, pr.bo), pr.w || 4, C.eq2);
      case "box": return `<rect x="${pr.x}" y="${pr.y}" width="${pr.w}" height="${pr.h}" rx="3" fill="${C.eq2}"/>`;
      case "bb": return circ(at, pr.r || 13, C.plate) + circ(at, 3, C.eq2);
      case "plate": return circ(at, pr.r || 9, C.plate) + circ(at, 2.5, C.eq2);
      case "db": return `<rect x="${(at[0] - 9).toFixed(1)}" y="${(at[1] - 5).toFixed(1)}" width="18" height="10" rx="3" fill="${C.plate}"/>`;
      case "kb": return circ(add(at, [0, 9]), 8, C.plate) + ln(add(at, [-4, 2]), add(at, [4, 2]), 3, C.plate);
      case "cable": { const f = pr.from; return ln(f, at, 1.6, C.eq) + circ(f, 4.5, "none", `stroke="${C.eq}" stroke-width="2"`) + circ(at, 3.5, C.eq); }
      case "rails": return ln([at[0] - 5, -30], [at[0] - 5, 170], 3, C.eq2);
      case "handle": return `<rect x="${(at[0] - 3).toFixed(1)}" y="${(at[1] - 7).toFixed(1)}" width="6" height="14" rx="2" fill="${C.eq}"/>`;
      case "roller": return circ(at, pr.r || 6, C.eq);
      case "wheel": return circ(at, 8, "none", `stroke="${C.plate}" stroke-width="4"`);
      case "bar": return circ(pr.p, 5, C.eq) + (pr.posts ? ln([pr.p[0] + 30, pr.p[1]], [pr.p[0] + 30, 170], 3, C.eq2) : "");
      case "sled": { const a = (pr.ang || 0) * RAD, v = [Math.cos(a) * 22, Math.sin(a) * 22]; return ln(add(at, v, -1), add(at, v), 7, C.eq) + ln(at, add(at, [Math.sin(a) * 30, -Math.cos(a) * 30]), 3, C.eq2); }
      case "wall": return ln([pr.x, -30], [pr.x, 170], 6, C.eq2);
      default: return "";
    }
  }
  function draw(spec, t) {
    const P = mix(spec.A, spec.B, t), J = solve(P);
    const back = (spec.props || []).filter(p => !p.front).map(p => prop(J, p)).join("");
    const front = (spec.props || []).filter(p => p.front).map(p => prop(J, p)).join("");
    const limb = (a, c, w) => `<polyline points="${a.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<line x1="-20" y1="170" x2="220" y2="170" stroke="${C.eq2}" stroke-width="2"/>` + back +
      limb([J.hip, J.knee2, J.ankle2, J.toe2], C.fig2, 9.5) +
      limb([J.S, J.elbow2, J.hand2], C.fig2, 8.5) +
      ln(J.hip, J.S, 18, C.fig) + circ(J.head, L.head, C.fig) +
      limb([J.hip, J.knee, J.ankle, J.toe], C.fig, 10) +
      front +
      limb([J.S, J.elbow, J.hand], C.fig, 9) + circ(J.hand, 4.2, C.fig);
  }

  // ---------- patterns ----------
  const STAND = {hip: [96, 88], foot: [100, 165]};
  function eqProps(g, o = {}) {
    const at = o.at || "hand", off = o.off;
    const out = [];
    if (g === "bb") out.push({t: "bb", at, off, front: true});
    if (g === "smith") out.push({t: "rails", at, off}, {t: "bb", at, off, front: true});
    if (g === "db") out.push({t: "db", at, off, front: true});
    if (g === "kb") out.push({t: "kb", at, off, front: true});
    if (g === "plate") out.push({t: "plate", at, off, front: true});
    if (g === "cable") out.push({t: "cable", from: o.from || [180, 20], at, off});
    if (g === "m") out.push({t: "handle", at, off, front: true});
    return out;
  }
  function benchProps(hip, T, extra = 0) {
    const d = dir(T), back = [d[1], -d[0]];
    const a = add(add(hip, back, 14), d, -14 - extra), b = add(add(SH(hip, T), back, 14), d, 12);
    return [{t: "pad", a, b, w: 10}, {t: "post", a: [a[0] + 8, a[1] + 4], b: [a[0] + 8, 170]}, {t: "post", a: [b[0], b[1] + 4], b: [b[0], 170]}];
  }
  function seatProps(hip, T, backrest) {
    const out = [{t: "pad", a: add(hip, [-14, 14]), b: add(hip, [24, 14]), w: 9}, {t: "post", a: add(hip, [4, 18]), b: [hip[0] + 4, 170]}];
    if (backrest) { const d = dir(T), back = [d[1], -d[0]]; out.push({t: "pad", a: add(add(hip, back, 14), d, 4), b: add(add(SH(hip, T), back, 14), d, -4), w: 9}); }
    return out;
  }
  const rel = (hip, T, v, sh) => { const s = SH(hip, T); return [s[0] + v[0], s[1] + v[1] + (sh || 0)]; };

  const P = {
    bench(o) {
      const a = +o.a || 0, T = -90 + a, hip = a > 0 ? [116, 118] : a < 0 ? [122, 104] : [120, 112];
      const foot = a < 0 ? [166, 116] : [154, 165];
      const lo = o.close ? [6, -16] : [4, -12];
      const A = {hip, T, foot, hand: rel(hip, T, [2, -55]), eb: 1}, B = {hip, T, foot, hand: rel(hip, T, lo), eb: 1};
      return {A, B, props: [...benchProps(hip, T), ...eqProps(o.g)]};
    },
    floorpress(o) {
      const hip = [122, 156], T = -90, foot = [156, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [2, -55]), eb: 1}, B: {hip, T, foot, hand: rel(hip, T, [6, -20]), eb: 1}, props: eqProps(o.g)};
    },
    fly(o) {
      const a = +o.a || 0, T = -90 + a, hip = a > 0 ? [116, 118] : [120, 112], foot = [154, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [0, -52]), eb: -1}, B: {hip, T, foot, hand: rel(hip, T, [-14, 12]), eb: -1}, props: [...benchProps(hip, T), ...eqProps(o.g || "db")]};
    },
    pullover(o) {
      const hip = [124, 112], T = -90, foot = [156, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [6, -54]), eb: -1}, B: {hip, T, foot, hand: rel(hip, T, [-52, -14]), eb: -1}, props: [...benchProps(hip, T), ...eqProps(o.g || "db")]};
    },
    skull(o) {
      const hip = [120, 112], T = -90, foot = [154, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [4, -55]), eb: -1}, B: {hip, T, foot, hand: rel(hip, T, [-22, -22]), eb: 1}, props: [...benchProps(hip, T), ...eqProps(o.g)]};
    },
    chestpress(o) {
      const hip = [90, 122], T = -10, foot = [134, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [18, 12])}, B: {hip, T, foot, hand: rel(hip, T, [55, 10])}, props: [...seatProps(hip, T, true), ...eqProps(o.g || "m")]};
    },
    pecdeck(o) {
      const hip = [90, 122], T = -6, foot = [134, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [-18, 4]), eb: -1}, B: {hip, T, foot, hand: rel(hip, T, [34, 6]), eb: -1}, props: [...seatProps(hip, T, true), ...eqProps("m")]};
    },
    crossover(o) {
      const hip = [96, 88], T = 14, foot = [108, 165], foot2 = [82, 165];
      const v = o.v || "high", from = v === "high" ? [18, -30] : v === "low" ? [18, 166] : [10, 30];
      const a = v === "high" ? [-26, -6] : v === "low" ? [-20, 44] : [-28, 6], b = v === "high" ? [34, 42] : v === "low" ? [38, -14] : [46, 8];
      return {A: {hip, T, foot, foot2, hand: rel(hip, T, a), eb: -1}, B: {hip, T, foot, foot2, hand: rel(hip, T, b), eb: -1}, props: eqProps("cable", {from})};
    },
    svend() {
      const hip = STAND.hip, T = 0;
      return {A: {...STAND, T, hand: rel(hip, T, [14, 22])}, B: {...STAND, T, hand: rel(hip, T, [52, 20])}, props: eqProps("plate")};
    },
    pushup(o) {
      const v = o.v || "floor";
      let H = [62, 164], F = [184, 164], drop = 36, props = [];
      if (v === "incline") { H = [62, 128]; F = [170, 164]; drop = 34; props = [{t: "box", x: 40, y: 128, w: 46, h: 42}]; }
      if (v === "decline") { H = [60, 164]; F = [176, 122]; drop = 34; props = [{t: "box", x: 160, y: 126, w: 40, h: 44}]; }
      if (v === "pike") {
        const base = {foot: [150, 164], hand: [70, 164], to: [3, 10], eb: 1};
        return {A: {...base, hip: [116, 88], S: [76, 110]}, B: {...base, hip: [118, 92], S: [84, 136]}, props};
      }
      const BL = L.torso + L.th + L.sh - 2;
      const pose = (Sy) => {
        const dy = Sy - F[1], dx = -Math.sqrt(Math.max(0, BL * BL - dy * dy));
        const S = [F[0] + dx, Sy], u = [(F[0] - S[0]) / BL, (F[1] - S[1]) / BL];
        return {S, hip: add(S, u, L.torso), foot: F, hand: H, to: v === "decline" ? [4, 10] : [3, 10], eb: -1};
      };
      const top = H[1] - 54;
      return {A: pose(top), B: pose(top + drop), props};
    },
    dips(o) {
      const lean = o.chest ? 22 : 4;
      const hand = [100, 100], base = {hand, foot: [80, 150], kb: 1, to: [10, 6]};
      return {A: {...base, hip: [94, 96], T: lean}, B: {...base, hip: [86, 124], T: lean + 6, foot: [74, 166]}, props: [{t: "post", a: [100, 104], b: [100, 170], w: 5}, {t: "bar", p: [100, 100]}]};
    },
    benchdips() {
      const hand = [72, 118], foot = [160, 165];
      return {A: {hip: [80, 110], S: [78, 62], hand, foot, eb: 1}, B: {hip: [84, 140], S: [80, 92], hand, foot, eb: 1}, props: [{t: "box", x: 34, y: 120, w: 46, h: 50}]};
    },
    press(o) {
      const seated = o.seat === "1", hip = seated ? [92, 122] : STAND.hip, T = seated ? -4 : 0, foot = seated ? [136, 165] : STAND.foot;
      const A = {hip, T, foot, hand: rel(hip, T, [14, 2]), eb: -1}, B = {hip, T, foot, hand: rel(hip, T, [4, -55]), eb: -1};
      return {A, B, props: [...(seated ? seatProps(hip, T, true) : []), ...eqProps(o.g)]};
    },
    raise(o) {
      const hip = STAND.hip, T = 0, side = o.v === "lat";
      const from = [150, 166];
      return {A: {...STAND, T, hand: rel(hip, T, [6, 56])}, B: {...STAND, T, hand: rel(hip, T, side ? [48, 14] : [56, -6])}, props: eqProps(o.g || "db", {from})};
    },
    reardelt(o) {
      if (o.m === "1") { const hip = [92, 122], T = 6, foot = [134, 165]; return {A: {hip, T, foot, hand: rel(hip, T, [52, 2])}, B: {hip, T, foot, hand: rel(hip, T, [-18, 6])}, props: [...seatProps(hip, T, false), ...eqProps("m")]}; }
      const hip = [84, 96], T = 68, foot = [100, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [4, 54])}, B: {hip, T, foot, hand: rel(hip, T, [-30, 32])}, props: eqProps(o.g || "db", {from: [170, 166]})};
    },
    facepull() {
      const hip = [94, 88], T = -8, foot = [104, 165], foot2 = [84, 165];
      return {A: {hip, T, foot, foot2, hand: rel(hip, T, [54, -4]), eb: -1}, B: {hip, T, foot, foot2, hand: rel(hip, T, [18, -14]), eb: -1}, props: eqProps("cable", {from: [196, -6]})};
    },
    upright(o) {
      const hip = STAND.hip, T = 0;
      return {A: {...STAND, T, hand: rel(hip, T, [8, 54])}, B: {...STAND, T, hand: rel(hip, T, [14, 6])}, props: eqProps(o.g, {from: [130, 166]})};
    },
    shrug(o) {
      const hip = STAND.hip, T = 0, h = rel(hip, T, [6, 55]);
      return {A: {...STAND, T, hand: h, sh: 0}, B: {...STAND, T, hand: [h[0], h[1] - 9], sh: -9}, props: eqProps(o.g)};
    },
    curl(o) {
      const hip = STAND.hip, T = 0;
      const from = [130, 166], hammer = o.v === "high";
      if (hammer) { const f = [190, -10]; return {A: {...STAND, T, hand: rel(hip, T, [56, -4])}, B: {...STAND, T, hand: rel(hip, T, [22, -16]), eb: -1}, props: eqProps("cable", {from: f})}; }
      return {A: {...STAND, T, hand: rel(hip, T, [8, 55])}, B: {...STAND, T, hand: rel(hip, T, [24, 6])}, props: eqProps(o.g, {from})};
    },
    preacher(o) {
      const hip = [90, 122], T = 14, foot = [132, 165];
      const s = SH(hip, T);
      return {A: {hip, T, foot, hand: rel(hip, T, [44, 36]), eb: 1}, B: {hip, T, foot, hand: rel(hip, T, [26, -4]), eb: 1},
        props: [...seatProps(hip, T, false), {t: "pad", a: add(s, [6, 14]), b: add(s, [34, 40]), w: 8}, ...eqProps(o.g, {from: [170, 120]})]};
    },
    inclinecurl(o) {
      const hip = [104, 120], T = -32, foot = [146, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [0, 56])}, B: {hip, T, foot, hand: rel(hip, T, [26, 14])}, props: [...seatProps(hip, T, true), ...eqProps(o.g || "db")]};
    },
    concentration(o) {
      const hip = [88, 124], T = 42, foot = [132, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [6, 54])}, B: {hip, T, foot, hand: rel(hip, T, [26, 8])}, props: [...seatProps(hip, T, false), ...eqProps("db")]};
    },
    pushdown(o) {
      const hip = [94, 88], T = 10, foot = [100, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [24, 16])}, B: {hip, T, foot, hand: rel(hip, T, [12, 56])}, props: eqProps(o.one ? "cable" : "cable", {from: [150, -30]})};
    },
    overhead(o) {
      const seated = o.seat === "1", hip = seated ? [92, 122] : STAND.hip, T = seated ? -4 : (o.g === "cable" ? 24 : 0), foot = seated ? [136, 165] : STAND.foot;
      return {A: {hip, T, foot, hand: rel(hip, T, [-16, -2]), eb: -1}, B: {hip, T, foot, hand: rel(hip, T, o.g === "cable" ? [40, -38] : [6, -56]), eb: -1},
        props: [...(seated ? seatProps(hip, T, true) : []), ...eqProps(o.g, {from: [30, 166]})]};
    },
    kickback(o) {
      const hip = [84, 96], T = 68, foot = [100, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [-28, 36])}, B: {hip, T, foot, hand: rel(hip, T, [-54, 18])}, props: eqProps(o.g || "db", {from: [176, 166]})};
    },
    row(o) {
      const hip = [80, 96], T = o.v === "pendlay" ? 82 : 64, foot = [100, 165];
      return {A: {hip, T, foot, hand: rel(hip, T, [2, 54])}, B: {hip, T, foot, hand: rel(hip, T, [-16, 26])}, props: eqProps(o.g)};
    },
    row1(o) {
      const hip = [80, 104], T = 78, foot = [96, 165], foot2 = [70, 134];
      const s = SH(hip, T);
      return {A: {hip, T, foot, foot2, kb2: 1, to2: [-12, 2], hand: rel(hip, T, [2, 54]), hand2: add(s, [4, 30])}, B: {hip, T, foot, foot2, kb2: 1, to2: [-12, 2], hand: rel(hip, T, [-22, 22]), hand2: add(s, [4, 30])},
        props: [{t: "pad", a: [52, 140], b: [150, 140], w: 9}, {t: "post", a: [60, 144], b: [60, 170]}, {t: "post", a: [142, 144], b: [142, 170]}, ...eqProps("db")]};
    },
    rowchest(o) {
      const hip = [84, 126], T = 48, foot = [70, 165];
      const d = dir(T), front = [-d[1], d[0]];
      const s = SH(hip, T);
      return {A: {hip, T, foot, kb: 1, hand: rel(hip, T, [0, 54])}, B: {hip, T, foot, kb: 1, hand: rel(hip, T, [-22, 26])},
        props: [{t: "pad", a: add(add(hip, front, 14), d, 2), b: add(add(s, front, 14), d, -4), w: 10}, {t: "post", a: add(hip, [10, 20]), b: [hip[0] + 10, 170]}, ...eqProps(o.g || "db")]};
    },
    cablerow(o) {
      const hip = [80, 140], foot = [150, 150];
      return {A: {hip, T: 26, foot, to: [4, -10], hand: rel(hip, 26, [54, 8])}, B: {hip, T: -6, foot, to: [4, -10], hand: rel(hip, -6, [18, 30])},
        props: [{t: "pad", a: [60, 154], b: [104, 154], w: 9}, {t: "box", x: 154, y: 126, w: 8, h: 44}, ...eqProps(o.g || "cable", {from: [196, 136]})]};
    },
    machinerow() {
      const hip = [90, 122], T = 2, foot = [134, 165];
      const s = SH(hip, T);
      return {A: {hip, T, foot, hand: rel(hip, T, [54, 6])}, B: {hip, T, foot, hand: rel(hip, T, [8, 24])}, props: [...seatProps(hip, T, false), {t: "pad", a: add(s, [16, 8]), b: add(s, [16, 40]), w: 8}, ...eqProps("m")]};
    },
    pulldown(o) {
      const hip = [94, 122], T = -12, foot = [136, 165];
      const one = o.one === "1";
      return {A: {hip, T, foot, hand: rel(hip, T, [6, -54])}, B: {hip, T, foot, hand: rel(hip, T, [18, o.v === "close" ? 14 : 6])},
        props: [...seatProps(hip, T, false), {t: "roller", at: "knee", off: [0, -9]}, ...eqProps(one ? "cable" : "cable", {from: [102, -40]})]};
    },
    straightarm() {
      const hip = [92, 90], T = 24, foot = [104, 165], foot2 = [84, 165];
      return {A: {hip, T, foot, foot2, hand: rel(hip, T, [42, -36])}, B: {hip, T, foot, foot2, hand: rel(hip, T, [8, 56])}, props: eqProps("cable", {from: [150, -30]})};
    },
    pullup(o) {
      const bar = [100, -24];
      const A = {hip: [96, 84], S: [98, 34], hand: bar, foot: [80, 152], to: [10, 6]}, B = {hip: [98, 54], S: [100, 4], hand: bar, foot: [82, 122], to: [10, 6]};
      return {A, B, props: [{t: "bar", p: bar, posts: true}, ...(o.assist === "1" ? [{t: "roller", at: "knee", off: [0, 8], r: 7}] : [])]};
    },
    invrow() {
      const bar = [58, 98], F = [186, 164], BL = 126;
      const pose = Sy => { const dy = Sy - F[1], dx = -Math.sqrt(BL * BL - dy * dy), S = [F[0] + dx, Sy]; return {S, hip: add(S, [(F[0] - S[0]) / BL, (F[1] - S[1]) / BL], L.torso), hand: bar, foot: F, to: [2, 10], eb: 1}; };
      return {A: pose(150), B: pose(118), props: [{t: "bar", p: bar}, {t: "post", a: [44, 98], b: [44, 170]}]};
    },
    deadlift(o) {
      const foot = [100, 165];
      const rack = o.v === "rack";
      const Ahip = rack ? [84, 100] : [72, 118], AT = rack ? 42 : 60;
      return {A: {hip: Ahip, T: AT, foot, hand: rack ? [112, 128] : [114, 148]}, B: {hip: [96, 88], T: 0, foot, hand: [102, 142]}, props: eqProps(o.g || "bb")};
    },
    hyper(o) {
      const hip = [112, 100], foot = [168, 140];
      const hA = add(SH(hip, -150), dir(-150), -16), hB = add(SH(hip, -50), dir(-50), -16);
      return {A: {hip, T: -150, foot, kb: 1, to: [4, 10], hand: hA}, B: {hip, T: -50, foot, kb: 1, to: [4, 10], hand: hB},
        props: [{t: "pad", a: [120, 110], b: [152, 134], w: 10}, {t: "roller", at: [170, 128]}, {t: "post", a: [138, 126], b: [138, 170]}, ...(o.g === "plate" ? eqProps("plate") : [])]};
    },
    squat(o) {
      const v = o.v || "back", foot = [100, 165];
      let A = {hip: [96, 86], T: 6, foot}, B = {hip: [70, 126], T: 36, foot};
      if (v === "front") { A.T = 3; B = {hip: [74, 128], T: 20, foot}; }
      if (v === "hack") { A = {hip: [104, 80], T: -18, foot: [124, 165]}; B = {hip: [84, 124], T: -12, foot: [124, 165]}; }
      if (v === "wide" || v === "plie") { B.T = 24; B.hip = [76, 128]; }
      if (v === "jump") { A = {hip: [96, 66], T: 4, foot: [100, 146]}; B = {hip: [72, 124], T: 32, foot}; }
      if (v === "wall") { A = {hip: [72, 128], T: -2, foot: [118, 165]}; B = {hip: [72, 126], T: -2, foot: [118, 165]}; }
      const handFor = (p) => {
        const s = SH(p.hip, p.T);
        if (v === "back" || v === "box" || v === "smith" || v === "wide" || v === "hack") return add(s, [6, -4]);
        if (v === "front") return add(s, [14, -2]);
        if (v === "goblet") return add(s, [18, 14]);
        if (v === "db" || v === "plie") return v === "plie" ? add(s, [6, 52]) : add(s, [4, 54]);
        if (v === "wall") return add(s, [2, 50]);
        return add(s, p === A ? [10, 52] : [52, 6]);
      };
      A.hand = handFor(A); B.hand = handFor(B);
      if (v === "back" || v === "box" || v === "smith" || v === "wide" || v === "hack") { A.eb = 1; B.eb = 1; }
      if (v === "front") { A.eb = -1; B.eb = -1; }
      const props = [];
      if (v === "box") props.push({t: "box", x: 46, y: 132, w: 34, h: 38});
      if (v === "wall") props.push({t: "wall", x: 56});
      if (v === "hack") props.push({t: "pad", a: "hip", ao: [-12, 4], b: "S", bo: [-12, -6], w: 9});
      if (v === "back" || v === "box" || v === "wide") props.push({t: "bb", at: "S", off: [-2, -8], front: true});
      if (v === "front") props.push({t: "bb", at: "S", off: [12, -6], front: true});
      if (v === "smith") props.push({t: "rails", at: "S", off: [-2, 0]}, {t: "bb", at: "S", off: [-2, -8], front: true});
      if (v === "goblet") props.push(...eqProps(o.g === "kb" ? "kb" : "db"));
      if (v === "db" || v === "plie") props.push(...eqProps(o.g === "kb" ? "kb" : "db"));
      return {A, B, props};
    },
    legpress(o) {
      const hip = [66, 132], T = -56;
      const A = {hip, T, foot: o.v === "narrow" ? [106, 106] : [104, 104], hand: add(SH(hip, T), [30, 30]), to: [10, -8]}, B = {hip, T, foot: [128, 80], hand: add(SH(hip, T), [30, 30]), to: [10, -8]};
      return {A, B, props: [{t: "pad", a: add(hip, [-6, 14]), b: add(hip, [28, 14]), w: 9}, {t: "pad", a: "hip", ao: [-14, 2], b: "S", bo: [-12, 10], w: 9}, {t: "sled", at: "toe", off: [-2, 2], ang: 44}, {t: "post", a: [80, 150], b: [80, 170]}]};
    },
    splitsquat(o) {
      const foot = [124, 165], foot2 = [42, 124];
      return {A: {hip: [90, 94], T: 8, foot, foot2, to2: [-10, 4], kb2: 1, hand: rel([90, 94], 8, [4, 54])}, B: {hip: [84, 124], T: 10, foot, foot2, to2: [-10, 4], kb2: 1, hand: rel([84, 124], 10, [4, 52])},
        props: [{t: "box", x: 22, y: 128, w: 36, h: 42}, ...eqProps(o.g)]};
    },
    lunge(o) {
      const foot = [134, 165], foot2 = [56, 160];
      return {A: {hip: [96, 90], T: 4, foot, foot2, to2: [10, 8], kb2: -1, hand: rel([96, 90], 4, [4, 54])}, B: {hip: [94, 124], T: 4, foot, foot2, to2: [10, 8], kb2: -1, hand: rel([94, 124], 4, [4, 52])}, props: eqProps(o.g)};
    },
    stepup(o) {
      return {A: {hip: [92, 94], T: 14, foot: [134, 130], foot2: [78, 165], hand: rel([92, 94], 14, [4, 54])}, B: {hip: [130, 54], T: 2, foot: [134, 130], foot2: [120, 118], hand: rel([130, 54], 2, [4, 54])}, props: [{t: "box", x: 112, y: 134, w: 62, h: 36}, ...eqProps(o.g)]};
    },
    legext(o) {
      const hip = [88, 120], T = -12;
      const hand = add(hip, [8, 10]);
      return {A: {hip, T, foot: [130, 158], hand}, B: {hip, T, foot: [166, 116], hand, to: [6, -12]}, props: [...seatProps(hip, T, true), {t: "roller", at: "ankle", off: [4, -4]}]};
    },
    rdl(o) {
      const foot = [100, 165];
      const gm = o.v === "gm";
      const A = {hip: [96, 88], T: 2, foot}, B = {hip: [80, 94], T: 76, foot};
      A.hand = gm ? add(SH(A.hip, A.T), [6, -4]) : add(SH(A.hip, A.T), [6, 54]);
      B.hand = gm ? add(SH(B.hip, B.T), [4, -6]) : add(SH(B.hip, B.T), [6, 52]);
      const props = gm ? [{t: "bb", at: "S", off: [-2, -8], front: true}] : eqProps(o.g, {from: [20, 166]});
      if (o.g === "smith") props.unshift();
      return {A, B, props};
    },
    pullthrough() {
      const foot = [100, 165];
      return {A: {hip: [104, 96], T: 74, foot, hand: [84, 150]}, B: {hip: [96, 88], T: 2, foot, hand: [104, 128]}, props: eqProps("cable", {from: [16, 166]})};
    },
    hipthrust(o) {
      const foot = [134, 165], S = [56, 112];
      const A = {hip: [98, 152], S, foot, hand: [102, 140]}, B = {hip: [102, 112], S, foot, hand: [106, 100]};
      const props = o.floor === "1" ? [] : [{t: "box", x: 18, y: 116, w: 42, h: 54}];
      if (o.floor === "1") { A.S = [56, 158]; B.S = [56, 158]; A.hip = [98, 160]; B.hip = [100, 130]; A.hand = [80, 166]; B.hand = [80, 166]; foot[0] = 128; }
      if (o.one === "1") { A.foot2 = [150, 116]; B.foot2 = [156, 90]; A.to2 = B.to2 = [8, -10]; }
      if (o.g === "bb") props.push({t: "bb", at: "hip", off: [4, -14], front: true});
      if (o.g === "smith") props.push({t: "rails", at: "hip", off: [4, 0]}, {t: "bb", at: "hip", off: [4, -14], front: true});
      return {A, B, props};
    },
    kickglute(o) {
      const hip = [96, 90], T = 18, foot2 = [100, 165];
      const hand = rel(hip, T, [36, 22]);
      return {A: {hip, T, foot: [102, 162], foot2, hand, kb: 1}, B: {hip, T, foot: [36, 132], foot2, hand, kb: 1, to: [-2, 12]},
        props: [{t: "post", a: [140, 100], b: [140, 170]}, ...(o.g === "cable" ? [{t: "cable", from: [180, 166], at: "ankle"}] : [])]};
    },
    legcurl(o) {
      if (o.seat === "1") {
        const hip = [86, 120], T = -10;
        const hand = add(hip, [8, 10]);
        return {A: {hip, T, foot: [166, 118], hand, to: [6, -12]}, B: {hip, T, foot: [130, 160], hand}, props: [...seatProps(hip, T, true), {t: "roller", at: "ankle", off: [0, 6]}]};
      }
      const hip = [96, 124], S = [46, 124], hand = [40, 140];
      return {A: {hip, S, foot: [174, 128], kb: 1, hand, to: [4, 10]}, B: {hip, S, foot: [128, 86], kb: 1, hand, to: [10, -2]},
        props: [{t: "pad", a: [30, 136], b: [150, 136], w: 9}, {t: "post", a: [40, 140], b: [40, 170]}, {t: "post", a: [140, 140], b: [140, 170]}, {t: "roller", at: "ankle", off: [0, -8]}]};
    },
    abduct(o) {
      const hip = [88, 120], T = -10, hand = add(hip, [10, 8]);
      return {A: {hip, T, foot: [162, 124], foot2: [162, 124], hand, to: [6, -12]}, B: {hip, T, foot: [156, 132], foot2: [164, 114], hand, to: [6, -12]}, props: [...seatProps(hip, T, true), {t: "roller", at: "knee", off: [0, o.v === "in" ? 6 : -8]}]};
    },
    calf(o) {
      const v = o.v || "stand";
      if (v === "seat") {
        const hip = [80, 122], T = 0, hand = add(SH(hip, T), [34, 40]);
        return {A: {hip, T, foot: [124, 160], hand, to: [13, 5]}, B: {hip, T, foot: [125, 150], hand, to: [12, 15]}, props: [...seatProps(hip, T, false), {t: "roller", at: "knee", off: [4, -8]}, ...eqProps(o.g === "db" ? "db" : "", {at: "knee", off: [4, -12]})]};
      }
      if (v === "press") {
        const hip = [66, 132], T = -56;
        return {A: {hip, T, foot: [124, 84], hand: add(SH(hip, T), [30, 30]), to: [6, -12]}, B: {hip, T, foot: [126, 82], hand: add(SH(hip, T), [30, 30]), to: [12, -6]},
          props: [{t: "pad", a: add(hip, [-6, 14]), b: add(hip, [28, 14]), w: 9}, {t: "pad", a: "hip", ao: [-14, 2], b: "S", bo: [-12, 10], w: 9}, {t: "sled", at: [140, 70], ang: 44}]};
      }
      const sh = rel(STAND.hip, 0, [0, 0]);
      const hA = o.g === "bb" || o.g === "smith" ? add(sh, [6, -4]) : add(sh, [6, 55]);
      const props = o.g === "bb" ? [{t: "bb", at: "S", off: [-2, -8], front: true}] : o.g === "smith" ? [{t: "rails", at: "S"}, {t: "bb", at: "S", off: [-2, -8], front: true}] : o.g === "m" ? [{t: "pad", a: "S", ao: [-10, -8], b: "S", bo: [14, -8], w: 7}] : eqProps(o.g);
      return {A: {hip: [96, 88], T: 0, foot: [100, 163], to: [13, 5], hand: hA, eb: o.g === "bb" || o.g === "smith" ? 1 : 1}, B: {hip: [97, 78], T: 0, foot: [101, 153], to: [12, 15], hand: add(hA, [1, -10])}, props: [{t: "box", x: 104, y: 166, w: 40, h: 6}, ...props]};
    },
    crunch(o) {
      const hip = [112, 158], foot = [146, 165];
      const tA = o.v === "situp" ? -92 : -90, tB = o.v === "situp" ? -10 : -58;
      const hand = T => add(SH(hip, T), dir(T), 6);
      return {A: {hip, T: tA, foot, hand: hand(tA), eb: 1}, B: {hip, T: tB, foot, hand: hand(tB), eb: 1}, props: []};
    },
    cablecrunch() {
      const hip = [100, 124], foot = [62, 162];
      const hand = T => add(SH(hip, T), [6, -6]);
      return {A: {hip, T: 12, foot, kb: 1, to: [-12, 4], hand: hand(12), eb: -1}, B: {hip, T: 78, foot, kb: 1, to: [-12, 4], hand: hand(78), eb: -1}, props: eqProps("cable", {from: [128, -36]})};
    },
    machinecrunch() {
      const hip = [90, 122], foot = [134, 165];
      const hand = T => add(SH(hip, T), [10, -8]);
      return {A: {hip, T: -6, foot, hand: hand(-6), eb: -1}, B: {hip, T: 36, foot, hand: hand(36), eb: -1}, props: [...seatProps(hip, 0, false), ...eqProps("m")]};
    },
    hangraise() {
      const bar = [98, -26];
      return {A: {hip: [96, 82], S: [97, 32], hand: bar, foot: [98, 158], to: [8, 6]}, B: {hip: [96, 82], S: [97, 32], hand: bar, foot: [172, 82], to: [6, -10], kb: -1}, props: [{t: "bar", p: bar, posts: true}]};
    },
    legraise(o) {
      const hip = [112, 160], T = -90;
      const hand = add(SH(hip, T), [42, 4]);
      if (o.v === "rev") return {A: {hip, T, foot: [148, 132], hand, to: [8, -8]}, B: {hip: [114, 152], T: -94, foot: [100, 100], hand, to: [8, -8]}, props: []};
      if (o.v === "bike") { const hd = add(SH(hip, -70), dir(-70), 6); return {A: {hip, T: -70, foot: [146, 126], foot2: [182, 140], hand: hd, to: [8, -6]}, B: {hip, T: -70, foot: [182, 140], foot2: [146, 126], hand: hd, to: [8, -6]}, props: []}; }
      if (o.v === "deadbug") return {A: {hip, T, foot: [150, 112], foot2: [150, 112], hand: add(SH(hip, T), [4, -54]), to: [8, -6]}, B: {hip, T, foot: [188, 150], foot2: [150, 112], hand: add(SH(hip, T), [-52, -10]), hand2: add(SH(hip, T), [4, -54]), to: [8, -6]}, props: []};
      return {A: {hip, T, foot: [188, 162], hand, to: [4, -10]}, B: {hip, T, foot: [118, 84], hand, to: [10, -4]}, props: []};
    },
    plank(o) {
      const base = {hand: [88, 166], foot: [188, 162], to: [3, 10], eb: 1};
      if (o.v === "climb") return {A: {...base, hip: [122, 124], S: [74, 109], hand: [70, 164]}, B: {...base, hip: [122, 122], S: [74, 109], hand: [70, 164], foot: [120, 140], foot2: [172, 160], kb: 1}, props: []};
      return {A: {...base, hip: [114, 146], S: [64, 142]}, B: {...base, hip: [114, 142], S: [64, 141]}, props: []};
    },
    twist() {
      const hip = [100, 158], T = -40;
      return {A: {hip, T, foot: [150, 138], hand: rel(hip, T, [36, 12]), hand2: rel(hip, T, [30, 24]), to: [10, -4]}, B: {hip, T, foot: [150, 138], hand: rel(hip, T, [24, 34]), hand2: rel(hip, T, [36, 12]), to: [10, -4]}, props: [{t: "plate", at: "hand", r: 7, front: true}]};
    },
    wheel() {
      const foot = [60, 163];
      return {A: {hip: [94, 124], S: [120, 110], hand: [126, 160], foot, kb: 1, to: [-12, 4]}, B: {hip: [102, 146], S: [150, 140], hand: [178, 160], foot, kb: 1, to: [-12, 4]}, props: [{t: "wheel", at: "hand", front: true}]};
    },
    stand() { return {A: {...STAND, T: 0, hand: rel(STAND.hip, 0, [6, 55])}, B: {...STAND, T: 0, hand: rel(STAND.hip, 0, [6, 55])}, props: []}; }
  };

  function spec(pattern, params) {
    const fn = P[pattern] || P.stand;
    try { return fn(params || {}); } catch (e) { return P.stand(); }
  }
  function parse(s) { const o = {}; (s || "").split(",").forEach(kv => { if (!kv) return; const [k, v] = kv.split("="); o[k] = v == null ? "1" : v; }); return o; }

  // animation loop for all live figures
  const live = new Set();
  let raf = 0;
  function loop(ts) {
    raf = 0;
    live.forEach(f => {
      if (!f.el.isConnected) { live.delete(f); return; }
      const ph = ((ts - f.t0) / f.period) % 1;
      const k = .5 - .5 * Math.cos(ph * 2 * Math.PI);
      f.g.innerHTML = draw(f.spec, k);
    });
    if (live.size) raf = requestAnimationFrame(loop);
  }
  function svg(inner, cls) { return `<svg class="${cls || "fig"}" viewBox="-6 -50 212 226" aria-hidden="true"><g>${inner}</g></svg>`; }
  function still(pattern, params, t = .65) { return svg(draw(spec(pattern, parse(params)), t), "fig still"); }
  function mount(el, pattern, params, period = 2600) {
    const sp = spec(pattern, parse(params));
    el.innerHTML = svg(draw(sp, 0), "fig anim");
    const f = {el, g: el.querySelector("g"), spec: sp, period, t0: performance.now()};
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { f.g.innerHTML = draw(sp, .7); return; }
    live.add(f);
    if (!raf) raf = requestAnimationFrame(loop);
  }
  return {still, mount, spec, draw, parse, patterns: Object.keys(P)};
})();
