'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { general, movies, music, profiles } = require('./questions');

const now = () => Date.now(), TTL = 30 * 60 * 1000, OFFLINE = 12000;
const random = () => crypto.randomBytes(24).toString('hex');

function shuffled(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function error(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  throw e;
}

function isOnline(p) {
  return Boolean(p.lastSeen && now() - p.lastSeen < OFFLINE);
}

function tick(r) {
  const wasPaused = r.paused;
  const missing = r.players.length === 2 && r.players.some(p => !isOnline(p));
  if (missing) {
    if (!r.disconnectedAt) r.disconnectedAt = now();
    if (r.phase === 'question' && !r.paused) {
      const lastContact = Math.min(...r.players.map(p => p.lastSeen || now()));
      r.remaining = Math.min(30000, Math.max(0, r.deadline - Math.min(now(), lastContact + 1500)));
      r.paused = true;
    }
  } else if (r.players.length === 2) {
    r.disconnectedAt = null;
    if (r.phase === 'question' && r.paused) {
      r.deadline = now() + r.remaining;
      r.paused = false;
    }
  }
  if (r.phase === 'question' && !r.paused && now() >= r.deadline) {
    reveal(r);
  }
}

function shuffleQuestion(q) {
  let order = shuffled([0, 1, 2, 3]);
  return {
    prompt: q.prompt,
    options: order.map(i => q.options[i]),
    answer: order.indexOf(q.answer)
  };
}

function bank(category, era) {
  let raw = category === 'movie' ? movies : category === 'music' ? music : general;
  if (category === 'movie' || category === 'music') {
    raw = era === 'mixed' ? raw : raw.filter(q => q.era === era);
  }
  let seen = new Set();
  return shuffled(raw.filter(q => !seen.has(q.prompt) && seen.add(q.prompt)));
}

function makeQuestion(r) {
  if (r.category === 'friends' && r.index < 20) {
    const who = r.index % 2;
    const target = 1 - who;
    const n = Math.floor(r.index / 2);
    const pi = r.friendOrder[target][n];
    const p = profiles[pi];
    return {
      ...shuffleQuestion({
        prompt: `About ${r.players[target].name}: ${p.prompt}`,
        options: p.options,
        answer: r.players[target].profile[pi]
      }),
      active: who,
      profileIndex: pi
    };
  }
  const list = r.category === 'friends' ? general : bank(r.category, r.era);
  const available = list.filter(q => !r.used.includes(q.prompt));
  let q = available[0];
  if (!q) {
    const canonical = list.slice().sort((a, b) => a.prompt.localeCompare(b.prompt));
    outer: for (let i = 0; i < canonical.length; i++) {
      for (let j = i + 1; j < canonical.length; j++) {
        let a = canonical[i], b = canonical[j], prompt = `Double challenge: ${a.prompt} / ${b.prompt}`;
        if (r.used.includes(prompt)) continue;
        const aRight = a.options[a.answer], bRight = b.options[b.answer], aWrong = a.options[(a.answer + 1) % 4], bWrong = b.options[(b.answer + 1) % 4];
        q = {
          prompt,
          options: [`${aRight} / ${bRight}`, `${aRight} / ${bWrong}`, `${aWrong} / ${bRight}`, `${aWrong} / ${bWrong}`],
          answer: 0
        };
        break outer;
      }
    }
  }
  if (!q) error('This exceptionally long tiebreaker exhausted the question bank. Start a new game.');
  r.used.push(q.prompt);
  return { ...shuffleQuestion(q), active: null };
}

function startQuestion(r) {
  r.current = makeQuestion(r);
  r.answers = [null, null];
  r.phase = 'question';
  r.remaining = 30000;
  r.deadline = now() + 30000;
  r.paused = false;
  tick(r);
}

function reveal(r) {
  const active = r.current.active;
  const results = r.players.map((p, i) => {
    if (active !== null && i !== active) return null;
    const correct = r.answers[i] === r.current.answer;
    if (!correct) p.coins++;
    return { correct, choice: r.answers[i] };
  });
  r.last = { answer: r.current.answer, results };
  r.phase = 'reveal';
  r.deadline = null;
  r.paused = false;
}

function advance(r) {
  r.index++;
  const friendsPair = r.category === 'friends' && r.index <= 20 && r.index % 2 === 0;
  const standardRound = r.category !== 'friends' || r.index > 20;
  if (r.index >= 10 && (friendsPair || standardRound) && r.players[0].coins !== r.players[1].coins) {
    r.winner = r.players[0].coins < r.players[1].coins ? 0 : 1;
    r.phase = 'gameover';
    return;
  }
  startQuestion(r);
}

function view(r, me) {
  tick(r);
  const c = r.current, p = r.players[me];
  return {
    code: r.code,
    phase: r.phase,
    me,
    players: r.players.map(x => ({
      name: x.name,
      avatar: x.avatar,
      coins: x.coins,
      connected: !!isOnline(x),
      ready: !!x.ready,
      profileDone: Array.isArray(x.profile)
    })),
    category: r.category,
    era: r.era,
    confirmed: !!r.confirmed,
    profileQuestions: r.phase === 'profiles' ? profiles : undefined,
    ownProfile: r.phase === 'profiles' ? p.profile : undefined,
    index: r.index,
    paused: !!r.paused,
    remaining: r.phase === 'question' ? Math.max(0, r.paused ? r.remaining : r.deadline - now()) : null,
    question: r.phase === 'question' || r.phase === 'reveal' ? { prompt: c.prompt, options: c.options, active: c.active } : null,
    submitted: r.phase === 'question' ? r.answers[me] !== null : false,
    opponentSubmitted: r.phase === 'question' && c.active === null ? r.answers[1 - me] !== null : false,
    reveal: r.phase === 'reveal' ? r.last : null,
    winner: r.winner,
    location: r.location || null,
    locationStatus: r.locationStatus || null,
    tiebreak: r.index >= 10,
    disconnectedAt: r.disconnectedAt
  };
}

// Storage persistence: Firestore for Cloud Run / Production, local JSON file for testing / local dev
const useFirestore = process.env.USE_FIRESTORE === 'true' || (Boolean(process.env.K_SERVICE) && !process.env.DATA_DIR);

let getRoom, saveRoom, deleteRoom, generateCode;

if (useFirestore) {
  const { Firestore } = require('@google-cloud/firestore');
  const db = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || undefined
  });
  const collectionName = process.env.FIRESTORE_COLLECTION || 'rooms';
  const roomsCol = db.collection(collectionName);

  getRoom = async function(code) {
    if (!code) return null;
    const snap = await roomsCol.doc(code).get();
    if (!snap.exists) return null;
    return snap.data();
  };

  saveRoom = async function(room) {
    if (!room || !room.code) return;
    const data = JSON.parse(JSON.stringify(room));
    await roomsCol.doc(room.code).set(data);
  };

  deleteRoom = async function(code) {
    if (!code) return;
    await roomsCol.doc(code).delete();
  };

  generateCode = async function() {
    let c;
    do {
      c = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
    } while (await getRoom(c));
    return c;
  };
} else {
  const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'rooms.json');
  let rooms = {};
  try {
    rooms = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  let dirty = false;

  function saveFile() {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(rooms), { mode: 0o600 });
    fs.renameSync(tmp, file);
    dirty = false;
  }

  // On restart every connection must be re-established; do not reset an existing expiry.
  for (const r of Object.values(rooms)) {
    if (r.phase === 'question' && !r.paused) {
      r.remaining = Math.max(0, r.deadline - (r.updated || now()));
      r.paused = true;
    }
    if (!r.disconnectedAt) {
      const seen = Math.max(...r.players.map(p => p.lastSeen || 0));
      r.disconnectedAt = seen ? Math.min(now(), seen + OFFLINE) : now();
    }
    r.players.forEach(p => p.lastSeen = 0);
  }
  saveFile();

  getRoom = async function(code) {
    return rooms[code] || null;
  };

  saveRoom = async function(room) {
    rooms[room.code] = room;
    saveFile();
  };

  deleteRoom = async function(code) {
    delete rooms[code];
    saveFile();
  };

  generateCode = async function() {
    let c;
    do {
      c = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
    } while (rooms[c]);
    return c;
  };

  function clean() {
    for (const [c, r] of Object.entries(rooms)) {
      tick(r);
      if ((r.disconnectedAt && now() - r.disconnectedAt >= TTL) || (r.players.length === 1 && now() - (r.lastActivity || r.created) >= TTL)) {
        delete rooms[c];
        dirty = true;
      }
    }
    if (dirty) saveFile();
  }
  const timer = setInterval(clean, 1000);
  timer.unref();
}

