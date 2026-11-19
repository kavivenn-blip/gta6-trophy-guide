// Leonida Nights — GTA VI trophy tracker and guide.
// Plain static app: it fetches only its own data/trophies.json, keeps progress in
// localStorage, and never reaches for the network. No external fonts or images.
const EARNED_KEY = 'leonida-nights-earned-v1';
const SPOILER_KEY = 'leonida-nights-spoiler-v1';
const DEMO_EARNED = [2, 3, 4, 8, 16, 19, 20, 21, 28, 35, 42, 53];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
if (params.get('demo') === '1' && earned.size === 0) {
  earned = new Set(DEMO_EARNED);
  saveEarned();
}
let spoilerOn = params.get('spoiler') === 'on'
  ? true
  : params.get('spoiler') === 'off'
    ? false
    : localStorage.getItem(SPOILER_KEY) === '1';
let kindFilter = params.get('kind') ?? 'all';
let gradeFilter = 'all';
let searchText = params.get('q') ?? '';
let earnedOnly = false;
let view = params.get('view') === 'roadmap' ? 'roadmap' : 'tracker';
let selectedId = Number(params.get('trophy') ?? '0') || firstUnearnedStoryId();

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}
function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}
function byId(id) {
  return trophies.find((t) => t.id === id);
}
function isHiddenFromSpoilers(t) {
  return spoilerOn && t.hidden && !earned.has(t.id);
}
function displayName(t) {
  return isHiddenFromSpoilers(t) ? 'Hidden trophy' : t.name;
}
function displayDescription(t) {
  return isHiddenFromSpoilers(t)
    ? 'Hidden until earned — spoiler-safe mode is on.'
    : t.description;
}
function firstUnearnedStoryId() {
  const next = trophies.find((t) => t.kind === 'story' && !earned.has(t.id));
  return next ? next.id : 39;
}
function gradeLabel(t) {
  return t.grade;
}
function countLabel(t) {
  return t.count === null ? '' : `PSN 0/${t.count}`;
}

function nextUpList() {
  const open = trophies.filter((t) => !earned.has(t.id));
  const missableFirst = open.filter((t) => t.missable);
  const byStage = [...open].sort((a, b) => a.stage - b.stage || a.id - b.id);
  const picked = [];
  for (const t of missableFirst) if (!picked.includes(t)) picked.push(t);
  for (const t of byStage) if (picked.length < 3 && !picked.includes(t)) picked.push(t);
  return picked.slice(0, 3);
}

const stageMeta = {
  1: ['Chapters 1–2 — Open the map', 'Opening mission, first chapters, switching unlocks. Do the Chapter 1 meditation now.'],
  2: ['Chapters 3–4 — Mid-story', 'Story missions plus the robbery tools: Snap Gun, bank vaults, armored trucks.'],
  3: ['Finale — End the story', 'The final mission, then the 100% checklist appears. Save before it.'],
  4: ['Side strands — Strangers & friends', 'Stranger strands and side-story finales. Most stay open after the credits.'],
  5: ['Free-roam grind — 100%', 'Counts, collectibles and money. The long tail after the story.'],
};

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progressBig').textContent = `${done} / ${total}`;
  document.getElementById('progressPct').textContent = `${pct}% to platinum`;
  const ring = document.getElementById('ringFg');
  const circ = 2 * Math.PI * 30;
  ring.style.strokeDasharray = String(circ);
  ring.style.strokeDashoffset = String(circ * (1 - done / total));
  const byGrade = {};
  for (const t of trophies) if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  document.getElementById('progressGrades').textContent =
    `earned: platinum ${byGrade.platinum ?? 0}/1 · gold ${byGrade.gold ?? 0}/2 · silver ${byGrade.silver ?? 0}/6 · bronze ${byGrade.bronze ?? 0}/46`;
}

