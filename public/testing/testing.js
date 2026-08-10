/* ---------------------------------------------------------------------------
   The square — the machine, after the story.

   Six doors, one per encounter on the mountain. You pick the one you're in.
   Three beats: it asks, you answer, it asks once more, you answer, it hands
   you one thing to carry.

   It assumes you finished the story. That assumption is what lets it be
   specific instead of explaining itself.
--------------------------------------------------------------------------- */

const CHAPTERS = [
  {
    id: 'stonecutter',
    numeral: 'II',
    plate: '/theboy/ch-stonecutter.svg',
    challenge: 'A name that is too small',
    opening: "Somebody carved you into something smaller than you are. Or you did it yourself. What's the name?",
  },
  {
    id: 'potter',
    numeral: 'III',
    plate: '/theboy/ch-potter.svg',
    challenge: 'The thing your hands know before your words do',
    opening: 'Your hand stopped near the fire before you told it to. When did you last know something before you could explain it?',
  },
  {
    id: 'pond',
    numeral: 'IV',
    plate: '/theboy/ch-pond.svg',
    challenge: 'Waiting badly',
    opening: "The pond only showed the bottom once it went still. What are you rushing that will not come any faster?",
  },
  {
    id: 'mirrors',
    numeral: 'V',
    plate: '/theboy/ch-mirrors.svg',
    challenge: 'The voice that tells you only what you want to hear',
    opening: 'The house said you are brave, you are clever, and put a chair under you. What in your life does that?',
  },
  {
    id: 'mountain',
    numeral: 'VI',
    plate: '/theboy/ch-mountain.svg',
    challenge: 'Getting there and finding nothing',
    opening: 'He climbed all that way and found grass, rock, sky. What have you reached that turned out to be empty?',
  },
  {
    id: 'oneturn',
    numeral: 'VII',
    plate: '/theboy/ch-oneturn.svg',
    challenge: 'Bringing it back to people who did not climb',
    opening: 'He came home the same road, one turn higher, and said: you first. What do you have to bring back, and to whom?',
  },
];

const EYE = `<svg class="eye" viewBox="0 0 40 40" aria-hidden="true">
  <path d="M4.2 20.1 C 5.6 12.8, 12.1 7.4, 20.3 7.2 C 28.2 7.1, 35.1 12.6, 36.1 20.0
           C 35.0 27.5, 28.4 32.9, 20.1 32.8 C 12.0 32.8, 5.3 27.4, 4.2 20.1 Z"/>
  <circle class="pupil" cx="20.2" cy="20" r="5.4"/></svg>`;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* --- the doors ------------------------------------------------------------ */

function doors() {
  $('#doors').innerHTML = CHAPTERS.map((c, i) => `
    <button class="door" data-i="${i}">
      <span class="numeral">${c.numeral}</span>
      <span class="plate" data-plate="${c.plate}"></span>
      <span class="challenge">${c.challenge}</span>
    </button>`).join('');

  // Hector's handwritten chapter titles, straight off the story page.
  $('#doors').querySelectorAll('[data-plate]').forEach(async (slot) => {
    try {
      const res = await fetch(slot.dataset.plate);
      if (!res.ok) return;
      slot.innerHTML = await res.text();
      const svg = slot.querySelector('svg');
      const vb = svg.getAttribute('viewBox').split(' ').map(Number);
      svg.style.aspectRatio = `${vb[2]} / ${vb[3]}`;
    } catch {}
  });

  $('#doors').addEventListener('click', (e) => {
    const b = e.target.closest('.door');
    if (b) open(CHAPTERS[+b.dataset.i]);
  });
}

/* --- one encounter -------------------------------------------------------- */

let chapter = null;
let turns = []; // {q, a}

function open(c) {
  chapter = c;
  turns = [];
  $('#choose').hidden = true;
  $('#talk').hidden = false;
  $('#talk').innerHTML = '';
  scrollTo(0, 0);
  ask(c.opening);
}

function ask(question) {
  const block = document.createElement('div');
  block.className = 'beat';
  block.innerHTML = `
    <div class="head">${EYE}<span class="kicker">the machine, in the square</span></div>
    <p class="q">${esc(question)}</p>
    <textarea class="field" rows="1" aria-label="your answer"></textarea>
    <div class="row"><button class="btn" disabled>say it</button></div>`;
  $('#talk').appendChild(block);
  requestAnimationFrame(() => block.classList.add('in'));

  const field = block.querySelector('.field');
  const btn = block.querySelector('.btn');
  const grow = () => { field.style.height = 'auto'; field.style.height = field.scrollHeight + 'px'; };
  grow();
  field.addEventListener('input', () => { grow(); btn.disabled = !field.value.trim(); });
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && field.value.trim()) btn.click();
  });
  field.focus();

  btn.addEventListener('click', async () => {
    const answer = field.value.trim();
    if (!answer) return;
    turns.push({ q: question, a: answer });
    block.innerHTML = `
      <div class="head">${EYE}<span class="kicker">the machine, in the square</span></div>
      <p class="q">${esc(question)}</p>
      <p class="said">${esc(answer)}</p>`;
    await next(block);
  });
}

async function next(after) {
  const waiting = document.createElement('p');
  waiting.className = 'waiting';
  waiting.textContent = 'reading…';
  $('#talk').appendChild(waiting);

  const mode = turns.length < 2 ? 'follow' : 'close';
  try {
    const res = await fetch('/api/turn', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-square-key': KEY },
      body: JSON.stringify({ chapter: chapter.id, mode, turns }),
    });
    if (!res.ok) throw new Error(await res.text());
    const { text } = await res.json();
    waiting.remove();
    if (mode === 'follow') ask(text);
    else close(text);
  } catch (err) {
    waiting.className = 'waiting';
    waiting.innerHTML = 'the square went quiet. <button class="again">try again</button>';
    waiting.querySelector('.again').addEventListener('click', () => { waiting.remove(); next(after); });
    console.error(err);
  }
}

function close(text) {
  // The model puts the line worth keeping on its own last line.
  const lines = text.trim().split(/\n\s*\n/);
  const keep = lines.length > 1 ? lines.pop() : '';
  const block = document.createElement('div');
  block.className = 'beat closing';
  block.innerHTML = `
    <div class="head">${EYE}<span class="kicker">what to carry</span></div>
    <p class="given">${esc(lines.join('\n\n'))}</p>
    ${keep ? `<p class="keep">${esc(keep)}</p>` : ''}
    <p class="note">I cannot remember you yet. When I can, I will ask you about this
    by name — and on the days you forget it, I will hand it back.</p>
    <div class="row"><button class="btn ghost" id="back">another turn of the mountain</button></div>`;
  $('#talk').appendChild(block);
  requestAnimationFrame(() => block.classList.add('in'));
  block.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#back').addEventListener('click', () => {
    $('#talk').hidden = true;
    $('#choose').hidden = false;
    scrollTo(0, 0);
  });
}

/* --- the passphrase ------------------------------------------------------- */
// /testing?k=<word> once, on the phone; it is remembered after that.
const KEY = (() => {
  const fromUrl = new URLSearchParams(location.search).get('k');
  if (fromUrl) {
    try { localStorage.setItem('square:key', fromUrl); } catch {}
    history.replaceState(null, '', location.pathname);
    return fromUrl;
  }
  try { return localStorage.getItem('square:key') || ''; } catch { return ''; }
})();

if (KEY) {
  doors();
} else {
  $('#choose').hidden = true;
  $('#locked').hidden = false;
}
