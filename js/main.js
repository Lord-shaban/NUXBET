// ============================================================
// NUXBET - Main Application Module
// Firebase Auth + Firestore + All App Logic
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyCP098hkWvZ9wErY9E8m8XVw2mav0cYyBM",
  authDomain: "nuxbet-1014c.firebaseapp.com",
  projectId: "nuxbet-1014c",
  storageBucket: "nuxbet-1014c.firebasestorage.app",
  messagingSenderId: "753459642708",
  appId: "1:753459642708:web:0440a58a2eced6173088c1",
  measurementId: "G-2P3J482RH6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === State ===
let currentUser = null;
let currentUserData = null;
let activePage = 'home';
let activeMD = 1; // can be number (group) or string (knockout key)
let activeKORound = 'R32';
let cdTimer = null;
let allUsers = {};
let firestoreResults = {};

// === Helpers ===
function flagImg(team, cls = 'flag-img') {
  return `<img src="${flagUrl(team.iso)}" class="${cls}" alt="${team.name}" loading="lazy">`;
}

function avatarHTML(url, cls = 'av-img') {
  if (url && url.length > 3) return `<img src="${url}" class="${cls}" alt="" loading="lazy">`;
  return `<span class="${cls} av-placeholder"></span>`;
}

// Returns actual kickoff Date for a match using date+time (Mecca UTC+3)
function matchKickoff(match) {
  return new Date(`${match.date}T${match.time}:00+03:00`);
}

// Check if match has started based on kickoff time
function isMatchStarted(match) {
  return Date.now() >= matchKickoff(match).getTime();
}

// ============================================================
// TOAST
// ============================================================
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  const ico = document.getElementById('toast-ico');
  document.getElementById('toast-msg').textContent = msg;
  ico.className = 'toast-icon toast-' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ============================================================
// AUTH
// ============================================================
function buildAvatarGrid() {
  const grid = document.getElementById('avatar-grid');
  if (!grid || grid.children.length) return;
  grid.innerHTML = AVATARS.map((url, i) =>
    `<button type="button" class="av-pick ${i === 0 ? 'selected' : ''}" data-av="${url}">
      <img src="${url}" alt="avatar ${i+1}" class="av-pick-img">
    </button>`
  ).join('');
  grid.querySelectorAll('.av-pick').forEach(b => {
    b.addEventListener('click', () => {
      grid.querySelectorAll('.av-pick').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
    });
  });
}

window.showAuthTab = function (tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  if (tab === 'register') buildAvatarGrid();
};

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const errEl = document.getElementById('reg-error');
  const btn = document.getElementById('reg-btn');
  const selAv = document.querySelector('.av-pick.selected');
  const avatar = selAv ? selAv.dataset.av : AVATARS[0];

  if (!name || !email || !pass) { errEl.textContent = 'برجاء ملء كل الحقول'; return; }
  if (pass.length < 6) { errEl.textContent = 'كلمة المرور لازم 6 أحرف على الأقل'; return; }

  btn.disabled = true; btn.textContent = 'جاري التسجيل...'; errEl.textContent = '';
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName: name, avatar, email, createdAt: serverTimestamp()
    });
    toast('تم التسجيل بنجاح! أهلاً بك');
  } catch (e) {
    let msg = 'حصل خطأ، حاول تاني';
    if (e.code === 'auth/email-already-in-use') msg = 'البريد ده مستخدم قبل كده';
    if (e.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة';
    if (e.code === 'auth/invalid-email') msg = 'البريد الإلكتروني غير صحيح';
    errEl.textContent = msg;
  }
  btn.disabled = false; btn.textContent = 'إنشاء حساب';
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  if (!email || !pass) { errEl.textContent = 'برجاء ملء كل الحقول'; return; }

  btn.disabled = true; btn.textContent = 'جاري الدخول...'; errEl.textContent = '';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    toast('أهلاً بيك!');
  } catch (e) {
    let msg = 'بيانات الدخول غلط';
    if (e.code === 'auth/user-not-found') msg = 'الحساب ده مش موجود';
    if (e.code === 'auth/wrong-password') msg = 'كلمة المرور غلط';
    if (e.code === 'auth/invalid-credential') msg = 'بيانات الدخول غلط';
    if (e.code === 'auth/too-many-requests') msg = 'محاولات كتير، استنى شوية';
    errEl.textContent = msg;
  }
  btn.disabled = false; btn.textContent = 'دخول';
}

async function handleLogout() {
  await signOut(auth);
  toast('تم تسجيل الخروج');
}

function onAuth(user) {
  currentUser = user;
  const overlay = document.getElementById('auth-overlay');
  const header = document.getElementById('app-header');
  const main = document.getElementById('app-main');
  const footer = document.getElementById('app-footer');

  if (user) {
    overlay.style.display = 'none';
    header.style.display = ''; main.style.display = ''; footer.style.display = '';
    document.getElementById('mobile-nav').style.display = '';
    loadUserData(user.uid);
    go('knockout');
  } else {
    overlay.style.display = 'flex';
    header.style.display = 'none'; main.style.display = 'none'; footer.style.display = 'none';
    document.getElementById('mobile-nav').style.display = 'none';
    currentUserData = null;
    buildAvatarGrid();
  }
}

async function loadUserData(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      currentUserData = snap.data();
      const avImg = document.getElementById('user-av-img');
      const avSpan = document.getElementById('user-av');
      if (currentUserData.avatar && currentUserData.avatar.length > 3) {
        avImg.src = currentUserData.avatar;
        avImg.style.display = '';
        avSpan.style.display = 'none';
      } else {
        avSpan.textContent = '';
        avSpan.style.display = '';
        avImg.style.display = 'none';
      }
      document.getElementById('user-name').textContent = currentUserData.displayName || 'لاعب';
    }
  } catch (e) { console.error('Error loading user:', e); }
  loadAllUsers();
}

async function loadAllUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    allUsers = {};
    snap.forEach(d => { allUsers[d.id] = d.data(); });
    const statEl = document.getElementById('stat-players');
    if (statEl) statEl.textContent = Object.keys(allUsers).length;
  } catch (e) { console.error('Error loading users:', e); }
}