async function act(b) {
  const action = b.action;
  let r, me;
  if (action === 'create') {
    const name = String(b.name || '').trim().slice(0, 20);
    if (!name) error('Enter a nickname.');
    const room = await generateCode();
    const secret = random();
    r = {
      code: room,
      phase: 'lobby',
      players: [{
        name,
        avatar: String(b.avatar || '🍹').slice(0, 8),
        token: secret,
        coins: 0,
        lastSeen: now(),
        ready: false
      }],
      created: now(),
      updated: now(),
      lastActivity: now(),
      index: 0,
      used: []
    };
    await saveRoom(r);
    return { token: secret, state: view(r, 0) };
  }

  const roomCode = String(b.room || '').toUpperCase();
  r = await getRoom(roomCode);
  if (!r) error('Room not found or expired.', 404);

  if (r.disconnectedAt && now() - r.disconnectedAt >= TTL) {
    await deleteRoom(r.code);
    error('Room not found or expired.', 404);
  }

  if (action === 'join') {
    if (r.phase !== 'lobby' || r.players.length >= 2) error('This room is full.');
    const name = String(b.name || '').trim().slice(0, 20);
    if (!name) error('Enter a nickname.');
    const secret = random();
    r.players.push({
      name,
      avatar: String(b.avatar || '🎮').slice(0, 8),
      token: secret,
      coins: 0,
      lastSeen: now(),
      ready: false
    });
    r.updated = now();
    r.lastActivity = now();
    await saveRoom(r);
    return { token: secret, state: view(r, 1) };
  }

  me = r.players.findIndex(p => p.token === b.token);
  if (me < 0) error('Invalid player session.', 403);
  r.players[me].lastSeen = now();
  r.updated = now();
  if (action !== 'state') r.lastActivity = now();
  const wasPaused = r.paused;
  tick(r);

  if (action === 'state') {
    if (useFirestore) {
      const stateChanged = (wasPaused !== r.paused) || (r.phase === 'reveal');
      const shouldThrottle = !stateChanged && r._lastSaved && (now() - r._lastSaved < 4000);
      if (!shouldThrottle) {
        r._lastSaved = now();
        await saveRoom(r);
      }
      return { state: view(r, me) };
    }
  } else if (action === 'select') {
    if (me !== 0 || r.phase !== 'lobby' || r.players.length !== 2) error('Only the host can select a category when both players have joined.');
    if (!['movie', 'music', 'friends', 'general'].includes(b.category)) error('Choose a category.');
    if (['movie', 'music'].includes(b.category) && !['mixed', 'classic', 'millennial', 'new'].includes(b.era)) error('Choose an era.');
    r.category = b.category;
    r.era = b.era || 'mixed';
    r.confirmed = false;
    r.players.forEach(p => p.ready = false);
  } else if (action === 'confirm') {
    if (me !== 1 || r.phase !== 'lobby' || !r.category) error('Waiting for the host to choose.');
    r.confirmed = !!b.confirm;
    r.players.forEach(p => p.ready = false);
  } else if (action === 'ready') {
    if (!r.confirmed || !['lobby', 'ready'].includes(r.phase)) error('Confirm the category first.');
    r.players[me].ready = true;
    if (r.players.every(p => p.ready)) {
      r.players.forEach(p => p.ready = false);
      r.index = 0;
      r.used = [];
      if (r.category === 'friends' && r.phase === 'lobby') {
        r.phase = 'profiles';
        r.players.forEach(p => p.profile = null);
      } else {
        startQuestion(r);
      }
    }
  } else if (action === 'profile') {
    if (r.phase !== 'profiles' || r.players[me].profile) error('Profile cannot be changed now.');
    if (!Array.isArray(b.answers) || b.answers.length !== 10 || b.answers.some(x => !Number.isInteger(x) || x < 0 || x > 3)) error('Answer all ten questions.');
    r.players[me].profile = b.answers;
    if (r.players.every(p => Array.isArray(p.profile))) {
      r.friendOrder = r.players.map(() => shuffled([...Array(10).keys()]));
      r.phase = 'ready';
      r.players.forEach(p => p.ready = false);
    }
  } else if (action === 'answer') {
    if (r.phase !== 'question' || r.paused) error('Question is not accepting answers.');
    if (r.current.active !== null && r.current.active !== me) error('It is the other player’s turn.');
    if (r.answers[me] !== null) error('Answer already submitted.');
    if (!Number.isInteger(b.answer) || b.answer < 0 || b.answer > 3) error('Invalid answer.');
    r.answers[me] = b.answer;
    if (r.current.active === me || (r.current.active === null && r.answers.every(a => a !== null))) {
      reveal(r);
    }
  } else if (action === 'next') {
    if (r.phase !== 'reveal' || me !== 0) error('Only the host can continue.');
    advance(r);
  } else if (action === 'location') {
    if (r.phase !== 'gameover' || me !== r.winner) error('Only the winner can suggest a location.');
    const loc = String(b.location || '').trim().slice(0, 120);
    if (!loc) error('Enter a location.');
    r.location = loc;
    r.locationStatus = 'proposed';
  } else if (action === 'locationReply') {
    if (r.phase !== 'gameover' || me === r.winner || r.locationStatus !== 'proposed') error('No location to respond to.');
    if (!['accepted', 'declined'].includes(b.reply)) error('Invalid response.');
    r.locationStatus = b.reply;
  } else if (action === 'restart') {
    if (r.phase !== 'gameover' || me !== 0) error('Only the host can start another game.');
    r.phase = 'lobby';
    r.category = null;
    r.confirmed = false;
    r.index = 0;
    r.used = [];
    r.winner = null;
    r.location = null;
    r.locationStatus = null;
    r.players.forEach(p => {
      p.coins = 0;
      p.ready = false;
      p.profile = null;
    });
  } else {
    error('Unknown action.');
  }

  if (useFirestore) r._lastSaved = now();
  await saveRoom(r);
  return { state: view(r, me) };
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('OK');
    return;
  }
  if (req.method === 'POST' && req.url === '/api') {
    let s = '';
    req.on('data', c => {
      s += c;
      if (s.length > 8192) req.destroy();
    });
    req.on('end', async () => {
      try {
        const out = await act(JSON.parse(s));
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(out));
      } catch (e) {
        res.writeHead(e.status || 400, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ error: e.status ? e.message : 'Invalid request.' }));
      }
    });
    return;
  }
  if (req.method === 'GET' && ['/', '/app.js', '/style.css'].includes(req.url)) {
    const f = req.url === '/' ? 'index.html' : req.url.slice(1);
    res.writeHead(200, {
      'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' :
                      f.endsWith('.js') ? 'text/javascript; charset=utf-8' :
                      'text/css; charset=utf-8'
    });
    fs.createReadStream(path.join(__dirname, 'public', f)).pipe(res);
    return;
  }
  res.writeHead(404);
  res.end();
});

if (require.main === module) {
  server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Losers Buy Drinks running'));
}
module.exports = { server };
