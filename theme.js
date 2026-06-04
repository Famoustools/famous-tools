// ── ANTI-FLASH ──────────────────────────────────────────
// HTML ทุกหน้าฝัง <style id="admin-hide"> ซ่อน admin-item ไว้แล้ว
// JS แค่ลบ style นั้นออกถ้า user มีสิทธิ์ manage_user
(function() {
  const raw  = sessionStorage.getItem('permissions') || 'view';
  const perms = raw === 'all'
    ? ['view','add','edit','delete','manage_user','export']
    : raw.split(',').map(x => x.trim());
  if (perms.includes('manage_user')) {
    const el = document.getElementById('admin-hide');
    if (el) el.remove();
  }
})();

// ═══════════════════════════════════════════════════════
//   FAMOUS TOOLS — theme.js
//   Shared: Theme, Sidebar, API, Toast, Auth guard
// ═══════════════════════════════════════════════════════

// ── API ────────────────────────────────────────────────
const API_URL = 'https://script.google.com/macros/s/AKfycbyU3aHPX5OYHQnMnVa11ewP6sulAxY35ds5O5z6INNWjyfUVN74oIh54cIWKlAsQ9p0/exec';

function apiCall(params, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const cbName = 'cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      reject(new Error('timeout'));
      delete window[cbName];
      try { document.head.removeChild(script); } catch(e) {}
    }, timeoutMs);

    window[cbName] = function(data) {
      clearTimeout(timer);
      delete window[cbName];
      try { document.head.removeChild(script); } catch(e) {}
      resolve(data);
    };
    script.onerror = function() {
      clearTimeout(timer);
      delete window[cbName];
      reject(new Error('network'));
    };
    const qs = new URLSearchParams({ ...params, callback: cbName }).toString();
    script.src = `${API_URL}?${qs}`;
    document.head.appendChild(script);
  });
}

// ── THEME ──────────────────────────────────────────────
function applyTheme(mode) {
  if (!mode) mode = localStorage.getItem('themeMode') || 'light';
  if (mode === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('themeMode', mode);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = mode === 'light'
      ? '<i class="ti ti-moon" style="font-size:16px"></i>'
      : '<i class="ti ti-sun" style="font-size:16px"></i>';
    btn.title = mode === 'light' ? 'โหมดมืด' : 'โหมดสว่าง';
  }
}
function toggleTheme() {
  const cur = localStorage.getItem('themeMode') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

// ── SIDEBAR ────────────────────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const mn = document.getElementById('main');
  const ic = document.getElementById('collapse-icon');
  if (!sb) return;
  const isCollapsed = sb.classList.toggle('collapsed');
  if (mn) mn.classList.toggle('expanded', isCollapsed);
  if (ic) ic.className = isCollapsed ? 'ti ti-chevrons-right' : 'ti ti-chevrons-left';
  localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
}

// ── TOAST ──────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success:'ti-circle-check', error:'ti-alert-circle', info:'ti-info-circle', warn:'ti-alert-triangle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="ti ${icons[type] || icons.info}" style="font-size:16px"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── AUTH GUARD ─────────────────────────────────────────
function authGuard(requiredPerm) {
  const token = sessionStorage.getItem('token');
  if (!token) { window.location.href = 'index.html'; return false; }
  if (requiredPerm && !hasPerm(requiredPerm)) {
    showToast('คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'error');
    setTimeout(() => window.location.href = 'dashboard1.html', 1500);
    return false;
  }
  return true;
}

// ── PERMISSIONS ────────────────────────────────────────
function hasPerm(p) {
  const raw = sessionStorage.getItem('permissions') || 'view';
  const perms = raw === 'all'
    ? ['view','add','edit','delete','manage_user','export']
    : raw.split(',').map(x => x.trim());
  // ถ้ามีสิทธิ์ใดๆ ก็ถือว่า view ได้เสมอ
  if (p === 'view' && perms.length > 0) return true;
  return perms.includes(p);
}

function getPerms() {
  const raw = sessionStorage.getItem('permissions') || 'view';
  if (raw === 'all') return ['view','add','edit','delete','manage_user','export'];
  return raw.split(',').map(x => x.trim());
}

// ── LOGOUT ─────────────────────────────────────────────
function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('permissions');
  sessionStorage.removeItem('displayName');
  window.location.href = 'index.html';
}

// ── TOPBAR INIT ────────────────────────────────────────
function initTopbar() {
  const username    = sessionStorage.getItem('username') || '';
  const displayName = sessionStorage.getItem('displayName') || username;

  const navUser = document.getElementById('nav-username');
  if (navUser) navUser.textContent = displayName;

  const badge = document.getElementById('role-badge');
  if (badge) {
    // แสดงสิทธิ์สูงสุดที่มี แทน role name
    const perms = getPerms();
    let label = 'user', cls = 'rb-dynamic';
    if (perms.includes('manage_user')) { label = 'admin'; cls = 'rb-admin'; }
    else if (perms.includes('edit') || perms.includes('delete')) { label = 'manager'; cls = 'rb-manager'; }
    badge.textContent = label;
    badge.className = `role-badge ${cls}`;
  }

  // CSS ซ่อน .admin-item และ .menu-label-group ไว้ก่อนแล้วตั้งแต่ต้น
  // JS แค่ "เปิด" ให้เห็นถ้ามีสิทธิ์ => ไม่มี flash เลย
  if (hasPerm('manage_user')) {
    document.querySelectorAll('.admin-item').forEach(el => el.style.display = '');
    document.querySelectorAll('.menu-label-group').forEach(el => el.style.display = '');
  }
}

// ── AUTO INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  initTopbar();

  // restore sidebar state
  const sb = document.getElementById('sidebar');
  const mn = document.getElementById('main');
  const ic = document.getElementById('collapse-icon');
  if (sb && localStorage.getItem('sidebarCollapsed') === '1') {
    sb.classList.add('collapsed');
    if (mn) mn.classList.add('expanded');
    if (ic) ic.className = 'ti ti-chevrons-right';
  }

  // Stagger menu items
  if (sb) {
    sb.querySelectorAll('.menu-item').forEach((item, i) => {
      item.style.animationDelay = `${i * 35}ms`;
      item.classList.add('menu-enter');
    });
  }
});