function renderNextUp() {
  const box = document.getElementById('nextUpCards');
  box.replaceChildren();
  for (const t of nextUpList()) {
    const card = document.createElement('div');
    card.className = 'next-card';
    const name = document.createElement('strong');
    name.textContent = displayName(t);
    const meta = document.createElement('span');
    meta.textContent = `${gradeLabel(t)} · stage ${t.stage} · ${countLabel(t) || 'no counter'}`;
    const why = document.createElement('span');
    why.className = 'why';
    why.textContent = t.missable
      ? 'Do this first — it is the only flagged missable trophy.'
      : t.kind === 'story'
        ? `Next story step — ${stageMeta[t.stage][0]}.`
        : `Nearest free-roam goal — ${stageMeta[t.stage][0]}.`;
    card.append(name, meta, why);
    card.addEventListener('click', () => selectTrophy(t.id));
    box.append(card);
  }
}

function visibleTrophies() {
  const q = searchText.trim().toLowerCase();
  return trophies.filter((t) => {
    if (earnedOnly && !earned.has(t.id)) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (kindFilter === 'story' && t.kind !== 'story') return false;
    if (kindFilter === 'missable' && !t.missable) return false;
    if (kindFilter === 'collectibles' && t.kind !== 'collectibles') return false;
    if (kindFilter === 'activities' && t.kind !== 'activities') return false;
    if (kindFilter === 'hidden' && !t.hidden) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = `badge ${cls}`;
  s.textContent = text;
  return s;
}

function renderList() {
  const rows = document.getElementById('rows');
  rows.replaceChildren();
  const shown = visibleTrophies();
  document.getElementById('shownCount').textContent =
    `${shown.length} shown · ${earned.size} earned of ${trophies.length}`;
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'row' + (t.id === selectedId ? ' selected' : '') + (earned.has(t.id) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned();
      renderAll();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const main = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'tname';
    name.textContent = displayName(t) + (earned.has(t.id) ? ' ✓' : '');
    const desc = document.createElement('div');
    desc.className = 'tdesc';
    desc.textContent = displayDescription(t);
    main.append(name, desc);
    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.append(badge(t.grade, `b-${t.grade}`));
    if (t.hidden) badges.append(badge('hidden', 'b-hidden'));
    if (t.missable) badges.append(badge('MISSABLE', 'b-missable'));
    if (t.count !== null) badges.append(badge(countLabel(t), 'b-count'));
    li.append(box, main, badges);
    li.addEventListener('click', () => selectTrophy(t.id));
    rows.append(li);
  }
}

function renderDetail() {
  const t = byId(selectedId) ?? trophies[0];
  const box = document.getElementById('detail');
  box.replaceChildren();
  const kicker = document.createElement('h2');
  kicker.textContent = 'Trophy guide';
  const name = document.createElement('h2');
  name.textContent = displayName(t);
  const desc = document.createElement('p');
  desc.className = 'ddesc';
  desc.textContent = `“${displayDescription(t)}”`;
  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(badge(t.grade, `b-${t.grade}`));
  badges.append(badge(t.kind, 'b-count'));
  if (t.hidden) badges.append(badge('hidden on PSN', 'b-hidden'));
  if (t.missable) badges.append(badge('MISSABLE — do in Chapter 1', 'b-missable'));
  if (t.count !== null) badges.append(badge(`PSN counter 0/${t.count}`, 'b-count'));
  box.append(kicker, name, desc, badges);
  if (t.count !== null) {
    const bar = document.createElement('div');
    bar.className = 'countbar';
    const fill = document.createElement('i');
    fill.style.width = '0%';
    bar.append(fill);
    const note = document.createElement('p');
    note.className = 'tdesc';
    note.textContent = `PSN tracks this one: 0 of ${t.count} so far. Tick the box when it pops.`;
    box.append(bar, note);
  }
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = isHiddenFromSpoilers(t)
    ? 'Spoiler-safe mode hides this guide until the trophy is earned. Turn the spoiler setting off, or tick it earned, to read it.'
    : t.guide;
  box.append(guide);
  if (!isHiddenFromSpoilers(t)) {
    const srcTitle = document.createElement('p');
    srcTitle.className = 'src';
    srcTitle.textContent = 'Sources for this guide:';
    const list = document.createElement('ul');
    list.className = 'src';
    for (const s of t.sources) {
      const li = document.createElement('li');
      li.textContent = s;
      list.append(li);
    }
    box.append(srcTitle, list);
  }
  const stage = document.createElement('p');
  stage.className = 'tdesc';
  stage.textContent = `Roadmap: ${stageMeta[t.stage][0]}.`;
  const mark = document.createElement('button');
  mark.type = 'button';
  mark.textContent = earned.has(t.id) ? '✓ Earned — unmark' : 'Mark as earned';
  mark.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    saveEarned();
    renderAll();
  });
  box.append(stage, mark);
}

