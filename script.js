/* ==========================================================================
   Build with Zeno — script.js
   ========================================================================== */

// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyC0vXwGfFjXwKqFjXwKqFjXwKqFjXwKqFj", // (YOUR ACTUAL KEY FROM THE FILE)
  authDomain: "buildwithzeno.firebaseapp.com", // (YOUR ACTUAL DOMAIN FROM THE FILE)
  projectId: "buildwithzeno", // (YOUR ACTUAL PROJECT ID FROM THE FILE)
  storageBucket: "buildwithzeno.appspot.com", // (YOUR ACTUAL BUCKET FROM THE FILE)
  messagingSenderId: "123456789", // (YOUR ACTUAL SENDER ID FROM THE FILE)
  appId: "1:123456789:web:abcdef" // (YOUR ACTUAL APP ID FROM THE FILE)
};

// Initialize Firebase (using compat mode for standard HTML)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// 2. GLOBAL STATE & UTILITIES
const page = document.body.getAttribute('data-page');
let currentUser = null;
let userData = null;

const PLAN_PRICES = { pro: 1500, vip: 4000 };

function formatCurrency(amount) {
  return '₦' + amount.toLocaleString();
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// 3. NAVIGATION & HEADER INJECTION
function renderHeader() {
  const headerEl = document.getElementById('site-header');
  if (!headerEl) return;

  const links = [
    { name: 'Home', href: 'index.html', active: page === 'index' },
    { name: 'Guides', href: 'guides.html', active: page === 'guides' },
    { name: 'Pricing', href: 'pricing.html', active: page === 'pricing' },
    { name: 'Community', href: 'community.html', active: page === 'community' },
    { name: 'Contact', href: 'contact.html', active: page === 'contact' }
  ];

  let navHtml = `<div class="wrap"><nav class="nav">`;
  navHtml += `<a href="index.html" class="logo">Build with Zeno</a>`;
  
  navHtml += `<ul class="nav-links">`;
  links.forEach(l => {
    navHtml += `<li><a href="${l.href}" class="${l.active ? 'active' : ''}">${l.name}</a></li>`;
  });
  navHtml += `</ul>`;

  navHtml += `<div id="nav-auth-area">`;
  if (currentUser) {
    navHtml += `<a href="my-account.html" class="btn btn-primary nav-cta">My Account</a>`;
  } else {
    navHtml += `<a href="join.html" class="btn btn-primary nav-cta">Join now</a>`;
  }
  navHtml += `</div></nav></div>`;
  
  headerEl.innerHTML = navHtml;
}

function renderFooter() {
  const footerEl = document.getElementById('site-footer');
  if (!footerEl) return;
  footerEl.innerHTML = `
    <div class="wrap" style="padding: 40px 24px; text-align: center; border-top: 1px solid var(--border); margin-top: 60px;">
      <p class="small">© ${new Date().getFullYear()} Build with Zeno. All rights reserved.</p>
      <p class="small" style="margin-top: 8px;"><a href="terms.html" class="text-link">Terms of Use</a></p>
    </div>
  `;
}

// 4. AUTHENTICATION STATE LISTENER
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      userData = doc.data();
    }
  } else {
    currentUser = null;
    userData = null;
  }
  
  renderHeader();
  
  if (page === 'account') initAccountPage();
  if (page === 'library') initLibraryPage();
  if (page === 'requests') initRequestsPage();
  if (page === 'contact') initContactPage();
  if (page === 'admin') initAdminPage();
});

// 5. PAGE INITIALIZERS
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  
  if (page === 'index') initHomePage();
  if (page === 'join') initJoinPage();
  if (page === 'login') initLoginPage();
  if (page === 'guides') initGuidesPage();
  if (page === 'pricing') initPricingPage();
});

