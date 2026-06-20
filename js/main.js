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
let activeMD = 1;
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
    loadUserData(user.uid);
    go('home');
  } else {
    overlay.style.display = 'flex';
    header.style.display = 'none'; main.style.display = 'none'; footer.style.display = 'none';
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
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  if (page === 'home') { renderGroups(); startCountdown(); }
  if (page === 'predictions') renderPredictions(activeMD);
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
  for (const md of [1, 2, 3]) {
    const d = new Date(MATCHDAY_INFO[md].deadline);
    if (d > new Date()) { target = d; break; }
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
// RESULTS
// ============================================================
async function loadResults() {
  try {
    for (const md of [1, 2, 3]) {
      const snap = await getDoc(doc(db, 'results', `md${md}`));
      if (snap.exists()) {
        firestoreResults[md] = snap.data().matches || {};
      }
    }
  } catch (e) { console.error('Error loading results:', e); }
}

function getResult(matchId, md) {
  if (firestoreResults[md] && firestoreResults[md][matchId]) {
    return firestoreResults[md][matchId];
  }
  const match = (MATCHES[md] || []).find(m => m.id === matchId);
  return match ? match.result : null;
}

function getMatchResult(match, md) {
  return getResult(match.id, md) || match.result;
}

// ============================================================
// PREDICTIONS
// ============================================================
function renderTabs() {
  const el = document.getElementById('md-tabs');
  if (!el) return;

  const mdKeys = Object.keys(MATCHDAY_INFO).map(Number).sort();

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
      // A match is locked if it has started OR has a result from admin
      const isLocked = started || result !== null;
      const st = result ? 'played' : getMatchStatus(match);
      const p = preds[match.id] || {};
      const isGolden = goldenMatch === match.id;

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

      let resultHTML = '';
      if (result && p.h !== undefined && p.a !== undefined) {
        let pts = calcPts(p, result);
        if (isGolden) pts *= 2;
        const level = calcPtsLevel(p, result);
        if (level === 'exact') resultHTML = `<div class="m-result exact">توقع دقيق +${pts}</div>`;
        else if (level === 'diff') resultHTML = `<div class="m-result diff">فرق أهداف صحيح +${pts}</div>`;
        else if (level === 'correct') resultHTML = `<div class="m-result correct">اتجاه صحيح +${pts}</div>`;
        else resultHTML = `<div class="m-result wrong">خطأ</div>`;
      }

      const goldenCls = isGolden ? 'golden-active' : '';
      const lockedCls = (isLocked && !result) ? 'm-locked' : '';
      const endedCls = (st === 'ended') ? 'm-ended' : '';
      // Disable golden star and inputs if match is locked (started or has result)
      const disabledAttr = isLocked ? 'disabled' : '';

      // Show saved prediction for locked matches without result
      let predDisplay = '';
      if (isLocked && p.h !== undefined && p.a !== undefined && !result) {
        predDisplay = `<div class="m-pred-saved">توقعك: ${p.h} - ${p.a}</div>`;
      }

      return `
        <div class="m-card ani ${goldenCls} ${lockedCls} ${endedCls}" id="mcard-${match.id}">
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
            ${isGolden ? '<div class="golden-label">\u2605 مباراة ذهبية \u2014 النقاط \u00d72</div>' : ''}
            ${resultHTML}
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
      // Block if match started, has result, or button is disabled
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
// LEAGUE
// ============================================================
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
  } catch (e) { console.error(e); }

  const matchWinnerPreds = {};
  [1, 2, 3].forEach(md => {
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
    let totalPts = 0, exact = 0, diff = 0, correct = 0, predicted = 0, bonus = 0, weeklyPts = {};
    [1, 2, 3].forEach(md => {
      const userPreds = allPreds[uid]?.[md];
      if (!userPreds) return;
      let mdPts = 0, wrongCount = 0;
      const golden = userPreds.goldenMatch;

      Object.entries(userPreds.preds).forEach(([matchId, pred]) => {
        const result = getResult(matchId, md);
        if (!result) return;
        predicted++;
        let pts = calcPts(pred, result);
        const level = calcPtsLevel(pred, result);
        if (matchId === golden) pts *= 2;

        if (level === 'exact') exact++;
        else if (level === 'diff') diff++;
        else if (level === 'correct') correct++;
        else wrongCount++;

        if (level === 'correct' || level === 'diff' || level === 'exact') {
          const ph = parseInt(pred.h), pa = parseInt(pred.a);
          const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
          const predsForSide = matchWinnerPreds[md]?.[matchId]?.[side] || [];
          if (predsForSide.length === 1 && predsForSide[0] === uid) {
            pts += 3;
            bonus += 3;
          }
        }

        mdPts += pts; totalPts += pts;
      });

      if (wrongCount >= 6) { mdPts -= 2; totalPts -= 2; }

      const rq = roundQuestions[md];
      if (rq && rq.reviews && rq.reviews[uid] === true) {
        mdPts += 3; totalPts += 3;
      }

      weeklyPts[md] = mdPts;
    });
    return { uid, name: user.displayName, avatar: user.avatar, points: totalPts, exact, diff, correct, predicted, bonus, weeklyPts };
  });

  loading.style.display = 'none';
  renderLeagueTable(scores);
}

let leagueFilter = 'overall';

function renderLeagueTable(scores, q = '') {
  let data = [...scores];
  if (leagueFilter === 'weekly') {
    data.sort((a, b) => (b.weeklyPts[activeMD] || 0) - (a.weeklyPts[activeMD] || 0));
  } else {
    data.sort((a, b) => b.points - a.points);
  }
  if (q) data = data.filter(p => p.name.includes(q));

  const el = document.getElementById('lg-rows');
  if (!el) return;

  el.innerHTML = data.map((p, i) => {
    const r = i + 1;
    let rkHTML = '';
    if (r === 1) rkHTML = `<span class="rk-badge g">1</span>`;
    else if (r === 2) rkHTML = `<span class="rk-badge s">2</span>`;
    else if (r === 3) rkHTML = `<span class="rk-badge b">3</span>`;
    else rkHTML = `<span class="rk-num">${r}</span>`;
    const you = currentUser && p.uid === currentUser.uid ? ' you' : '';
    const pts = leagueFilter === 'weekly' ? (p.weeklyPts[activeMD] || 0) : p.points;
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

  document.querySelectorAll('.lg-pill').forEach(b => {
    b.onclick = () => {
      leagueFilter = b.dataset.f;
      document.querySelectorAll('.lg-pill').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderLeagueTable(scores, document.getElementById('lg-search')?.value || '');
    };
  });

  const inp = document.getElementById('lg-search');
  if (inp && !inp._bound) {
    inp._bound = true;
    inp.addEventListener('input', e => renderLeagueTable(scores, e.target.value));
  }
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
    Object.entries(userPreds.preds).forEach(([matchId, pred]) => {
      const result = getResult(matchId, md);
      if (!result) return;
      let p = calcPts(pred, result);
      if (matchId === userPreds.goldenMatch) p *= 2;
      pts += p;
    });
    return pts;
  }

  const rounds = [];
  for (const md of [1, 2, 3]) {
    let draw = null;
    try {
      const snap = await getDoc(doc(db, 'cupDraws', `round${md}`));
      if (snap.exists()) draw = snap.data();
    } catch (e) { console.error(e); }

    const uids = Object.keys(allUsers);
    if (!draw && uids.length >= 2) {
      const shuffled = [...uids].sort(() => Math.random() - 0.5);
      const matchups = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) matchups.push({ p1: shuffled[i], p2: shuffled[i + 1] });
      }
      draw = { matchday: md, matchups, createdAt: new Date().toISOString() };
      try { await setDoc(doc(db, 'cupDraws', `round${md}`), draw); } catch (e) { console.error(e); }
    }

    if (draw) {
      const matchups = (draw.matchups || []).map(m => {
        const p1Pts = getUserMDPts(m.p1, md);
        const p2Pts = getUserMDPts(m.p2, md);
        return {
          p1: { uid: m.p1, ...(allUsers[m.p1] || { displayName: 'لاعب', avatar: '' }), pts: p1Pts },
          p2: { uid: m.p2, ...(allUsers[m.p2] || { displayName: 'لاعب', avatar: '' }), pts: p2Pts },
          winnerId: p1Pts > p2Pts ? m.p1 : p2Pts > p1Pts ? m.p2 : null
        };
      });
      rounds.push({ matchday: md, name: MATCHDAY_INFO[md].name, matchups });
    }
  }

  const standings = {};
  Object.entries(allUsers).forEach(([uid, u]) => {
    standings[uid] = { uid, name: u.displayName, avatar: u.avatar, w: 0, d: 0, l: 0, pts: 0 };
  });
  rounds.forEach(round => {
    round.matchups.forEach(m => {
      if (!standings[m.p1.uid] || !standings[m.p2.uid]) return;
      if (m.winnerId === m.p1.uid) { standings[m.p1.uid].w++; standings[m.p1.uid].pts += 3; standings[m.p2.uid].l++; }
      else if (m.winnerId === m.p2.uid) { standings[m.p2.uid].w++; standings[m.p2.uid].pts += 3; standings[m.p1.uid].l++; }
      else { standings[m.p1.uid].d++; standings[m.p1.uid].pts += 1; standings[m.p2.uid].d++; standings[m.p2.uid].pts += 1; }
    });
  });

  loading.style.display = 'none';
  const el = document.getElementById('cup-content');
  if (!el) return;

  const standingsArr = Object.values(standings).sort((a, b) => b.pts - a.pts);
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
      <div class="lg-hdr" style="grid-template-columns:45px 1fr 50px 50px 50px 60px"><div>#</div><div>اللاعب</div><div>فوز</div><div>تعادل</div><div>خسارة</div><div>نقاط</div></div>
      ${standingsArr.map((p, i) => {
        const r = i + 1;
        let rkHTML = r === 1 ? `<span class="rk-badge g">1</span>` : r === 2 ? `<span class="rk-badge s">2</span>` : r === 3 ? `<span class="rk-badge b">3</span>` : `<span class="rk-num">${r}</span>`;
        const you = currentUser && p.uid === currentUser.uid ? ' you' : '';
        const avH = p.avatar && p.avatar.length > 3 ? `<img src="${p.avatar}" class="pl-av-img" alt="">` : `<span class="pl-av"></span>`;
        return `<div class="lg-row${you} ani" style="grid-template-columns:45px 1fr 50px 50px 50px 60px">
          <div class="rk">${rkHTML}</div>
          <div class="pl-info" style="cursor:pointer" onclick="goProfile('${p.uid}')">${avH}<span class="pl-name">${p.name}</span></div>
          <div class="cell" style="color:var(--green)">${p.w}</div><div class="cell">${p.d}</div>
          <div class="cell" style="color:var(--red)">${p.l}</div><div class="cell pts">${p.pts}</div>
        </div>`;
      }).join('')}
    </div>`;

  rounds.forEach(round => {
    if (round.matchups.length === 0) return;
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
    html += '</div>';
  });

  el.innerHTML = html;
}

// ============================================================
// PROFILE
// ============================================================
async function renderProfile(uid) {
  const loading = document.getElementById('profile-loading');
  const container = document.getElementById('profile-content');
  container.innerHTML = '';
  loading.style.display = 'flex';
  await loadAllUsers();
  await loadResults();

  const user = allUsers[uid];
  if (!user) { container.innerHTML = '<div class="empty-state">المستخدم غير موجود</div>'; loading.style.display = 'none'; return; }

  const allPredsMap = {};
  try {
    const snap = await getDocs(collection(db, 'predictions'));
    snap.forEach(d => {
      const data = d.data();
      if (!allPredsMap[data.userId]) allPredsMap[data.userId] = {};
      allPredsMap[data.userId][data.matchday] = { preds: data.preds || {}, goldenMatch: data.goldenMatch, roundAnswer: data.roundAnswer || null };
    });
  } catch (e) { console.error(e); }

  const userPreds = {};
  Object.entries(allPredsMap[uid] || {}).forEach(([md, data]) => { userPreds[+md] = data; });

  const roundQuestions = {};
  try {
    for (const md of [1, 2, 3]) {
      const snap = await getDoc(doc(db, 'roundQuestions', `md${md}`));
      if (snap.exists()) roundQuestions[md] = snap.data();
    }
  } catch (e) {}

  const matchWinnerPreds = {};
  [1, 2, 3].forEach(md => {
    matchWinnerPreds[md] = {};
    Object.entries(allPredsMap).forEach(([u, userMDs]) => {
      const up = userMDs[md]; if (!up) return;
      Object.entries(up.preds).forEach(([matchId, pred]) => {
        if (!matchWinnerPreds[md][matchId]) matchWinnerPreds[md][matchId] = { home: [], away: [], draw: [] };
        const ph = parseInt(pred.h), pa = parseInt(pred.a);
        if (isNaN(ph) || isNaN(pa)) return;
        const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
        matchWinnerPreds[md][matchId][side].push(u);
      });
    });
  });

  let totalPts = 0, exactCount = 0, diffCount = 0, correctCount = 0, wrongCount = 0;
  let totalPredicted = 0, totalPlayed = 0, bonusCount = 0;
  let goldenTotal = 0, goldenSuccess = 0, goldenExact = 0, goldenPts = 0;
  let bestStreak = 0, currentStreak = 0;
  const mdStats = {};

  [1, 2, 3].forEach(md => {
    const preds = userPreds[md];
    if (!preds) { mdStats[md] = { pts: 0, matches: [], goldenMatch: null }; return; }
    let mdPts = 0, mdWrong = 0;
    const golden = preds.goldenMatch;
    const matchDetails = [];
    const matches = MATCHES[md] || [];
    matches.forEach(match => {
      const pred = preds.preds[match.id];
      const result = getResult(match.id, md);
      if (!pred || pred.h === undefined) return;
      totalPredicted++;
      const isGolden = match.id === golden;
      if (isGolden) goldenTotal++;
      let pts = 0, level = 'none', bonusPts = 0;
      if (result) {
        totalPlayed++;
        pts = calcPts(pred, result);
        level = calcPtsLevel(pred, result);
        if (isGolden) {
          pts *= 2;
          if (level !== 'wrong') { goldenSuccess++; goldenPts += pts; }
          if (level === 'exact') goldenExact++;
        }
        if (level === 'exact') { exactCount++; currentStreak++; }
        else if (level === 'diff') { diffCount++; currentStreak++; }
        else if (level === 'correct') { correctCount++; currentStreak++; }
        else { wrongCount++; mdWrong++; bestStreak = Math.max(bestStreak, currentStreak); currentStreak = 0; }
        if (level !== 'wrong' && level !== 'none') {
          const ph = parseInt(pred.h), pa = parseInt(pred.a);
          const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
          const predsForSide = matchWinnerPreds[md]?.[match.id]?.[side] || [];
          if (predsForSide.length === 1 && predsForSide[0] === uid) { bonusPts = 3; bonusCount += 3; pts += 3; }
        }
        mdPts += pts; totalPts += pts;
      }
      matchDetails.push({ match, pred, result, pts, level, isGolden, bonusPts });
    });
    if (mdWrong >= 6) { mdPts -= 2; totalPts -= 2; }
    const rq = roundQuestions[md];
    let rqResult = null;
    if (rq && rq.reviews && rq.reviews[uid] === true) { mdPts += 3; totalPts += 3; rqResult = 'correct'; }
    else if (rq && rq.reviews && rq.reviews[uid] === false) { rqResult = 'wrong'; }
    mdStats[md] = { pts: mdPts, matches: matchDetails, rqResult, rqAnswer: preds.roundAnswer, rqQuestion: rq?.question, wrongCount: mdWrong, goldenMatch: golden };
  });
  bestStreak = Math.max(bestStreak, currentStreak);

  const allScores = Object.keys(allUsers).map(u => {
    let pts = 0;
    [1, 2, 3].forEach(md => {
      const up = allPredsMap[u]?.[md]; if (!up) return;
      let wc = 0;
      Object.entries(up.preds).forEach(([matchId, pred]) => {
        const result = getResult(matchId, md); if (!result) return;
        let p = calcPts(pred, result);
        const level = calcPtsLevel(pred, result);
        if (matchId === up.goldenMatch) p *= 2;
        if (level !== 'wrong' && level !== 'none') {
          const ph = parseInt(pred.h), pa = parseInt(pred.a);
          const side = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
          const pfs = matchWinnerPreds[md]?.[matchId]?.[side] || [];
          if (pfs.length === 1 && pfs[0] === u) p += 3;
        }
        if (level === 'wrong') wc++;
        pts += p;
      });
      if (wc >= 6) pts -= 2;
      const rq = roundQuestions[md];
      if (rq && rq.reviews && rq.reviews[u] === true) pts += 3;
    });
    return { uid: u, pts };
  }).sort((a, b) => b.pts - a.pts);
  const rank = allScores.findIndex(s => s.uid === uid) + 1;
  const totalUsers = allScores.length;

  const accuracy = totalPlayed > 0 ? Math.round(((exactCount + diffCount + correctCount) / totalPlayed) * 100) : 0;
  const avgPts = totalPlayed > 0 ? (totalPts / totalPlayed).toFixed(1) : '0';
  const bestMD = [1, 2, 3].reduce((best, md) => mdStats[md].pts > (mdStats[best]?.pts || -999) ? md : best, 1);

  loading.style.display = 'none';

  const isMe = currentUser && currentUser.uid === uid;
  const joinDate = user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '';
  const avHTML = user.avatar && user.avatar.length > 3 ? `<img src="${user.avatar}" class="pf-avatar" alt="">` : `<div class="pf-avatar pf-av-placeholder"></div>`;
  const rankIcon = rank === 1 ? '\u{1F947}' : rank === 2 ? '\u{1F948}' : rank === 3 ? '\u{1F949}' : `#${rank}`;

  let html = `
    <div class="pf-header">
      <button class="pf-back" onclick="go('league')">← الدوري</button>
      <div class="pf-avatar-wrap">${avHTML}<span class="pf-rank-badge">${rankIcon}</span></div>
      <h2 class="pf-name">${user.displayName}${isMe ? ' <span class="pf-you">(أنت)</span>' : ''}</h2>
      ${joinDate ? `<div class="pf-joined">انضم: ${joinDate}</div>` : ''}
      <div class="pf-total-pts">${totalPts}<span> نقطة</span></div>
      <div class="pf-rank-label">الترتيب ${rankIcon} من ${totalUsers} لاعب</div>
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
      <div class="pf-stat"><div class="pf-stat-icon">\u26A1</div><div class="pf-stat-val">${bestStreak}</div><div class="pf-stat-lbl">أطول سلسلة صح</div></div>
      <div class="pf-stat"><div class="pf-stat-icon">\u{1F3C5}</div><div class="pf-stat-val">${bonusCount}</div><div class="pf-stat-lbl">نقاط بونص</div></div>
      <div class="pf-stat"><div class="pf-stat-icon">\u26BD</div><div class="pf-stat-val">${totalPredicted}</div><div class="pf-stat-lbl">توقعات</div></div>
      <div class="pf-stat"><div class="pf-stat-icon">\u{1F3C6}</div><div class="pf-stat-val">${MATCHDAY_INFO[bestMD]?.name || '-'}</div><div class="pf-stat-lbl">أفضل جولة</div></div>
    </div>

    <div class="pf-golden-section">
      <div class="pf-golden-header">
        <span class="pf-golden-title">\u2605 المباراة الذهبية</span>
        <span class="pf-golden-summary">${goldenSuccess}/${goldenTotal} نجاح${goldenExact > 0 ? ` - ${goldenExact} دقيق` : ''} - ${goldenPts} نقطة</span>
      </div>`;

  [1, 2, 3].forEach(md => {
    const stats = mdStats[md];
    if (!stats || !stats.goldenMatch) return;
    const gMatch = stats.matches.find(m => m.isGolden);
    if (!gMatch) return;
    const home = TEAMS[gMatch.match.home], away = TEAMS[gMatch.match.away];
    const predStr = `${gMatch.pred.h} - ${gMatch.pred.a}`;
    const resultStr = gMatch.result ? `${gMatch.result.home} - ${gMatch.result.away}` : 'لم تلعب';
    let levelText = '', levelClass = '';
    if (gMatch.result) {
      levelClass = gMatch.level;
      levelText = gMatch.level === 'exact' ? 'دقيق' : gMatch.level === 'diff' ? 'فرق صح' : gMatch.level === 'correct' ? 'اتجاه صح' : 'خطأ';
    }
    html += `
      <div class="pf-golden-card">
        <div class="pf-golden-md">${MATCHDAY_INFO[md].name}</div>
        <div class="pf-golden-match"><img src="${flagUrl(home.iso)}" class="flag-sm" alt=""><span>${home.name}</span><span class="pf-golden-vs">\u2605</span><span>${away.name}</span><img src="${flagUrl(away.iso)}" class="flag-sm" alt=""></div>
        <div class="pf-golden-detail">
          <span>توقع: <strong>${predStr}</strong></span><span>نتيجة: <strong>${resultStr}</strong></span>
          ${gMatch.result ? `<span class="pf-golden-level ${levelClass}">${levelText} > +${gMatch.pts} (x2)</span>` : ''}
        </div>
      </div>`;
  });
  html += `</div>`;

  [1, 2, 3].forEach(md => {
    const info = MATCHDAY_INFO[md];
    const stats = mdStats[md];
    if (!stats || stats.matches.length === 0) return;
    const mdCorrect = stats.matches.filter(m => m.result && m.level !== 'wrong' && m.level !== 'none').length;
    const mdTotal = stats.matches.filter(m => m.result).length;

    html += `
    <div class="pf-md-card">
      <div class="pf-md-header">
        <div class="pf-md-left"><span class="pf-md-name">${info.name}</span><span class="pf-md-accuracy">${mdTotal > 0 ? Math.round(mdCorrect/mdTotal*100) : 0}% - ${mdCorrect}/${mdTotal}</span></div>
        <span class="pf-md-pts ${stats.pts > 0 ? 'positive' : stats.pts < 0 ? 'negative' : ''}">${stats.pts > 0 ? '+' : ''}${stats.pts}</span>
      </div>`;

    stats.matches.forEach(m => {
      const home = TEAMS[m.match.home], away = TEAMS[m.match.away];
      const predStr = `${m.pred.h} - ${m.pred.a}`;
      const resultStr = m.result ? `${m.result.home} - ${m.result.away}` : '\u2014';
      let levelClass = '', levelEmoji = '', ptsText = '';
      if (m.result) {
        levelClass = m.level;
        levelEmoji = m.level === 'exact' ? '\u{1F3AF}' : m.level === 'diff' ? '\u2705' : m.level === 'correct' ? '\u{1F44D}' : '\u274C';
        ptsText = m.pts > 0 ? `+${m.pts}` : '0';
      }

      html += `
      <div class="pf-match-row ${m.isGolden ? 'golden' : ''} ${levelClass}">
        <div class="pf-match-left">
          <span class="pf-match-emoji">${m.result ? levelEmoji : '\u23F3'}</span>
          <div class="pf-match-teams">
            <img src="${flagUrl(home.iso)}" class="flag-xs" alt="">
            <span>${home.name}</span>
            <span class="pf-vs">vs</span>
            <span>${away.name}</span>
            <img src="${flagUrl(away.iso)}" class="flag-xs" alt="">
            ${m.isGolden ? '<span class="pf-golden-star">\u2605</span>' : ''}
          </div>
        </div>
        <div class="pf-match-right">
          <div class="pf-match-nums"><span class="pf-pred-num">${predStr}</span><span class="pf-result-num">${resultStr}</span></div>
          ${m.result ? `<span class="pf-pts-chip ${levelClass}">${ptsText}${m.isGolden ? ' x2' : ''}${m.bonusPts > 0 ? ' +B' : ''}</span>` : ''}
        </div>
      </div>`;
    });

    if (stats.wrongCount >= 6) html += `<div class="pf-penalty">عقوبة 6 أخطاء: <strong>-2</strong></div>`;

    if (stats.rqQuestion) {
      html += `<div class="pf-rq-row">
        <div class="pf-rq-top"><span class="pf-rq-icon">?</span><span class="pf-rq-label">سؤال الجولة</span>
          ${stats.rqResult === 'correct' ? '<span class="pf-rq-badge correct">+3</span>' : stats.rqResult === 'wrong' ? '<span class="pf-rq-badge wrong">0</span>' : '<span class="pf-rq-badge pending">...</span>'}
        </div>
        <div class="pf-rq-q">${stats.rqQuestion}</div>
        ${stats.rqAnswer ? `<div class="pf-rq-answer">"${stats.rqAnswer}"</div>` : '<div class="pf-rq-answer dim">لم يجب</div>'}
      </div>`;
    }
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
  document.getElementById('header-profile-link')?.addEventListener('click', () => {
    if (currentUser) goProfile(currentUser.uid);
  });
  document.getElementById('hero-start-btn')?.addEventListener('click', () => go('predictions'));
  document.getElementById('hero-howto-btn')?.addEventListener('click', () => {
    document.getElementById('howto-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  buildAvatarGrid();
  loadResults();
  onAuthStateChanged(auth, onAuth);
}

init();
