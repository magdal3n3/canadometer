import { useState, useMemo, useRef, useCallback, useEffect } from "react";

/* ─── Google Fonts ─── */
(() => {
  if (document.getElementById("cano-gf")) return;
  const l = document.createElement("link");
  l.id = "cano-gf"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
})();

/* ─── Global CSS ─── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f0f; color: #e8e4de; font-family: 'Barlow', sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #161616; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  select option { background: #1e1e1e; color: #e8e4de; }
  textarea { resize: vertical; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) scaleY(0.96); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
`;
if (!document.getElementById("cano-css")) {
  const s = document.createElement("style");
  s.id = "cano-css"; s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

/* ─── Design tokens ─── */
const C = {
  bg: "#0f0f0f", surface: "#161616", elevated: "#1e1e1e", card: "#1a1a1a", hover: "#242424",
  border: "rgba(255,255,255,0.07)", borderMid: "rgba(255,255,255,0.12)",
  red: "#e53935", redHov: "#c62828", redGlow: "rgba(229,57,53,0.15)", redFaint: "rgba(229,57,53,0.08)",
  white: "#f0ede8", muted: "#8a8680", faint: "#454340",
  display: "'Barlow Condensed', sans-serif", body: "'Barlow', sans-serif",
};

/* ─── Category icons ─── */
const CAT_ICONS = {
  "Food & Drink": <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  "Culture":      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  "Nature":       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l9-13 9 13H3z"/><path d="M12 4v16"/></svg>,
  "Sports":       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24m5.66-0l4.24-4.24M4.93 19.07l4.24-4.24m5.66 0l4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>,
  "History":      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  "Activity":     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  "Politics":     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  "Other":        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
};

const CATS = ["Food & Drink", "Culture", "Nature", "Sports", "History", "Activity", "Politics", "Other"];
const CITIES = ["Calgary", "Halifax", "Montreal", "Ottawa", "Toronto", "Vancouver"];