function renderRoadmap() {
  const box = document.getElementById('stageCards');
  box.replaceChildren();
  for (const stage of [1, 2, 3, 4, 5]) {
    const card = document.createElement('div');
    card.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage} — ${stageMeta[stage][0]}`;
    const p = document.createElement('p');
    p.textContent = stageMeta[stage][1];
    const ul = document.createElement('ul');
    for (const t of trophies.filter((x) => x.stage === stage)) {
      const li = document.createElement('li');
      if (earned.has(t.id)) li.className = 'done';
      li.textContent = displayName(t) + (t.missable ? ' — MISSABLE' : '') + (t.count !== null ? ` (0/${t.count})` : '');
      li.addEventListener('click', () => {
        view = 'tracker';
        selectTrophy(t.id);
      });
      ul.append(li);
    }
    card.append(h, p, ul);
    box.append(card);
  }
}

function renderTabs() {
  document.getElementById('tabTracker').classList.toggle('active', view === 'tracker');
  document.getElementById('tabRoadmap').classList.toggle('active', view === 'roadmap');
  document.body.classList.toggle('roadmap-view', view === 'roadmap');
  document.getElementById('viewTracker').hidden = view !== 'tracker';
  document.getElementById('viewRoadmap').hidden = view !== 'roadmap';
}

function renderAll() {
  renderProgress();
  renderNextUp();
  renderList();
  renderDetail();
  renderRoadmap();
  renderTabs();
}

function selectTrophy(id) {
  selectedId = id;
  view = 'tracker';
  renderAll();
  document.getElementById('detail').scrollIntoView({ block: 'nearest' });
}

document.getElementById('tabTracker').addEventListener('click', () => { view = 'tracker'; renderTabs(); });
document.getElementById('tabRoadmap').addEventListener('click', () => { view = 'roadmap'; renderTabs(); });
document.getElementById('search').addEventListener('input', (e) => {
  searchText = e.target.value;
  renderList();
});
document.getElementById('grade').addEventListener('change', (e) => {
  gradeFilter = e.target.value;
  renderList();
});
document.getElementById('kindChips').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-kind]');
  if (!btn) return;
  kindFilter = btn.dataset.kind;
  for (const c of document.querySelectorAll('#kindChips .chip')) c.classList.toggle('active', c === btn);
  renderList();
});
document.getElementById('spoiler').addEventListener('change', (e) => {
  spoilerOn = e.target.checked;
  saveSpoiler();
  renderAll();
});
document.getElementById('earnedOnly').addEventListener('change', (e) => {
  earnedOnly = e.target.checked;
  renderList();
});
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned])], { type: 'application/json' }));
  a.download = 'leonida-nights-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  earned = new Set(JSON.parse(await file.text()));
  saveEarned();
  renderAll();
});

// Apply the initial filter state from the URL, then render.
if (kindFilter !== 'all') {
  for (const c of document.querySelectorAll('#kindChips .chip')) {
    c.classList.toggle('active', c.dataset.kind === kindFilter);
  }
}
if (searchText) document.getElementById('search').value = searchText;
document.getElementById('spoiler').checked = spoilerOn;
renderAll();