// --- HOME PAGE ---
async function initHomePage() {
  const container = document.getElementById('latest-guides');
  if (!container) return;

  try {
    const snapshot = await db.collection('guides').orderBy('publishDate', 'desc').limit(3).get();
    if (snapshot.empty) {
      container.innerHTML = `<div class="empty-state"><span class="glyph">▤</span><p>No guides published yet.</p></div>`;
      return;
    }
    
    let html = `<div class="feature-grid">`;
    snapshot.forEach(doc => {
      const g = doc.data();
      html += `
        <div class="feature">
          <h3>${g.title}</h3>
          <p>${g.description}</p>
          <a href="guides.html" class="text-link" style="margin-top:16px; display:inline-block;">Read guide →</a>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p class="error">Failed to load guides.</p>`;
  }
}

// --- JOIN PAGE ---
function initJoinPage() {
  const planSelect = document.getElementById('plan');
  const monthsSelect = document.getElementById('months');
  const sumPlan = document.getElementById('sum-plan');
  const sumMonths = document.getElementById('sum-months');
  const sumTotal = document.getElementById('sum-total');
  const agreeCheck = document.getElementById('agree');
  const submitBtn = document.getElementById('join-submit');
  const form = document.getElementById('join-form');
  const msg = document.getElementById('join-msg');

  function updateSummary() {
    const plan = planSelect.value;
    const months = parseInt(monthsSelect.value);
    const price = PLAN_PRICES[plan];
    const total = price * months;

    sumPlan.textContent = plan === 'pro' ? 'Pro' : 'VIP';
    sumMonths.textContent = months + (months === 1 ? ' month' : ' months');
    sumTotal.textContent = formatCurrency(total);
  }

  planSelect.addEventListener('change', updateSummary);
  monthsSelect.addEventListener('change', updateSummary);
  updateSummary();

  agreeCheck.addEventListener('change', () => {
    submitBtn.disabled = !agreeCheck.checked;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    msg.className = 'form-msg';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const plan = planSelect.value;
    const months = parseInt(monthsSelect.value);

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await db.collection('users').doc(user.uid).set({
        email: email,
        plan: plan,
        months: months,
        status: 'pending_payment',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      msg.textContent = 'Account created! Redirecting to payment...';
      msg.classList.add('show', 'ok');
      
      setTimeout(() => window.location.href = 'my-account.html', 1500);

    } catch (error) {
      msg.textContent = error.message;
      msg.classList.add('show', 'err');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
    }
  });
}

// --- LOGIN PAGE ---
function initLoginPage() {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('login-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-msg';
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = 'my-account.html';
    } catch (error) {
      msg.textContent = error.message;
      msg.classList.add('show', 'err');
    }
  });
}

// --- GUIDES PAGE ---
async function initGuidesPage() {
  const container = document.getElementById('all-guides');
  if (!container) return;

  try {
    const snapshot = await db.collection('guides').orderBy('publishDate', 'desc').get();
    if (snapshot.empty) {
      container.innerHTML = `<div class="empty-state"><span class="glyph">▤</span><p>No guides available yet.</p></div>`;
      return;
    }

    let html = `<div class="feature-grid">`;
    snapshot.forEach(doc => {
      const g = doc.data();
      const isMember = userData && userData.status === 'active';
      
      html += `
        <div class="feature">
          <h3>${g.title}</h3>
          <p>${g.description}</p>
          ${isMember 
            ? `<a href="#" class="btn btn-primary" style="margin-top:16px;" onclick="alert('Guide content would load here.')">Read Guide</a>`
            : `<a href="join.html" class="btn btn-ghost" style="margin-top:16px;">Join to read</a>`
          }
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p class="error">Error loading guides.</p>`;
  }
}

// --- PRICING PAGE ---
function initPricingPage() {
  const proMonths = document.getElementById('pro-months');
  const vipMonths = document.getElementById('vip-months');
  const proCta = document.getElementById('pro-cta');
  const vipCta = document.getElementById('vip-cta');

  function updateProLink() {
    proCta.href = `join.html?plan=pro&months=${proMonths.value}`;
  }
  function updateVipLink() {
    vipCta.href = `join.html?plan=vip&months=${vipMonths.value}`;
  }

  proMonths.addEventListener('change', updateProLink);
  vipMonths.addEventListener('change', updateVipLink);
}

// --- MY ACCOUNT PAGE ---
async function initAccountPage() {
  const gate = document.getElementById('account-gate');
  const panel = document.getElementById('account-panel');
  if (!currentUser) return;

  gate.style.display = 'none';
  panel.style.display = 'block';

  document.getElementById('acc-email').textContent = currentUser.email;
  
  if (userData) {
    document.getElementById('acc-plan').textContent = userData.plan.toUpperCase();
    
    if (userData.expiryDate) {
      document.getElementById('acc-expiry').textContent = formatDate(userData.expiryDate);
    } else {
      document.getElementById('acc-expiry').textContent = 'Pending payment';
    }

    if (userData.status === 'pending_payment') {
      document.getElementById('payment-block').style.display = 'block';
      document.getElementById('pending-box').style.display = 'block';
      
      const total = PLAN_PRICES[userData.plan] * userData.months;
      document.getElementById('pay-amount').value = total;
      document.getElementById('pay-plan').value = userData.plan;
      document.getElementById('pay-months').value = userData.months;
    }
  }

  const payForm = document.getElementById('payment-form');
  const payMsg = document.getElementById('pay-msg');
  if (payForm) {
    payForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      payMsg.className = 'form-msg';
      const btn = payForm.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Submitting...';

      try {
        await db.collection('payments').add({
          uid: currentUser.uid,
          email: currentUser.email,
          amount: parseInt(document.getElementById('pay-amount').value),
          bank: document.getElementById('pay-bank').value,
          reference: document.getElementById('pay-reference').value,
          plan: document.getElementById('pay-plan').value,
          months: parseInt(document.getElementById('pay-months').value),
          status: 'pending',
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        payMsg.textContent = "Payment details submitted! I'll verify and activate your account within 24 hours.";
        payMsg.classList.add('show', 'ok');
        payForm.reset();
      } catch (error) {
        payMsg.textContent = error.message;
        payMsg.classList.add('show', 'err');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit payment details';
      }
    });
  }

  document.getElementById('account-logout').addEventListener('click', () => {
    auth.signOut().then(() => window.location.href = 'index.html');
  });
}

// --- LIBRARY PAGE ---
function initLibraryPage() {
  const gate = document.getElementById('library-gate');
  const content = document.getElementById('library-content');
  
  if (!currentUser) {
    gate.innerHTML = `<div class="empty-state"><span class="glyph">◈</span><h3>Sign in required</h3><p>Sign in to access your library.</p><a href="login.html" class="btn btn-primary" style="margin-top:16px;">Sign in</a></div>`;
    return;
  }

  if (userData && userData.status !== 'active') {
    gate.innerHTML = `<div class="empty-state"><span class="glyph">◈</span><h3>Payment pending</h3><p>Your account is pending payment verification. Once activated, your library will appear here.</p><a href="my-account.html" class="btn btn-primary" style="margin-top:16px;">Go to My Account</a></div>`;
    return;
  }

  gate.style.display = 'none';
  content.style.display = 'block';
  document.getElementById('library-list').innerHTML = `<p class="small">Library functionality is ready to be connected to your guides database.</p>`;
}

// --- REQUESTS PAGE ---
function initRequestsPage() {
  const gate = document.getElementById('request-gate');
  const form = document.getElementById('request-form');
  
  if (!currentUser) {
    gate.innerHTML = `<div class="empty-state" style="margin-bottom:24px;"><p>You need an account to request a custom build.</p><a href="join.html" class="btn btn-primary" style="margin-top:12px;">Create account</a></div>`;
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('request-msg');
    msg.className = 'form-msg';
    const btn = form.querySelector('button');
    btn.disabled = true;

    try {
      await db.collection('requests').add({
        uid: currentUser.uid,
        email: currentUser.email,
        name: document.getElementById('r-name').value,
        need: document.getElementById('r-need').value,
        budget: document.getElementById('r-budget').value,
        status: 'new',
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      msg.textContent = "Request sent! I'll review it and get back to you.";
      msg.classList.add('show', 'ok');
      form.reset();
    } catch (error) {
      msg.textContent = error.message;
      msg.classList.add('show', 'err');
    } finally {
      btn.disabled = false;
    }
  });
}

// --- CONTACT PAGE ---
function initContactPage() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('feedback-msg');
    msg.className = 'form-msg';
    const btn = form.querySelector('button');
    btn.disabled = true;

    try {
      await db.collection('feedback').add({
        name: document.getElementById('c-name').value,
        email: document.getElementById('c-email').value,
        message: document.getElementById('c-message').value,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      msg.textContent = "Message sent! I'll get back to you soon.";
      msg.classList.add('show', 'ok');
      form.reset();
    } catch (error) {
      msg.textContent = "Something went wrong. Try again.";
      msg.classList.add('show', 'err');
    } finally {
      btn.disabled = false;
    }
  });
}

// --- ADMIN PAGE ---
function initAdminPage() {
  const loginForm = document.getElementById('admin-login-form');
  const loginBox = document.getElementById('admin-login');
  const shell = document.getElementById('admin-shell');
  const loginMsg = document.getElementById('admin-login-msg');

  if (currentUser) {
    loginBox.style.display = 'none';
    shell.style.display = 'block';
    document.getElementById('admin-whoami').textContent = currentUser.email;
    loadAdminData();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMsg.className = 'form-msg';
    try {
      await auth.signInWithEmailAndPassword(
        document.getElementById('a-email').value,
        document.getElementById('a-password').value
      );
      window.location.reload();
    } catch (error) {
      loginMsg.textContent = error.message;
      loginMsg.classList.add('show', 'err');
    }
  });

  document.getElementById('admin-logout').addEventListener('click', () => {
    auth.signOut().then(() => window.location.reload());
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

async function loadAdminData() {
  const guideList = document.getElementById('admin-guide-list');
  const guidesSnap = await db.collection('guides').orderBy('publishDate', 'desc').get();
  if (guidesSnap.empty) {
    guideList.innerHTML = '<p class="small">No guides published yet.</p>';
  } else {
    let html = '<div class="stack">';
    guidesSnap.forEach(doc => {
      const g = doc.data();
      html += `<div class="panel" style="padding:16px;"><strong>${g.title}</strong><br><span class="small">${formatDate(g.publishDate)}</span></div>`;
    });
    html += '</div>';
    guideList.innerHTML = html;
  }

  const payList = document.getElementById('admin-payments-list');
  const paySnap = await db.collection('payments').where('status', '==', 'pending').get();
  if (paySnap.empty) {
    payList.innerHTML = '<p class="small">No pending payments.</p>';
  } else {
    let html = '<div class="stack">';
    paySnap.forEach(doc => {
      const p = doc.data();
      html += `
        <div class="panel" style="padding:16px;">
          <p><strong>${p.email}</strong> sent ${formatCurrency(p.amount)}</p>
          <p class="small">Ref: ${p.reference} | Bank: ${p.bank} | Plan: ${p.plan} (${p.months} mo)</p>
          <button class="btn btn-primary btn-small" onclick="approvePayment('${doc.id}', '${p.uid}', ${p.months})">Approve Payment</button>
        </div>
      `;
    });
    html += '</div>';
    payList.innerHTML = html;
  }
}

window.approvePayment = async function(paymentDocId, uid, months) {
  if (!confirm('Approve this payment and activate the user?')) return;
  
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + months);

  try {
    await db.collection('users').doc(uid).update({
      status: 'active',
      expiryDate: expiry.toISOString()
    });
    await db.collection('payments').doc(paymentDocId).update({
      status: 'approved'
    });
    alert('Payment approved and user activated!');
    loadAdminData();
  } catch (error) {
    alert('Error approving payment: ' + error.message);
  }
};