// ============================================================
// NAVIGATION
// ============================================================
function go(page) {
  activePage = page;
  // Sync desktop nav
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  // Sync mobile nav
  document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  if (page === 'home') { startCountdown(); renderHomeMiniLeague(); }
  if (page === 'predictions') renderPredictions(activeMD);
  if (page === 'knockout') renderKnockout(activeKORound);
  if (page === 'league') renderLeague();
  if (page === 'cup') renderCup();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.go = go;

let profileUid = null;
function goProfile(uid) {
  profileUid = uid;
  activePage = 'profile';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-profile');
  if (el) el.classList.add('active');
  renderProfile(uid);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goProfile = goProfile;

// ============================================================
// HOME
// ============================================================
function renderGroups() {
  const el = document.getElementById('groups-grid');
  if (!el || el.innerHTML) return;
  el.innerHTML = Object.entries(GROUPS).map(([g, codes]) => `
    <div class="grp-card ani">
      <div class="grp-hdr">المجموعة ${g}</div>
      ${codes.map(c => {
        const t = TEAMS[c];
        return `<div class="grp-team">${flagImg(t, 'flag-sm')}<span class="name">${t.name}</span></div>`;
      }).join('')}
    </div>
  `).join('');
}

function startCountdown() {
  if (cdTimer) clearInterval(cdTimer);
  let target = null;
  // Check group stage deadlines
  for (const md of [1, 2, 3]) {
    const d = new Date(MATCHDAY_INFO[md].deadline);
    if (d > new Date()) { target = d; break; }
  }
  // If group stage done, check knockout deadlines
  if (!target) {
    for (const k of KNOCKOUT_ROUND_KEYS) {
      const info = MATCHDAY_INFO[k];
      if (info) {
        const d = new Date(info.deadline);
        if (d > new Date()) { target = d; break; }
      }
    }
  }
  if (!target) target = new Date('2026-07-19T21:00:00');
  function tick() {
    const diff = Math.max(0, target - new Date());
    document.getElementById('cd-d').textContent = String(Math.floor(diff / 864e5)).padStart(2, '0');
    document.getElementById('cd-h').textContent = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0');
    document.getElementById('cd-s').textContent = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
  }
  tick(); cdTimer = setInterval(tick, 1000);
}

// ============================================================
// RESULTS (Group + Knockout)
// ============================================================
async function loadResults() {
  try {
    // Group stage results
    for (const md of [1, 2, 3]) {
      const snap = await getDoc(doc(db, 'results', `md${md}`));
      if (snap.exists()) {
        firestoreResults[md] = snap.data().matches || {};
      }
    }
    // Knockout results
    for (const k of KNOCKOUT_ROUND_KEYS) {
      const snap = await getDoc(doc(db, 'results', `ko_${k}`));
      if (snap.exists()) {
        firestoreResults[k] = snap.data().matches || {};
      }
    }
  } catch (e) { console.error('Error loading results:', e); }
}

function getResult(matchId, md) {
  if (firestoreResults[md] && firestoreResults[md][matchId]) {
    return firestoreResults[md][matchId];
  }
  const matches = getMatchesForMD(md);
  const match = matches.find(m => m.id === matchId);
  return match ? match.result : null;
}

function getMatchResult(match, md) {
  return getResult(match.id, md) || match.result;
}

// ============================================================
// PREDICTIONS (Group Stage)
// ============================================================
function renderTabs() {
  const el = document.getElementById('md-tabs');
  if (!el) return;

  const mdKeys = [1, 2, 3];

  el.innerHTML = mdKeys.map(md => {
    const info = MATCHDAY_INFO[md];
    let locked = false;
    if (md > 1) {
      const prevMatches = MATCHES[md - 1] || [];
      const allPrevStarted = prevMatches.every(m => isMatchStarted(m));
      if (!allPrevStarted) locked = true;
    }
    const lockIcon = locked ? ' \u{1F512}' : '';
    return `<button class="md-tab ${+md === activeMD ? 'active' : ''} ${locked ? 'locked' : ''}" data-md="${md}" ${locked ? 'disabled' : ''}>${info.name}${lockIcon}</button>`;
  }).join('');
  el.querySelectorAll('.md-tab:not(.locked)').forEach(b => {
    b.addEventListener('click', () => { activeMD = +b.dataset.md; renderPredictions(activeMD); });
  });
}

let showOnlyAvailable = false;

async function renderPredictions(md) {
  renderTabs();
  document.querySelectorAll('.md-tab').forEach(b => b.classList.toggle('active', +b.dataset.md === md));

  const info = MATCHDAY_INFO[md];
  const matches = MATCHES[md] || [];
  const grid = document.getElementById('matches-grid');
  const loading = document.getElementById('pred-loading');
  loading.style.display = 'flex';

  // Sort matches by date + time chronologically
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}:00+03:00`);
    const dateB = new Date(`${b.date}T${b.time}:00+03:00`);
    return dateA - dateB;
  });

  if (info) {
    document.getElementById('md-range').textContent = info.dateRange;
    const upcomingCount = sortedMatches.filter(m => !isMatchStarted(m)).length;
    const startedCount = sortedMatches.length - upcomingCount;
    const dlEl = document.getElementById('md-deadline');
    if (upcomingCount === 0) {
      dlEl.textContent = 'بدأت كل المباريات';
      dlEl.classList.add('expired');
    } else {
      dlEl.textContent = `${upcomingCount} مباراة متاحة — ${startedCount} مقفلة`;
      dlEl.classList.remove('expired');
    }

    // Filter toggle button
    let filterWrap = document.getElementById('pred-filter-wrap');
    if (!filterWrap) {
      filterWrap = document.createElement('div');
      filterWrap.id = 'pred-filter-wrap';
      filterWrap.className = 'pred-filter-wrap';
      const strip = document.getElementById('md-strip');
      if (strip) strip.parentNode.insertBefore(filterWrap, strip.nextSibling);
    }
    const filterBtnText = showOnlyAvailable ? '\u{1F50D} عرض الكل' : `\u2705 المتاحة فقط (${upcomingCount})`;
    filterWrap.innerHTML = `
      <button class="pred-filter-btn ${showOnlyAvailable ? 'active' : ''}" id="pred-filter-btn">
        ${filterBtnText}
      </button>
      <span class="pred-filter-info">${startedCount > 0 ? '\u{1F512} ' + startedCount + ' مباراة مقفلة' : ''}</span>
    `;
    document.getElementById('pred-filter-btn').addEventListener('click', () => {
      showOnlyAvailable = !showOnlyAvailable;
      renderPredictions(md);
    });
  }

  let preds = {}, goldenMatch = null, savedRoundAnswer = '';
  if (currentUser) {
    try {
      const snap = await getDoc(doc(db, 'predictions', `${currentUser.uid}_md${md}`));
      if (snap.exists()) {
        const d = snap.data();
        preds = d.preds || {};
        goldenMatch = d.goldenMatch || null;
        savedRoundAnswer = d.roundAnswer || '';
      }
    } catch (e) { console.error('Error loading predictions:', e); }
  }

  // Load round question
  const rqCard = document.getElementById('round-question-card');
  const rqInput = document.getElementById('rq-answer');
  try {
    const rqSnap = await getDoc(doc(db, 'roundQuestions', `md${md}`));
    if (rqSnap.exists() && rqSnap.data().question) {
      const rqData = rqSnap.data();
      rqCard.style.display = 'block';
      document.getElementById('rq-text').textContent = rqData.question;
      rqInput.value = savedRoundAnswer;
      const existingResult = rqCard.querySelector('.rq-result');
      if (existingResult) existingResult.remove();
      if (currentUser && rqData.reviews && savedRoundAnswer) {
        const reviewed = rqData.reviews[currentUser.uid];
        if (reviewed === true) {
          const resultDiv = document.createElement('div');
          resultDiv.className = 'rq-result correct';
          resultDiv.textContent = 'إجابة صحيحة! +3 نقاط';
          rqCard.appendChild(resultDiv);
        } else if (reviewed === false) {
          const resultDiv = document.createElement('div');
          resultDiv.className = 'rq-result wrong';
          resultDiv.textContent = 'إجابة خاطئة';
          rqCard.appendChild(resultDiv);
        }
      }
    } else {
      rqCard.style.display = 'none';
    }
  } catch (e) { rqCard.style.display = 'none'; }

  loading.style.display = 'none';

  // Filter matches if needed
  const displayMatches = showOnlyAvailable ? sortedMatches.filter(m => !isMatchStarted(m)) : sortedMatches;

  if (displayMatches.length === 0) {
    grid.innerHTML = '<div class="empty-state">لا توجد مباريات متاحة للتوقع حالياً</div>';
  } else {
    grid.innerHTML = displayMatches.map(match => {
      const home = TEAMS[match.home], away = TEAMS[match.away];
      const result = getMatchResult(match, md);
      const started = isMatchStarted(match);
      const isLocked = started || result !== null;
      const st = result ? 'played' : getMatchStatus(match);
      const p = preds[match.id] || {};
      const isGolden = goldenMatch === match.id;
      const hasPred = p.h !== undefined && p.a !== undefined;

      let statusTxt = '';
      if (st === 'played') statusTxt = 'انتهت';
      else if (st === 'ended') statusTxt = 'بانتظار النتيجة';
      else if (st === 'live') statusTxt = 'مباشر';
      else if (isLocked) statusTxt = '\u{1F512} مقفلة';
      else statusTxt = match.time;

      let centerHTML = '';
      if (result) {
        centerHTML = `<div class="m-score"><span>${result.home}</span><span class="dash">-</span><span>${result.away}</span></div>`;
      } else {
        centerHTML = `<div class="m-time">${match.time}</div><div class="m-vs">VS</div>`;
      }

      // Build comparison section for played matches
      let comparisonHTML = '';
      if (result && hasPred) {
        let pts = calcPts(p, result);
        if (isGolden) pts *= 2;
        const level = calcPtsLevel(p, result);
        const levelLabels = { exact: 'توقع دقيق 🎯', diff: 'فرق أهداف صحيح', correct: 'اتجاه صحيح', wrong: 'خطأ ✗' };
        comparisonHTML = `
          <div class="m-comparison">
            <div class="m-comp-row">
              <div class="m-comp-item">
                <span class="m-comp-label">توقعك</span>
                <span class="m-comp-score pred-score">${p.h} - ${p.a}</span>
              </div>
              <div class="m-comp-vs-icon">⚡</div>
              <div class="m-comp-item">
                <span class="m-comp-label">النتيجة</span>
                <span class="m-comp-score actual-score">${result.home} - ${result.away}</span>
              </div>
            </div>
            <div class="m-pts-badge ${level}">
              <span class="m-pts-label">${levelLabels[level]}</span>
              ${pts > 0 ? `<span class="m-pts-val">+${pts}</span>` : ''}
              ${isGolden ? '<span class="m-pts-golden">★×2</span>' : ''}
            </div>
          </div>`;
      } else if (result && !hasPred) {
        comparisonHTML = `
          <div class="m-comparison">
            <div class="m-no-pred">لم تتوقع هذه المباراة</div>
          </div>`;
      }

      let predDisplay = '';
      if (isLocked && hasPred && !result) {
        predDisplay = `
          <div class="m-pred-saved-wrap">
            <span class="m-pred-saved-label">توقعك</span>
            <span class="m-pred-saved-score">${p.h} - ${p.a}</span>
          </div>`;
      }

      const goldenCls = isGolden ? 'golden-active' : '';
      const lockedCls = (isLocked && !result) ? 'm-locked' : '';
      const endedCls = (st === 'ended') ? 'm-ended' : '';
      const playedCls = result ? 'm-played' : '';
      const disabledAttr = isLocked ? 'disabled' : '';

      return `
        <div class="m-card ani ${goldenCls} ${lockedCls} ${endedCls} ${playedCls}" id="mcard-${match.id}">
          <div class="m-card-top">
            <span class="m-group-tag">المجموعة ${match.group}</span>
            <button class="golden-star ${isGolden ? 'active' : ''}" data-mid="${match.id}" ${disabledAttr} title="مباراة ذهبية">\u2605</button>
            <span class="m-date">${formatMatchDate(match.date)}</span>
            <span class="m-status ${st === 'ended' ? 'ended' : isLocked && !result ? 'locked' : st}">${statusTxt}</span>
          </div>
          <div class="m-card-body">
            ${isLocked && !result ? '<div class="m-locked-overlay"><span class="m-locked-icon">\u{1F512}</span><span class="m-locked-text">تم إغلاق التوقعات</span></div>' : ''}
            <div class="m-fixture">
              <div class="m-team">${flagImg(home)}<span class="name">${home.name}</span></div>
              <div class="m-center">${centerHTML}</div>
              <div class="m-team">${flagImg(away)}<span class="name">${away.name}</span></div>
            </div>
            ${isLocked ? '' : `<div class="m-pred">
              <label>توقعك:</label>
              <input type="number" class="pred-input" id="ph-${match.id}" min="0" max="20" placeholder="-"
                     value="${p.h !== undefined ? p.h : ''}">
              <span class="pred-dash">-</span>
              <input type="number" class="pred-input" id="pa-${match.id}" min="0" max="20" placeholder="-"
                     value="${p.a !== undefined ? p.a : ''}">
            </div>`}
            ${predDisplay}
            ${comparisonHTML}
            ${isGolden ? '<div class="golden-label">\u2605 مباراة ذهبية \u2014 النقاط \u00d72</div>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Golden star click handlers
  grid.querySelectorAll('.golden-star').forEach(btn => {
    btn.addEventListener('click', () => {
      const mid = btn.dataset.mid;
      const match = sortedMatches.find(m => m.id === mid);
      if (!match || isMatchStarted(match) || getMatchResult(match, md)) return;
      grid.querySelectorAll('.golden-star').forEach(s => s.classList.remove('active'));
      grid.querySelectorAll('.m-card').forEach(c => {
        c.classList.remove('golden-active');
        c.querySelector('.golden-label')?.remove();
      });
      btn.classList.add('active');
      const card = document.getElementById('mcard-' + mid);
      if (card) {
        card.classList.add('golden-active');
        const body = card.querySelector('.m-card-body');
        if (body && !body.querySelector('.golden-label')) {
          const lbl = document.createElement('div');
          lbl.className = 'golden-label';
          lbl.textContent = '\u2605 مباراة ذهبية \u2014 النقاط \u00d72';
          body.appendChild(lbl);
        }
      }
    });
  });

  // Show save button if any match is still available for prediction
  const anyUpcoming = sortedMatches.some(m => !isMatchStarted(m));
  const btn = document.getElementById('submit-btn');
  if (btn) {
    btn.style.display = anyUpcoming ? '' : 'none';
    btn.onclick = () => savePreds(md);
    btn.textContent = 'حفظ التوقعات';
    btn.className = 'submit-btn';
  }
}

function calcPts(pred, actual) {
  const ph = parseInt(pred.h), pa = parseInt(pred.a);
  if (isNaN(ph) || isNaN(pa)) return 0;
  if (ph === actual.home && pa === actual.away) return 5;
  if ((ph - pa) === (actual.home - actual.away)) return 3;
  const predSign = Math.sign(ph - pa), actSign = Math.sign(actual.home - actual.away);
  if (predSign === actSign) return 1;
  return 0;
}

function calcPtsLevel(pred, actual) {
  const ph = parseInt(pred.h), pa = parseInt(pred.a);
  if (isNaN(ph) || isNaN(pa)) return 'none';
  if (ph === actual.home && pa === actual.away) return 'exact';
  if ((ph - pa) === (actual.home - actual.away)) return 'diff';
  const predSign = Math.sign(ph - pa), actSign = Math.sign(actual.home - actual.away);
  if (predSign === actSign) return 'correct';
  return 'wrong';
}

async function savePreds(md) {
  if (!currentUser) return;
  const matches = MATCHES[md] || [];
  const now = new Date();

  let existingPreds = {};
  try {
    const snap = await getDoc(doc(db, 'predictions', `${currentUser.uid}_md${md}`));
    if (snap.exists()) existingPreds = snap.data().preds || {};
  } catch (e) {}

  const preds = { ...existingPreds };
  matches.forEach(m => {
    if (isMatchStarted(m)) return;
    const hEl = document.getElementById('ph-' + m.id);
    const aEl = document.getElementById('pa-' + m.id);
    if (hEl && aEl && hEl.value !== '' && aEl.value !== '') {
      preds[m.id] = { h: +hEl.value, a: +aEl.value };
    }
  });

  const goldenBtn = document.querySelector('.golden-star.active');
  const goldenMatch = goldenBtn ? goldenBtn.dataset.mid : null;

  if (Object.keys(preds).length === 0) { toast('لازم تتوقع مباراة واحدة على الأقل!', 'warn'); return; }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = 'جاري الحفظ...';

  const roundAnswer = document.getElementById('rq-answer')?.value?.trim() || null;

  try {
    await setDoc(doc(db, 'predictions', `${currentUser.uid}_md${md}`), {
      userId: currentUser.uid, matchday: md, preds, goldenMatch, roundAnswer, savedAt: serverTimestamp()
    });
    btn.textContent = 'تم الحفظ!'; btn.className = 'submit-btn saved';
    toast('تم حفظ توقعاتك بنجاح!');
    setTimeout(() => { btn.textContent = 'حفظ التوقعات'; btn.className = 'submit-btn'; btn.disabled = false; }, 2000);
  } catch (e) {
    console.error('Error saving predictions:', e);
    toast('حصل خطأ في الحفظ، حاول تاني', 'error');
    btn.disabled = false; btn.textContent = 'حفظ التوقعات';
  }
}

// ============================================================
// KNOCKOUT PAGE
// ============================================================
async function renderKnockout(roundKey) {
  activeKORound = roundKey;
  const tabsEl = document.getElementById('ko-round-tabs');
  const badgeEl = document.getElementById('ko-multiplier-badge');
  const grid = document.getElementById('ko-matches-grid');
  const loading = document.getElementById('ko-loading');
  loading.style.display = 'flex';

  // Render round tabs
  tabsEl.innerHTML = KNOCKOUT_ROUND_KEYS.map(k => {
    const r = KNOCKOUT_ROUNDS[k];
    const mult = KNOCKOUT_MULTIPLIERS[k];
    const isActive = k === roundKey;
    return `<button class="ko-round-tab ${isActive ? 'active' : ''}" data-round="${k}">
      <span class="ko-tab-icon">${r.icon}</span>
      <span>${r.name}</span>
      <span class="ko-tab-mult">×${mult}</span>
    </button>`;
  }).join('');

  tabsEl.querySelectorAll('.ko-round-tab').forEach(btn => {
    btn.addEventListener('click', () => renderKnockout(btn.dataset.round));
  });

  // Multiplier badge
  const mult = KNOCKOUT_MULTIPLIERS[roundKey];
  const roundInfo = KNOCKOUT_ROUNDS[roundKey];
  badgeEl.innerHTML = `
    <span class="ko-mult-icon">${roundInfo.icon}</span>
    <span class="ko-mult-text">${roundInfo.name} — مضاعف النقاط:</span>
    <span class="ko-mult-val">×${mult}</span>
  `;

  // Load existing predictions for this round
  let preds = {}, goldenMatch = null;
  if (currentUser) {
    try {
      const snap = await getDoc(doc(db, 'predictions', `${currentUser.uid}_ko_${roundKey}`));
      if (snap.exists()) {
        const d = snap.data();
        preds = d.preds || {};
        goldenMatch = d.goldenMatch || null;
      }
    } catch (e) { console.error('Error loading knockout predictions:', e); }
  }

  await loadResults();

  const matches = KNOCKOUT_MATCHES[roundKey] || [];
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}:00+03:00`);
    const dateB = new Date(`${b.date}T${b.time}:00+03:00`);
    return dateA - dateB;
  });

  loading.style.display = 'none';

  if (sortedMatches.length === 0) {
    grid.innerHTML = '<div class="empty-state">لا توجد مباريات في هذا الدور بعد</div>';
    return;
  }

  const roundCssClass = `ko-${roundKey.toLowerCase().replace("'", '')}`;

  grid.innerHTML = sortedMatches.map(match => {
    const homeTeam = match.home && TEAMS[match.home] ? TEAMS[match.home] : null;
    const awayTeam = match.away && TEAMS[match.away] ? TEAMS[match.away] : null;
    const result = getMatchResult(match, roundKey);
    const started = isMatchStarted(match);
    const isLocked = started || result !== null;
    const st = result ? 'played' : getMatchStatus(match);
    const p = preds[match.id] || {};
    const isGolden = goldenMatch === match.id;
    const hasPred = p.h !== undefined && p.a !== undefined;
    const isTBD = !homeTeam || !awayTeam;

    let statusTxt = '';
    if (st === 'played') statusTxt = 'انتهت';
    else if (st === 'ended') statusTxt = 'بانتظار النتيجة';
    else if (st === 'live') statusTxt = 'مباشر';
    else if (isLocked) statusTxt = '🔒 مقفلة';
    else statusTxt = match.time;

    let centerHTML = '';
    if (result) {
      centerHTML = `<div class="m-score"><span>${result.home}</span><span class="dash">-</span><span>${result.away}</span></div>`;
    } else {
      centerHTML = `<div class="m-time">${match.time}</div><div class="m-vs">VS</div>`;
    }

    // Comparison for played matches
    let comparisonHTML = '';
    if (result && hasPred) {
      let pts = calcPts(p, result);
      pts = Math.round(pts * mult);
      if (isGolden) pts *= 2;
      const level = calcPtsLevel(p, result);
      const levelLabels = { exact: 'توقع دقيق 🎯', diff: 'فرق أهداف صحيح', correct: 'اتجاه صحيح', wrong: 'خطأ ✗' };
      comparisonHTML = `
        <div class="m-comparison">
          <div class="m-comp-row">
            <div class="m-comp-item"><span class="m-comp-label">توقعك</span><span class="m-comp-score pred-score">${p.h} - ${p.a}</span></div>
            <div class="m-comp-vs-icon">⚡</div>
            <div class="m-comp-item"><span class="m-comp-label">النتيجة</span><span class="m-comp-score actual-score">${result.home} - ${result.away}</span></div>
          </div>
          <div class="m-pts-badge ${level}">
            <span class="m-pts-label">${levelLabels[level]}</span>
            ${pts > 0 ? `<span class="m-pts-val">+${pts}</span>` : ''}
            ${isGolden ? '<span class="m-pts-golden">★×2</span>' : ''}
            <span class="m-pts-golden" style="font-size:0.65rem">×${mult}</span>
          </div>
        </div>`;
    }

    let predDisplay = '';
    if (isLocked && hasPred && !result) {
      predDisplay = `<div class="m-pred-saved-wrap"><span class="m-pred-saved-label">توقعك</span><span class="m-pred-saved-score">${p.h} - ${p.a}</span></div>`;
    }

    const goldenCls = isGolden ? 'golden-active' : '';
    const lockedCls = (isLocked && !result) ? 'm-locked' : '';
    const playedCls = result ? 'm-played' : '';
    const disabledAttr = (isLocked || isTBD) ? 'disabled' : '';

    const homeName = homeTeam ? homeTeam.name : 'يُحدد لاحقاً';
    const awayName = awayTeam ? awayTeam.name : 'يُحدد لاحقاً';
    const homeFlag = homeTeam ? flagImg(homeTeam) : '<span class="m-tbd">?</span>';
    const awayFlag = awayTeam ? flagImg(awayTeam) : '<span class="m-tbd">?</span>';

    return `
      <div class="m-card ko-card ${roundCssClass} ani ${goldenCls} ${lockedCls} ${playedCls}" id="mcard-${match.id}">
        <span class="m-round-badge">${roundInfo.icon} ${roundInfo.name}</span>
        <div class="m-card-top">
          <span class="m-group-tag" style="background:rgba(150,60,255,0.08);color:var(--pl-violet)">${roundInfo.short}</span>
          <button class="golden-star ${isGolden ? 'active' : ''}" data-mid="${match.id}" ${disabledAttr} title="مباراة ذهبية">★</button>
          <span class="m-date">${formatMatchDate(match.date)}</span>
          <span class="m-status ${st}">${statusTxt}</span>
        </div>
        <div class="m-card-body">
          ${isLocked && !result ? '<div class="m-locked-overlay"><span class="m-locked-icon">🔒</span><span class="m-locked-text">تم إغلاق التوقعات</span></div>' : ''}
          <div class="m-fixture">
            <div class="m-team">${homeFlag}<span class="name">${homeName}</span></div>
            <div class="m-center">${isTBD ? '<div class="m-vs" style="opacity:0.4">VS</div>' : centerHTML}</div>
            <div class="m-team">${awayFlag}<span class="name">${awayName}</span></div>
          </div>
          ${(!isLocked && !isTBD) ? `<div class="m-pred">
            <label>توقعك:</label>
            <input type="number" class="pred-input" id="ph-${match.id}" min="0" max="20" placeholder="-" value="${p.h !== undefined ? p.h : ''}">
            <span class="pred-dash">-</span>
            <input type="number" class="pred-input" id="pa-${match.id}" min="0" max="20" placeholder="-" value="${p.a !== undefined ? p.a : ''}">
          </div>` : ''}
          ${predDisplay}
          ${comparisonHTML}
          ${isGolden ? '<div class="golden-label">★ مباراة ذهبية — النقاط ×2</div>' : ''}
          ${match.venue ? `<div class="m-venue">📍 ${match.venue}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Golden star handlers
  grid.querySelectorAll('.golden-star').forEach(btn => {
    btn.addEventListener('click', () => {
      const mid = btn.dataset.mid;
      const match = sortedMatches.find(m => m.id === mid);
      if (!match || isMatchStarted(match) || getMatchResult(match, roundKey)) return;
      if (!match.home || !match.away || !TEAMS[match.home] || !TEAMS[match.away]) return;
      grid.querySelectorAll('.golden-star').forEach(s => s.classList.remove('active'));
      grid.querySelectorAll('.m-card').forEach(c => {
        c.classList.remove('golden-active');
        c.querySelector('.golden-label')?.remove();
      });
      btn.classList.add('active');
      const card = document.getElementById('mcard-' + mid);
      if (card) {
        card.classList.add('golden-active');
        const body = card.querySelector('.m-card-body');
        if (body && !body.querySelector('.golden-label')) {
          const lbl = document.createElement('div');
          lbl.className = 'golden-label';
          lbl.textContent = '★ مباراة ذهبية — النقاط ×2';
          body.appendChild(lbl);
        }
      }
    });
  });

  // Add save button
  const anyUpcoming = sortedMatches.some(m => !isMatchStarted(m) && m.home && m.away && TEAMS[m.home] && TEAMS[m.away]);
  let submitWrap = grid.parentElement.querySelector('.ko-submit-wrap');
  if (!submitWrap) {
    submitWrap = document.createElement('div');
    submitWrap.className = 'ko-submit-wrap';
    grid.parentElement.insertBefore(submitWrap, grid.nextSibling);
  }
  if (anyUpcoming) {
    submitWrap.innerHTML = `<button class="ko-save-btn" id="ko-save-btn">حفظ توقعات ${roundInfo.name}</button>`;
    document.getElementById('ko-save-btn').addEventListener('click', () => saveKnockoutPreds(roundKey));
  } else {
    submitWrap.innerHTML = '';
  }

  // Render bracket
  renderBracket();
}

async function saveKnockoutPreds(roundKey) {
  if (!currentUser) return;
  const matches = KNOCKOUT_MATCHES[roundKey] || [];

  let existingPreds = {};
  try {
    const snap = await getDoc(doc(db, 'predictions', `${currentUser.uid}_ko_${roundKey}`));
    if (snap.exists()) existingPreds = snap.data().preds || {};
  } catch (e) {}

  const preds = { ...existingPreds };
  matches.forEach(m => {
    if (isMatchStarted(m)) return;
    if (!m.home || !m.away || !TEAMS[m.home] || !TEAMS[m.away]) return;
    const hEl = document.getElementById('ph-' + m.id);
    const aEl = document.getElementById('pa-' + m.id);
    if (hEl && aEl && hEl.value !== '' && aEl.value !== '') {
      preds[m.id] = { h: +hEl.value, a: +aEl.value };
    }
  });

  const goldenBtn = document.querySelector('#ko-matches-grid .golden-star.active');
  const goldenMatch = goldenBtn ? goldenBtn.dataset.mid : null;

  if (Object.keys(preds).length === 0) { toast('لازم تتوقع مباراة واحدة على الأقل!', 'warn'); return; }

  const btn = document.getElementById('ko-save-btn');
  btn.disabled = true; btn.textContent = 'جاري الحفظ...';

  try {
    await setDoc(doc(db, 'predictions', `${currentUser.uid}_ko_${roundKey}`), {
      userId: currentUser.uid, matchday: roundKey, preds, goldenMatch, savedAt: serverTimestamp()
    });
    btn.textContent = 'تم الحفظ!'; btn.className = 'ko-save-btn saved';
    toast('تم حفظ توقعاتك بنجاح!');
    setTimeout(() => { btn.textContent = `حفظ توقعات ${KNOCKOUT_ROUNDS[roundKey].name}`; btn.className = 'ko-save-btn'; btn.disabled = false; }, 2000);
  } catch (e) {
    console.error('Error saving knockout predictions:', e);
    toast('حصل خطأ في الحفظ، حاول تاني', 'error');
    btn.disabled = false; btn.textContent = `حفظ توقعات ${KNOCKOUT_ROUNDS[roundKey].name}`;
  }
}

function renderBracket() {
  const el = document.getElementById('ko-bracket');
  if (!el) return;

  let html = '';
  const roundsToShow = ['R32', 'R16', 'QF', 'SF', 'FINAL'];

  roundsToShow.forEach(rk => {
    const round = KNOCKOUT_ROUNDS[rk];
    const matches = KNOCKOUT_MATCHES[rk] || [];
    html += `<div class="ko-bracket-round"><div class="ko-bracket-round-title">${round.icon} ${round.name}</div>`;
    matches.forEach(m => {
      const homeTeam = m.home && TEAMS[m.home] ? TEAMS[m.home] : null;
      const awayTeam = m.away && TEAMS[m.away] ? TEAMS[m.away] : null;
      const result = getMatchResult(m, rk);
      const homeWin = result && result.home > result.away;
      const awayWin = result && result.away > result.home;

      html += `<div class="ko-bracket-match ${rk === activeKORound ? 'highlight' : ''}">`;
      if (homeTeam) {
        html += `<div class="ko-b-team ${homeWin ? 'winner' : ''}"><img src="${flagUrl(homeTeam.iso)}" class="flag-xs" alt=""><span>${homeTeam.name}</span>${result ? `<span class="ko-b-score">${result.home}</span>` : ''}</div>`;
      } else {
        html += `<div class="ko-b-team"><span class="ko-b-tbd">يُحدد لاحقاً</span></div>`;
      }
      if (awayTeam) {
        html += `<div class="ko-b-team ${awayWin ? 'winner' : ''}"><img src="${flagUrl(awayTeam.iso)}" class="flag-xs" alt=""><span>${awayTeam.name}</span>${result ? `<span class="ko-b-score">${result.away}</span>` : ''}</div>`;
      } else {
        html += `<div class="ko-b-team"><span class="ko-b-tbd">يُحدد لاحقاً</span></div>`;
      }
      html += '</div>';
    });
    html += '</div>';
  });

  el.innerHTML = html;
}

// ============================================================
// LEAGUE (Updated with detailed filtering)
// ============================================================
let leagueFilter = 'ko_total'; // default to knockout total
let leagueScoresCache = null;

async function renderLeague() {
  const loading = document.getElementById('league-loading');
  loading.style.display = 'flex';
  await loadAllUsers();
  await loadResults();

  const allPreds = {};
  const roundQuestions = {};
  try {
    const snap = await getDocs(collection(db, 'predictions'));
    snap.forEach(d => {
      const data = d.data();
      if (!allPreds[data.userId]) allPreds[data.userId] = {};
      allPreds[data.userId][data.matchday] = {
        preds: data.preds || {}, goldenMatch: data.goldenMatch,
        roundAnswer: data.roundAnswer || null
      };
    });
  } catch (e) { console.error(e); }

  try {
    for (const md of [1, 2, 3]) {
      const snap = await getDoc(doc(db, 'roundQuestions', `md${md}`));
      if (snap.exists()) roundQuestions[md] = snap.data();
    }
    for (const k of KNOCKOUT_ROUND_KEYS) {
      const snap = await getDoc(doc(db, 'roundQuestions', `ko_${k}`));
      if (snap.exists()) roundQuestions[k] = snap.data();
    }
  } catch (e) { console.error(e); }

  // Unique prediction tracking for bonus
  const matchWinnerPreds = {};
  ALL_MATCHDAY_KEYS.forEach(md => {
    matchWinnerPreds[md] = {};
    Object.entries(allPreds).forEach(([uid, userMDs]) => {
      const userPreds = userMDs[md];
      if (!userPreds) return;
      Object.entries(userPreds.preds).forEach(([matchId, pred]) => {
        if (!matchWinnerPreds[md][matchId]) matchWinnerPreds[md][matchId] = { home: [], away: [], draw: [] };
        const ph = parseInt(pred.h), pa = parseInt(pred.a);
        if (isNaN(ph) || isNaN(pa)) return;
        const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
        matchWinnerPreds[md][matchId][side].push(uid);
      });
    });
  });

  const scores = Object.entries(allUsers).map(([uid, user]) => {
    let totalPts = 0, groupPts = 0, koPts = 0;
    let exact = 0, diff = 0, correct = 0, predicted = 0, bonus = 0;
    const weeklyPts = {};

    ALL_MATCHDAY_KEYS.forEach(md => {
      const userPreds = allPreds[uid]?.[md];
      if (!userPreds) { weeklyPts[md] = 0; return; }
      let mdPts = 0, wrongCount = 0;
      const golden = userPreds.goldenMatch;
      const multiplier = getKnockoutMultiplier(md);
      let mdExact = 0, mdDiff = 0, mdCorrect = 0, mdPredicted = 0;

      Object.entries(userPreds.preds).forEach(([matchId, pred]) => {
        const result = getResult(matchId, md);
        if (!result) return;
        predicted++; mdPredicted++;
        let pts = calcPts(pred, result);
        const level = calcPtsLevel(pred, result);
        pts = Math.round(pts * multiplier);
        if (matchId === golden) pts *= 2;

        if (level === 'exact') { exact++; mdExact++; }
        else if (level === 'diff') { diff++; mdDiff++; }
        else if (level === 'correct') { correct++; mdCorrect++; }
        else wrongCount++;

        if (level === 'correct' || level === 'diff' || level === 'exact') {
          const ph = parseInt(pred.h), pa = parseInt(pred.a);
          const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
          const predsForSide = matchWinnerPreds[md]?.[matchId]?.[side] || [];
          if (predsForSide.length === 1 && predsForSide[0] === uid) {
            pts += 3; bonus += 3;
          }
        }

        mdPts += pts; totalPts += pts;
      });

      // 6-wrong penalty only for group stage
      if (typeof md === 'number' && wrongCount >= 6) { mdPts -= 2; totalPts -= 2; }

      // Round question bonus
      const rq = roundQuestions[md];
      if (rq && rq.reviews && rq.reviews[uid] === true) {
        mdPts += 3; totalPts += 3;
      }

      if (isKnockoutMD(md)) koPts += mdPts;
      else groupPts += mdPts;

      weeklyPts[md] = mdPts;
    });
    return { uid, name: user.displayName, avatar: user.avatar, points: totalPts, groupPts, koPts, exact, diff, correct, predicted, bonus, weeklyPts };
  });

  loading.style.display = 'none';
  leagueScoresCache = scores;
  renderLeaguePills(scores);
  renderLeagueTable(scores);
}

function renderLeaguePills(scores) {
  const pillsEl = document.getElementById('lg-pills');
  if (!pillsEl) return;

  // Build pills: Overall | Groups Total | Knockout Total | then each individual matchday
  const pills = [
    { key: 'overall', label: 'المجموع الكلي', icon: '🌍', ko: false },
    { key: 'group_total', label: 'المجموعات', icon: '⚽', ko: false },
    { key: 'ko_total', label: 'الإقصائيات', icon: '⚔️', ko: true },
  ];
  // Individual matchdays
  [1, 2, 3].forEach(md => {
    const info = MATCHDAY_INFO[md];
    pills.push({ key: `md_${md}`, label: info.name, icon: '', ko: false });
  });
  KNOCKOUT_ROUND_KEYS.forEach(k => {
    const info = MATCHDAY_INFO[k];
    const r = KNOCKOUT_ROUNDS[k];
    pills.push({ key: `md_${k}`, label: r.short || info.name, icon: r.icon, ko: true });
  });

  pillsEl.innerHTML = pills.map(p => {
    const active = leagueFilter === p.key ? 'active' : '';
    const koCls = p.ko ? 'ko-pill' : '';
    return `<button class="lg-pill ${active} ${koCls}" data-f="${p.key}">${p.icon ? `<span class="pill-icon">${p.icon}</span>` : ''}${p.label}</button>`;
  }).join('');

  pillsEl.querySelectorAll('.lg-pill').forEach(b => {
    b.onclick = () => {
      leagueFilter = b.dataset.f;
      pillsEl.querySelectorAll('.lg-pill').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderLeagueTable(scores, document.getElementById('lg-search')?.value || '');
    };
  });
}

function getLeaguePts(p) {
  if (leagueFilter === 'overall') return p.points;
  if (leagueFilter === 'group_total') return p.groupPts;
  if (leagueFilter === 'ko_total') return p.koPts;
  // Individual matchday: md_1, md_2, md_3, md_R32, etc.
  if (leagueFilter.startsWith('md_')) {
    const mdKey = leagueFilter.substring(3);
    const key = isNaN(mdKey) ? mdKey : +mdKey;
    return p.weeklyPts[key] || 0;
  }
  return p.points;
}

function renderLeagueTable(scores, q = '') {
  let data = [...scores];
  data.sort((a, b) => getLeaguePts(b) - getLeaguePts(a));
  if (q) data = data.filter(p => p.name.includes(q));

  const el = document.getElementById('lg-rows');
  if (!el) return;

  // Dynamic header label
  let ptsLabel = 'النقاط';
  if (leagueFilter === 'ko_total') ptsLabel = 'نقاط الإقصائيات';
  else if (leagueFilter === 'group_total') ptsLabel = 'نقاط المجموعات';
  else if (leagueFilter.startsWith('md_')) ptsLabel = 'نقاط الجولة';
  const hdrEl = document.getElementById('lg-hdr');
  if (hdrEl) {
    hdrEl.innerHTML = `<div>#</div><div>اللاعب</div><div class="hide-m">دقيق</div><div class="hide-m">فرق</div><div class="hide-m">صحيح</div><div>م</div><div>${ptsLabel}</div>`;
  }

  el.innerHTML = data.map((p, i) => {
    const r = i + 1;
    let rkHTML = '';
    if (r === 1) rkHTML = `<span class="rk-badge g">1</span>`;
    else if (r === 2) rkHTML = `<span class="rk-badge s">2</span>`;
    else if (r === 3) rkHTML = `<span class="rk-badge b">3</span>`;
    else rkHTML = `<span class="rk-num">${r}</span>`;
    const you = currentUser && p.uid === currentUser.uid ? ' you' : '';
    const pts = getLeaguePts(p);
    const avH = p.avatar && p.avatar.length > 3
      ? `<img src="${p.avatar}" class="pl-av-img" alt="">`
      : `<span class="pl-av"></span>`;

    return `
      <div class="lg-row${you} ani">
        <div class="rk">${rkHTML}</div>
        <div class="pl-info" style="cursor:pointer" onclick="goProfile('${p.uid}')">${avH}<span class="pl-name">${p.name}</span></div>
        <div class="cell hide-m">${p.exact}</div>
        <div class="cell hide-m">${p.diff || 0}</div>
        <div class="cell hide-m">${p.correct}</div>
        <div class="cell">${p.predicted}</div>
        <div class="cell pts">${pts}</div>
      </div>
    `;
  }).join('');

  if (data.length === 0) {
    el.innerHTML = '<div class="empty-state">لسه محدش سجل توقعات</div>';
  }

  const inp = document.getElementById('lg-search');
  if (inp && !inp._bound) {
    inp._bound = true;
    inp.addEventListener('input', e => renderLeagueTable(scores, e.target.value));
  }
}

// Mini League for Homepage
async function renderHomeMiniLeague() {
  const el = document.getElementById('home-league-mini');
  if (!el) return;

  await loadAllUsers();
  await loadResults();

  const allPreds = {};
  try {
    const snap = await getDocs(collection(db, 'predictions'));
    snap.forEach(d => {
      const data = d.data();
      if (!allPreds[data.userId]) allPreds[data.userId] = {};
      const key = isNaN(data.matchday) ? data.matchday : +data.matchday;
      allPreds[data.userId][key] = { preds: data.preds || {}, goldenMatch: data.goldenMatch };
    });
  } catch (e) { console.error(e); }

  // Load knockout round questions
  const koRoundQuestions = {};
  try {
    for (const k of KNOCKOUT_ROUND_KEYS) {
      const snap = await getDoc(doc(db, 'roundQuestions', `ko_${k}`));
      if (snap.exists()) koRoundQuestions[k] = snap.data();
    }
  } catch (e) {}

  const scores = Object.entries(allUsers).map(([uid, user]) => {
    let koPts = 0;
    // Only count knockout matchdays for homepage mini league
    KNOCKOUT_ROUND_KEYS.forEach(md => {
      const userPreds = allPreds[uid]?.[md];
      if (!userPreds) return;
      const golden = userPreds.goldenMatch;
      const multiplier = getKnockoutMultiplier(md);
      let mdPts = 0;
      Object.entries(userPreds.preds).forEach(([matchId, pred]) => {
        const result = getResult(matchId, md);
        if (!result) return;
        let pts = calcPts(pred, result);
        pts = Math.round(pts * multiplier);
        if (matchId === golden) pts *= 2;
        mdPts += pts;
      });
      // Round question bonus for knockout
      const rq = koRoundQuestions[md];
      if (rq && rq.reviews && rq.reviews[uid] === true) { mdPts += 3; }
      koPts += mdPts;
    });
    return { uid, name: user.displayName, avatar: user.avatar, points: koPts };
  });

  scores.sort((a, b) => b.points - a.points);
  const top5 = scores.slice(0, 5);

  if (top5.length === 0) {
    el.innerHTML = '<div class="empty-state" style="font-size:0.8rem">لسه محدش سجل توقعات إقصائيات</div>';
    return;
  }

  el.innerHTML = `<div class="mini-league">
    <div class="lg-table">
      <div class="lg-hdr"><div>#</div><div>اللاعب</div><div>نقاط الإقصائيات</div></div>
      ${top5.map((p, i) => {
        const r = i + 1;
        let rkHTML = r === 1 ? '<span class="rk-badge g">1</span>' : r === 2 ? '<span class="rk-badge s">2</span>' : r === 3 ? '<span class="rk-badge b">3</span>' : `<span class="rk-num">${r}</span>`;
        const you = currentUser && p.uid === currentUser.uid ? ' you' : '';
        const avH = p.avatar && p.avatar.length > 3 ? `<img src="${p.avatar}" class="pl-av-img" alt="">` : '<span class="pl-av"></span>';
        return `<div class="lg-row${you} ani" style="grid-template-columns:40px 1fr 55px">
          <div class="rk">${rkHTML}</div>
          <div class="pl-info" style="cursor:pointer" onclick="goProfile('${p.uid}')">${avH}<span class="pl-name">${p.name}</span></div>
          <div class="cell pts">${p.points}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ============================================================
// CUP
// ============================================================
async function renderCup() {
  const loading = document.getElementById('cup-loading');
  loading.style.display = 'flex';
  await loadAllUsers();
  await loadResults();

  const allPreds = {};
  try {
    const snap = await getDocs(collection(db, 'predictions'));
    snap.forEach(d => {
      const data = d.data();
      if (!allPreds[data.userId]) allPreds[data.userId] = {};
      allPreds[data.userId][data.matchday] = { preds: data.preds || {}, goldenMatch: data.goldenMatch };
    });
  } catch (e) { console.error(e); }

  function getUserMDPts(uid, md) {
    const userPreds = allPreds[uid]?.[md];
    if (!userPreds) return 0;
    let pts = 0;
    const multiplier = getKnockoutMultiplier(md);
    Object.entries(userPreds.preds).forEach(([matchId, pred]) => {
      const result = getResult(matchId, md);
      if (!result) return;
      let p = calcPts(pred, result);
      p = Math.round(p * multiplier);
      if (matchId === userPreds.goldenMatch) p *= 2;
      pts += p;
    });
    return pts;
  }

  function generateDraw(uids, previousDraws) {
    const prevPairs = new Set();
    previousDraws.forEach(d => {
      (d.matchups || []).forEach(m => {
        prevPairs.add([m.p1, m.p2].sort().join('|'));
      });
    });

    for (let attempt = 0; attempt < 50; attempt++) {
      const shuffled = [...uids].sort(() => Math.random() - 0.5);
      const matchups = [];
      let byePlayer = null;
      let valid = true;

      if (shuffled.length % 2 !== 0) {
        byePlayer = shuffled.pop();
      }

      for (let i = 0; i < shuffled.length; i += 2) {
        const pair = [shuffled[i], shuffled[i + 1]].sort().join('|');
        if (prevPairs.has(pair)) {
          valid = false;
          break;
        }
        matchups.push({ p1: shuffled[i], p2: shuffled[i + 1] });
      }

      if (valid || attempt === 49) {
        return { matchups, byePlayer };
      }
    }
    const shuffled = [...uids].sort(() => Math.random() - 0.5);
    let byePlayer = null;
    if (shuffled.length % 2 !== 0) byePlayer = shuffled.pop();
    const matchups = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      matchups.push({ p1: shuffled[i], p2: shuffled[i + 1] });
    }
    return { matchups, byePlayer };
  }

  const rounds = [];
  const previousDraws = [];
  // Use all matchday keys for cup rounds
  const cupRoundKeys = [1, 2, 3, ...KNOCKOUT_ROUND_KEYS];

  for (const md of cupRoundKeys) {
    const mdLabel = typeof md === 'number' ? md : md;
    const docId = typeof md === 'number' ? `round${md}` : `round_${md}`;
    let draw = null;
    try {
      const snap = await getDoc(doc(db, 'cupDraws', docId));
      if (snap.exists()) draw = snap.data();
    } catch (e) { console.error(e); }

    const uids = Object.keys(allUsers);
    if (!draw && uids.length >= 2) {
      const { matchups, byePlayer } = generateDraw(uids, previousDraws);
      draw = { matchday: md, matchups, byePlayer: byePlayer || null, createdAt: new Date().toISOString() };
      try { await setDoc(doc(db, 'cupDraws', docId), draw); } catch (e) { console.error(e); }
    }

    if (draw) {
      previousDraws.push(draw);
      const matchups = (draw.matchups || []).map(m => {
        const p1Pts = getUserMDPts(m.p1, md);
        const p2Pts = getUserMDPts(m.p2, md);
        return {
          p1: { uid: m.p1, ...(allUsers[m.p1] || { displayName: 'لاعب', avatar: '' }), pts: p1Pts },
          p2: { uid: m.p2, ...(allUsers[m.p2] || { displayName: 'لاعب', avatar: '' }), pts: p2Pts },
          winnerId: p1Pts > p2Pts ? m.p1 : p2Pts > p1Pts ? m.p2 : null
        };
      });
      const byeInfo = draw.byePlayer ? {
        uid: draw.byePlayer,
        ...(allUsers[draw.byePlayer] || { displayName: 'لاعب', avatar: '' })
      } : null;
      const mdInfo = MATCHDAY_INFO[md];
      rounds.push({ matchday: md, name: mdInfo ? mdInfo.name : `جولة ${md}`, matchups, byePlayer: byeInfo });
    }
  }

  // Calculate standings
  const standings = {};
  Object.entries(allUsers).forEach(([uid, u]) => {
    standings[uid] = { uid, name: u.displayName, avatar: u.avatar, w: 0, d: 0, l: 0, bye: 0, pts: 0 };
  });
  rounds.forEach(round => {
    round.matchups.forEach(m => {
      if (!standings[m.p1.uid] || !standings[m.p2.uid]) return;
      if (m.winnerId === m.p1.uid) {
        standings[m.p1.uid].w++; standings[m.p1.uid].pts += 3;
        standings[m.p2.uid].l++;
      } else if (m.winnerId === m.p2.uid) {
        standings[m.p2.uid].w++; standings[m.p2.uid].pts += 3;
        standings[m.p1.uid].l++;
      } else {
        standings[m.p1.uid].d++; standings[m.p1.uid].pts += 1;
        standings[m.p2.uid].d++; standings[m.p2.uid].pts += 1;
      }
    });
    if (round.byePlayer && standings[round.byePlayer.uid]) {
      standings[round.byePlayer.uid].bye++;
      standings[round.byePlayer.uid].pts += 1;
    }
  });

  loading.style.display = 'none';
  const el = document.getElementById('cup-content');
  if (!el) return;

  const standingsArr = Object.values(standings).sort((a, b) => b.pts - a.pts || b.w - a.w);
  if (standingsArr.length === 0) {
    el.innerHTML = '<div class="empty-state">لازم يسجل لاعبين أول عشان الكأس يبدأ</div>';
    return;
  }

  function cupAvatar(av) {
    return av && av.length > 3
      ? `<img src="${av}" class="cup-av-img" alt="">`
      : `<span class="av"></span>`;
  }

  let html = `<div class="sec-title"><span class="bar"></span> ترتيب الكأس</div>
    <div class="lg-table" style="margin-bottom:32px">
      <div class="lg-hdr" style="grid-template-columns:40px 1fr 45px 45px 45px 45px 55px"><div>#</div><div>اللاعب</div><div>فوز</div><div>تعادل</div><div>خسارة</div><div>راحة</div><div>نقاط</div></div>
      ${standingsArr.map((p, i) => {
        const r = i + 1;
        let rkHTML = r === 1 ? `<span class="rk-badge g">1</span>` : r === 2 ? `<span class="rk-badge s">2</span>` : r === 3 ? `<span class="rk-badge b">3</span>` : `<span class="rk-num">${r}</span>`;
        const you = currentUser && p.uid === currentUser.uid ? ' you' : '';
        const avH = p.avatar && p.avatar.length > 3 ? `<img src="${p.avatar}" class="pl-av-img" alt="">` : `<span class="pl-av"></span>`;
        return `<div class="lg-row${you} ani" style="grid-template-columns:40px 1fr 45px 45px 45px 45px 55px">
          <div class="rk">${rkHTML}</div>
          <div class="pl-info" style="cursor:pointer" onclick="goProfile('${p.uid}')">${avH}<span class="pl-name">${p.name}</span></div>
          <div class="cell" style="color:var(--green)">${p.w}</div><div class="cell">${p.d}</div>
          <div class="cell" style="color:var(--red)">${p.l}</div><div class="cell" style="color:var(--gold)">${p.bye}</div><div class="cell pts">${p.pts}</div>
        </div>`;
      }).join('')}
    </div>`;

  rounds.forEach(round => {
    html += `<div class="cup-round-title">${round.name}</div><div class="cup-grid">`;
    round.matchups.forEach(m => {
      const p1w = m.winnerId === m.p1.uid, p2w = m.winnerId === m.p2.uid, draw = !m.winnerId;
      const summary = draw ? 'تعادل' : p1w ? `فاز ${m.p1.displayName}` : `فاز ${m.p2.displayName}`;
      html += `<div class="cup-match ani">
        <div class="cup-player ${p1w ? 'w' : draw ? '' : 'l'}">
          <div class="cup-pl-info" style="cursor:pointer" onclick="goProfile('${m.p1.uid}')">${cupAvatar(m.p1.avatar)}<span class="nm">${m.p1.displayName}</span></div>
          <span class="cup-pts">${m.p1.pts}</span>
        </div>
        <div class="cup-player ${p2w ? 'w' : draw ? '' : 'l'}">
          <div class="cup-pl-info" style="cursor:pointer" onclick="goProfile('${m.p2.uid}')">${cupAvatar(m.p2.avatar)}<span class="nm">${m.p2.displayName}</span></div>
          <span class="cup-pts">${m.p2.pts}</span>
        </div>
        <div class="cup-summary"><span class="winner-tag">${summary}</span></div>
      </div>`;
    });
    if (round.byePlayer) {
      html += `<div class="cup-match ani cup-bye">
        <div class="cup-player">
          <div class="cup-pl-info" style="cursor:pointer" onclick="goProfile('${round.byePlayer.uid}')">${cupAvatar(round.byePlayer.avatar)}<span class="nm">${round.byePlayer.displayName}</span></div>
          <span class="cup-pts" style="color:var(--gold)">+1</span>
        </div>
        <div class="cup-summary"><span class="winner-tag" style="color:var(--gold)">🎫 راحة (BYE)</span></div>
      </div>`;
    }
    html += '</div>';
  });

  el.innerHTML = html;
}

// ============================================================
// PROFILE (Updated for knockout support)
// ============================================================
async function renderProfile(uid) {
  const loading = document.getElementById('profile-loading');
  const container = document.getElementById('profile-content');
  container.innerHTML = '';
  loading.style.display = 'flex';
  profileUid = uid; // ensure profileUid always updated
  await loadAllUsers();
  await loadResults();

  const user = allUsers[uid];
  if (!user) { container.innerHTML = '<div class="empty-state">المستخدم غير موجود</div>'; loading.style.display = 'none'; return; }

  // Load ALL predictions (for bonus calculation)
  const allPredsMap = {};
  try {
    const snap = await getDocs(collection(db, 'predictions'));
    snap.forEach(d => {
      const data = d.data();
      if (!allPredsMap[data.userId]) allPredsMap[data.userId] = {};
      const key = isNaN(data.matchday) ? data.matchday : +data.matchday;
      allPredsMap[data.userId][key] = { preds: data.preds || {}, goldenMatch: data.goldenMatch, roundAnswer: data.roundAnswer || null };
    });
  } catch (e) { console.error(e); }

  const userPreds = allPredsMap[uid] || {};

  // Build unique prediction tracking for bonus
  const matchWinnerPreds = {};
  ALL_MATCHDAY_KEYS.forEach(md => {
    matchWinnerPreds[md] = {};
    Object.entries(allPredsMap).forEach(([puid, pMDs]) => {
      const pData = pMDs[md];
      if (!pData) return;
      Object.entries(pData.preds).forEach(([matchId, pred]) => {
        if (!matchWinnerPreds[md][matchId]) matchWinnerPreds[md][matchId] = { home: [], away: [], draw: [] };
        const ph = parseInt(pred.h), pa = parseInt(pred.a);
        if (isNaN(ph) || isNaN(pa)) return;
        const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
        matchWinnerPreds[md][matchId][side].push(puid);
      });
    });
  });

  const roundQuestions = {};
  try {
    for (const md of [1, 2, 3]) {
      const snap = await getDoc(doc(db, 'roundQuestions', `md${md}`));
      if (snap.exists()) roundQuestions[md] = snap.data();
    }
    for (const k of KNOCKOUT_ROUND_KEYS) {
      const snap = await getDoc(doc(db, 'roundQuestions', `ko_${k}`));
      if (snap.exists()) roundQuestions[k] = snap.data();
    }
  } catch (e) {}

  let totalPts = 0, exactCount = 0, diffCount = 0, correctCount = 0, wrongCount = 0;
  let totalPredicted = 0, totalPlayed = 0, bonusCount = 0;
  const mdStats = {};

  ALL_MATCHDAY_KEYS.forEach(md => {
    const preds = userPreds[md];
    if (!preds) { mdStats[md] = { pts: 0, matches: [], goldenMatch: null, wrongCount: 0 }; return; }
    let mdPts = 0, mdWrong = 0;
    const golden = preds.goldenMatch;
    const matchDetails = [];
    const matches = getMatchesForMD(md);
    const multiplier = getKnockoutMultiplier(md);

    matches.forEach(match => {
      const pred = preds.preds[match.id];
      const result = getResult(match.id, md);
      if (!pred || pred.h === undefined) return;
      totalPredicted++;
      const isGolden = match.id === golden;
      let pts = 0, level = 'none', matchBonus = 0;
      if (result) {
        totalPlayed++;
        pts = calcPts(pred, result);
        level = calcPtsLevel(pred, result);
        pts = Math.round(pts * multiplier);
        if (isGolden) pts *= 2;
        if (level === 'exact') exactCount++;
        else if (level === 'diff') diffCount++;
        else if (level === 'correct') correctCount++;
        else { wrongCount++; mdWrong++; }

        // Bonus check
        if (level === 'correct' || level === 'diff' || level === 'exact') {
          const ph = parseInt(pred.h), pa = parseInt(pred.a);
          const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
          const predsForSide = matchWinnerPreds[md]?.[match.id]?.[side] || [];
          if (predsForSide.length === 1 && predsForSide[0] === uid) {
            pts += 3;
            matchBonus = 3;
            bonusCount += 3;
          }
        }

        mdPts += pts; totalPts += pts;
      }
      matchDetails.push({ match, pred, result, pts, level, isGolden, bonusPts: matchBonus });
    });

    if (typeof md === 'number' && mdWrong >= 6) { mdPts -= 2; totalPts -= 2; }
    const rq = roundQuestions[md];
    let rqResult = null;
    if (rq && rq.reviews && rq.reviews[uid] === true) { mdPts += 3; totalPts += 3; rqResult = 'correct'; }
    else if (rq && rq.reviews && rq.reviews[uid] === false) { rqResult = 'wrong'; }
    mdStats[md] = { pts: mdPts, matches: matchDetails, rqResult, rqAnswer: preds.roundAnswer, rqQuestion: rq?.question, wrongCount: mdWrong, goldenMatch: golden };
  });

  const accuracy = totalPlayed > 0 ? Math.round(((exactCount + diffCount + correctCount) / totalPlayed) * 100) : 0;
  const avgPts = totalPlayed > 0 ? (totalPts / totalPlayed).toFixed(1) : '0';

  loading.style.display = 'none';

  const isMe = currentUser && currentUser.uid === uid;
  const joinDate = user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '';
  const avHTML = user.avatar && user.avatar.length > 3 ? `<img src="${user.avatar}" class="pf-avatar" alt="">` : `<div class="pf-avatar pf-av-placeholder"></div>`;

  let html = `
    <div class="pf-header">
      <button class="pf-back" onclick="go('league')">← الدوري</button>
      <div class="pf-avatar-wrap">${avHTML}</div>
      <h2 class="pf-name">${user.displayName}${isMe ? ' <span class="pf-you">(أنت)</span>' : ''}</h2>
      ${joinDate ? `<div class="pf-joined">انضم: ${joinDate}</div>` : ''}
      <div class="pf-total-pts">${totalPts}<span> نقطة</span></div>
    </div>

    <div class="pf-perf-bar-wrap">
      <div class="pf-perf-title">توزيع الأداء</div>
      <div class="pf-perf-bar">
        ${exactCount > 0 ? `<div class="pf-pb exact" style="flex:${exactCount}" title="دقيق: ${exactCount}"></div>` : ''}
        ${diffCount > 0 ? `<div class="pf-pb diff" style="flex:${diffCount}" title="فرق أهداف: ${diffCount}"></div>` : ''}
        ${correctCount > 0 ? `<div class="pf-pb correct" style="flex:${correctCount}" title="اتجاه: ${correctCount}"></div>` : ''}
        ${wrongCount > 0 ? `<div class="pf-pb wrong" style="flex:${wrongCount}" title="خطأ: ${wrongCount}"></div>` : ''}
      </div>
      <div class="pf-perf-legend">
        <span class="pf-leg exact">دقيق ${exactCount}</span>
        <span class="pf-leg diff">فرق ${diffCount}</span>
        <span class="pf-leg correct">اتجاه ${correctCount}</span>
        <span class="pf-leg wrong">خطأ ${wrongCount}</span>
      </div>
    </div>

    <div class="pf-stats-grid">
      <div class="pf-stat main"><div class="pf-stat-icon">\u{1F3AF}</div><div class="pf-stat-val">${accuracy}%</div><div class="pf-stat-lbl">نسبة الدقة</div></div>
      <div class="pf-stat main"><div class="pf-stat-icon">\u{1F4CA}</div><div class="pf-stat-val">${avgPts}</div><div class="pf-stat-lbl">معدل النقاط/ماتش</div></div>
      <div class="pf-stat"><div class="pf-stat-icon">\u26BD</div><div class="pf-stat-val">${totalPredicted}</div><div class="pf-stat-lbl">توقعات</div></div>
      <div class="pf-stat"><div class="pf-stat-icon">\u{1F3C5}</div><div class="pf-stat-val">${bonusCount}</div><div class="pf-stat-lbl">نقاط بونص</div></div>
    </div>`;

  // Show matchday cards
  ALL_MATCHDAY_KEYS.forEach(md => {
    const info = MATCHDAY_INFO[md];
    const stats = mdStats[md];
    if (!stats || stats.matches.length === 0) return;
    const mdCorrect = stats.matches.filter(m => m.result && m.level !== 'wrong' && m.level !== 'none').length;
    const mdTotal = stats.matches.filter(m => m.result).length;
    const multiplier = getKnockoutMultiplier(md);
    const isKO = isKnockoutMD(md);

    html += `
    <div class="pf-md-card">
      <div class="pf-md-header">
        <div class="pf-md-left"><span class="pf-md-name">${info.name}${isKO ? ` (×${multiplier})` : ''}</span><span class="pf-md-accuracy">${mdTotal > 0 ? Math.round(mdCorrect/mdTotal*100) : 0}% - ${mdCorrect}/${mdTotal}</span></div>
        <span class="pf-md-pts ${stats.pts > 0 ? 'positive' : stats.pts < 0 ? 'negative' : ''}">${stats.pts > 0 ? '+' : ''}${stats.pts}</span>
      </div>`;

    stats.matches.forEach(m => {
      // Safely get team info (handles null/TBD for knockout)
      const homeCode = m.match.home;
      const awayCode = m.match.away;
      const homeTeam = homeCode ? TEAMS[homeCode] : null;
      const awayTeam = awayCode ? TEAMS[awayCode] : null;
      const homeName = homeTeam ? homeTeam.name : 'يُحدد';
      const awayName = awayTeam ? awayTeam.name : 'يُحدد';
      const homeFlag = homeTeam ? `<img src="${flagUrl(homeTeam.iso)}" class="flag-xs" alt="">` : '<span class="flag-xs">❓</span>';
      const awayFlag = awayTeam ? `<img src="${flagUrl(awayTeam.iso)}" class="flag-xs" alt="">` : '<span class="flag-xs">❓</span>';

      const predStr = `${m.pred.h} - ${m.pred.a}`;
      const resultStr = m.result ? `${m.result.home} - ${m.result.away}` : '\u2014';
      let levelClass = '', levelEmoji = '', ptsText = '';
      if (m.result) {
        levelClass = m.level;
        levelEmoji = m.level === 'exact' ? '\u{1F3AF}' : m.level === 'diff' ? '\u2705' : m.level === 'correct' ? '\u{1F44D}' : '\u274C';
        ptsText = m.pts > 0 ? `+${m.pts}` : '0';
      }
      const bonusTag = m.bonusPts > 0 ? ' <span style="color:#ffb800;font-size:0.65rem">+3 بونص</span>' : '';

      html += `
      <div class="pf-match-row ${m.isGolden ? 'golden' : ''} ${levelClass}">
        <div class="pf-match-left">
          <span class="pf-match-emoji">${m.result ? levelEmoji : '\u23F3'}</span>
          <div class="pf-match-teams">
            ${homeFlag}
            <span>${homeName}</span>
            <span class="pf-vs">vs</span>
            <span>${awayName}</span>
            ${awayFlag}
            ${m.isGolden ? '<span class="pf-golden-star">\u2605</span>' : ''}
          </div>
        </div>
        <div class="pf-match-right">
          <div class="pf-match-nums"><span class="pf-pred-num">${predStr}</span><span class="pf-result-num">${resultStr}</span></div>
          ${m.result ? `<span class="pf-pts-chip ${levelClass}">${ptsText}${bonusTag}</span>` : ''}
        </div>
      </div>`;
    });

    if (typeof md === 'number' && stats.wrongCount >= 6) html += `<div class="pf-penalty">عقوبة 6 أخطاء: <strong>-2</strong></div>`;
    html += `</div>`;
  });

  container.innerHTML = html;
}

// ============================================================
// INIT
// ============================================================
function init() {
  document.getElementById('login-btn')?.addEventListener('click', handleLogin);
  document.getElementById('reg-btn')?.addEventListener('click', handleRegister);
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('reg-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleRegister(); });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.page));
  });
  document.querySelectorAll('.mob-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.page));
  });
  document.getElementById('header-profile-link')?.addEventListener('click', () => {
    if (currentUser) goProfile(currentUser.uid);
  });
  document.getElementById('hero-start-btn')?.addEventListener('click', () => go('knockout'));
  document.getElementById('hero-league-btn')?.addEventListener('click', () => go('league'));

  buildAvatarGrid();
  loadResults();
  onAuthStateChanged(auth, onAuth);
}

init();
