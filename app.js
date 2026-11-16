/* FitDuo: calorie diary + workout diary. All data lives on the device (localStorage). */
(function () {
  "use strict";
  const APP = {name: "FitDuo", version: "1.0.0", url: "https://fitduo-app.github.io/"};
  const KEY = "fitduo.v1";
  const {FOODS, EX, TPL, CARDIO} = window.FDATA;
  const FOOD = Object.fromEntries(FOODS.map(f => [f.id, f]));
  const EXM = Object.fromEntries(EX.map(e => [e.id, e]));
  const MEALS = [{id: "b", ic: "🍳"}, {id: "l", ic: "🍲"}, {id: "d", ic: "🥗"}, {id: "s", ic: "🍎"}];
  const CATS = ["meat", "fish", "eggs", "dairy", "grains", "bread", "legumes", "fruit", "veg", "dishes", "fats", "sweets", "drinks"];
  const GROUPS = ["chest", "back", "shoulders", "biceps", "triceps", "legs", "glutes", "calves", "abs"];
  const PLACE_EQ = {gym: "bdcmwk", db: "dwk", none: "w"};
  const TPL_EM = {chest_tri: "💪", back_bi: "🏋️", legs: "🦵", shoulders: "🎯", upper: "⬆️", lower: "⬇️", full: "🔥", empty: "✍️"};
  const CARDIO_EM = {walk: "🚶", incline: "⛰️", bike: "🚴", ellip: "〰️", run: "🏃", swim: "🏊", rowing: "🚣", stairs: "🪜"};

  // ---------- state ----------
  const blank = () => ({v: 1, profile: null, settings: {lang: guessLang(), units: "kg", rest: 90, hints: {}, showBase: false}, days: {}, myFoods: [], workouts: [], active: null, weights: [], customEx: []});
  let S = load();
  function guessLang() {
    const l = (navigator.language || "en").slice(0, 2).toLowerCase();
    return ["uk", "ru", "en", "es"].includes(l) ? l : "en";
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v) { const b = blank(); s.settings = Object.assign(b.settings, s.settings || {}); return Object.assign(b, s); }
    } catch (e) {}
    return blank();
  }
  let saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(saveNow, 150); }
  function saveNow() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("⚠️ Storage full"); } }
  window.addEventListener("pagehide", saveNow);
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveNow(); else if (tab === "today" && !$("#sheet")) render(); });
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}

  // ---------- helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const LI = () => ({uk: 0, ru: 1, en: 2, es: 3})[S.settings.lang] || 0;
  function t(k, ...a) {
    const v = window.T[k]; let s = v ? (v[LI()] || v[2]) : k;
    s = s.replace(/\{(\d)#([^}]*)\}/g, (_, i, f) => { const forms = f.split("|"), n = Number(a[i]); let c = "other"; try { c = new Intl.PluralRules(S.settings.lang).select(n); } catch (e) {} return forms[c === "one" ? 0 : c === "few" || forms.length < 3 ? 1 : c === "many" ? 2 : 1] || forms[forms.length - 1]; });
    a.forEach((x, i) => { s = s.split("{" + i + "}").join(x); }); return s;
  }
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseIso = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseIso(s); d.setDate(d.getDate() + n); return iso(d); };
  const todayIso = () => iso(new Date());
  const dayDiff = (a, b) => Math.round((parseIso(b) - parseIso(a)) / 864e5);
  const loc = () => window.LOCALE[S.settings.lang] || "en-GB";
  const fmt = (n, dec = 0) => (Math.round(n * 10 ** dec) / 10 ** dec).toLocaleString(loc(), {maximumFractionDigits: dec});
  const num = v => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : NaN; };
  const inVal = n => String(Math.round(n * 10) / 10);
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const dateLong = s => parseIso(s).toLocaleDateString(loc(), {weekday: "long", day: "numeric", month: "long"});
  const dateShort = s => parseIso(s).toLocaleDateString(loc(), {day: "numeric", month: "short"});
  const monthYear = d => d.toLocaleDateString(loc(), {month: "long", year: "numeric"});
  const LB = 2.20462;
  const isLb = () => S.settings.units === "lb";
  const wUnit = () => t(isLb() ? "lb" : "kg");
  const toU = kg => isLb() ? kg * LB : kg;
  const fromU = v => isLb() ? v / LB : v;
  const wTxt = (kg, dec = 1) => fmt(toU(kg), dec) + " " + wUnit();
  const liftU = kg => Math.round(toU(kg) * 4) / 4;
  const liftTxt = kg => fmt(liftU(kg), 2);
  function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("on");
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2800);
  }
  function hintCard(key) {
    if (S.settings.hints[key]) return "";
    return `<div class="card tip hint" data-hint="${key}"><div class="t">💡 ${esc(APP.name)}</div>${t("hint_" + key)}<div style="margin-top:10px"><button class="btn small" data-hintok="${key}">${t("got_it")}</button></div></div>`;
  }
  function bindHints() { $$("[data-hintok]").forEach(b => b.onclick = () => { S.settings.hints[b.dataset.hintok] = 1; save(); b.closest(".hint").remove(); }); }

  // ---------- nutrition plan ----------
  function calc(p) {
    const w = currentWeightOf(p), h = p.height, a = p.age;
    const bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === "m" ? 5 : -161);
    const factor = [1.2, 1.3, 1.4, 1.5][p.steps - 1] + [0, .075, .125, .175][p.tf];
    const formula = bmr * factor;
    const tdee = p.adapt && p.adapt.tdee ? p.adapt.tdee : formula;
    const pace = paceKg(p);
    let k = tdee;
    if (p.goal === "lose") k = tdee - Math.min(pace * 1100, tdee * .25);
    if (p.goal === "gain") k = tdee + [150, 250, 400][p.pace];
    k = Math.max(k, p.sex === "m" ? 1500 : 1200);
    k = Math.round(k / 10) * 10;
    const ref = Math.min(w, 25 * (h / 100) ** 2);
    let pr = ref * ({lose: 2, keep: 1.6, gain: 1.8})[p.goal] * (p.tf === 0 ? .85 : 1);
    pr = Math.round(pr / 5) * 5;
    const f = Math.round(Math.max(k * .25 / 9, ref * .6));
    const c = Math.max(0, Math.round((k - pr * 4 - f * 9) / 4));
    return {bmr: Math.round(bmr), formula: Math.round(formula / 10) * 10, tdee: Math.round(tdee / 10) * 10, k, p: pr, f, c, delta: Math.round(Math.abs(tdee - k) / 10) * 10};
  }
  function paceKg(p) { return p.goal === "gain" ? [.125, .25, .4][p.pace] : [.25, .5, .75][p.pace]; }
  function targets() { const c = calc(S.profile); return S.profile.manual ? Object.assign({}, c, S.profile.manual) : c; }
  function etaDate(p, fromW) {
    if (p.goal === "keep") return null;
    const diff = Math.abs((fromW == null ? p.weight : fromW) - p.target);
    if (diff < .3) return null;
    const d = new Date(); d.setDate(d.getDate() + Math.ceil(diff / paceKg(p) * 7));
    return d;
  }
  const sortedW = () => [...S.weights].sort((a, b) => a.date < b.date ? -1 : 1);
  function currentWeightOf(p) { const w = S.profile === p ? sortedW() : []; return w.length ? w[w.length - 1].kg : p.weight; }
  const currentWeight = () => currentWeightOf(S.profile);

  // weight trend: least squares over the last N days (kg per day)
  function trend(daysBack = 28) {
    const from = addDays(todayIso(), -daysBack);
    const W = sortedW().filter(w => w.date >= from);
    if (W.length < 2) return null;
    const xs = W.map(w => dayDiff(from, w.date)), ys = W.map(w => w.kg);
    const span = xs[xs.length - 1] - xs[0]; if (span < 7) return null;
    const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
    let num1 = 0, den = 0; xs.forEach((x, i) => { num1 += (x - mx) * (ys[i] - my); den += (x - mx) ** 2; });
    return {slope: den ? num1 / den : 0, span, n: W.length};
  }
  // real maintenance from intake + weight change
  function adaptive() {
    const p = S.profile, tr = trend(28);
    if (!tr || tr.span < 14) return null;
    const from = addDays(todayIso(), -28);
    const ds = Object.keys(S.days).filter(d => d >= from && d < todayIso()).map(d => totals(d)).filter(x => x.k >= 800);
    if (ds.length < 10) return null;
    const avg = ds.reduce((s, x) => s + x.k, 0) / ds.length;
    const c = calc(Object.assign({}, p, {adapt: null}));
    let real = avg - tr.slope * 7700;
    real = Math.max(c.formula * .75, Math.min(c.formula * 1.35, real));
    real = Math.round(real / 10) * 10;
    const sugg = calc(Object.assign({}, p, {adapt: {tdee: real}})).k;
    return {days: ds.length, avg, perWeek: tr.slope * 7, real, sugg, current: targets().k};
  }

  // ---------- foods ----------
  const getFood = id => FOOD[id] || S.myFoods.find(f => f.id === id) || null;
  const foodName = f => f ? (typeof f.n === "string" ? f.n : (f.n[S.settings.lang] || f.n.en)) : "?";
  const itemName = it => { const f = getFood(it.fid); return f ? foodName(f) : it.n; };
  function nutrFor(f, q, unit) {
    const grams = unit === "pc" ? q * (f.pc || 100) : q, r = grams / 100;
    return {k: f.k * r, p: f.p * r, f: f.f * r, c: f.c * r};
  }
  function day(d) { return S.days[d] || (S.days[d] = {items: [], water: 0}); }
  function totals(d) {
    const x = {k: 0, p: 0, f: 0, c: 0};
    (S.days[d] && S.days[d].items || []).forEach(i => { x.k += i.k; x.p += i.p; x.f += i.f; x.c += i.c; });
    return x;
  }
  function usage() {
    const u = {};
    Object.values(S.days).forEach(d => (d.items || []).forEach(i => { u[i.fid] = (u[i.fid] || 0) + 1; }));
    return u;
  }
  function lastAmount(fid) {
    for (const d of Object.keys(S.days).sort().reverse()) { const it = [...S.days[d].items].reverse().find(i => i.fid === fid); if (it) return it; }
    return null;
  }
  function mealByTime() { const h = new Date().getHours(); return h < 11 ? "b" : h < 16 ? "l" : h < 21 ? "d" : "s"; }

  // ---------- exercises ----------
  const getEx = id => EXM[id] || S.customEx.find(e => e.id === id) || {id, n: "?", g: "custom", eq: "x", lo: 8, hi: 12};
  const exName = e => typeof e.n === "string" ? e.n : (e.n[S.settings.lang] || e.n.en);
  const exMatches = (e, q) => !q || (typeof e.n === "string" ? e.n : Object.values(e.n).join(" ")).toLowerCase().includes(q);
  const allowedEx = (all) => all ? EX : EX.filter(e => PLACE_EQ[S.profile.place || "gym"].includes(e.eq));
  const figStill = (e, cls = "thumb") => e.fig ? `<div class="${cls} figbox">${window.FIG.still(e.fig, e.fp)}</div>` : `<div class="${cls} figbox" style="display:flex;align-items:center;justify-content:center;font-size:22px">🏋️</div>`;
  function pickForTemplate(tpl) {
    const al = allowedEx(), used = new Set(), out = [], seenG = {};
    tpl.g.forEach(g => {
      const n = seenG[g] = (seenG[g] || 0) + 1;
      let cands = al.filter(e => e.g === g && !used.has(e.id));
      if (n === 1) cands = [...cands.filter(e => e.cmp), ...cands.filter(e => !e.cmp)];
      else if (n === 2) cands = [...cands.filter(e => e.eq !== (EXM[out[out.length - 1]] || {}).eq), ...cands];
      const e = cands[0]; if (e) { used.add(e.id); out.push(e.id); }
    });
    return out;
  }
  function strengthWorkouts(exceptId) { return S.workouts.filter(w => w.kind === "strength" && w.id !== exceptId).sort((a, b) => b.start - a.start); }
  function lastSetsFor(eid, exceptId) {
    for (const w of strengthWorkouts(exceptId)) { const x = w.ex.find(e => e.eid === eid); if (x) { const s = x.sets.filter(s => s.done && s.r > 0); if (s.length) return s; } }
    return null;
  }
  function incFor(e) {
    const big = e.cmp && ["legs", "glutes", "back"].includes(e.g) && e.eq !== "d" && e.eq !== "k";
    if (isLb()) return (big ? 10 : 5) / LB;
    return e.eq === "d" || e.eq === "k" ? 2 : big ? 5 : 2.5;
  }
  const isTimed = e => e.hi >= 30 && e.eq === "w";
  function progress(e, prev) {
    if (!prev) return {kind: "first"};
    const w = Math.max(...prev.map(s => s.w || 0));
    if (!(w > 0)) return {kind: e.eq === "w" ? "bw" : "first"};
    const work = prev.filter(s => (s.w || 0) >= w * .95);
    if (work.every(s => s.r >= e.hi)) return {kind: "up", w: w + incFor(e)};
    if (work.some(s => s.r < e.lo - 1)) return {kind: "down", w: w * .9};
    return {kind: "reps", w};
  }
  function advice(e, prev) {
    const p = progress(e, prev);
    if (e.eq === "w" && p.kind !== "up" && p.kind !== "reps") return t("prog_bw");
    if (p.kind === "first") return t("prog_first", e.lo, e.hi);
    if (p.kind === "bw") return t("prog_bw");
    if (p.kind === "up") return t("prog_up", e.hi, liftTxt(p.w) + " " + wUnit());
    if (p.kind === "down") return t("prog_down", liftTxt(p.w) + " " + wUnit(), e.lo, e.hi);
    return t("prog_reps", liftTxt(p.w) + " " + wUnit(), e.hi);
  }
  const strengthKcal = min => Math.round(5 * currentWeight() * min / 60);

  // weekly program
  function rotation() {
    const p = S.profile;
    if (p.place === "none" || p.tf <= 1) return {id: "full", list: ["full"]};
    if (p.tf === 2) return {id: "ul", list: ["upper", "lower"]};
    return {id: "split", list: ["chest_tri", "back_bi", "legs", "shoulders", "full"]};
  }
  function nextTpl() {
    const r = rotation(), last = strengthWorkouts().find(w => r.list.includes(w.tpl));
    if (!last) return r.list[0];
    return r.list[(r.list.indexOf(last.tpl) + 1) % r.list.length];
  }

  // ---------- back button support for sheets ----------
  let sheetOpen = false;
  window.addEventListener("popstate", () => { if (sheetOpen) closeSheet(true); });

  // ---------- render root ----------
  let tab = "today", cur = todayIso();
  function render() {
    document.documentElement.lang = S.settings.lang;
    document.title = APP.name;
    if (!S.profile || ob) { renderOnboarding(); $("#nav").hidden = true; return; }
    $("#nav").hidden = false;
    renderNav();
    ({today: renderToday, train: renderTrain, progress: renderProgress, profile: renderProfile})[tab]();
    bindHints();
  }
  const ICONS = {
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 11h16M8 3v4M16 3v4"/><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8.5 15.5l2 2 4-4"/></svg>',
    train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/></svg>',
    progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M5 15l4-4 3 3 7-7"/><path d="M15 7h4v4"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'
  };
  function renderNav() {
    $("#nav").innerHTML = '<div class="in">' + ["today", "train", "progress", "profile"].map(k =>
      `<button data-tab="${k}" class="${tab === k ? "on" : ""}"><span class="pill">${ICONS[k]}${k === "train" && S.active ? '<i class="dot"></i>' : ""}</span>${t("nav_" + k)}</button>`).join("") + "</div>";
    $$("#nav button").forEach(b => b.onclick = () => { tab = b.dataset.tab; if (tab === "today") cur = todayIso(); window.scrollTo(0, 0); render(); });
  }

  // ---------- onboarding ----------
  let ob = null;
  function obInit(edit) {
    const p = S.profile;
    ob = {i: edit ? 1 : 0, edit: !!edit, d: p ? JSON.parse(JSON.stringify(p)) : {goal: "", sex: "", age: "", height: "", weight: "", target: "", steps: 0, tf: -1, place: "", pace: 1}};
    if (edit) { ob.d.weight = currentWeight(); delete ob.d.adapt; }
  }
  const OB_STEPS = ["hello", "goal", "sex", "body", "steps", "tf", "place", "pace", "plan"];
  function obSteps() { return OB_STEPS.filter(s => !(s === "pace" && ob.d.goal === "keep")); }
  function renderOnboarding() {
    if (!ob) obInit(false);
    const steps = obSteps(), st = steps[ob.i], d = ob.d, app = $("#app");
    const opt = (key, val, em, title, desc) => `<button class="opt ${d[key] === val ? "on" : ""}" data-k="${key}" data-v="${val}"><span class="em">${em}</span><span><b>${title}</b>${desc ? `<span>${desc}</span>` : ""}</span></button>`;
    let body = "", canNext = true, nextLbl = t("next");
    if (st === "hello") {
      app.innerHTML = `<div class="ob"><div class="body welcome">
        <img class="logo" src="icons/icon-192.png" alt="">
        <h1>${esc(APP.name)}</h1>
        <p class="lead" style="margin-top:6px"><b style="color:var(--text)">${t("ob_hello")}</b></p>
        <p class="lead">${t("ob_hello_text")}</p>
        <div class="hello-figs">${["squat", "bench", "curl"].map(p => `<div class="figbox" data-fig="${p}"></div>`).join("")}</div>
        <div class="chips" style="justify-content:center;flex-wrap:wrap">${window.LANGS.map(([c, n]) => `<button class="chip ${S.settings.lang === c ? "on" : ""}" data-lang="${c}">${n}</button>`).join("")}</div>
      </div><div class="foot"><button class="btn big block" id="obNext">${t("ob_start")}</button><p class="small muted" style="text-align:center">🔒 ${t("ob_private")}</p></div></div>`;
      $$("[data-fig]").forEach((el, i) => window.FIG.mount(el, el.dataset.fig, el.dataset.fig === "squat" ? "v=back" : el.dataset.fig === "bench" ? "g=bb" : "g=db", 2400 + i * 300));
      $$("[data-lang]").forEach(b => b.onclick = () => { S.settings.lang = b.dataset.lang; save(); renderOnboarding(); });
      $("#obNext").onclick = () => { ob.i++; renderOnboarding(); };
      return;
    }
    if (st === "goal") {
      body = `<h1>${t("ob_goal_q")}</h1><p class="lead"></p>` + opt("goal", "lose", "🔥", t("goal_lose"), t("goal_lose_d")) + opt("goal", "keep", "⚖️", t("goal_keep"), t("goal_keep_d")) + opt("goal", "gain", "💪", t("goal_gain"), t("goal_gain_d"));
      canNext = !!d.goal;
    } else if (st === "sex") {
      body = `<h1>${t("ob_sex_q")}</h1><p class="lead">${t("ob_sex_d")}</p>` + opt("sex", "m", "👨", t("sex_m")) + opt("sex", "f", "👩", t("sex_f"));
      canNext = !!d.sex;
    } else if (st === "body") {
      const u = wUnit(), sh = v => v === "" || v == null ? "" : inVal(toU(v));
      body = `<h1>${t("ob_body_q")}</h1><p class="lead"></p>
        <div class="seg" style="margin-bottom:16px"><button data-u="kg" class="${!isLb() ? "on" : ""}">${t("kg")}</button><button data-u="lb" class="${isLb() ? "on" : ""}">${t("lb")}</button></div>
        <div class="grid2"><div class="field"><label>${t("age")}</label><div class="unit-in"><input id="fAge" inputmode="numeric" value="${esc(d.age)}" placeholder="30"><span>${t("years")}</span></div></div>
        <div class="field"><label>${t("height")}</label><div class="unit-in"><input id="fH" inputmode="decimal" value="${esc(d.height)}" placeholder="175"><span>${t("cm")}</span></div></div></div>
        <div class="field" style="margin-top:12px"><label>${t("weight")}</label><div class="unit-in"><input id="fW" inputmode="decimal" value="${sh(d.weight)}" placeholder="${isLb() ? 200 : 90}"><span>${u}</span></div></div>
        ${d.goal !== "keep" ? `<div class="field" style="margin-top:12px"><label>${t("target_w")}</label><div class="unit-in"><input id="fT" inputmode="decimal" value="${sh(d.target)}" placeholder="${isLb() ? 170 : 78}"><span>${u}</span></div></div>` : ""}
        <p class="msg bad" id="obErr" hidden></p>`;
    } else if (st === "steps") {
      body = `<h1>${t("ob_steps_q")}</h1><p class="lead"></p>` + [1, 2, 3, 4].map(n => opt("steps", n, ["🪑", "🚶", "🚶‍♂️", "🏗️"][n - 1], t("steps_" + n), t("steps_" + n + "d"))).join("");
      canNext = d.steps > 0;
    } else if (st === "tf") {
      body = `<h1>${t("ob_tf_q")}</h1><p class="lead"></p>` + [0, 1, 2, 3].map(n => opt("tf", n, ["😴", "🙂", "💪", "🔥"][n], t("tf_" + n))).join("");
      canNext = d.tf >= 0;
    } else if (st === "place") {
      body = `<h1>${t("ob_place_q")}</h1><p class="lead">${t("ob_place_d")}</p>` + opt("place", "gym", "🏋️", t("place_gym"), t("place_gym_d")) + opt("place", "db", "🏠", t("place_db"), t("place_db_d")) + opt("place", "none", "🧘", t("place_none"), t("place_none_d"));
      canNext = !!d.place;
    } else if (st === "pace") {
      const ks = d.goal === "gain" ? [.125, .25, .4] : [.25, .5, .75];
      body = `<h1>${t("ob_pace_q")}</h1><p class="lead">${t("ob_pace_d")}</p>` + [0, 1, 2].map(n => opt("pace", n, ["🐢", "✅", "⚡"][n], t(["pace_slow", "pace_mid", "pace_fast"][n]), t("per_week", wTxt(ks[n], 2)))).join("");
    } else if (st === "plan") {
      const c = calc(d), eta = etaDate(d);
      const line = d.goal === "lose" ? t("plan_line", fmt(c.tdee), fmt(c.delta), wTxt(c.delta * 7 / 7700, 1)) : d.goal === "gain" ? t("plan_line_gain", fmt(c.tdee), fmt(c.delta)) : t("plan_line_keep");
      const saveP = S.profile; S.profile = d; const rot = rotation(); S.profile = saveP;
      body = `<h1>${t("ob_plan")}</h1><p class="lead"></p>
        <div class="card" style="text-align:center;padding:22px 16px"><div class="big-num num">${fmt(c.k)}</div><div class="muted">${t("kcal_day")}</div>
        <div class="nutr" style="grid-template-columns:repeat(3,1fr);margin-top:16px">
          <div style="background:var(--card2)"><b style="color:var(--prot)">${c.p} ${t("g")}</b><span>${t("protein")}</span></div>
          <div style="background:var(--card2)"><b style="color:var(--fat)">${c.f} ${t("g")}</b><span>${t("fat")}</span></div>
          <div style="background:var(--card2)"><b style="color:var(--carb)">${c.c} ${t("g")}</b><span>${t("carbs")}</span></div></div></div>
        <div class="card stack"><div>${line}</div>${eta ? `<div><b>${t("plan_eta", wTxt(d.target, 1), monthYear(eta)).replace(/\.\.$/, ".")}</b></div>` : ""}<div class="muted small">${t("plan_protein")}</div></div>
        <div class="card"><h3>🏋️ ${t("my_program")}</h3><div class="muted small" style="margin:4px 0 8px">${t("prog_" + rot.id)}</div><div class="chips" style="flex-wrap:wrap">${rot.list.map(x => `<span class="chip">${TPL_EM[x]} ${t("tpl_" + x)}</span>`).join("")}</div></div>
        <p class="small muted">${t("disclaimer")}</p>`;
      nextLbl = ob.edit ? t("save") : t("lets_go");
    }
    const prog = Math.round(ob.i / (steps.length - 1) * 100);
    app.innerHTML = `<div class="ob"><div class="ob-top"><button class="icon-btn" id="obBack" aria-label="${t("back")}">‹</button><div class="ob-prog"><i style="width:${prog}%"></i></div>${ob.edit ? `<button class="icon-btn" id="obX" aria-label="${t("close")}">✕</button>` : ""}</div>
      <div class="body">${body}</div><div class="foot"><button class="btn big block" id="obNext" ${canNext ? "" : "disabled"}>${nextLbl}</button></div></div>`;
    $("#obBack").onclick = () => { if (ob.i <= (ob.edit ? 1 : 0)) { if (ob.edit) { ob = null; tab = "profile"; render(); } return; } if (st === "body") readBody(); ob.i--; renderOnboarding(); };
    if ($("#obX")) $("#obX").onclick = () => { ob = null; render(); };
    $$(".opt").forEach(b => b.onclick = () => {
      const k = b.dataset.k, v = b.dataset.v; d[k] = /^\d+$/.test(v) ? +v : v;
      renderOnboarding();
      if (k !== "pace") setTimeout(() => { ob.i++; renderOnboarding(); window.scrollTo(0, 0); }, 180);
    });
    $$("[data-u]").forEach(b => b.onclick = () => { readBody(); S.settings.units = b.dataset.u; save(); renderOnboarding(); });
    $("#obNext").onclick = () => {
      if (st === "body" && !readBody(true)) return;
      if (st === "plan") return obFinish();
      ob.i++; renderOnboarding(); window.scrollTo(0, 0);
    };
  }
  function readBody(validate) {
    const d = ob.d; if (!$("#fAge")) return true;
    const a = num($("#fAge").value), h = num($("#fH").value), w = num($("#fW").value), tg = $("#fT") ? num($("#fT").value) : NaN;
    if (isFinite(a)) d.age = Math.round(a); if (isFinite(h)) d.height = h;
    if (isFinite(w)) d.weight = fromU(w); if (isFinite(tg)) d.target = fromU(tg);
    if (!validate) return true;
    const err = id => { $("#obErr").hidden = false; $("#obErr").textContent = t("check_val"); $(id).focus(); return false; };
    if (!(a >= 14 && a <= 90)) return err("#fAge");
    if (!(h >= 120 && h <= 230)) return err("#fH");
    if (!(d.weight >= 35 && d.weight <= 300)) return err("#fW");
    if (d.goal === "keep") d.target = d.weight;
    else if (!(d.target >= 35 && d.target <= 300) || (d.goal === "lose" && d.target >= d.weight) || (d.goal === "gain" && d.target <= d.weight)) return err("#fT");
    return true;
  }
  function obFinish() {
    const d = ob.d, first = !S.profile;
    if (first || !d.start) d.start = {date: todayIso(), kg: d.weight};
    S.profile = d;
    const w = S.weights.find(x => x.date === todayIso());
    if (w) w.kg = d.weight; else if (first || Math.abs(currentWeight() - d.weight) > .05) S.weights.push({date: todayIso(), kg: d.weight});
    ob = null; save(); tab = first ? "today" : "profile"; window.scrollTo(0, 0); render();
  }

  // ---------- insights (actionable advice) ----------
  function insights() {
    const p = S.profile, T = targets(), out = [], c = calc(p);
    const days7 = Array.from({length: 7}, (_, i) => addDays(todayIso(), i - 7));
    const logged = days7.map(d => ({d, x: totals(d)})).filter(o => o.x.k > 0);
    const full = logged.filter(o => o.x.k >= 800);
    if (full.length >= 3) {
      const avgK = full.reduce((s, o) => s + o.x.k, 0) / full.length, avgP = full.reduce((s, o) => s + o.x.p, 0) / full.length;
      if (avgP < T.p * .85) out.push({ic: "🥩", txt: t("ins_prot_low", fmt(avgP), T.p)});
      if (p.goal !== "gain" && avgK > T.k * 1.08) out.push({ic: "⚖️", txt: t("ins_over", fmt(avgK - T.k), wTxt((avgK - T.k) * 7 / 7700, 2))});
      if (avgK < c.bmr * .95 && p.goal !== "gain") out.push({ic: "⚠️", txt: t("ins_low", fmt(avgK), fmt(c.bmr), fmt(Math.max(T.k * .95, c.bmr))), warn: true});
      const we = full.filter(o => [0, 6].includes(parseIso(o.d).getDay())), wd = full.filter(o => ![0, 6].includes(parseIso(o.d).getDay()));
      if (we.length && wd.length) { const diff = we.reduce((s, o) => s + o.x.k, 0) / we.length - wd.reduce((s, o) => s + o.x.k, 0) / wd.length; if (diff > 300) out.push({ic: "📅", txt: t("ins_weekend", fmt(diff))}); }
    }
    const gaps = logged.filter(o => o.x.k > 0 && o.x.k < 800).length;
    if (gaps >= 2) out.push({ic: "✍️", txt: t("ins_gap", gaps)});
    const tr = trend(21);
    if (tr && tr.span >= 10) {
      const wk = tr.slope * 7, cw = currentWeight();
      if (p.goal === "lose") {
        if (-wk > cw * .01) out.push({ic: "🐢", txt: t("ins_fast", wTxt(-wk, 2)), warn: true});
        else if (wk > -.1 && tr.span >= 14) out.push({ic: "🧱", txt: t("ins_plateau", Math.round(tr.span / 7))});
        else if (-wk >= paceKg(p) * .6) out.push({ic: "✅", txt: t("ins_ontrack", wTxt(-wk, 2)), good: true});
      } else if (p.goal === "gain") {
        if (wk > paceKg(p) * 1.8) out.push({ic: "📈", txt: t("ins_gain_fast", wTxt(wk, 2))});
        else if (wk < paceKg(p) * .4) out.push({ic: "🍚", txt: t("ins_gain_slow")});
        else out.push({ic: "✅", txt: t("ins_ontrack", wTxt(wk, 2)), good: true});
      }
    }
    if (p.tf > 0 && S.workouts.length && !S.workouts.some(w => w.date >= days7[0])) out.push({ic: "🏋️", txt: t("ins_noworkout")});
    // strength stalls & PRs
    const ws = strengthWorkouts();
    const seen = new Set();
    ws.slice(0, 6).forEach(w => w.ex.forEach(x => {
      if (seen.has(x.eid)) return; seen.add(x.eid);
      const hist = ws.map(ww => ww.ex.find(e => e.eid === x.eid)).filter(Boolean).slice(0, 3);
      if (hist.length < 3) return;
      const score = h => Math.max(...h.sets.map(s => (s.w || 0) * (1 + s.r / 30)));
      if (score(hist[0]) <= score(hist[2]) * 1.005 && score(hist[0]) <= score(hist[1]) * 1.005 && out.filter(o => o.stall).length < 2) out.push({ic: "🔁", txt: t("ins_stall", exName(getEx(x.eid))), stall: true});
    }));
    if (ws[0] && ws[0].date >= days7[0]) {
      ws[0].ex.forEach(x => {
        const best = Math.max(...x.sets.map(s => s.w || 0)); if (!(best > 0)) return;
        const before = Math.max(0, ...ws.slice(1).flatMap(w => (w.ex.find(e => e.eid === x.eid) || {sets: []}).sets.map(s => s.w || 0)));
        if (before > 0 && best > before && out.filter(o => o.pr).length < 2) out.push({ic: "🏆", txt: t("ins_pr", exName(getEx(x.eid)), liftTxt(best) + " " + wUnit()), pr: true, good: true});
      });
    }
    return out;
  }
  const insightHtml = list => list.map(o => `<div class="ins ${o.warn ? "warn" : o.good ? "good" : ""}"><span>${o.ic}</span><div>${esc(o.txt)}</div></div>`).join("");

  // ---------- TODAY ----------
  function ring(pct, color, over) {
    const r = 58, C = 2 * Math.PI * r, v = Math.min(pct, 1);
    return `<svg viewBox="0 0 136 136"><circle cx="68" cy="68" r="${r}" fill="none" stroke="var(--card2)" stroke-width="14"/>
      <circle cx="68" cy="68" r="${r}" fill="none" stroke="${over ? "var(--warn)" : color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - v)}" style="transition:stroke-dashoffset .5s"/></svg>`;
  }
  function renderToday() {
    const T = targets(), x = totals(cur), d = S.days[cur] || {items: [], water: 0};
    const left = T.k - x.k, over = left < 0;
    const isToday = cur === todayIso(), isY = cur === addDays(todayIso(), -1);
    const title = isToday ? t("today") : isY ? t("yesterday") : dateShort(cur);
    const mbar = (lbl, v, goal, color) => `<div class="macro"><div class="lbl"><span>${lbl}</span><span class="num"><b>${fmt(v)}</b> / ${fmt(goal)} ${t("g")}</span></div><div class="bar"><i style="width:${Math.min(100, v / goal * 100)}%;background:${color}"></i></div></div>`;
    const woK = S.workouts.filter(w => w.date === cur).reduce((s, w) => s + (w.kcal || 0), 0);
    const lastW = sortedW().pop();
    const needWeigh = isToday && (!lastW || dayDiff(lastW.date, cur) >= 7);
    const tips = window.T.tips, tipI = Math.floor(parseIso(cur) / 864e5) % tips.length;
    let html = `<div class="top datebar"><button class="icon-btn" id="dPrev" aria-label="‹">‹</button><button class="title" id="dToday">${esc(title)}<div class="small muted" style="font-weight:500">${esc(isToday || isY ? dateShort(cur) : parseIso(cur).toLocaleDateString(loc(), {weekday: "long"}))}</div></button><button class="icon-btn" id="dNext" ${isToday ? "disabled style='opacity:.3'" : ""} aria-label="›">›</button></div>
      ${hintCard("today")}
      <div class="card"><div class="hero"><div class="ring">${ring(x.k / T.k, "var(--accent)", over)}<div class="c"><b class="num">${fmt(Math.abs(left))}</b><span>${over ? t("over") : t("left")}</span></div></div>
      <div class="macros">${mbar(t("protein"), x.p, T.p, "var(--prot)")}${mbar(t("fat"), x.f, T.f, "var(--fat)")}${mbar(t("carbs"), x.c, T.c, "var(--carb)")}</div></div>
      <div class="hero-sub"><div><b class="num">${fmt(x.k)}</b>${t("eaten")}</div><div><b class="num">${fmt(T.k)}</b>${t("goal")}</div><div><b class="num">${woK ? "−" + fmt(woK) : "—"}</b>🏋️ ${t("kcal")}</div></div></div>`;
    if (needWeigh) html += `<div class="card tip row"><div class="grow">⚖️ ${t("weigh_remind")}</div><button class="btn small" id="wNow">${t("weigh_now")}</button></div>`;
    MEALS.forEach(m => {
      const its = d.items.filter(i => i.m === m.id), mk = its.reduce((s, i) => s + i.k, 0);
      const yd = S.days[addDays(cur, -1)], canCopy = !its.length && yd && yd.items.some(i => i.m === m.id);
      html += `<div class="card meal"><div class="meal-head"><div class="ic">${m.ic}</div><div class="grow"><h3>${t("meal_" + m.id)}</h3><div class="small muted num">${its.length ? fmt(mk) + " " + t("kcal") + " · " + fmt(its.reduce((s, i) => s + i.p, 0)) + " " + t("g") + " " + t("protein").toLowerCase() : "—"}</div></div><button class="plus" data-add="${m.id}" aria-label="${t("add_food")}">+</button></div>
        ${its.map(i => `<button class="item" data-it="${i.id}"><div class="nm"><div>${esc(itemName(i))}</div><div class="small muted">${amtTxt(i)}</div></div><div class="kc">${fmt(i.k)}</div></button>`).join("")}
        ${canCopy ? `<div class="meal-foot"><button class="btn small soft" data-copy="${m.id}">↺ ${t("same_as_yday")}</button></div>` : ""}</div>`;
    });
    const glasses = d.water || 0;
    html += `<div class="card"><div class="row between"><h3>💧 ${t("water")}</h3><span class="muted small num">${fmt(glasses * .25, 2)} / 2 ${S.settings.lang === "en" ? "l" : S.settings.lang === "es" ? "l" : "л"}</span></div>
      <div class="water">${Array.from({length: 8}, (_, i) => `<button data-w="${i + 1}" class="${i < glasses ? "on" : ""}" aria-label="${i + 1}"></button>`).join("")}</div><div class="small muted" style="margin-top:6px">${t("water_hint")}</div></div>`;
    // advice for today
    let tipHtml = "";
    const pl = T.p - x.p, h = new Date().getHours();
    if (isToday && x.k > 0 && h >= 16 && left > 150) tipHtml = "🍽 " + t("ins_evening", fmt(left), fmt(Math.max(0, pl)));
    else if (isToday && x.k > 0) tipHtml = (pl > 5 ? "🥩 " + t("protein_left", fmt(pl)) : "✅ " + t("protein_ok"));
    html += `<div class="card tip"><div class="t">${t("tip_day")}</div>${tipHtml ? tipHtml + "<br>" : ""}<span class="${tipHtml ? "muted small" : ""}">${tips[tipI][LI()]}</span></div>`;
    html += `<button class="btn big block" id="addMain">＋ ${t("add_food")}</button>`;
    $("#app").innerHTML = html;
    $("#dPrev").onclick = () => { cur = addDays(cur, -1); render(); };
    $("#dNext").onclick = () => { if (!isToday) { cur = addDays(cur, 1); render(); } };
    $("#dToday").onclick = () => { cur = todayIso(); render(); };
    $$("[data-add]").forEach(b => b.onclick = () => openFood({meal: b.dataset.add}));
    $("#addMain").onclick = () => openFood({meal: isToday ? mealByTime() : "l"});
    $$("[data-it]").forEach(b => b.onclick = () => { const it = d.items.find(i => i.id === b.dataset.it); if (it) openFood({meal: it.m, edit: it}); });
    $$("[data-copy]").forEach(b => b.onclick = () => {
      const m = b.dataset.copy, yd = S.days[addDays(cur, -1)], dd = day(cur);
      yd.items.filter(i => i.m === m).forEach(i => dd.items.push(Object.assign({}, i, {id: uid("i")})));
      save(); render(); vibrate(15);
    });
    $$("[data-w]").forEach(b => b.onclick = () => { const dd = day(cur), n = +b.dataset.w; dd.water = dd.water === n ? n - 1 : n; save(); render(); });
    if ($("#wNow")) $("#wNow").onclick = openWeigh;
  }
  function amtTxt(i) {
    const f = getFood(i.fid), u = f && f.u === "ml" ? t("ml") : t("g");
    return i.unit === "pc" ? `${fmt(i.q, 1)} ${t("pcs")} · ${fmt(i.q * ((f && f.pc) || 100))} ${u}` : `${fmt(i.q)} ${u}`;
  }

  // ---------- sheet ----------
  function openSheet(html, opts = {}) {
    closeSheet(true, true);
    const bd = document.createElement("div"); bd.className = "backdrop"; bd.id = "bd";
    const sh = document.createElement("div"); sh.className = "sheet" + (opts.auto ? " auto" : ""); sh.id = "sheet";
    sh.setAttribute("role", "dialog");
    sh.innerHTML = '<div class="grab"></div>' + html;
    document.body.append(bd, sh);
    requestAnimationFrame(() => { bd.classList.add("on"); sh.classList.add("on"); });
    bd.onclick = () => closeSheet();
    if (!sheetOpen) { history.pushState({sheet: 1}, ""); sheetOpen = true; }
    return sh;
  }
  function closeSheet(fromPop, keepHistory) {
    const sh = $("#sheet"), bd = $("#bd");
    if (!sh) return;
    stopCamera();
    if (keepHistory) { sh.remove(); bd.remove(); return; }
    sh.classList.remove("on"); bd.classList.remove("on");
    setTimeout(() => { sh.remove(); bd.remove(); }, 220);
    if (sheetOpen) { sheetOpen = false; if (!fromPop) history.back(); }
  }

  // ---------- add food ----------
  let fs = null;
  function openFood(o) {
    fs = {meal: o.meal, tab: "my", cat: "", q: "", sel: null, edit: o.edit || null, unit: "g", amt: 100};
    if (o.edit) {
      fs.sel = getFood(o.edit.fid); fs.unit = o.edit.unit; fs.amt = o.edit.q;
      if (!fs.sel) { const g = o.edit.unit === "pc" ? o.edit.q * 100 : o.edit.q; fs.sel = {id: o.edit.fid, n: o.edit.n, k: o.edit.k / g * 100, p: o.edit.p / g * 100, f: o.edit.f / g * 100, c: o.edit.c / g * 100}; fs.unit = "g"; fs.amt = g; }
    }
    if (Object.keys(usage()).length >= 3) fs.tab = "recent";
    fs.sel ? foodAmountView() : foodListView();
  }
  function foodListView() {
    const tabs = [["recent", t("tab_recent")], ["my", t("tab_my")]];
    if (S.settings.showBase) tabs.push(["base", t("base_foods")]);
    const sh = openSheet(`<div class="sh-head"><div class="grow"><h2>${t("add_food")}</h2></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body"><div class="stack">
        <div class="seg" id="mealSeg">${MEALS.map(m => `<button data-m="${m.id}" class="${fs.meal === m.id ? "on" : ""}">${t("meal_" + m.id)}</button>`).join("")}</div>
        <div class="grid2"><button class="btn" id="scanBtn">▥ ${t("scan")}</button><button class="btn soft" id="newBtn">＋ ${t("new_food")}</button></div>
        <input id="fq" type="search" placeholder="🔍 ${t("search")}" value="${esc(fs.q)}" autocomplete="off">
        <div class="seg" id="tabSeg">${tabs.map(([k, l]) => `<button data-t="${k}">${l}</button>`).join("")}</div>
        <div class="chips" id="catChips"></div>
        <div id="flist"></div></div></div>`);
    $("[data-x]", sh).onclick = () => closeSheet();
    $$("#mealSeg button").forEach(b => b.onclick = () => { fs.meal = b.dataset.m; $$("#mealSeg button").forEach(x => x.classList.toggle("on", x === b)); });
    $("#fq").oninput = e => { fs.q = e.target.value; drawFoodList(); };
    $$("#tabSeg button").forEach(b => b.onclick = () => { fs.tab = b.dataset.t; fs.cat = ""; drawFoodList(); });
    $("#scanBtn").onclick = scanView;
    $("#newBtn").onclick = () => newFoodView({});
    drawFoodList();
  }
  function drawFoodList() {
    $$("#tabSeg button").forEach(b => b.classList.toggle("on", b.dataset.t === fs.tab && !fs.q));
    const q = fs.q.trim().toLowerCase(), u = usage();
    let list, empty = t("nothing");
    const pool = S.settings.showBase ? [...S.myFoods, ...FOODS] : [...S.myFoods, ...FOODS.filter(f => u[f.id])];
    if (q) {
      const words = q.split(/\s+/);
      list = pool.filter(f => { const s = (typeof f.n === "string" ? f.n : Object.values(f.n).join(" ")).toLowerCase(); return words.every(w => s.includes(w)); });
      list.sort((a, b) => (u[b.id] || 0) - (u[a.id] || 0));
    } else if (fs.tab === "recent") {
      list = Object.keys(u).sort((a, b) => u[b] - u[a]).map(getFood).filter(Boolean).slice(0, 40); empty = t("recent_empty");
    } else if (fs.tab === "my") { list = S.myFoods.slice().reverse(); empty = t("my_foods_hint"); }
    else list = fs.cat ? FOODS.filter(f => f.cat === fs.cat) : FOODS;
    const showCats = !q && fs.tab === "base";
    $("#catChips").hidden = !showCats;
    if (showCats) {
      $("#catChips").innerHTML = `<button class="chip ${!fs.cat ? "on" : ""}" data-c="">${t("g_all")}</button>` + CATS.map(c => `<button class="chip ${fs.cat === c ? "on" : ""}" data-c="${c}">${t("cat_" + c)}</button>`).join("");
      $$("#catChips .chip").forEach(b => b.onclick = () => { fs.cat = b.dataset.c; drawFoodList(); });
    }
    $("#flist").innerHTML = list.length ? `<div class="list">${list.slice(0, 150).map(f => `<button class="li" data-f="${f.id}"><div class="nm"><div>${esc(foodName(f))}</div><div class="small muted num">${fmt(f.k)} ${t("kcal")} · ${t("protein")} ${fmt(f.p, 1)} ${t("g")} · ${t("per100", f.u === "ml" ? t("ml") : t("g"))}</div></div><span class="muted">›</span></button>`).join("")}</div>`
      : `<div class="card empty"><div style="font-size:34px">🥫</div><p>${empty}</p>${fs.tab === "my" || q ? `<div class="grid2"><button class="btn" data-scan2>▥ ${t("scan")}</button><button class="btn soft" data-new2>＋ ${t("new_food")}</button></div>` : ""}</div>`;
    if ($("[data-scan2]")) { $("[data-scan2]").onclick = scanView; $("[data-new2]").onclick = () => newFoodView({}); }
    $$("#flist [data-f]").forEach(b => b.onclick = () => {
      fs.sel = getFood(b.dataset.f);
      const last = lastAmount(fs.sel.id);
      if (last) { fs.unit = last.unit; fs.amt = last.q; } else if (fs.sel.pc) { fs.unit = "pc"; fs.amt = 1; } else { fs.unit = "g"; fs.amt = 100; }
      foodAmountView();
    });
  }
  function foodAmountView() {
    const f = fs.sel, u = f.u === "ml" ? t("ml") : t("g"), mine = S.myFoods.includes(f);
    const sh = openSheet(`<div class="sh-head"><button class="icon-btn" data-back aria-label="${t("back")}">‹</button><div class="grow"><h2 style="font-size:18px">${esc(foodName(f))}</h2><div class="small muted">${fmt(f.k)} ${t("kcal")} · ${t("protein")} ${fmt(f.p, 1)} ${t("g")} ${t("per100", u)}</div></div>${mine ? `<button class="icon-btn" id="editFood" aria-label="${t("edit_food")}">✎</button>` : ""}</div>
      <div class="sh-body"><div class="stack">
        <div class="small muted" style="font-weight:600">${t("how_much")}</div>
        ${f.pc ? `<div class="seg" id="uSeg"><button data-u="g">${u}</button><button data-u="pc">${t("pcs")} (${fmt(f.pc)} ${u})</button></div>` : ""}
        <div class="amount"><button class="icon-btn" id="aMinus" aria-label="−">−</button><input id="amt" inputmode="decimal"><button class="icon-btn" id="aPlus" aria-label="+">+</button></div>
        <div class="quick" id="quick"></div>
        <div class="nutr" id="nutr"></div>
        <div class="seg" id="mealSeg2">${MEALS.map(m => `<button data-m="${m.id}" class="${fs.meal === m.id ? "on" : ""}">${t("meal_" + m.id)}</button>`).join("")}</div>
      </div></div>
      <div class="sh-foot"><div class="row">${fs.edit ? `<button class="btn danger" id="delIt" aria-label="${t("del")}">🗑</button>` : ""}<button class="btn big grow" id="addIt"></button></div></div>`);
    const draw = () => {
      const steps = fs.unit === "pc" ? [.5, 1, 2, 3] : f.u === "ml" ? [100, 200, 250, 330] : [50, 100, 150, 200];
      $("#quick").innerHTML = steps.map(s => `<button data-q="${s}" class="${+fs.amt === s ? "on" : ""}">${fmt(s, 1)}</button>`).join("");
      $$("#quick button").forEach(b => b.onclick = () => { fs.amt = +b.dataset.q; $("#amt").value = fs.amt; draw(); });
      $$("#uSeg button").forEach(b => b.classList.toggle("on", b.dataset.u === fs.unit));
      const n = nutrFor(f, +fs.amt || 0, fs.unit);
      $("#nutr").innerHTML = `<div><b class="num">${fmt(n.k)}</b><span>${t("kcal")}</span></div><div><b class="num" style="color:var(--prot)">${fmt(n.p, 1)}</b><span>${t("protein")}</span></div><div><b class="num" style="color:var(--fat)">${fmt(n.f, 1)}</b><span>${t("fat")}</span></div><div><b class="num" style="color:var(--carb)">${fmt(n.c, 1)}</b><span>${t("carbs")}</span></div>`;
      $("#addIt").textContent = fs.edit ? t("save_changes") : t("add_to", t("meal_" + fs.meal));
      $("#addIt").disabled = !(+fs.amt > 0);
    };
    $("#amt").value = fs.amt;
    $("#amt").oninput = e => { fs.amt = num(e.target.value) || 0; draw(); };
    $("#amt").onfocus = e => e.target.select();
    const stepBy = () => fs.unit === "pc" ? .5 : 10;
    $("#aMinus").onclick = () => { fs.amt = Math.max(0, Math.round(((+fs.amt || 0) - stepBy()) * 10) / 10); $("#amt").value = fs.amt; draw(); };
    $("#aPlus").onclick = () => { fs.amt = Math.round(((+fs.amt || 0) + stepBy()) * 10) / 10; $("#amt").value = fs.amt; draw(); };
    $$("#uSeg button").forEach(b => b.onclick = () => {
      if (b.dataset.u === fs.unit) return;
      fs.amt = b.dataset.u === "pc" ? Math.max(.5, Math.round((+fs.amt || 0) / f.pc * 2) / 2) : Math.round((+fs.amt || 0) * f.pc);
      fs.unit = b.dataset.u; $("#amt").value = fs.amt; draw();
    });
    $$("#mealSeg2 button").forEach(b => b.onclick = () => { fs.meal = b.dataset.m; $$("#mealSeg2 button").forEach(x => x.classList.toggle("on", x === b)); draw(); });
    $("[data-back]", sh).onclick = () => fs.edit ? closeSheet() : foodListView();
    if ($("#editFood")) $("#editFood").onclick = () => newFoodView(Object.assign({}, f, {editId: f.id}));
    $("#addIt").onclick = () => {
      const q = +fs.amt; if (!(q > 0)) return;
      const n = nutrFor(f, q, fs.unit), d = day(cur);
      const rec = {fid: f.id, n: foodName(f), m: fs.meal, q, unit: fs.unit, k: n.k, p: n.p, f: n.f, c: n.c};
      if (fs.edit) Object.assign(d.items.find(i => i.id === fs.edit.id) || {}, rec);
      else d.items.push(Object.assign({id: uid("i")}, rec));
      save(); closeSheet(); render(); vibrate(15);
    };
    if ($("#delIt")) $("#delIt").onclick = () => { const d = day(cur); d.items = d.items.filter(i => i.id !== fs.edit.id); save(); closeSheet(); render(); };
    draw();
  }
  function newFoodView(pre) {
    const v = (x, d = 1) => x != null && x !== "" ? inVal(Math.round(x * 10 ** d) / 10 ** d) : "";
    const sh = openSheet(`<div class="sh-head"><button class="icon-btn" data-back aria-label="${t("back")}">‹</button><div class="grow"><h2>${pre.editId ? t("edit_food") : t("nf_title")}</h2></div></div>
      <div class="sh-body"><div class="stack">
        ${pre.msg ? `<div class="msg ${pre.bad ? "bad" : ""}">${esc(pre.msg)}</div>` : ""}
        <div class="field"><label>${t("nf_name")}</label><input id="nN" value="${esc(pre.editId ? foodName(pre) : (pre.n || fs.q || ""))}"></div>
        <p class="small muted" style="margin:4px 2px 0">${t("nf_per")}</p>
        <div class="grid2"><div class="field"><label>${t("nf_kcal")}</label><input id="nK" inputmode="decimal" value="${v(pre.k, 0)}"></div>
        <div class="field"><label>${t("protein")}, ${t("g")}</label><input id="nP" inputmode="decimal" value="${v(pre.p)}"></div>
        <div class="field"><label>${t("fat")}, ${t("g")}</label><input id="nF" inputmode="decimal" value="${v(pre.f)}"></div>
        <div class="field"><label>${t("carbs")}, ${t("g")}</label><input id="nC" inputmode="decimal" value="${v(pre.c)}"></div></div>
        <div class="field"><label>${t("nf_piece")}</label><input id="nPc" inputmode="decimal" value="${pre.pc || ""}"></div>
        <label class="check"><input type="checkbox" id="nMl" ${pre.u === "ml" ? "checked" : ""}> ${t("nf_liquid")}</label>
        ${pre.bc ? `<div class="small muted">${t("nf_barcode")}: ${esc(pre.bc)}</div>` : ""}
        ${pre.editId ? `<button class="btn danger block" id="nDel">${t("del")}</button>` : ""}
      </div></div><div class="sh-foot"><button class="btn big block" id="nSave">${t("save")}</button></div>`);
    $("[data-back]", sh).onclick = () => pre.editId ? foodAmountView() : foodListView();
    $("#nSave").onclick = () => {
      const n = $("#nN").value.trim(), k = num($("#nK").value);
      if (!n) return $("#nN").focus(); if (!(k >= 0)) return $("#nK").focus();
      const data = {n, k, p: num($("#nP").value) || 0, f: num($("#nF").value) || 0, c: num($("#nC").value) || 0, pc: num($("#nPc").value) || 0, u: $("#nMl").checked ? "ml" : "g", cat: "my"};
      let f;
      if (pre.editId) { f = S.myFoods.find(x => x.id === pre.editId); Object.assign(f, data); }
      else { f = Object.assign({id: uid("my_")}, data); if (pre.bc) f.bc = pre.bc; S.myFoods.push(f); toast("✓ " + t("saved_my")); }
      save();
      fs.sel = f; if (!pre.editId) { fs.unit = f.pc ? "pc" : "g"; fs.amt = f.pc ? 1 : 100; }
      foodAmountView();
    };
    if ($("#nDel")) $("#nDel").onclick = () => { if (!confirm(t("del_food_q"))) return; S.myFoods = S.myFoods.filter(x => x.id !== pre.editId); save(); fs.sel = null; fs.tab = "my"; foodListView(); };
  }
  // barcode
  let camStream = null, camLoop = 0, zxReader = null;
  function stopCamera() {
    cancelAnimationFrame(camLoop); camLoop = 0;
    try { if (zxReader) zxReader.reset(); } catch (e) {}
    zxReader = null;
    if (camStream) { camStream.getTracks().forEach(tr => tr.stop()); camStream = null; }
  }
  function scanView() {
    const sh = openSheet(`<div class="sh-head"><button class="icon-btn" data-back aria-label="${t("back")}">‹</button><div class="grow"><h2>${t("scan_title")}</h2></div></div>
      <div class="sh-body"><div class="stack">
        <div class="vidwrap" id="vidwrap" hidden><video id="vid" class="video" playsinline muted autoplay></video><i class="scanline"></i></div>
        <div id="scanMsg" class="msg" hidden></div>
        <label class="btn ghost block">📷 ${t("scan_photo")}<input type="file" accept="image/*" capture="environment" id="bcFile" hidden></label>
        <div class="small muted" style="text-align:center">${t("scan_or")}</div>
        <div class="row"><input id="bcIn" inputmode="numeric" placeholder="4820000000000" class="grow"><button class="btn" id="bcGo">${t("find")}</button></div>
        <p class="small muted">Open Food Facts · ODbL</p>
      </div></div>`);
    $("[data-back]", sh).onclick = () => { stopCamera(); foodListView(); };
    $("#bcGo").onclick = () => lookupBarcode($("#bcIn").value.replace(/\D/g, ""));
    $("#bcFile").onchange = async e => {
      const file = e.target.files[0]; e.target.value = ""; if (!file) return;
      stopCamera(); $("#vidwrap").hidden = true;
      scanMsg(t("scan_reading"));
      const code = await decodeFile(file);
      if (!code) return scanMsg(t("scan_fail"), true);
      $("#bcIn").value = code; lookupBarcode(code);
    };
    startLiveScan();
  }
  function scanMsg(m, bad) { const el = $("#scanMsg"); if (!el) return; el.hidden = !m; el.textContent = m; el.className = "msg" + (bad ? " bad" : ""); }
  function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  async function ensureZX() { if (!window.ZXing) await loadScript("vendor/zxing.min.js"); return window.ZXing; }
  function gotCode(code) { vibrate(40); stopCamera(); const w = $("#vidwrap"); if (w) w.hidden = true; const i = $("#bcIn"); if (i) i.value = code; lookupBarcode(code); }
  async function startLiveScan() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      const v = $("#vid"); if (!v) return;
      if ("BarcodeDetector" in window) {
        const det = new BarcodeDetector({formats: ["ean_13", "ean_8", "upc_a", "upc_e"]});
        camStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}});
        if (!$("#vid")) return stopCamera();
        v.srcObject = camStream; $("#vidwrap").hidden = false; await v.play(); scanMsg(t("scan_point"));
        const tick = async () => {
          if (!camStream) return;
          try { const r = await det.detect(v); if (r[0]) return gotCode(r[0].rawValue); } catch (e) {}
          camLoop = requestAnimationFrame(tick);
        };
        tick();
      } else {
        const ZX = await ensureZX(); if (!$("#vid")) return;
        const hints = new Map(); hints.set(ZX.DecodeHintType.POSSIBLE_FORMATS, [ZX.BarcodeFormat.EAN_13, ZX.BarcodeFormat.EAN_8, ZX.BarcodeFormat.UPC_A, ZX.BarcodeFormat.UPC_E]);
        zxReader = new ZX.BrowserMultiFormatReader(hints);
        $("#vidwrap").hidden = false; scanMsg(t("scan_point"));
        await zxReader.decodeFromConstraints({video: {facingMode: "environment"}}, "vid", (res) => { if (res && zxReader) gotCode(res.getText()); });
        camStream = v.srcObject;
      }
    } catch (e) { stopCamera(); const w = $("#vidwrap"); if (w) w.hidden = true; scanMsg(""); }
  }
  async function decodeFile(file) {
    try { if ("BarcodeDetector" in window) { const r = await new BarcodeDetector({formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"]}).detect(await createImageBitmap(file)); if (r[0]) return r[0].rawValue; } } catch (e) {}
    try {
      const ZX = await ensureZX();
      const url = URL.createObjectURL(file); const res = await new ZX.BrowserMultiFormatReader().decodeFromImageUrl(url); URL.revokeObjectURL(url);
      return res && res.getText();
    } catch (e) { return null; }
  }
  async function lookupBarcode(code) {
    if (!code || code.length < 6) return $("#bcIn") && $("#bcIn").focus();
    const mine = S.myFoods.find(f => f.bc === code);
    if (mine) { fs.sel = mine; fs.unit = mine.pc ? "pc" : "g"; fs.amt = mine.pc ? 1 : 100; return foodAmountView(); }
    scanMsg(t("scan_search"));
    try {
      const lg = S.settings.lang;
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_${lg},brands,nutriments,serving_quantity,quantity`);
      const j = await r.json(), pr = j && j.status === 1 ? j.product : null, n = pr && pr.nutriments || {};
      let k = n["energy-kcal_100g"]; if (k == null && n.energy_100g != null) k = n.energy_100g / 4.184;
      if (!pr || k == null) return newFoodView({bc: code, msg: t("scan_none"), bad: true, n: pr ? (pr["product_name_" + lg] || pr.product_name || "") : ""});
      const name = [pr["product_name_" + lg] || pr.product_name, pr.brands && pr.brands.split(",")[0]].filter(Boolean).join(", ");
      const isMl = /\d\s*(ml|cl|l)\b/i.test(pr.quantity || "");
      newFoodView({bc: code, msg: t("scan_found"), n: name, k, p: +n.proteins_100g || 0, f: +n.fat_100g || 0, c: +n.carbohydrates_100g || 0, u: isMl ? "ml" : "g", pc: +pr.serving_quantity > 0 && +pr.serving_quantity !== 100 ? Math.round(+pr.serving_quantity) : ""});
    } catch (e) { scanMsg(t("scan_offline"), true); }
  }

  // ---------- weigh-in ----------
  function openWeigh() {
    const last = currentWeight();
    const sh = openSheet(`<div class="sh-head"><div class="grow"><h2>${t("weigh_in")}</h2><div class="small muted">${esc(dateLong(todayIso()))}</div></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body"><div class="stack">
        <div class="stepper"><button class="icon-btn" id="wm" aria-label="−">−</button><div class="unit-in grow"><input id="wv" inputmode="decimal" value="${inVal(toU(last))}"><span>${wUnit()}</span></div><button class="icon-btn" id="wp" aria-label="+">+</button></div>
        <div class="field"><label>${t("waist")} (${t("optional")})</label><input id="wa" inputmode="decimal"></div>
        <p class="small muted">${t("weigh_remind")}</p>
      </div></div><div class="sh-foot"><button class="btn big block" id="wSave">${t("save")}</button></div>`, {auto: true});
    $("[data-x]", sh).onclick = () => closeSheet();
    const st = d => { $("#wv").value = inVal((num($("#wv").value) || 0) + d); };
    $("#wm").onclick = () => st(-.1); $("#wp").onclick = () => st(.1);
    $("#wSave").onclick = () => {
      const v = num($("#wv").value); if (!(v > 0)) return $("#wv").focus();
      const kg = fromU(v), waist = num($("#wa").value), d = todayIso();
      if (!(kg >= 30 && kg <= 320)) return $("#wv").focus();
      S.weights = S.weights.filter(w => w.date !== d); S.weights.push(Object.assign({date: d, kg}, waist > 0 ? {waist} : {}));
      save(); closeSheet(); render(); toast("✓ " + wTxt(kg));
    };
  }

  // ---------- TRAIN ----------
  function renderTrain() {
    if (S.active) return renderWorkout();
    const r = rotation(), nx = nextTpl(), ntp = TPL.find(x => x.id === nx);
    const tplCount = id => { const l = lastLayout(id); return l ? l.length : pickForTemplate(TPL.find(x => x.id === id)).length; };
    const others = TPL.filter(tp => tp.id !== nx && (tp.id === "empty" || pickForTemplate(tp).length));
    const weekAgo = addDays(todayIso(), -6);
    const nWeek = S.workouts.filter(w => w.date >= weekAgo).length;
    const hist = S.workouts.slice().sort((a, b) => b.start - a.start).slice(0, 30);
    const nextEx = (lastLayout(nx) || pickForTemplate(ntp)).slice(0, 4).map(getEx);
    $("#app").innerHTML = `<div class="top"><h1>${t("nav_train")}</h1><span class="badge">${t("week_count", nWeek)}</span></div>
      ${hintCard("train")}
      <div class="card next-card"><div class="small muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.05em">${t("next_up")}</div>
        <div class="row" style="margin:6px 0 10px"><div style="font-size:30px">${TPL_EM[nx]}</div><div class="grow"><h2>${t("tpl_" + nx)}</h2><div class="small muted">${t("exercises_n", tplCount(nx))} · ${t("prog_" + r.id)}</div></div></div>
        <div class="next-figs">${nextEx.map(e => figStill(e, "nf")).join("")}</div>
        <button class="btn big block" data-tpl="${nx}">▶ ${t("start")}</button>
        <div class="chips" style="margin-top:10px;flex-wrap:wrap">${r.list.map(x => `<span class="chip ${x === nx ? "on" : ""}">${TPL_EM[x]} ${t("tpl_" + x)}</span>`).join("")}</div></div>
      <button class="card libbtn row" id="libBtn"><div class="lib-figs">${["bench", "pulldown", "squat"].map(p => `<div class="figbox mini" data-fig="${p}"></div>`).join("")}</div><div class="grow" style="text-align:left"><b>${t("lib_title")}</b><div class="small muted">${t("lib_btn")} · ${t("lib_count", EX.length)}</div></div><span class="muted">›</span></button>
      <div class="section-t">${t("other_workouts")}</div>
      <div class="tpls">${others.map(tp => `<button class="tpl" data-tpl="${tp.id}"><span class="em">${TPL_EM[tp.id]}</span><div><b>${t("tpl_" + tp.id)}</b><br><span>${tp.id === "empty" ? "" : t("exercises_n", tplCount(tp.id))}</span></div></button>`).join("")}
      <button class="tpl wide accent" data-cardio><span class="em">🚴</span><div class="grow" style="margin-left:10px"><b>${t("cardio")}</b><br><span>${CARDIO.slice(0, 4).map(c => t("c_" + c.id)).join(" · ")}</span></div><span>›</span></button></div>
      <div class="section-t">${t("history")}</div>
      ${hist.length ? `<div class="list hist">${hist.map(w => `<button class="li" data-w="${w.id}"><div style="font-size:24px;width:32px;text-align:center">${w.kind === "cardio" ? CARDIO_EM[w.type] || "🏃" : TPL_EM[w.tpl] || "🏋️"}</div><div class="nm"><div><b>${w.kind === "cardio" ? t("c_" + w.type) : t("tpl_" + w.tpl)}</b></div><div class="small muted">${esc(dateShort(w.date))} · ${w.kind === "cardio" ? w.min + " " + t("min") : t("exercises_n", w.ex.length) + " · " + Math.round((w.end - w.start) / 6e4) + " " + t("min")} · ${fmt(w.kcal || 0)} ${t("kcal")}</div></div><span class="muted">›</span></button>`).join("")}</div>` : `<div class="card muted">${t("no_history")}</div>`}`;
    $$("[data-fig]").forEach((el, i) => window.FIG.mount(el, el.dataset.fig, el.dataset.fig === "squat" ? "v=back" : el.dataset.fig === "bench" ? "g=bb" : "", 2400 + i * 250));
    $$("[data-tpl]").forEach(b => b.onclick = () => startWorkout(b.dataset.tpl));
    $("[data-cardio]").onclick = () => openCardio();
    $("#libBtn").onclick = () => openLibrary();
    $$("[data-w]").forEach(b => b.onclick = () => openHistory(b.dataset.w));
  }
  function lastLayout(tpl) {
    const w = strengthWorkouts().find(x => x.tpl === tpl);
    return w && w.ex.length ? w.ex.map(e => e.eid) : null;
  }
  function newSets(eid) {
    const prev = lastSetsFor(eid), n = prev ? Math.max(2, Math.min(prev.length, 6)) : (getEx(eid).cmp ? 4 : 3);
    return Array.from({length: n}, () => ({w: null, r: null, done: false}));
  }
  function startWorkout(tplId) {
    const tp = TPL.find(x => x.id === tplId);
    const ids = lastLayout(tplId) || pickForTemplate(tp);
    S.active = {id: uid("w"), kind: "strength", tpl: tplId, date: todayIso(), start: Date.now(), ex: ids.map(eid => ({eid, sets: newSets(eid)}))};
    save(); tab = "train"; render(); window.scrollTo(0, 0);
    if (!ids.length) openExPicker(null);
  }
  let woTimer = 0, restEnd = 0, restT = 0;
  function renderWorkout() {
    const A = S.active;
    const exCards = A.ex.map((x, xi) => {
      const e = getEx(x.eid), prev = lastSetsFor(x.eid, A.id), pg = progress(e, prev), sw = pg.w;
      const timed = isTimed(e);
      const prevTxt = prev ? prev.map(s => (e.eq === "w" && !s.w ? "" : liftTxt(s.w || 0) + "×") + s.r).join(", ") : "—";
      const done = x.sets.filter(s => s.done).length;
      return `<div class="card ex ${done && done === x.sets.length ? "complete" : ""}" data-xi="${xi}">
        <div class="ex-top"><button class="thumbbtn" data-tech="${xi}" aria-label="${t("technique")}">${figStill(e)}</button>
          <div class="nm"><b>${esc(exName(e))}</b><div class="small muted">${t("g_" + e.g)} · ${t("target_reps", e.lo, e.hi)}</div><div class="small muted">${t("prev")}: <span class="num">${prevTxt}</span></div></div>
          <button class="icon-btn" data-menu="${xi}" aria-label="⋯">⋯</button></div>
        <div class="ex-hint">💡 ${esc(advice(e, prev))}</div>
        <div class="sets"><div class="set-h"><span>#</span><span>${e.eq === "w" ? "+" + wUnit() : wUnit()}</span><span>${timed ? t("sec") : t("reps")}</span><span>✓</span><span></span></div>
        ${x.sets.map((s, si) => `<div class="set ${s.done ? "done" : ""}"><span class="n">${si + 1}</span>
          <input inputmode="decimal" data-sw="${xi}.${si}" value="${s.w != null ? liftU(s.w) : ""}" placeholder="${sw != null ? liftU(sw) : (e.eq === "w" ? "0" : "")}" aria-label="${wUnit()}">
          <input inputmode="numeric" data-sr="${xi}.${si}" value="${s.r != null ? s.r : ""}" placeholder="${prev && prev[si] && pg.kind === "reps" ? Math.min(e.hi, prev[si].r + 1) : e.hi}" aria-label="${t("reps")}">
          <button class="ok" data-ok="${xi}.${si}" aria-label="✓">✓</button><button class="x" data-rm="${xi}.${si}" aria-label="${t("del")}">×</button></div>`).join("")}</div>
        <div class="ex-foot"><button class="btn small ghost" data-addset="${xi}">${t("add_set")}</button><button class="btn small ghost" data-tech="${xi}">▶ ${t("technique")}</button></div></div>`;
    }).join("");
    $("#app").innerHTML = `<div class="wo-head"><div class="top" style="margin-bottom:0"><div class="grow"><h2>${TPL_EM[A.tpl] || ""} ${t("tpl_" + A.tpl)}</h2><div class="small muted"><span id="woClock" class="num"></span> · ${t("running")}</div></div><button class="btn" id="woFinish">${t("finish")}</button></div></div>
      ${hintCard("workout")}${exCards}<button class="btn block soft big" id="addEx">${t("add_ex")}</button>
      <button class="btn block danger" id="woDiscard" style="margin-top:12px">${t("discard")}</button>`;
    bindHints();
    const clock = () => { const el = $("#woClock"); if (!el || !S.active) return clearInterval(woTimer); const s = Math.floor((Date.now() - S.active.start) / 1000); el.textContent = `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ":" : ""}${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
    clearInterval(woTimer); clock(); woTimer = setInterval(clock, 1000);
    const at = k => k.split(".").map(Number);
    $$("[data-sw]").forEach(i => i.onchange = () => { const [a, b] = at(i.dataset.sw), v = num(i.value); A.ex[a].sets[b].w = isFinite(v) ? fromU(v) : null; save(); });
    $$("[data-sr]").forEach(i => i.onchange = () => { const [a, b] = at(i.dataset.sr), v = parseInt(i.value); A.ex[a].sets[b].r = v >= 0 ? v : null; save(); });
    $$("[data-ok]").forEach(b => b.onclick = () => {
      const [a, si] = at(b.dataset.ok), s = A.ex[a].sets[si], row = b.closest(".set");
      const wi = $("[data-sw]", row), ri = $("[data-sr]", row);
      if (!s.done) {
        const wv = num(wi.value !== "" ? wi.value : wi.placeholder), rv = parseInt(ri.value !== "" ? ri.value : ri.placeholder);
        s.w = isFinite(wv) ? fromU(wv) : 0; s.r = rv >= 0 ? rv : 0; s.done = true;
        // carry the weight to the next empty set
        const nxt = A.ex[a].sets[si + 1]; if (nxt && nxt.w == null && !nxt.done) nxt.w = s.w;
        startRest();
      } else s.done = false;
      save(); vibrate(20);
      const y = window.scrollY; renderWorkout(); window.scrollTo(0, y);
    });
    $$("[data-rm]").forEach(b => b.onclick = () => { const [a, si] = at(b.dataset.rm); A.ex[a].sets.splice(si, 1); save(); const y = window.scrollY; renderWorkout(); window.scrollTo(0, y); });
    $$("[data-addset]").forEach(b => b.onclick = () => { const sets = A.ex[+b.dataset.addset].sets, l = sets[sets.length - 1]; sets.push({w: l ? l.w : null, r: null, done: false}); save(); const y = window.scrollY; renderWorkout(); window.scrollTo(0, y); });
    $$("[data-tech]").forEach(b => b.onclick = () => openExDetail(A.ex[+b.dataset.tech].eid));
    $$("[data-menu]").forEach(b => b.onclick = () => openExMenu(+b.dataset.menu));
    $("#addEx").onclick = () => openExPicker(null);
    $("#woFinish").onclick = finishWorkout;
    $("#woDiscard").onclick = () => { if (confirm(t("confirm_discard"))) { S.active = null; stopRest(); save(); render(); } };
  }
  function startRest() {
    const sec = S.settings.rest; if (!sec) return;
    restEnd = Date.now() + sec * 1000; drawRest();
    clearInterval(restT); restT = setInterval(drawRest, 250);
  }
  function stopRest() { clearInterval(restT); restEnd = 0; const el = $("#rest"); if (el) el.remove(); }
  function drawRest() {
    const left = Math.ceil((restEnd - Date.now()) / 1000);
    if (left <= 0) { stopRest(); vibrate([200, 100, 200]); return; }
    let el = $("#rest");
    if (!el) { el = document.createElement("div"); el.id = "rest"; el.className = "restbar"; el.innerHTML = `<span>⏱ ${t("rest")}</span><b></b><button data-p>+15</button><button data-s>${t("skip")}</button>`; document.body.append(el); $("[data-s]", el).onclick = stopRest; $("[data-p]", el).onclick = () => { restEnd += 15000; drawRest(); }; }
    $("b", el).textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  }
  function finishWorkout() {
    const A = S.active;
    A.ex.forEach(x => { x.sets = x.sets.filter(s => s.done); });
    A.ex = A.ex.filter(x => x.sets.length);
    if (!A.ex.length) { if (confirm(t("confirm_discard"))) { S.active = null; stopRest(); save(); render(); } return; }
    A.end = Date.now();
    const min = Math.max(1, Math.round((A.end - A.start) / 6e4));
    A.kcal = strengthKcal(Math.min(min, 150));
    A.vol = A.ex.reduce((s, x) => s + x.sets.reduce((a, b) => a + (b.w || 0) * b.r, 0), 0);
    S.workouts.push(A); S.active = null; stopRest(); save();
    render(); openHistory(A.id, true);
  }
  function openExMenu(xi) {
    const sh = openSheet(`<div class="sh-head"><div class="grow"><h2 style="font-size:18px">${esc(exName(getEx(S.active.ex[xi].eid)))}</h2></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body"><div class="list">
        <button class="li" data-a="tech">▶ ${t("technique")}</button>
        <button class="li" data-a="swap">🔄 ${t("replace")}</button>
        <button class="li" data-a="up">⬆️ ${t("prog_order")}</button><button class="li" data-a="down">⬇️ ${t("prog_order")}</button>
        <button class="li" data-a="rm" style="color:var(--warn)">🗑 ${t("remove")}</button></div></div>`, {auto: true});
    $("[data-x]", sh).onclick = () => closeSheet();
    $$("[data-a]", sh).forEach(b => b.onclick = () => {
      const a = b.dataset.a, ex = S.active.ex;
      if (a === "tech") return openExDetail(ex[xi].eid);
      if (a === "swap") return openExPicker(xi);
      if (a === "rm") ex.splice(xi, 1);
      if (a === "up" && xi > 0) [ex[xi - 1], ex[xi]] = [ex[xi], ex[xi - 1]];
      if (a === "down" && xi < ex.length - 1) [ex[xi + 1], ex[xi]] = [ex[xi], ex[xi + 1]];
      save(); closeSheet(); renderWorkout();
    });
  }
  // exercise list (picker or library)
  function exListSheet(mode, replaceIdx) {
    let g = "", q = "", all = mode === "lib";
    if (replaceIdx != null) g = getEx(S.active.ex[replaceIdx].eid).g;
    const sh = openSheet(`<div class="sh-head"><div class="grow"><h2>${mode === "lib" ? t("lib_title") : t("pick_ex")}</h2></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body"><div class="stack"><input id="exq" type="search" placeholder="🔍 ${t("search").split(" ")[0]}…" autocomplete="off"><div class="chips" id="gChips"></div>
      ${S.profile.place !== "gym" ? `<label class="check small"><input type="checkbox" id="allEq" ${all ? "checked" : ""}> ${t("all_eq")}</label>` : ""}
      <div id="exList"></div>
      ${mode === "pick" ? `<button class="btn ghost block" id="customEx">＋ ${t("custom_ex")}</button>` : ""}</div></div>`);
    $("[data-x]", sh).onclick = () => closeSheet();
    const choose = eid => {
      if (replaceIdx != null) S.active.ex[replaceIdx] = {eid, sets: newSets(eid)};
      else S.active.ex.push({eid, sets: newSets(eid)});
      save(); closeSheet(); renderWorkout();
      if (replaceIdx == null) setTimeout(() => window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"}), 60);
    };
    const draw = () => {
      const base = allowedEx(all);
      const gs = ["", ...GROUPS.filter(x => base.some(e => e.g === x)), ...(S.customEx.length && mode === "pick" ? ["custom"] : [])];
      $("#gChips").innerHTML = gs.map(x => `<button class="chip ${g === x ? "on" : ""}" data-g="${x}">${x ? t("g_" + x) : t("g_all")}</button>`).join("");
      $$("#gChips .chip").forEach(b => b.onclick = () => { g = b.dataset.g; draw(); });
      const ql = q.trim().toLowerCase();
      const list = [...base, ...(mode === "pick" ? S.customEx : [])].filter(e => (!g || e.g === g) && exMatches(e, ql));
      $("#exList").innerHTML = list.length ? `<div class="list">${list.map(e => `<div class="li exrow"><button class="exinfo" data-info="${e.id}" aria-label="${t("technique")}">${figStill(e)}</button><button class="nm" data-e="${e.id}" style="text-align:left"><div>${esc(exName(e))}</div><div class="small muted">${t("g_" + e.g)} · ${t("eq_" + e.eq)}</div></button>${mode === "pick" ? `<button class="btn small soft" data-e="${e.id}">${t("add")}</button>` : `<span class="muted">›</span>`}</div>`).join("")}</div>` : `<p class="muted" style="text-align:center">${t("nothing").split(".")[0]}.</p>`;
      $$("#exList [data-e]").forEach(b => b.onclick = () => mode === "pick" ? choose(b.dataset.e) : openExDetail(b.dataset.e, true));
      $$("#exList [data-info]").forEach(b => b.onclick = () => openExDetail(b.dataset.info, mode === "lib", mode === "pick" ? () => choose(b.dataset.info) : null));
    };
    $("#exq").oninput = e => { q = e.target.value; draw(); };
    if ($("#allEq")) $("#allEq").onchange = e => { all = e.target.checked; draw(); };
    if ($("#customEx")) $("#customEx").onclick = () => {
      const n = (prompt(t("custom_ex_q")) || "").trim(); if (!n) return;
      const e = {id: uid("cx"), n, g: "custom", eq: "x", lo: 8, hi: 12};
      S.customEx.push(e); choose(e.id);
    };
    draw();
  }
  const openExPicker = idx => exListSheet("pick", idx);
  const openLibrary = () => exListSheet("lib");
  function openExDetail(eid, fromLib, onAdd) {
    const e = getEx(eid), cues = e.fig && window.CUES[e.fig] ? (window.CUES[e.fig][S.settings.lang] || window.CUES[e.fig].en) : null;
    const prev = lastSetsFor(eid);
    const sh = openSheet(`<div class="sh-head">${fromLib || onAdd ? `<button class="icon-btn" data-back aria-label="${t("back")}">‹</button>` : ""}<div class="grow"><h2 style="font-size:18px">${esc(exName(e))}</h2><div class="small muted">${t("g_" + e.g)} · ${t("eq_" + e.eq)}</div></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body"><div class="stack">
        ${e.fig ? `<div class="figbig" id="figbig"></div>` : ""}
        <div class="row" style="flex-wrap:wrap;gap:6px"><span class="badge">${t("sets_reps", e.cmp ? 4 : 3, e.lo, e.hi)}</span>${prev ? `<span class="badge">${t("prev")}: ${prev.map(s => (s.w ? liftTxt(s.w) + "×" : "") + s.r).join(", ")}</span>` : ""}</div>
        ${cues ? `<div class="card"><h3>${t("how_to")}</h3><ol class="cues">${cues.map(c => `<li>${esc(c)}</li>`).join("")}</ol></div>` : ""}
        <div class="ex-hint" style="margin:0">💡 ${esc(advice(e, prev))}</div>
      </div></div>
      ${onAdd || (fromLib && S.active) ? `<div class="sh-foot"><button class="btn big block" id="exAdd">${t("add_to_workout")}</button></div>` : ""}`);
    if (e.fig) window.FIG.mount($("#figbig"), e.fig, e.fp, 2600);
    $("[data-x]", sh).onclick = () => closeSheet();
    if ($("[data-back]", sh)) $("[data-back]", sh).onclick = () => fromLib ? openLibrary() : openExPicker(null);
    if ($("#exAdd")) $("#exAdd").onclick = () => {
      if (onAdd) return onAdd();
      S.active.ex.push({eid, sets: newSets(eid)}); save(); closeSheet(); tab = "train"; render();
    };
  }
  function openCardio() {
    let type = "incline", min = 30;
    const sh = openSheet(`<div class="sh-head"><div class="grow"><h2>${t("cardio")}</h2></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body"><div class="stack"><div class="list" id="cList"></div>
      <div class="field"><label>${t("minutes")}</label><div class="stepper"><button class="icon-btn" id="cm" aria-label="−">−</button><input id="cMin" inputmode="numeric" value="${min}"><button class="icon-btn" id="cp" aria-label="+">+</button></div></div>
      <div class="msg" id="cEst"></div><p class="small muted">${t("cardio_note")}</p></div></div>
      <div class="sh-foot"><button class="btn big block" id="cSave">${t("save")}</button></div>`);
    $("[data-x]", sh).onclick = () => closeSheet();
    const kcal = () => Math.round(CARDIO.find(c => c.id === type).met * currentWeight() * min / 60);
    const draw = () => {
      $("#cList").innerHTML = CARDIO.map(c => `<button class="li" data-c="${c.id}" style="${c.id === type ? "background:var(--accentSoft)" : ""}"><span style="font-size:22px">${CARDIO_EM[c.id]}</span><div class="nm">${t("c_" + c.id)}</div>${c.id === type ? "✓" : ""}</button>`).join("");
      $$("#cList [data-c]").forEach(b => b.onclick = () => { type = b.dataset.c; draw(); });
      $("#cEst").textContent = "🔥 " + t("approx", fmt(kcal()));
    };
    $("#cMin").oninput = e => { min = parseInt(e.target.value) || 0; draw(); };
    $("#cm").onclick = () => { min = Math.max(5, min - 5); $("#cMin").value = min; draw(); };
    $("#cp").onclick = () => { min += 5; $("#cMin").value = min; draw(); };
    $("#cSave").onclick = () => {
      if (!(min > 0)) return;
      const now = Date.now();
      S.workouts.push({id: uid("c"), kind: "cardio", type, min, kcal: kcal(), date: todayIso(), start: now - min * 6e4, end: now});
      save(); closeSheet(); render(); toast(t("saved_workout"));
    };
    draw();
  }
  function openHistory(id, fresh) {
    const w = S.workouts.find(x => x.id === id); if (!w) return;
    const body = w.kind === "cardio"
      ? `<div class="card"><h3>${CARDIO_EM[w.type]} ${t("c_" + w.type)}</h3><p>${w.min} ${t("min")} · ${t("approx", fmt(w.kcal))}</p></div>`
      : `<div class="stats card"><div><b>${Math.round((w.end - w.start) / 6e4)}</b><span>${t("min")}</span></div><div><b>${w.ex.length}</b><span>${t("exercises_n", w.ex.length).replace(/^\d+\s*/, "")}</span></div><div><b>${fmt(toU(w.vol || 0) / 1000, 1)}</b><span>${t("volume")}, ${isLb() ? "k lb" : "t"}</span></div><div><b>${fmt(w.kcal || 0)}</b><span>${t("kcal")}</span></div></div>
        ${w.ex.map(x => { const e = getEx(x.eid); return `<div class="card row">${figStill(e)}<div class="grow"><b>${esc(exName(e))}</b><div class="small muted num" style="margin-top:4px">${x.sets.map(s => (e.eq === "w" && !s.w ? "" : liftTxt(s.w || 0) + " " + wUnit() + " × ") + s.r).join(" · ")}</div></div></div>`; }).join("")}`;
    const sh = openSheet(`<div class="sh-head"><div class="grow"><h2>${fresh ? "🎉 " + t("saved_workout") : (w.kind === "cardio" ? t("cardio") : t("tpl_" + w.tpl))}</h2><div class="small muted">${esc(dateLong(w.date))}</div></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body">${fresh ? insightHtml(insights().filter(o => o.pr)) : ""}${body}<button class="btn danger block" id="hDel">${t("discard")}</button></div>`);
    $("[data-x]", sh).onclick = () => closeSheet();
    $("#hDel").onclick = () => { if (confirm(t("confirm_discard"))) { S.workouts = S.workouts.filter(x => x.id !== id); save(); closeSheet(); render(); } };
  }

  // ---------- PROGRESS ----------
  function renderProgress() {
    const p = S.profile, T = targets(), W = sortedW();
    const now = currentWeight(), start = p.start ? p.start.kg : (W[0] ? W[0].kg : now);
    const diff = now - start, toGo = Math.abs(now - p.target);
    const reached = p.goal === "lose" ? now <= p.target : p.goal === "gain" ? now >= p.target : false;
    const eta = etaDate(p, now);
    let html = `<div class="top"><h1>${t("nav_progress")}</h1><button class="btn small" id="wAdd">＋ ${t("weigh_in")}</button></div>
      ${hintCard("progress")}
      <div class="card"><div class="stats"><div><b class="num">${fmt(toU(start), 1)}</b><span>${t("start_w")}</span></div><div><b class="num">${fmt(toU(now), 1)}</b><span>${t("now_w")}</span></div>
      <div><b class="num" style="color:var(--accent2)">${Math.abs(toU(diff)) < .05 ? "" : diff < 0 ? "−" : "+"}${fmt(Math.abs(toU(diff)), 1)}</b><span>${diff <= 0 ? t("lost") : t("gained")}</span></div>
      <div><b class="num">${p.goal === "keep" ? "—" : fmt(toU(toGo), 1)}</b><span>${t("to_go")}</span></div></div>
      ${reached && p.goal !== "keep" ? `<div class="msg" style="margin-top:12px;text-align:center"><b>${t("goal_reached")}</b></div>` : eta ? `<div class="small muted" style="text-align:center;margin-top:10px">${t("forecast")}: ${wTxt(p.target)} · ${esc(monthYear(eta))}</div>` : ""}</div>
      <div class="card"><h3>${t("w_chart")}, ${wUnit()}</h3>${W.length >= 2 ? weightChart(W, p) : `<p class="muted">${t("w_empty")}</p>`}</div>`;
    // insights
    const ins = insights();
    html += `<div class="card"><h3>🧠 ${t("ins_title")}</h3><div class="stack" style="margin-top:8px">${ins.length ? insightHtml(ins) : `<p class="muted" style="margin:0">${t("ins_none")}</p>`}</div></div>`;
    // adaptive target
    const ad = adaptive();
    html += `<div class="card"><h3>🎯 ${t("adapt_title")}</h3>`;
    if (!ad) html += `<p class="muted small" style="margin:6px 0 0">${t("adapt_need")}</p>`;
    else {
      html += `<p class="small" style="margin:6px 0">${t("adapt_text", ad.days, fmt(ad.avg), (ad.perWeek > 0 ? "+" : "−") + wTxt(Math.abs(ad.perWeek), 2), fmt(ad.real))}</p>`;
      if (S.profile.manual) html += `<p class="small muted">${t("own_targets")}</p>`;
      else if (Math.abs(ad.sugg - ad.current) >= 100) html += `<p class="small"><b>${t("adapt_suggest", fmt(ad.sugg), fmt(ad.current))}</b></p><button class="btn block" id="adApply">${t("adapt_apply")}</button>`;
      else html += `<p class="small muted">✅ ${t("adapt_ok")}</p>`;
    }
    if (p.adapt) html += `<p class="small muted" style="margin:8px 0 0">${t("adapt_on", esc(dateShort(p.adapt.date)))}</p>`;
    html += `</div>`;
    // 7 days
    const days7 = Array.from({length: 7}, (_, i) => addDays(todayIso(), i - 6));
    const tots = days7.map(totals), logged = tots.filter(x => x.k > 0);
    const avgK = logged.length ? logged.reduce((s, x) => s + x.k, 0) / logged.length : 0;
    const avgP = logged.length ? logged.reduce((s, x) => s + x.p, 0) / logged.length : 0;
    html += `<div class="card"><h3>${t("last7")}</h3>${barChart(days7, tots, T.k)}<div class="small muted">${logged.length ? t("avg_kcal", fmt(avgK)) + " · " + t("avg_prot", fmt(avgP), T.p) : ""}</div></div>`;
    let streak = 0; for (let d = todayIso(); S.days[d] && S.days[d].items.length; d = addDays(d, -1)) streak++;
    const w7 = S.workouts.filter(w => w.date >= days7[0]).length;
    html += `<div class="kpis"><div class="card"><b>${w7}</b><span class="small muted">${t("workouts_w")}</span></div><div class="card"><b>${streak} 🔥</b><span class="small muted">${t("streak")}</span></div></div>`;
    const best = {};
    S.workouts.filter(w => w.kind === "strength").forEach(w => w.ex.forEach(x => x.sets.forEach(s => { if ((s.w || 0) > 0 && (!best[x.eid] || s.w > best[x.eid].w || (s.w === best[x.eid].w && s.r > best[x.eid].r))) best[x.eid] = {w: s.w, r: s.r, date: w.date}; })));
    const recs = Object.entries(best).sort((a, b) => b[1].date < a[1].date ? -1 : 1).slice(0, 8);
    html += `<div class="section-t">🏆 ${t("records")}</div>${recs.length ? `<div class="list">${recs.map(([eid, r]) => `<div class="li"><div class="nm"><div>${esc(exName(getEx(eid)))}</div><div class="small muted">${esc(dateShort(r.date))}</div></div><b class="num">${liftTxt(r.w)} ${wUnit()} × ${r.r}</b></div>`).join("")}</div>` : `<div class="card muted">${t("records_empty")}</div>`}`;
    html += `<div class="section-t">${t("weight_history")}</div><div class="list">${W.slice().reverse().slice(0, 30).map(w => `<div class="li"><div class="nm"><div>${esc(dateShort(w.date))}</div>${w.waist ? `<div class="small muted">${t("waist")}: ${fmt(w.waist, 1)}</div>` : ""}</div><b class="num">${wTxt(w.kg)}</b><button class="icon-btn" data-wd="${w.date}" style="width:36px;height:36px;font-size:16px" aria-label="${t("del")}">×</button></div>`).join("")}</div>`;
    $("#app").innerHTML = html;
    $("#wAdd").onclick = openWeigh;
    if ($("#adApply")) $("#adApply").onclick = () => { S.profile.adapt = {tdee: ad.real, date: todayIso()}; save(); render(); toast("✓ " + fmt(targets().k) + " " + t("kcal")); };
    $$("[data-wd]").forEach(b => b.onclick = () => { if (S.weights.length > 1 && confirm(t("del") + "?")) { S.weights = S.weights.filter(w => w.date !== b.dataset.wd); save(); render(); } });
  }
  function weightChart(W, p) {
    const w = 340, h = 170, L = 34, R = 8, Tp = 12, B = 22;
    const xs = W.map(x => parseIso(x.date).getTime()), ys = W.map(x => toU(x.kg));
    const tg = p.goal !== "keep" ? toU(p.target) : null;
    let mn = Math.min(...ys), mx = Math.max(...ys);
    if (tg != null && Math.abs(tg - ys[ys.length - 1]) < (mx - mn + 4) * 1.5) { mn = Math.min(mn, tg); mx = Math.max(mx, tg); }
    const padY = Math.max(1, (mx - mn) * .12); mn -= padY; mx += padY;
    const x0 = xs[0], x1 = Math.max(xs[xs.length - 1], x0 + 864e5);
    const X = v => L + (v - x0) / (x1 - x0) * (w - L - R), Y = v => Tp + (mx - v) / (mx - mn) * (h - Tp - B);
    const pts = W.map((d, i) => `${X(xs[i]).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join(" ");
    const ticks = [mn + padY, (mn + mx) / 2, mx - padY];
    const showT = tg != null && tg >= mn && tg <= mx;
    return `<svg class="chart" viewBox="0 0 ${w} ${h}">
      ${ticks.map(v => `<line x1="${L}" x2="${w - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join("")}
      ${showT ? `<line x1="${L}" x2="${w - R}" y1="${Y(tg)}" y2="${Y(tg)}" stroke="var(--accent)" stroke-dasharray="5 5"/><text x="${w - R}" y="${Y(tg) - 5}" text-anchor="end" style="fill:var(--accent2)">🎯 ${fmt(tg)}</text>` : ""}
      <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${W.map((d, i) => `<circle cx="${X(xs[i])}" cy="${Y(ys[i])}" r="3.5" fill="var(--card)" stroke="var(--accent)" stroke-width="2"/>`).join("")}
      <text x="${L}" y="${h - 4}">${esc(dateShort(W[0].date))}</text><text x="${w - R}" y="${h - 4}" text-anchor="end">${esc(dateShort(W[W.length - 1].date))}</text></svg>`;
  }
  function barChart(days, tots, goal) {
    const w = 340, h = 150, B = 20, Tp = 8, mx = Math.max(goal * 1.25, ...tots.map(x => x.k)), bw = (w - 16) / 7;
    const Y = v => Tp + (1 - v / mx) * (h - Tp - B);
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="margin:8px 0">
      ${tots.map((x, i) => { const y = Y(x.k), over = x.k > goal * 1.05; return `<rect x="${8 + i * bw + 6}" y="${y}" width="${bw - 12}" height="${Math.max(0, h - B - y)}" rx="6" fill="${x.k ? (over ? "var(--warn)" : "var(--accent)") : "var(--card2)"}"/><text x="${8 + i * bw + bw / 2}" y="${h - 4}" text-anchor="middle">${esc(parseIso(days[i]).toLocaleDateString(loc(), {weekday: "short"}).slice(0, 2))}</text>`; }).join("")}
      <line x1="8" x2="${w - 8}" y1="${Y(goal)}" y2="${Y(goal)}" stroke="var(--text)" stroke-dasharray="4 4" opacity=".5"/></svg>`;
  }

  // ---------- PROFILE ----------
  function renderProfile() {
    const p = S.profile, c = calc(p), T = targets();
    $("#app").innerHTML = `<div class="top"><h1>${t("nav_profile")}</h1></div>
      <div class="card"><div class="row"><div style="font-size:40px">${p.sex === "f" ? "👩" : "👨"}</div><div class="grow"><h3>${t("goal_" + p.goal)}</h3><div class="small muted">${p.age} ${t("years")} · ${fmt(p.height)} ${t("cm")} · ${wTxt(currentWeight())}${p.goal !== "keep" ? " → " + wTxt(p.target) : ""}</div></div></div>
      <button class="btn ghost block" id="pEdit" style="margin-top:12px">✏️ ${t("edit_profile")}</button></div>
      <div class="section-t">${t("daily_targets")}</div>
      <div class="card"><div class="nutr"><div style="background:var(--card2)"><b class="num">${fmt(T.k)}</b><span>${t("kcal")}</span></div><div style="background:var(--card2)"><b style="color:var(--prot)">${T.p}</b><span>${t("protein")}</span></div><div style="background:var(--card2)"><b style="color:var(--fat)">${T.f}</b><span>${t("fat")}</span></div><div style="background:var(--card2)"><b style="color:var(--carb)">${T.c}</b><span>${t("carbs")}</span></div></div>
      <div class="small muted" style="margin-top:10px">${p.manual ? t("own_targets") : p.adapt ? t("adapt_on", esc(dateShort(p.adapt.date))) : t("auto_calc")} · ${t("bmr_line", fmt(c.bmr), fmt(c.tdee))}</div>
      <button class="btn ghost block" id="pManual" style="margin-top:10px">${t("own_targets")}</button></div>
      <div class="section-t">${t("settings")}</div>
      <div class="card stack">
        <div class="field"><label>${t("language")}</label><div class="seg" id="sLang">${window.LANGS.map(([cd]) => `<button data-v="${cd}" class="${S.settings.lang === cd ? "on" : ""}">${cd.toUpperCase()}</button>`).join("")}</div></div>
        <div class="field"><label>${t("units")}</label><div class="seg" id="sUnits"><button data-v="kg" class="${!isLb() ? "on" : ""}">${t("kg")}</button><button data-v="lb" class="${isLb() ? "on" : ""}">${t("lb")}</button></div></div>
        <div class="field"><label>${t("rest_time")}</label><div class="seg" id="sRest">${[0, 60, 90, 120, 180].map(v => `<button data-v="${v}" class="${S.settings.rest === v ? "on" : ""}">${v ? v + t("sec") : t("off")}</button>`).join("")}</div></div>
        <div class="field"><label>${t("train_place")}</label><div class="seg" id="sPlace">${["gym", "db", "none"].map((v, i) => `<button data-v="${v}" class="${p.place === v ? "on" : ""}">${["🏋️", "🏠", "🧘"][i]}</button>`).join("")}</div><div class="small muted" style="margin-top:4px">${t("place_" + p.place)}</div></div>
        <label class="check"><input type="checkbox" id="sBase" ${S.settings.showBase ? "checked" : ""}> ${t("show_base", FOODS.length)}</label>
      </div>
      <div class="section-t">${t("my_data")}</div>
      <div class="card stack"><div class="small muted">🔒 ${t("data_local")}</div>
        <div class="grid2"><button class="btn ghost" id="pExp">⬇️ ${t("export")}</button><label class="btn ghost">⬆️ ${t("import")}<input type="file" accept="application/json,.json" id="pImp" hidden></label></div>
        <button class="btn danger block" id="pWipe">${t("wipe")}</button></div>
      <div class="section-t">${t("about")}</div>
      <div class="list"><button class="li" id="pShare">💚 ${t("share_app")}</button><a class="li" href="privacy.html" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">📄 ${t("privacy")}</a></div>
      <p class="small muted" style="margin:14px 4px">${esc(APP.name)} · ${t("version", APP.version)}<br>${t("credits")}<br>${t("disclaimer")}</p>`;
    $("#pEdit").onclick = () => { obInit(true); render(); window.scrollTo(0, 0); };
    $("#pManual").onclick = openManual;
    const seg = (id, fn) => $$(`#${id} button`).forEach(b => b.onclick = () => { fn(b.dataset.v); save(); render(); });
    seg("sLang", v => S.settings.lang = v);
    seg("sUnits", v => S.settings.units = v);
    seg("sRest", v => S.settings.rest = +v);
    seg("sPlace", v => S.profile.place = v);
    $("#sBase").onchange = e => { S.settings.showBase = e.target.checked; save(); };
    $("#pExp").onclick = exportData;
    $("#pImp").onchange = importData;
    $("#pWipe").onclick = () => { if (confirm(t("wipe_q"))) { localStorage.removeItem(KEY); S = blank(); ob = null; tab = "today"; render(); } };
    $("#pShare").onclick = async () => { const d = {title: APP.name, text: t("share_text"), url: APP.url}; try { if (navigator.share) await navigator.share(d); else { await navigator.clipboard.writeText(d.text + " " + d.url); toast("✓ " + d.url); } } catch (e) {} };
  }
  function openManual() {
    const T = targets();
    const sh = openSheet(`<div class="sh-head"><div class="grow"><h2>${t("own_targets")}</h2><div class="small muted">${t("own_targets_d")}</div></div><button class="icon-btn" data-x aria-label="${t("close")}">✕</button></div>
      <div class="sh-body"><div class="grid2">
        <div class="field"><label>${t("kcal")}</label><input id="mK" inputmode="numeric" value="${T.k}"></div>
        <div class="field"><label>${t("protein")}, ${t("g")}</label><input id="mP" inputmode="numeric" value="${T.p}"></div>
        <div class="field"><label>${t("fat")}, ${t("g")}</label><input id="mF" inputmode="numeric" value="${T.f}"></div>
        <div class="field"><label>${t("carbs")}, ${t("g")}</label><input id="mC" inputmode="numeric" value="${T.c}"></div></div>
        ${S.profile.manual ? `<button class="btn ghost block" id="mReset" style="margin-top:12px">${t("reset_auto")}</button>` : ""}</div>
      <div class="sh-foot"><button class="btn big block" id="mSave">${t("save")}</button></div>`, {auto: true});
    $("[data-x]", sh).onclick = () => closeSheet();
    $("#mSave").onclick = () => {
      const k = num($("#mK").value); if (!(k >= 800 && k <= 8000)) return $("#mK").focus();
      S.profile.manual = {k: Math.round(k), p: Math.round(num($("#mP").value) || 0), f: Math.round(num($("#mF").value) || 0), c: Math.round(num($("#mC").value) || 0)};
      save(); closeSheet(); render();
    };
    if ($("#mReset")) $("#mReset").onclick = () => { delete S.profile.manual; save(); closeSheet(); render(); };
  }
  function exportData() {
    saveNow();
    const blob = new Blob([JSON.stringify(Object.assign({app: APP.name, exported: new Date().toISOString()}, S))], {type: "application/json"});
    const name = `${APP.name.toLowerCase()}-${todayIso()}.json`;
    let file = null; try { file = new File([blob], name, {type: "application/json"}); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({files: [file]})) { navigator.share({files: [file], title: name}).catch(() => {}); return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function importData(e) {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || !d.v || !d.profile) throw 0;
        delete d.app; delete d.exported;
        const b = blank(); d.settings = Object.assign(b.settings, d.settings || {});
        S = Object.assign(b, d); saveNow(); toast(t("import_ok")); render();
      } catch (er) { toast(t("import_bad")); }
    };
    r.readAsText(f);
  }

  // ---------- boot ----------
  render();
  if ("serviceWorker" in navigator && location.protocol === "https:") window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  window.__fitduo = {get S() { return S; }, set S(v) { S = v; }, render, insights, adaptive};
})();