/* ─── Items ─── */
const ITEMS = [
  // Sports
  { id:"sp1", label:"Watch a live NHL hockey game",                    type:"Sports",       city:"",          diff:3 },
  { id:"sp2", label:"Play a pickup game of road hockey",               type:"Sports",       city:"",          diff:1 },
  { id:"sp3", label:"Curl at a local curling club",                    type:"Sports",       city:"",          diff:2 },
  { id:"sp4", label:"Watch a CFL football game",                       type:"Sports",       city:"",          diff:2 },
  { id:"sp5", label:"Attend a Toronto Raptors game",                   type:"Sports",       city:"Toronto",   diff:3 },
  // Nature
  { id:"n1",  label:"Visit Banff National Park",                       type:"Nature",       city:"Calgary",   diff:4 },
  { id:"n2",  label:"Hike through old-growth forest in BC",            type:"Nature",       city:"Vancouver", diff:3 },
  { id:"n3",  label:"Spot a moose in the wild",                        type:"Nature",       city:"",          diff:3 },
  { id:"n4",  label:"See Niagara Falls",                               type:"Nature",       city:"Toronto",   diff:2 },
  { id:"n5",  label:"Kayak in the Bay of Fundy",                       type:"Nature",       city:"Halifax",   diff:3 },
  // Activity
  { id:"a1",  label:"Ice skate on the Rideau Canal",                   type:"Activity",     city:"Ottawa",    diff:2 },
  { id:"a2",  label:"Ski or snowboard in the Rockies",                 type:"Activity",     city:"Calgary",   diff:4 },
  { id:"a3",  label:"Go dogsledding",                                  type:"Activity",     city:"",          diff:4 },
  { id:"a4",  label:"See the Northern Lights",                         type:"Activity",     city:"",          diff:5 },
  { id:"a5",  label:"Go whale watching off the coast",                 type:"Activity",     city:"",          diff:4 },
  { id:"a6",  label:"Canoe a backcountry lake in Algonquin Park",      type:"Activity",     city:"Toronto",   diff:4 },
  // History
  { id:"h1",  label:"Visit Parliament Hill",                           type:"History",      city:"Ottawa",    diff:2 },
  { id:"h2",  label:"Study the Battle of the Plains of Abraham",       type:"History",      city:"Montreal",  diff:1 },
  { id:"h3",  label:"Read about Canadian Confederation (1867)",        type:"History",      city:"",          diff:1 },
  { id:"h4",  label:"Visit a Hudson's Bay Company historic site",      type:"History",      city:"",          diff:2 },
  { id:"h5",  label:"Tour the Canadian War Museum",                    type:"History",      city:"Ottawa",    diff:2 },
  { id:"h6",  label:"Learn about the residential school system",       type:"History",      city:"",          diff:1 },
  { id:"h7",  label:"Read about the Klondike Gold Rush",               type:"History",      city:"",          diff:1 },
  // Culture (formerly separate Music + Culture — now merged, expanded)
  { id:"c1",  label:"Visit the Canadian Museum of History",            type:"Culture",      city:"Ottawa",    diff:2 },
  { id:"c2",  label:"Attend a powwow or Indigenous ceremony",          type:"Culture",      city:"",          diff:3 },
  { id:"c3",  label:"Watch SCTV or Kids in the Hall",                  type:"Culture",      city:"",          diff:1 },
  { id:"c4",  label:"Visit the CN Tower",                              type:"Culture",      city:"Toronto",   diff:2 },
  { id:"c5",  label:"Attend the Calgary Stampede",                     type:"Culture",      city:"Calgary",   diff:3 },
  { id:"c6",  label:"Visit the Quebec Winter Carnival",                type:"Culture",      city:"Montreal",  diff:3 },
  { id:"c7",  label:"Explore Old Quebec City on foot",                 type:"Culture",      city:"Montreal",  diff:2 },
  // Culture — Film
  { id:"cf1", label:"Watch Atanarjuat: The Fast Runner",               type:"Culture",      city:"",          diff:1 },
  { id:"cf2", label:"Watch Mon Oncle Antoine",                         type:"Culture",      city:"",          diff:1 },
  { id:"cf3", label:"Watch Bon Cop, Bad Cop",                          type:"Culture",      city:"",          diff:1 },
  { id:"cf4", label:"Watch The Sweet Hereafter by Atom Egoyan",        type:"Culture",      city:"",          diff:1 },
  { id:"cf5", label:"Watch a National Film Board short film",          type:"Culture",      city:"",          diff:1 },
  // Culture — Literature
  { id:"cl1", label:"Read The Stone Angel by Margaret Laurence",       type:"Culture",      city:"",          diff:2 },
  { id:"cl2", label:"Read The Handmaid's Tale by Margaret Atwood",     type:"Culture",      city:"",          diff:2 },
  { id:"cl3", label:"Read In the Skin of a Lion by Michael Ondaatje",  type:"Culture",      city:"",          diff:2 },
  { id:"cl4", label:"Read Anne of Green Gables by L.M. Montgomery",    type:"Culture",      city:"",          diff:1 },
  { id:"cl5", label:"Read Indian Horse by Richard Wagamese",           type:"Culture",      city:"",          diff:1 },
  { id:"cl6", label:"Read The Blind Assassin by Margaret Atwood",      type:"Culture",      city:"",          diff:2 },
  // Culture — Theatre
  { id:"ct1", label:"See a Stratford Festival production",             type:"Culture",      city:"",          diff:3 },
  { id:"ct2", label:"Attend a Shaw Festival play in Niagara-on-the-Lake", type:"Culture",  city:"Toronto",   diff:3 },
  { id:"ct3", label:"See a show at the National Arts Centre",          type:"Culture",      city:"Ottawa",    diff:2 },
  // Culture — Music (merged from Music category)
  { id:"s1",  label:"Listen to I Go Blind — 54-40",                    type:"Culture",      city:"",          diff:1 },
  { id:"s2",  label:"Listen to Black Velvet — Alannah Myles",          type:"Culture",      city:"",          diff:1 },
  { id:"s3",  label:"Listen to You Oughta Know — Alanis Morissette",   type:"Culture",      city:"",          diff:1 },
  { id:"s4",  label:"Listen to Ironic — Alanis Morissette",            type:"Culture",      city:"",          diff:1 },
  { id:"s5",  label:"Listen to Archie, Marry Me — Alvvays",            type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s6",  label:"Listen to Rebellion (Lies) — Arcade Fire",        type:"Culture",      city:"Montreal",  diff:1 },
  { id:"s7",  label:"Listen to Takin' Care of Business — BTO",         type:"Culture",      city:"",          diff:1 },
  { id:"s8",  label:"Listen to If I Had $1,000,000 — Barenaked Ladies",type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s9",  label:"Listen to One Week — Barenaked Ladies",           type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s10", label:"Listen to Spaceman — Bif Naked",                  type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s11", label:"Listen to Hasn't Hit Me Yet — Blue Rodeo",        type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s12", label:"Listen to Summer of '69 — Bryan Adams",           type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s13", label:"Listen to Call Me Maybe — Carly Rae Jepsen",      type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s14", label:"Listen to Feel Good — Charlotte Cardin",          type:"Culture",      city:"Montreal",  diff:1 },
  { id:"s15", label:"Listen to My Heart Will Go On — Celine Dion",     type:"Culture",      city:"Montreal",  diff:1 },
  { id:"s16", label:"Listen to Sunglasses at Night — Corey Hart",      type:"Culture",      city:"Montreal",  diff:1 },
  { id:"s17", label:"Listen to Best Part — Daniel Caesar",             type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s18", label:"Listen to Let's Fall in Love — Diana Krall",      type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s19", label:"Listen to Hotline Bling — Drake",                 type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s20", label:"Listen to Passionfruit — Drake",                  type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s21", label:"Listen to 1234 — Feist",                          type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s22", label:"Listen to If You Could Read My Mind — Gordon Lightfoot", type:"Culture", city:"",       diff:1 },
  { id:"s23", label:"Listen to Canadian Railroad Trilogy — Gordon Lightfoot", type:"Culture", city:"",       diff:1 },
  { id:"s24", label:"Listen to Oblivion — Grimes",                     type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s25", label:"Listen to When I'm Up — Great Big Sea",           type:"Culture",      city:"",          diff:1 },
  { id:"s26", label:"Listen to Don't Forget Me — Glass Tiger",         type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s27", label:"Listen to Hallelujah — Leonard Cohen",            type:"Culture",      city:"Montreal",  diff:1 },
  { id:"s28", label:"Listen to Working for the Weekend — Loverboy",    type:"Culture",      city:"Calgary",   diff:1 },
  { id:"s29", label:"Listen to My Kind of Woman — Mac DeMarco",        type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s30", label:"Listen to Man! I Feel Like a Woman! — Shania Twain", type:"Culture",   city:"",          diff:1 },
  { id:"s31", label:"Listen to You're Still the One — Shania Twain",   type:"Culture",      city:"",          diff:1 },
  { id:"s32", label:"Listen to Haven't Met You Yet — Michael Buble",   type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s33", label:"Listen to Echo Beach — Martha and the Muffins",   type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s34", label:"Listen to I'm Like a Bird — Nelly Furtado",       type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s35", label:"Listen to How You Remind Me — Nickelback",        type:"Culture",      city:"Calgary",   diff:1 },
  { id:"s36", label:"Listen to Photograph — Nickelback",               type:"Culture",      city:"Calgary",   diff:1 },
  { id:"s37", label:"Listen to Clumsy — Our Lady Peace",               type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s38", label:"Listen to Spirit of the Radio — Rush",            type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s39", label:"Listen to Angel — Sarah McLachlan",               type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s40", label:"Listen to Building a Mystery — Sarah McLachlan",  type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s41", label:"Listen to Stitches — Shawn Mendes",               type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s42", label:"Listen to Perfect — Simple Plan",                 type:"Culture",      city:"Montreal",  diff:1 },
  { id:"s43", label:"Listen to Northwest Passage — Stan Rogers",       type:"Culture",      city:"",          diff:1 },
  { id:"s44", label:"Listen to Born to Be Wild — Steppenwolf",         type:"Culture",      city:"",          diff:1 },
  { id:"s45", label:"Listen to The Hockey Song — Stompin' Tom Connors",type:"Culture",      city:"",          diff:1 },
  { id:"s46", label:"Listen to In Too Deep — Sum 41",                  type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s47", label:"Listen to Fat Lip — Sum 41",                      type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s48", label:"Listen to The Weight — The Band",                 type:"Culture",      city:"",          diff:1 },
  { id:"s49", label:"Listen to T-Shirt — The Beaches",                 type:"Culture",      city:"Toronto",   diff:1 },
  { id:"s50", label:"Listen to American Woman — The Guess Who",        type:"Culture",      city:"",          diff:1 },
  { id:"s51", label:"Listen to Wheat Kings — The Tragically Hip",      type:"Culture",      city:"",          diff:1 },
  { id:"s52", label:"Listen to Bobcaygeon — The Tragically Hip",       type:"Culture",      city:"",          diff:1 },
  { id:"s53", label:"Listen to Life is a Highway — Tom Cochrane",      type:"Culture",      city:"",          diff:1 },
  { id:"s54", label:"Listen to We're Here for a Good Time — Trooper",  type:"Culture",      city:"Vancouver", diff:1 },
  { id:"s55", label:"Listen to I'll Believe in Anything — Wolf Parade",type:"Culture",      city:"Montreal",  diff:1 },
  { id:"s56", label:"Listen to Left and Leaving — The Weakerthans",    type:"Culture",      city:"",          diff:1 },
  // Food & Drink
  { id:"f1",  label:"Eat poutine",                                     type:"Food & Drink", city:"",          diff:1 },
  { id:"f2",  label:"Try butter tarts",                                type:"Food & Drink", city:"",          diff:1 },
  { id:"f3",  label:"Eat a Nanaimo bar",                               type:"Food & Drink", city:"Vancouver", diff:1 },
  { id:"f4",  label:"Drink a Caesar cocktail",                         type:"Food & Drink", city:"",          diff:1 },
  { id:"f5",  label:"Try a BeaverTail pastry in Ottawa",               type:"Food & Drink", city:"Ottawa",    diff:1 },
  { id:"f6",  label:"Try ketchup chips",                               type:"Food & Drink", city:"",          diff:1 },
  { id:"f7",  label:"Try all-dressed chips",                           type:"Food & Drink", city:"",          diff:1 },
  { id:"f8",  label:"Eat Montreal smoked meat on rye",                 type:"Food & Drink", city:"Montreal",  diff:2 },
  { id:"f9",  label:"Drink a Tim Hortons double-double",               type:"Food & Drink", city:"",          diff:1 },
  { id:"f10", label:"Try Montreal-style bagels",                       type:"Food & Drink", city:"Montreal",  diff:2 },
  { id:"f11", label:"Drink Canadian maple whiskey",                    type:"Food & Drink", city:"",          diff:1 },
  { id:"f12", label:"Eat fried cod tongues",                           type:"Food & Drink", city:"",          diff:3 },
  { id:"f13", label:"Drink a Labatt Blue or Molson Canadian",          type:"Food & Drink", city:"",          diff:1 },
  { id:"f14", label:"Eat maple-glazed salmon",                         type:"Food & Drink", city:"Vancouver", diff:1 },
  { id:"f15", label:"Eat a peameal bacon sandwich",                    type:"Food & Drink", city:"Toronto",   diff:1 },
  { id:"f16", label:"Try tourtiere — Quebec meat pie",                 type:"Food & Drink", city:"Montreal",  diff:1 },
  { id:"f17", label:"Eat maple taffy on snow",                         type:"Food & Drink", city:"Montreal",  diff:2 },
  { id:"f18", label:"Try figgy duff — Newfoundland pudding",           type:"Food & Drink", city:"",          diff:2 },
  { id:"f19", label:"Try Oka cheese",                                  type:"Food & Drink", city:"Montreal",  diff:1 },
  { id:"f20", label:"Eat a Halifax donair",                            type:"Food & Drink", city:"Halifax",   diff:2 },
  { id:"f21", label:"Eat a maple bacon donut",                         type:"Food & Drink", city:"",          diff:1 },
  { id:"f22", label:"Try a Nova Scotia lobster roll",                  type:"Food & Drink", city:"Halifax",   diff:1 },
  { id:"f23", label:"Eat wild game jerky — elk or moose",              type:"Food & Drink", city:"",          diff:1 },
  { id:"f24", label:"Drink ice cider from Quebec",                     type:"Food & Drink", city:"Montreal",  diff:1 },
  { id:"f25", label:"Eat fresh PEI oysters",                           type:"Food & Drink", city:"",          diff:1 },
  { id:"f26", label:"Eat fresh PEI mussels",                           type:"Food & Drink", city:"",          diff:1 },
  { id:"f27", label:"Eat wild Arctic char",                            type:"Food & Drink", city:"",          diff:3 },
  { id:"f28", label:"Try Saskatoon berry pie",                         type:"Food & Drink", city:"",          diff:2 },
  { id:"f29", label:"Eat toutons with molasses",                       type:"Food & Drink", city:"",          diff:1 },
  { id:"f30", label:"Try spruce beer",                                 type:"Food & Drink", city:"",          diff:1 },
  { id:"f31", label:"Try Labrador tea",                                type:"Food & Drink", city:"",          diff:2 },
  { id:"f32", label:"Eat cretons — Quebec pork spread",                type:"Food & Drink", city:"Montreal",  diff:2 },
  { id:"f33", label:"Eat wild salmon candy from BC",                   type:"Food & Drink", city:"Vancouver", diff:2 },
  { id:"f34", label:"Try partridgeberry jam",                          type:"Food & Drink", city:"",          diff:2 },
  { id:"f35", label:"Eat prairie oysters at the Stampede",             type:"Food & Drink", city:"Calgary",   diff:2 },
  { id:"f36", label:"Try bannock",                                     type:"Food & Drink", city:"",          diff:2 },
  // Politics
  { id:"p1",  label:"Read the Canadian Charter of Rights and Freedoms",type:"Politics",     city:"",          diff:1 },
  { id:"p2",  label:"Vote in a federal election",                       type:"Politics",     city:"",          diff:2 },
  { id:"p3",  label:"Attend a town hall with your MP",                  type:"Politics",     city:"",          diff:3 },
  { id:"p4",  label:"Watch a federal leaders debate",                   type:"Politics",     city:"",          diff:1 },
  { id:"p5",  label:"Read about the October Crisis of 1970",            type:"Politics",     city:"Montreal",  diff:1 },
  { id:"p6",  label:"Learn about the Meech Lake Accord",                type:"Politics",     city:"",          diff:1 },
  { id:"p7",  label:"Tour the Senate chamber on Parliament Hill",        type:"Politics",     city:"Ottawa",    diff:2 },
  { id:"p8",  label:"Read about Tommy Douglas and Canadian healthcare", type:"Politics",     city:"",          diff:1 },
  { id:"p9",  label:"Learn about the National Energy Program debate",   type:"Politics",     city:"",          diff:1 },
  { id:"p10", label:"Understand the difference between the NDP, Liberal, and Conservative platforms", type:"Politics", city:"", diff:1 },
  { id:"p11", label:"Read Pierre Trudeau's Memoirs",                    type:"Politics",     city:"",          diff:2 },
  { id:"p12", label:"Follow a session of Question Period in Ottawa",    type:"Politics",     city:"Ottawa",    diff:2 },
  // Other
  { id:"o1",  label:"Say 'sorry' to someone who bumped into you",       type:"Other",        city:"",          diff:1 },
  { id:"o2",  label:"Survive a full Canadian winter without complaining",type:"Other",       city:"",          diff:4 },
  { id:"o3",  label:"Learn 10 words of Canadian French",                type:"Other",        city:"",          diff:2 },
  { id:"o4",  label:"Learn 10 words of an Indigenous language",         type:"Other",        city:"",          diff:2 },
  { id:"o5",  label:"Explain the difference between Canadian and American spelling", type:"Other", city:"",   diff:1 },
  { id:"o6",  label:"Successfully parallel park on a snowy street",     type:"Other",        city:"",          diff:3 },
  { id:"o7",  label:"Own a piece of Canadian Tire money",               type:"Other",        city:"",          diff:1 },
  { id:"o8",  label:"Argue about whether Canada Dry is actually good ginger ale", type:"Other", city:"",      diff:1 },
  { id:"o9",  label:"Call a beanie a 'toque' without thinking about it", type:"Other",       city:"",          diff:1 },
  { id:"o10", label:"Know when to use 'eh' correctly in a sentence",    type:"Other",        city:"",          diff:2 },
];

const RANKS = [
  [100, "Fully Canadian"], [80, "True North Strong"], [60, "Proudly Canuck"],
  [40, "Prairies Rookie"], [20, "Hoser in Training"], [1, "Just Getting Started"], [0, "Not Yet Started"],
];

/* ─── Storage ─── */
const ls = {
  get: () => { try { return JSON.parse(localStorage.getItem("cano5") || "{}"); } catch { return {}; } },
  set: (d) => { try { localStorage.setItem("cano5", JSON.stringify(d)); } catch {} },
};
function getRank(p) { for (const [t, l] of RANKS) if (p >= t) return l; return "Not Yet Started"; }

/* ─── Primitive UI components ─── */

function IconBtn({ onClick, active, activeColor = C.red, children, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: active ? activeColor : hov ? "rgba(255,255,255,0.07)" : "transparent",
        border: `1px solid ${active ? activeColor : "rgba(255,255,255,0.1)"}`,
        borderRadius: 6, width: 28, height: 28, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: active ? "#fff" : hov ? C.white : C.muted,
        transition: "all 0.15s", flexShrink: 0, padding: 0,
      }}>{children}</button>
  );
}

function Tag({ children, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: active ? C.red : hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? C.red : hov ? C.borderMid : C.border}`,
        borderRadius: 5, padding: "5px 14px",
        fontFamily: C.display, fontWeight: 600, fontSize: 13, letterSpacing: "0.06em",
        textTransform: "uppercase", cursor: "pointer",
        color: active ? "#fff" : hov ? C.white : C.muted,
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}>{children}</button>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: foc ? C.muted : C.faint, pointerEvents: "none" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width: "100%", padding: "9px 12px 9px 34px", background: C.elevated, border: `1px solid ${foc ? "rgba(229,57,53,0.5)" : C.border}`, borderRadius: 7, fontSize: 14, fontFamily: C.body, color: C.white, outline: "none", transition: "border-color 0.15s" }} />
    </div>
  );
}

function AppSelect({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: "9px 12px", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, fontFamily: C.body, color: C.muted, cursor: "pointer", outline: "none" }}>
      {children}
    </select>
  );
}

/* ─── Maple leaf meter ─── */
function LeafMeter({ pct }) {
  const p = Math.min(100, Math.max(0, pct));
  const fillH = (p / 100) * 124;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <div style={{ position: "relative" }}>
        {p > 0 && <div style={{ position: "absolute", inset: -20, background: `radial-gradient(ellipse, rgba(229,57,53,${p / 500 + 0.04}) 0%, transparent 70%)`, pointerEvents: "none", borderRadius: "50%" }} />}
        <svg width="120" height="155" viewBox="0 0 110 145">
          <clipPath id="lc5"><path d="M55 5 L65 28 L90 22 L76 42 L96 54 L74 58 L80 82 L55 71 L30 82 L36 58 L14 54 L34 42 L20 22 L45 28 Z"/></clipPath>
          <path d="M55 5 L65 28 L90 22 L76 42 L96 54 L74 58 L80 82 L55 71 L30 82 L36 58 L14 54 L34 42 L20 22 L45 28 Z" fill="#1a1a1a" stroke={C.faint} strokeWidth="1"/>
          <rect x="0" y={130 - fillH} width="110" height={fillH} fill={C.red} clipPath="url(#lc5)" style={{ transition: "y 0.8s cubic-bezier(.4,0,.2,1), height 0.8s cubic-bezier(.4,0,.2,1)" }}/>
          <path d="M55 5 L65 28 L90 22 L76 42 L96 54 L74 58 L80 82 L55 71 L30 82 L36 58 L14 54 L34 42 L20 22 L45 28 Z" fill="none" stroke={p > 0 ? C.red : C.faint} strokeWidth="1.5" style={{ transition: "stroke 0.4s" }}/>
          <rect x="52" y="82" width="6" height="22" rx="2.5" fill={p > 0 ? C.red : C.faint} style={{ transition: "fill 0.4s" }}/>
          <text x="55" y="51" textAnchor="middle" fontFamily={C.display} fontSize="21" fontWeight="700" letterSpacing="0.5" fill={p > 32 ? "#fff" : C.faint} style={{ transition: "fill 0.4s" }}>{Math.round(p)}%</text>
        </svg>
      </div>
      <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: p > 0 ? C.red : C.faint, textAlign: "center", transition: "color 0.4s" }}>
        {getRank(p)}
      </div>
    </div>
  );
}

/* ─── Modal wrapper ─── */
function Modal({ open, onClose, children, width = 440 }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14, padding: "2rem", maxWidth: width, width: "92%", position: "relative", boxShadow: "0 40px 80px rgba(0,0,0,0.7)", animation: "slideDown 0.22s ease", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} onMouseEnter={e => e.currentTarget.style.color = C.white} onMouseLeave={e => e.currentTarget.style.color = C.faint}
          style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: C.faint, fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 2 }}>&#x2715;</button>
        {children}
      </div>
    </div>
  );
}

/* ─── Auth field ─── */
function AuthField({ label, type = "text", value, onChange, onEnter, placeholder }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: C.display, fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onKeyDown={e => e.key === "Enter" && onEnter?.()} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width: "100%", padding: "10px 12px", background: C.card, border: `1px solid ${foc ? "rgba(229,57,53,0.6)" : C.border}`, borderRadius: 7, fontSize: 15, fontFamily: C.body, color: C.white, outline: "none", transition: "border-color 0.15s" }} />
    </div>
  );
}

/* ─── Item row ─── */
function ItemRow({ item, isDone, uv, vc, onToggle, onVote, idx }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onToggle}
      style={{ display: "flex", alignItems: "center", gap: 12, background: isDone ? "rgba(229,57,53,0.04)" : hov ? C.hover : C.card, border: `1px solid ${isDone ? "rgba(229,57,53,0.18)" : hov ? C.borderMid : C.border}`, borderRadius: 9, padding: "11px 14px", cursor: "pointer", transition: "background 0.15s, border-color 0.15s", animation: "fadeUp 0.3s ease both", animationDelay: `${Math.min(idx * 0.012, 0.4)}s` }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${isDone ? C.red : C.faint}`, background: isDone ? C.red : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        {isDone && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6.5l3 2.5 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{ color: isDone ? C.faint : C.muted, flexShrink: 0, transition: "color 0.15s" }}>{CAT_ICONS[item.type]}</span>
      <span style={{ flex: 1, fontSize: 14, fontFamily: C.body, fontWeight: 400, lineHeight: 1.45, color: isDone ? C.faint : C.white, textDecoration: isDone ? "line-through" : "none", textDecorationColor: C.faint, transition: "color 0.15s" }}>{item.label}</span>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {item.city && <span style={{ fontFamily: C.display, fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.faint, whiteSpace: "nowrap" }}>{item.city}</span>}
        <span style={{ display: "flex", gap: 3 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i <= item.diff ? C.red : C.faint, display: "inline-block" }} />)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <IconBtn active={uv === 1} onClick={() => onVote(1)} title="Upvote"><svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor"><path d="M4.5 1 L8 7 H1 Z"/></svg></IconBtn>
          <span style={{ fontFamily: C.display, fontWeight: 700, fontSize: 13, minWidth: 22, textAlign: "center", color: vc > 0 ? C.red : C.faint }}>{vc}</span>
          <IconBtn active={uv === -1} activeColor="#444" onClick={() => onVote(-1)} title="Downvote"><svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor"><path d="M4.5 8 L1 2 H8 Z"/></svg></IconBtn>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ msg }) {
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: C.elevated, border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: "10px 20px", fontFamily: C.display, fontWeight: 600, fontSize: 14, letterSpacing: "0.04em", color: C.white, zIndex: 2000, boxShadow: "0 8px 40px rgba(0,0,0,0.6)", whiteSpace: "nowrap", animation: "fadeUp 0.2s ease" }}>{msg}</div>
  );
}

/* ─── Suggest Modal ─── */
function SuggestModal({ open, onClose, currentUser, onSubmit }) {
  const [label, setLabel]     = useState("");
  const [type, setType]       = useState("Food & Drink");
  const [city, setCity]       = useState("");
  const [diff, setDiff]       = useState(2);
  const [note, setNote]       = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reset = () => { setLabel(""); setType("Food & Drink"); setCity(""); setDiff(2); setNote(""); setSubmitted(false); };

  const handleSubmit = () => {
    if (!label.trim()) return;
    onSubmit({ label: label.trim(), type, city, diff: Number(diff), note: note.trim(), submittedBy: currentUser || "anonymous", submittedAt: new Date().toISOString() });
    setSubmitted(true);
  };

  const handleClose = () => { reset(); onClose(); };

  const fieldStyle = { width: "100%", padding: "9px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 14, fontFamily: C.body, color: C.white, outline: "none" };
  const labelStyle = { fontFamily: C.display, fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 6 };

  return (
    <Modal open={open} onClose={handleClose} width={500}>
      <div style={{ fontFamily: C.display, fontWeight: 800, fontSize: 28, letterSpacing: "0.03em", color: C.white, marginBottom: 4 }}>
        Suggest an Entry
      </div>
      <div style={{ fontFamily: C.body, fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.5 }}>
        Think something's missing? Submit it for moderator review. If approved, it'll appear on the list for everyone.
      </div>

      {submitted ? (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto", display: "block" }}>
              <circle cx="24" cy="24" r="23" stroke={C.red} strokeWidth="2"/>
              <path d="M14 24l7 7 13-13" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 22, color: C.white, marginBottom: 8 }}>Suggestion submitted!</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
            Thanks for contributing. A moderator will review your suggestion before it goes live.
          </div>
          <button onClick={() => { reset(); }} onMouseEnter={e => e.currentTarget.style.borderColor = C.red} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            style={{ padding: "9px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.white, fontFamily: C.body, fontSize: 14, cursor: "pointer", transition: "border-color 0.15s", marginRight: 10 }}>
            Submit another
          </button>
          <button onClick={handleClose} onMouseEnter={e => e.currentTarget.style.background = C.redHov} onMouseLeave={e => e.currentTarget.style.background = C.red}
            style={{ padding: "9px 24px", background: C.red, border: "none", borderRadius: 7, color: "#fff", fontFamily: C.body, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "background 0.15s" }}>
            Close
          </button>
        </div>
      ) : (
        <>
          {/* Label */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Experience *</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Watch a curling match on TV" onFocus={e => e.target.style.borderColor = "rgba(229,57,53,0.5)"} onBlur={e => e.target.style.borderColor = C.border} style={{ ...fieldStyle, transition: "border-color 0.15s" }} />
          </div>

          {/* Type + City row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category *</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>City <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <select value={city} onChange={e => setCity(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                <option value="">Nationwide</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Difficulty — {["","Easy","Moderate","Challenging","Hard","Legendary"][diff]} ({diff}/5)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="range" min="1" max="5" value={diff} onChange={e => setDiff(e.target.value)}
                style={{ flex: 1, accentColor: C.red, cursor: "pointer" }} />
              <span style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= diff ? C.red : C.faint, display: "inline-block", transition: "background 0.15s" }} />)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Notes for moderators <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Why is this a quintessentially Canadian experience? Any context that might help..." onFocus={e => e.target.style.borderColor = "rgba(229,57,53,0.5)"} onBlur={e => e.target.style.borderColor = C.border}
              style={{ ...fieldStyle, transition: "border-color 0.15s" }} />
          </div>

          <button onClick={handleSubmit} disabled={!label.trim()}
            onMouseEnter={e => { if (label.trim()) e.currentTarget.style.background = C.redHov; }}
            onMouseLeave={e => { if (label.trim()) e.currentTarget.style.background = C.red; }}
            style={{ width: "100%", padding: "11px 0", background: label.trim() ? C.red : C.faint, border: "none", borderRadius: 8, color: "#fff", fontFamily: C.display, fontWeight: 700, fontSize: 20, letterSpacing: "0.05em", cursor: label.trim() ? "pointer" : "not-allowed", transition: "background 0.15s" }}>
            Submit for Review
          </button>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: C.faint, fontFamily: C.body }}>
            Suggestions are reviewed before appearing publicly. Thank you for contributing.
          </div>
        </>
      )}
    </Modal>
  );
}

/* ─── Moderator Panel Modal ─── */
function ModeratorModal({ open, onClose, showToast }) {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    if (open) {
      const s = ls.get();
      setPending(s.pendingSubmissions || []);
    }
  }, [open]);

  const approve = (idx) => {
    const s = ls.get();
    const subs = [...(s.pendingSubmissions || [])];
    subs[idx] = { ...subs[idx], status: "approved" };
    ls.set({ ...s, pendingSubmissions: subs });
    setPending(subs);
    showToast("Approved — would be added to the live list");
  };

  const reject = (idx) => {
    const s = ls.get();
    const subs = [...(s.pendingSubmissions || [])];
    subs[idx] = { ...subs[idx], status: "rejected" };
    ls.set({ ...s, pendingSubmissions: subs });
    setPending(subs);
    showToast("Suggestion rejected");
  };

  const active = pending.filter(p => !p.status);
  const reviewed = pending.filter(p => p.status);

  const rowStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "14px 16px", marginBottom: 10 };
  const metaStyle = { fontFamily: C.display, fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.faint };

  return (
    <Modal open={open} onClose={onClose} width={600}>
      <div style={{ fontFamily: C.display, fontWeight: 800, fontSize: 28, letterSpacing: "0.03em", color: C.white, marginBottom: 4 }}>Moderator Panel</div>
      <div style={{ fontFamily: C.body, fontSize: 13, color: C.muted, marginBottom: 24 }}>Review user-submitted suggestions before they go live.</div>

      {active.length === 0 && reviewed.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem 0", color: C.faint }}>
          <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No submissions yet</div>
          <p style={{ fontSize: 14 }}>Suggestions will appear here once users submit them.</p>
        </div>
      )}

      {active.length > 0 && (
        <>
          <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
            Pending Review ({active.length})
          </div>
          {pending.map((sub, idx) => sub.status ? null : (
            <div key={idx} style={rowStyle}>
              <div style={{ fontSize: 15, fontFamily: C.body, color: C.white, marginBottom: 8, fontWeight: 500 }}>{sub.label}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={metaStyle}>{sub.type}</span>
                {sub.city && <span style={metaStyle}>{sub.city}</span>}
                <span style={metaStyle}>Difficulty {sub.diff}/5</span>
                <span style={metaStyle}>by {sub.submittedBy}</span>
                <span style={metaStyle}>{new Date(sub.submittedAt).toLocaleDateString()}</span>
              </div>
              {sub.note && <div style={{ fontSize: 13, color: C.muted, fontFamily: C.body, marginBottom: 10, fontStyle: "italic" }}>"{sub.note}"</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => approve(idx)} onMouseEnter={e => e.currentTarget.style.background = "#1b5e20"} onMouseLeave={e => e.currentTarget.style.background = "#2e7d32"}
                  style={{ padding: "6px 16px", background: "#2e7d32", border: "none", borderRadius: 6, color: "#fff", fontFamily: C.body, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background 0.15s" }}>Approve</button>
                <button onClick={() => reject(idx)} onMouseEnter={e => e.currentTarget.style.borderColor = C.red} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  style={{ padding: "6px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontFamily: C.body, fontSize: 13, cursor: "pointer", transition: "border-color 0.15s" }}>Reject</button>
              </div>
            </div>
          ))}
        </>
      )}

      {reviewed.length > 0 && (
        <>
          <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: C.faint, marginTop: 20, marginBottom: 10 }}>
            Previously Reviewed ({reviewed.length})
          </div>
          {pending.map((sub, idx) => !sub.status ? null : (
            <div key={idx} style={{ ...rowStyle, opacity: 0.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 14, fontFamily: C.body, color: C.white }}>{sub.label}</div>
                <span style={{ fontFamily: C.display, fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: sub.status === "approved" ? "#66bb6a" : C.faint, marginLeft: 12, flexShrink: 0 }}>{sub.status}</span>
              </div>
              <div style={{ ...metaStyle, marginTop: 4 }}>{sub.type}{sub.city ? ` · ${sub.city}` : ""} · by {sub.submittedBy}</div>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [store, setStore] = useState(ls.get);
  const currentUser = store.currentUser || null;

  const [showAuth, setShowAuth]         = useState(false);
  const [authMode, setAuthMode]         = useState("login");
  const [showAccount, setShowAccount]   = useState(false);
  const [showSuggest, setShowSuggest]   = useState(false);
  const [showMod, setShowMod]           = useState(false);
  const [authUser, setAuthUser]         = useState("");
  const [authPass, setAuthPass]         = useState("");
  const [authErr, setAuthErr]           = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortBy, setSortBy]         = useState("votes");
  const [search, setSearch]         = useState("");

  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const showToast = useCallback((msg) => {
    clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const save = useCallback((s) => { setStore(s); ls.set(s); }, []);

  const ud = useMemo(() => {
    if (!currentUser) return { completed: {}, votes: {} };
    return store.users?.[currentUser] || { completed: {}, votes: {} };
  }, [store, currentUser]);

  const gv = store.globalVotes || {};

  const saveUd = useCallback((newUd) => {
    save({ ...store, users: { ...store.users, [currentUser]: newUd } });
  }, [store, currentUser, save]);

  /* Score */
  const { total, done, cnt, pct } = useMemo(() => {
    let total = 0, done = 0, cnt = 0;
    ITEMS.forEach(i => {
      total += i.diff;
      if (ud.completed?.[i.id]) { done += i.diff; cnt++; }
    });
    return { total, done, cnt, pct: total > 0 ? (done / total) * 100 : 0 };
  }, [ud]);

  /* Filtered list */
  const visible = useMemo(() => {
    let items = ITEMS.filter(i => {
      if (typeFilter && i.type !== typeFilter) return false;
      if (cityFilter && i.city !== cityFilter) return false;
      if (search && !i.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    return [...items].sort((a, b) => {
      if (sortBy === "votes")     return (gv[b.id] || 0) - (gv[a.id] || 0);
      if (sortBy === "diff-desc") return b.diff - a.diff;
      if (sortBy === "diff-asc")  return a.diff - b.diff;
      if (sortBy === "done")      return (ud.completed?.[b.id] ? 1 : 0) - (ud.completed?.[a.id] ? 1 : 0);
      if (sortBy === "todo")      return (ud.completed?.[a.id] ? 1 : 0) - (ud.completed?.[b.id] ? 1 : 0);
      return 0;
    });
  }, [typeFilter, cityFilter, sortBy, search, gv, ud]);

  /* Actions */
  const toggleDone = useCallback((id) => {
    if (!currentUser) { setShowAuth(true); showToast("Sign in to track your progress"); return; }
    saveUd({ ...ud, completed: { ...ud.completed, [id]: !ud.completed[id] } });
  }, [currentUser, ud, saveUd, showToast]);

  const vote = useCallback((id, dir) => {
    if (!currentUser) { setShowAuth(true); showToast("Sign in to vote"); return; }
    const uv = ud.votes?.[id] || 0;
    const newVote = uv === dir ? 0 : dir;
    const delta = newVote - uv;
    save({ ...store, globalVotes: { ...gv, [id]: (gv[id] || 0) + delta }, users: { ...store.users, [currentUser]: { ...ud, votes: { ...ud.votes, [id]: newVote } } } });
  }, [currentUser, ud, gv, store, save, showToast]);

  const openAuth = (mode = "login") => { setAuthMode(mode); setAuthErr(""); setAuthUser(""); setAuthPass(""); setShowAuth(true); };

  const doAuth = () => {
    if (!authUser.trim() || !authPass.trim()) { setAuthErr("Both fields are required."); return; }
    const users = store.users || {};
    if (authMode === "signup") {
      if (users[authUser]) { setAuthErr("Username already taken."); return; }
      save({ ...store, users: { ...users, [authUser]: { password: authPass, completed: {}, votes: {} } }, currentUser: authUser });
    } else {
      if (!users[authUser] || users[authUser].password !== authPass) { setAuthErr("Incorrect username or password."); return; }
      save({ ...store, currentUser: authUser });
    }
    setShowAuth(false);
    showToast(authMode === "signup" ? `Welcome, ${authUser}` : `Welcome back, ${authUser}`);
  };

  const logout = () => { save({ ...store, currentUser: null }); setShowAccount(false); showToast("Signed out"); };
  const resetProgress = () => { saveUd({ ...ud, completed: {} }); setShowAccount(false); showToast("Progress reset"); };

  const handleSuggestion = (sub) => {
    const s = ls.get();
    const subs = s.pendingSubmissions || [];
    ls.set({ ...s, pendingSubmissions: [...subs, sub] });
  };

  const catBreakdown = CATS.map(type => ({
    type, total: ITEMS.filter(i => i.type === type).length,
    done: ITEMS.filter(i => i.type === type && ud.completed?.[i.id]).length,
  }));

  // Check if there are pending submissions to show mod badge
  const pendingCount = (ls.get().pendingSubmissions || []).filter(s => !s.status).length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(15,15,15,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 1.5rem", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 1.5 L13.2 7 L19.5 5.5 L16 10 L20 12.5 L14 13.5 L15 18.5 L11 16 L7 18.5 L8 13.5 L2 12.5 L6 10 L2.5 5.5 L8.8 7 Z" fill={C.red}/>
              <rect x="10.2" y="18.5" width="1.6" height="3.5" rx="0.8" fill={C.red}/>
            </svg>
            <span style={{ fontFamily: C.display, fontWeight: 800, fontSize: 22, letterSpacing: "0.06em", color: C.white }}>CANADOMETER</span>
          </div>

          {/* Right nav */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Suggest button */}
            <button onClick={() => setShowSuggest(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 13px", color: C.muted, fontFamily: C.body, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Suggest
            </button>

            {currentUser ? (
              <button onClick={() => setShowAccount(true)}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.red}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", color: C.white, fontFamily: C.body, fontSize: 14, transition: "border-color 0.15s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                {currentUser}
              </button>
            ) : (
              <>
                <button onClick={() => openAuth("login")}
                  onMouseEnter={e => { e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.borderMid; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                  style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 16px", color: C.muted, fontFamily: C.body, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>Sign in</button>
                <button onClick={() => openAuth("signup")}
                  onMouseEnter={e => e.currentTarget.style.background = C.redHov}
                  onMouseLeave={e => e.currentTarget.style.background = C.red}
                  style={{ background: C.red, border: "none", borderRadius: 7, padding: "7px 16px", color: "#fff", fontFamily: C.body, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "background 0.15s" }}>Join</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>

        {/* ── HERO ── */}
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "2rem 2.5rem", marginBottom: "2rem", flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 320, height: 320, pointerEvents: "none", background: `radial-gradient(circle, ${C.redGlow} 0%, transparent 65%)` }}/>
          <LeafMeter pct={pct}/>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <div style={{ fontFamily: C.display, fontWeight: 600, fontSize: 11, letterSpacing: "0.18em", color: C.red, textTransform: "uppercase", marginBottom: 10 }}>Canadian Score</div>
            <div style={{ fontFamily: C.display, fontWeight: 800, fontSize: 48, lineHeight: 1, letterSpacing: "0.02em", marginBottom: 6, color: C.white }}>
              {currentUser ? `${done} / ${total}` : "– / –"}
              <span style={{ fontSize: 22, color: C.muted, fontWeight: 400, marginLeft: 8 }}>pts</span>
            </div>
            <p style={{ fontSize: 15, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
              {currentUser ? `${cnt} of ${ITEMS.length} experiences completed` : "Create an account and start tracking your Canadian bucket list."}
            </p>
            {currentUser ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {catBreakdown.map(({ type, total: t, done: d }) => (
                  <button key={type} onClick={() => setTypeFilter(typeFilter === type ? "" : type)}
                    onMouseEnter={e => { if (typeFilter !== type) e.currentTarget.style.borderColor = C.borderMid; }}
                    onMouseLeave={e => { if (typeFilter !== type) e.currentTarget.style.borderColor = C.border; }}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, background: typeFilter === type ? C.redFaint : "transparent", border: `1px solid ${typeFilter === type ? C.red : C.border}`, cursor: "pointer", transition: "all 0.15s", fontFamily: C.display, fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: d === t && t > 0 ? C.red : typeFilter === type ? C.red : C.muted }}>
                    <span style={{ color: "inherit", opacity: 0.8 }}>{CAT_ICONS[type]}</span>
                    {type} {d}/{t}
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => openAuth("signup")}
                onMouseEnter={e => e.currentTarget.style.background = C.redHov}
                onMouseLeave={e => e.currentTarget.style.background = C.red}
                style={{ background: C.red, border: "none", borderRadius: 8, padding: "11px 28px", color: "#fff", fontFamily: C.display, fontWeight: 700, fontSize: 18, letterSpacing: "0.06em", cursor: "pointer", transition: "background 0.15s" }}>
                Start Tracking
              </button>
            )}
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search experiences..." />
          <AppSelect value={cityFilter} onChange={setCityFilter}>
            <option value="">All cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </AppSelect>
          <AppSelect value={sortBy} onChange={setSortBy}>
            <option value="votes">Most popular</option>
            <option value="diff-desc">Hardest first</option>
            <option value="diff-asc">Easiest first</option>
            <option value="done">Completed first</option>
            <option value="todo">Incomplete first</option>
          </AppSelect>
          <span style={{ fontFamily: C.display, fontWeight: 600, fontSize: 12, letterSpacing: "0.08em", color: C.faint, whiteSpace: "nowrap" }}>{visible.length} items</span>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <Tag active={typeFilter === ""} onClick={() => setTypeFilter("")}>All</Tag>
          {CATS.map(type => (
            <Tag key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>{type}</Tag>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: "1.25rem" }} />

        {/* ── LIST ── */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: C.faint }}>
            <div style={{ fontFamily: C.display, fontWeight: 800, fontSize: 52, letterSpacing: "0.04em", marginBottom: 12, color: C.elevated }}>No results</div>
            <p style={{ fontSize: 15 }}>Try adjusting your filters, eh.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {visible.map((item, idx) => (
              <ItemRow key={item.id} item={item} idx={idx}
                isDone={!!ud.completed?.[item.id]}
                uv={ud.votes?.[item.id] || 0}
                vc={gv[item.id] || 0}
                onToggle={() => toggleDone(item.id)}
                onVote={dir => vote(item.id, dir)} />
            ))}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: "3.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <button onClick={() => setShowSuggest(true)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.white; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontFamily: C.body, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Missing something? Suggest an entry
          </button>

          {/* Moderator link — hidden in plain sight */}
          <button onClick={() => setShowMod(true)}
            style={{ background: "none", border: "none", color: C.faint, fontFamily: C.display, fontWeight: 600, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", opacity: 0.5, display: "flex", alignItems: "center", gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}>
            {ITEMS.length} Canadian Experiences &nbsp;&mdash;&nbsp; True North Strong and Free
            {pendingCount > 0 && <span style={{ background: C.red, color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontFamily: C.body, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{pendingCount}</span>}
          </button>
        </div>
      </main>

      {/* ── AUTH MODAL ── */}
      <Modal open={showAuth} onClose={() => setShowAuth(false)}>
        <div style={{ fontFamily: C.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.04em", color: C.white, marginBottom: 4 }}>
          {authMode === "login" ? "Sign In" : "Create Account"}
        </div>
        <div style={{ fontFamily: C.body, fontSize: 14, color: C.muted, marginBottom: 24 }}>
          {authMode === "login" ? "Welcome back, eh." : "Start your Canadian bucket list."}
        </div>
        {authErr && <div style={{ background: C.redFaint, border: `1px solid rgba(229,57,53,0.4)`, borderRadius: 7, padding: "9px 12px", marginBottom: 14, fontSize: 13, color: "#ff9e9a", fontFamily: C.body }}>{authErr}</div>}
        <AuthField label="Username" value={authUser} onChange={setAuthUser} placeholder="beaver42" onEnter={doAuth}/>
        <AuthField label="Password" type="password" value={authPass} onChange={setAuthPass} placeholder="••••••••" onEnter={doAuth}/>
        <button onClick={doAuth} onMouseEnter={e => e.currentTarget.style.background = C.redHov} onMouseLeave={e => e.currentTarget.style.background = C.red}
          style={{ width: "100%", padding: "11px 0", background: C.red, border: "none", borderRadius: 8, color: "#fff", fontFamily: C.display, fontWeight: 700, fontSize: 20, letterSpacing: "0.05em", cursor: "pointer", marginTop: 6, transition: "background 0.15s" }}>
          {authMode === "login" ? "Sign In" : "Create Account"}
        </button>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: C.muted, fontFamily: C.body }}>
          {authMode === "login" ? "No account? " : "Already have one? "}
          <span onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthErr(""); }} style={{ color: C.red, cursor: "pointer", fontWeight: 600 }}>
            {authMode === "login" ? "Sign up" : "Sign in"}
          </span>
        </div>
      </Modal>

      {/* ── ACCOUNT MODAL ── */}
      <Modal open={showAccount} onClose={() => setShowAccount(false)}>
        <div style={{ fontFamily: C.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.04em", color: C.white, marginBottom: 20 }}>My Account</div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontFamily: C.display, fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 22, letterSpacing: "0.03em" }}>{currentUser}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontFamily: C.display, fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>Progress</div>
          <div style={{ fontFamily: C.display, fontWeight: 800, fontSize: 36, color: C.red, letterSpacing: "0.02em", lineHeight: 1, marginBottom: 4 }}>{Math.round(pct)}%</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, fontFamily: C.body }}>{cnt} tasks completed &nbsp;&middot;&nbsp; {done} / {total} pts</div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: C.red, borderRadius: 2, transition: "width 0.7s ease" }}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={resetProgress}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.white; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontFamily: C.body, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>
            Reset progress
          </button>
          <button onClick={logout}
            onMouseEnter={e => e.currentTarget.style.background = C.redHov}
            onMouseLeave={e => e.currentTarget.style.background = C.red}
            style={{ flex: 1, padding: "10px 0", background: C.red, border: "none", borderRadius: 8, color: "#fff", fontFamily: C.body, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "background 0.15s" }}>
            Sign out
          </button>
        </div>
      </Modal>

      {/* ── SUGGEST MODAL ── */}
      <SuggestModal open={showSuggest} onClose={() => setShowSuggest(false)} currentUser={currentUser} onSubmit={handleSuggestion}/>

      {/* ── MODERATOR MODAL ── */}
      <ModeratorModal open={showMod} onClose={() => setShowMod(false)} showToast={showToast}/>

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast}/>}
    </div>
  );
}
