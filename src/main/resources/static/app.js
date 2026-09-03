// CarePulse Enterprise Frontend Core
const API_BASE_URL = window.location.origin + '/api';

const state = {
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
    role: localStorage.getItem('role') || null,
    currentView: 'dashboard'
};

// ----------------------------------------------------
// Core HTTP & Toast Utilities
// ----------------------------------------------------
async function authFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (response.status === 401) {
            showToast('Session expired. Please sign in.', 'error');
            handleLogout();
            throw new Error('Unauthorized');
        }
        if (response.status === 403) {
            showToast('Access Denied.', 'error');
            throw new Error('Forbidden');
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        return await response.json().catch(() => null);
    } catch (error) {
        if (error.message !== 'Unauthorized' && error.message !== 'Forbidden') showToast(error.message, 'error');
        throw error;
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 300); 
    }, 4000);
}

// ----------------------------------------------------
// Navigation & Mobile Drawer Helpers
// ----------------------------------------------------
function closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function openMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function applyRoleBasedNavigation() {
    const role = state.role || '';
    const permissions = {
        ADMIN: ['dashboard', 'patients', 'beds', 'admissions', 'lab', 'mar', 'ot', 'billing'],
        RECEPTIONIST: ['dashboard', 'patients', 'beds', 'admissions'],
        DOCTOR: ['dashboard', 'patients', 'beds', 'admissions', 'lab', 'mar', 'ot'],
        NURSE: ['dashboard', 'patients', 'beds', 'admissions', 'mar', 'ot'],
        LAB_TECHNICIAN: ['dashboard', 'lab'],
        ACCOUNTANT: ['dashboard', 'patients', 'admissions', 'billing'],
        PATIENT: ['dashboard', 'lab', 'billing']
    };
    const allowedViews = permissions[role] || ['dashboard'];

    document.querySelectorAll('.nav-item').forEach(button => {
        const view = button.getAttribute('data-view');
        button.classList.toggle('hidden', !allowedViews.includes(view));
    });
    if (!allowedViews.includes(state.currentView)) state.currentView = allowedViews[0];
}

function checkAuthState() {
    const loginModal = document.getElementById('login-modal');
    const appContainer = document.getElementById('app-container');

    if (!loginModal || !appContainer) return;

    if (state.token && state.username) {
        loginModal.classList.add('hidden');
        appContainer.classList.remove('hidden');

        const nameEl = document.getElementById('user-name-display');
        const initialEl = document.getElementById('user-avatar-initial');
        const roleBadge = document.getElementById('user-role-badge');

        if (nameEl) nameEl.innerText = state.username;
        if (initialEl) initialEl.innerText = state.username.charAt(0).toUpperCase();

        if (roleBadge) {
            roleBadge.innerText = state.role;
            roleBadge.className = `badge badge-${state.role ? state.role.toLowerCase() : 'admin'}`;
        }

        applyRoleBasedNavigation();
        loadView(state.currentView);
    } else {
        loginModal.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

function handleLogout() {
    state.token = null; 
    state.username = null; 
    state.role = null; 
    localStorage.clear(); 
    checkAuthState();
}

function loadView(viewName) {
    state.currentView = viewName;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    const titleMap = {
        dashboard: { title: 'Hospital Telemetry', sub: 'Real-time census, inpatient load & system health' },
        patients: { title: 'Patient Registry & Directory', sub: 'Patient onboarding, demographic indexing & records' },
        beds: { title: 'Ward & Bed Occupancy', sub: 'Infrastructure tracking & state management' },
        admissions: { title: 'Inpatient Admissions (IPD)', sub: 'Clinical check-in, assignment & bed locking' },
        lab: { title: 'Diagnostic Pathology', sub: 'Test requisitions & pathology reports' },
        mar: { title: 'Medication Record (MAR)', sub: 'Multi-drug prescription & nurse dosage logs' },
        ot: { title: 'Operation Theater Suite', sub: 'Surgical scheduling, room allocation & notes' },
        billing: { title: 'Inpatient Billing & Payments', sub: 'Tariff aggregation, counter settle & checkout' }
    };

    const header = titleMap[viewName] || { title: 'Hospital Management', sub: 'CarePulse Enterprise' };
    const titleEl = document.getElementById('view-title');
    const subEl = document.getElementById('view-subtitle');
    if (titleEl) titleEl.innerText = header.title;
    if (subEl) subEl.innerText = header.sub;

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (viewName === 'dashboard') renderDashboardOverview(mainContent);
    else if (viewName === 'patients') renderPatientsView(mainContent);
    else if (viewName === 'beds') renderBedsView(mainContent);
    else if (viewName === 'admissions') renderAdmissionsView(mainContent);
    else if (viewName === 'lab') renderLabView(mainContent);
    else if (viewName === 'mar') renderMarView(mainContent);
    else if (viewName === 'ot') renderOtView(mainContent);
    else if (viewName === 'billing') renderBillingView(mainContent);
}

// ----------------------------------------------------
// DOMContentLoaded: Master Lifecycle Controller
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Password Visibility Toggle (Delegated)
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.password-toggle-btn');
        if (!toggleBtn) return;

        const targetId = toggleBtn.getAttribute('data-target');
        const targetInput = document.getElementById(targetId);
        const icon = toggleBtn.querySelector('i');

        if (!targetInput) return;

        const isPassword = targetInput.type === 'password';
        targetInput.type = isPassword ? 'text' : 'password';

        toggleBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
        toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

        if (icon) {
            icon.classList.toggle('fa-eye', !isPassword);
            icon.classList.toggle('fa-eye-slash', isPassword);
        }
    });

    // 2. Auth Modal Tabs Switcher
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabLogin && tabRegister && loginForm && registerForm) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active-tab'); 
            tabLogin.classList.remove('inactive-tab');
            tabLogin.setAttribute('aria-selected', 'true');
            tabRegister.classList.remove('active-tab'); 
            tabRegister.classList.add('inactive-tab');
            tabRegister.setAttribute('aria-selected', 'false');
            loginForm.classList.remove('hidden'); 
            registerForm.classList.add('hidden');
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active-tab'); 
            tabRegister.classList.remove('inactive-tab');
            tabRegister.setAttribute('aria-selected', 'true');
            tabLogin.classList.remove('active-tab'); 
            tabLogin.classList.add('inactive-tab');
            tabLogin.setAttribute('aria-selected', 'false');
            registerForm.classList.remove('hidden'); 
            loginForm.classList.add('hidden');
        });
    }

    // 3. Password Verification Logic
    const regPassword = document.getElementById('reg-password');
    const regConfirm = document.getElementById('reg-confirm-password');
    const matchError = document.getElementById('password-match-error');

    function checkPasswordMatch() {
        if (!regPassword || !regConfirm) return true;
        if (regConfirm.value.length > 0 && regPassword.value !== regConfirm.value) {
            if (matchError) matchError.classList.remove('hidden');
            regConfirm.classList.add('input-invalid');
            return false;
        } else {
            if (matchError) matchError.classList.add('hidden');
            regConfirm.classList.remove('input-invalid');
            return true;
        }
    }

    if (regPassword && regConfirm) {
        regPassword.addEventListener('input', checkPasswordMatch);
        regConfirm.addEventListener('input', checkPasswordMatch);
    }

    // 4. Form Submissions
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: document.getElementById('login-username').value.trim(),
                        password: document.getElementById('login-password').value
                    })
                });
                if (!res.ok) throw new Error('Invalid credentials.');
                const data = await res.json();
                state.token = data.token; 
                state.username = data.username; 
                state.role = data.role;
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                showToast(`Signed in as ${data.username}`, 'success');
                checkAuthState();
            } catch (err) { 
                showToast(err.message, 'error'); 
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!checkPasswordMatch()) {
                showToast('Passwords do not match.', 'error');
                if (regConfirm) regConfirm.focus();
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/users`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: document.getElementById('reg-username').value.trim(),
                        email: document.getElementById('reg-email').value.trim(),
                        password: document.getElementById('reg-password').value,
                        role: document.getElementById('reg-role').value
                    })
                });
                if (!res.ok) throw new Error('Registration failed.');
                showToast('Account created. Please sign in.', 'success');
                registerForm.reset(); 
                if (tabLogin) tabLogin.click();
            } catch (err) { 
                showToast(err.message, 'error'); 
            }
        });
    }

    // 5. Layout & Navigation Event Listeners
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);

    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', openMobileSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            loadView(btn.getAttribute('data-view'));
            if (window.innerWidth <= 992) closeMobileSidebar();
        });
    });

    // 6. Bootstrap Initial Auth State
    checkAuthState();
});

// ----------------------------------------------------
// 1. Dashboard Overview
// ----------------------------------------------------
async function renderDashboardOverview(container) {
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
            <div class="ui-card" style="padding: 24px;">
                <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600;">Available Beds</span>
                <h3 id="stat-beds" style="font-size: 30px; margin-top: 8px; color: var(--accent-green);"><i class="fa-solid fa-spinner fa-spin"></i></h3>
            </div>
            <div class="ui-card" style="padding: 24px;">
                <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600;">Active Inpatients</span>
                <h3 id="stat-admissions" style="font-size: 30px; margin-top: 8px; color: var(--accent-primary);"><i class="fa-solid fa-spinner fa-spin"></i></h3>
            </div>
            <div class="ui-card" style="padding: 24px;">
                <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600;">Registered Patients</span>
                <h3 id="stat-patients" style="font-size: 30px; margin-top: 8px; color: var(--accent-purple);"><i class="fa-solid fa-spinner fa-spin"></i></h3>
            </div>
            <div class="ui-card" style="padding: 24px;">
                <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600;">System Status</span>
                <h3 style="font-size: 24px; margin-top: 8px; color: var(--accent-cyan); font-weight: 700;">OPERATIONAL</h3>
            </div>
        </div>
    `;
    try {
        const [beds, admissions, patients] = await Promise.all([
            authFetch('/infrastructure/beds/available'),
            authFetch('/admissions/active'),
            authFetch('/patients')
        ]);
        const bedsEl = document.getElementById('stat-beds');
        const admEl = document.getElementById('stat-admissions');
        const patEl = document.getElementById('stat-patients');
        if (bedsEl) bedsEl.innerText = beds ? beds.length : 0;
        if (admEl) admEl.innerText = admissions ? admissions.length : 0;
        if (patEl) patEl.innerText = patients ? patients.length : 0;
    } catch (e) {}
}

// ----------------------------------------------------
// 2. Patient Registry & Directory
// ----------------------------------------------------
async function renderPatientsView(container) {
    const canRegister = state.role === 'ADMIN' || state.role === 'RECEPTIONIST';

    container.innerHTML = `
        <div class="view-grid-layout" style="${!canRegister ? 'grid-template-columns: 1fr;' : ''}">
            ${canRegister ? `
            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-user-plus"></i> Register Patient</h3>
                </div>
                <form id="register-patient-form">
                    <div class="input-group">
                        <label>Full Name</label>
                        <input type="text" id="pat-fullname" class="ui-input" required placeholder="e.g. Rahul Sharma">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="input-group">
                            <label>Age</label>
                            <input type="number" id="pat-age" class="ui-input" min="0" max="130" required placeholder="32">
                        </div>
                        <div class="input-group">
                            <label>Gender</label>
                            <select id="pat-gender" class="ui-input" required>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="input-group">
                            <label>Blood Group</label>
                            <select id="pat-blood" class="ui-input" required>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Phone Number</label>
                            <input type="tel" id="pat-phone" class="ui-input" required placeholder="9876543210">
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Address</label>
                        <textarea id="pat-address" class="ui-input" rows="2" placeholder="Street, City, State"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        <i class="fa-solid fa-address-card"></i> Save & Generate Patient ID
                    </button>
                </form>
            </div>
            ` : ''}

            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-users"></i> Patient Master Directory</h3>
                    <button id="refresh-patients-btn" class="btn btn-xs" style="background: var(--bg-surface-hover); color: var(--text-main);">
                        <i class="fa-solid fa-rotate-right"></i> Refresh
                    </button>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Patient ID</th>
                                <th>Name</th>
                                <th>Demographics</th>
                                <th>Blood</th>
                                <th>Phone</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="patients-table-body">
                            <tr><td colspan="6" style="text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading directory...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    async function loadPatientsTable() {
        const tbody = document.getElementById('patients-table-body');
        if (!tbody) return;
        try {
            const patients = await authFetch('/patients');
            if (!patients || patients.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No patients registered yet.</td></tr>`;
                return;
            }
            tbody.innerHTML = patients.map(p => `
                <tr>
                    <td><b style="color: var(--accent-primary);">#${p.id}</b></td>
                    <td><span style="font-weight: 600;">${p.fullName}</span></td>
                    <td>${p.age} yrs / ${p.gender}</td>
                    <td><span class="badge badge-doctor">${p.bloodGroup || 'N/A'}</span></td>
                    <td>${p.contactNumber}</td>
                    <td>
                        <button onclick="copyToClipboard('${p.id}')" class="btn btn-xs" style="background: var(--bg-surface-hover); color: var(--text-main);">
                            <i class="fa-solid fa-copy"></i> Copy ID
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-rose); text-align: center;">Failed to load patient records.</td></tr>`;
        }
    }

    if (canRegister) {
        const patForm = document.getElementById('register-patient-form');
        if (patForm) {
            patForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    fullName: document.getElementById('pat-fullname').value.trim(),
                    age: parseInt(document.getElementById('pat-age').value),
                    gender: document.getElementById('pat-gender').value,
                    bloodGroup: document.getElementById('pat-blood').value,
                    contactNumber: document.getElementById('pat-phone').value.trim(),
                    address: document.getElementById('pat-address').value.trim()
                };

                try {
                    const res = await authFetch('/patients', { method: 'POST', body: JSON.stringify(payload) });
                    showToast(`Patient registered! Assigned ID #${res.id}`, 'success');
                    patForm.reset();
                    loadPatientsTable();
                } catch (err) {}
            });
        }
    }

    const refBtn = document.getElementById('refresh-patients-btn');
    if (refBtn) refBtn.addEventListener('click', loadPatientsTable);
    loadPatientsTable();
}

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text);
    showToast(`Patient ID #${text} copied to clipboard!`, 'info');
};

// ----------------------------------------------------
// 3. Ward & Beds
// ----------------------------------------------------
async function renderBedsView(container) {
    const isAdmin = state.role === 'ADMIN';

    container.innerHTML = `
        <div class="view-grid-layout" style="${!isAdmin ? 'grid-template-columns: 1fr;' : ''}">
            ${isAdmin ? `
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 24px;">
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-hospital"></i> Create Ward</h3></div>
                    <form id="create-ward-form">
                        <div class="input-group">
                            <label>Ward Name</label>
                            <input type="text" id="ward-name" class="ui-input" required placeholder="e.g. ICU Wing A">
                        </div>
                        <div class="input-group">
                            <label>Category</label>
                            <select id="ward-category" class="ui-input" required>
                                <option value="GENERAL">General</option>
                                <option value="ICU">ICU</option>
                                <option value="PRIVATE">Private</option>
                                <option value="SEMI_PRIVATE">Semi-Private</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Daily Tariff (₹)</label>
                            <input type="number" id="ward-rate" class="ui-input" min="1" step="1" required placeholder="2500">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Register Ward</button>
                    </form>
                </div>
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-bed"></i> Add Bed</h3></div>
                    <form id="add-bed-form">
                        <div class="input-group">
                            <label>Ward</label>
                            <select id="bed-ward-select" class="ui-input" required><option value="">Loading wards...</option></select>
                        </div>
                        <div class="input-group">
                            <label>Bed Number / Code</label>
                            <input type="text" id="bed-number" class="ui-input" required placeholder="e.g. ICU-01">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Add Bed</button>
                    </form>
                </div>
            </div>
            ` : ''}

            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-table-cells-large"></i> Bed Matrix</h3>
                    <button id="refresh-beds-btn" class="btn btn-xs" style="background: var(--bg-surface-hover); color: var(--text-main);"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
                </div>
                <div id="beds-container" class="beds-grid"><div style="color: var(--text-muted);">Loading beds...</div></div>
            </div>
        </div>
    `;

    async function loadWardsDropdown() {
        if (!isAdmin) return;
        const select = document.getElementById('bed-ward-select');
        if (!select) return;
        try {
            const wards = await authFetch('/infrastructure/wards');
            select.innerHTML = wards && wards.length > 0 ? wards.map(w => `<option value="${w.id}">${w.name} (₹${w.dailyRate})</option>`).join('') : `<option value="">No wards found.</option>`;
        } catch (e) { select.innerHTML = `<option value="">Error loading</option>`; }
    }

    async function loadBedsGrid() {
        const grid = document.getElementById('beds-container');
        if (!grid) return;
        try {
            const beds = await authFetch('/infrastructure/beds/available');
            if (!beds || beds.length === 0) { grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">No available beds.</div>`; return; }
            grid.innerHTML = beds.map(b => `
                <div class="bed-card ${b.status.toLowerCase()}">
                    <div class="bed-header"><span class="bed-title">${b.bedNumber}</span><span class="badge badge-nurse">${b.status}</span></div>
                    <div class="bed-ward">${b.wardName}</div>
                    <div class="bed-price">₹${b.dailyRate} / day</div>
                    ${(state.role === 'ADMIN' || state.role === 'NURSE') ? `<button onclick="toggleBedStatus(${b.id}, 'UNDER_MAINTENANCE')" class="btn btn-xs" style="background: rgba(245, 158, 11, 0.1); color: var(--accent-amber); margin-top: 8px;">Maintenance</button>` : ''}
                </div>
            `).join('');
        } catch (e) { grid.innerHTML = `<div style="color: var(--accent-rose);">Failed to load.</div>`; }
    }

    if (isAdmin) {
        const cWard = document.getElementById('create-ward-form');
        if (cWard) {
            cWard.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await authFetch('/infrastructure/wards', { 
                        method: 'POST', 
                        body: JSON.stringify({ 
                            name: document.getElementById('ward-name').value.trim(), 
                            category: document.getElementById('ward-category').value, 
                            dailyRate: parseFloat(document.getElementById('ward-rate').value) 
                        }) 
                    });
                    showToast('Ward created!', 'success'); 
                    cWard.reset(); 
                    loadWardsDropdown();
                } catch (err) {}
            });
        }

        const aBed = document.getElementById('add-bed-form');
        if (aBed) {
            aBed.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await authFetch('/infrastructure/beds', { 
                        method: 'POST', 
                        body: JSON.stringify({ 
                            wardId: parseInt(document.getElementById('bed-ward-select').value), 
                            bedNumber: document.getElementById('bed-number').value.trim() 
                        }) 
                    });
                    showToast('Bed added!', 'success'); 
                    document.getElementById('bed-number').value = ''; 
                    loadBedsGrid();
                } catch (err) {}
            });
        }
    }

    const refBeds = document.getElementById('refresh-beds-btn');
    if (refBeds) refBeds.addEventListener('click', loadBedsGrid);
    loadWardsDropdown(); 
    loadBedsGrid();
}

window.toggleBedStatus = async function(bedId, status) {
    try { 
        await authFetch(`/infrastructure/beds/${bedId}/status?status=${status}`, { method: 'PATCH' }); 
        showToast(`Bed status updated.`, 'success'); 
        loadView('beds'); 
    } catch (err) {}
};

// ----------------------------------------------------
// 4. Inpatient Admissions (IPD)
// ----------------------------------------------------
async function renderAdmissionsView(container) {
    const canAdmit = state.role === 'ADMIN' || state.role === 'RECEPTIONIST';
    container.innerHTML = `
        <div class="view-grid-layout" style="${!canAdmit ? 'grid-template-columns: 1fr;' : ''}">
            ${canAdmit ? `
            <div class="ui-card panel-card">
                <div class="panel-header"><h3><i class="fa-solid fa-user-plus"></i> Inpatient Admission</h3></div>
                <form id="admit-patient-form">
                    <div class="input-group">
                        <label>Registered Patient ID</label>
                        <input type="number" id="admit-patient-id" class="ui-input" min="1" required placeholder="e.g. 1">
                    </div>
                    <div class="input-group">
                        <label>Attending Doctor ID</label>
                        <input type="number" id="admit-doctor-id" class="ui-input" min="1" required placeholder="e.g. 1">
                    </div>
                    <div class="input-group">
                        <label>Allocate Available Bed</label>
                        <select id="admit-bed-select" class="ui-input" required><option value="">Loading beds...</option></select>
                    </div>
                    <div class="input-group">
                        <label>Admission Diagnosis</label>
                        <textarea id="admit-diagnosis" class="ui-input" rows="3" required placeholder="Provisional clinical assessment"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Admit & Lock Bed</button>
                </form>
            </div>
            ` : ''}

            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-procedures"></i> Active Inpatient Census</h3>
                    <button id="refresh-admissions-btn" class="btn btn-xs" style="background: var(--bg-surface-hover); color: var(--text-main);"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead><tr><th>Adm ID</th><th>Patient</th><th>Doctor</th><th>Ward/Bed</th><th>Diagnosis</th><th>Date</th><th>Action</th></tr></thead>
                        <tbody id="admissions-table-body"><tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Loading...</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    async function loadAvailableBedsDropdown() {
        if (!canAdmit) return;
        const select = document.getElementById('admit-bed-select');
        if (!select) return;
        try {
            const beds = await authFetch('/infrastructure/beds/available');
            select.innerHTML = beds && beds.length > 0 ? beds.map(b => `<option value="${b.id}">${b.bedNumber} — ${b.wardName}</option>`).join('') : `<option value="">No beds available.</option>`;
        } catch (e) { select.innerHTML = `<option value="">Error</option>`; }
    }

    async function loadActiveAdmissionsTable() {
        const tbody = document.getElementById('admissions-table-body');
        if (!tbody) return;
        try {
            const admissions = await authFetch('/admissions/active');
            if (!admissions || admissions.length === 0) { tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No active inpatients.</td></tr>`; return; }
            tbody.innerHTML = admissions.map(a => `
                <tr>
                    <td><b>#${a.id}</b></td><td>Patient #${a.patientId}</td><td>Dr. #${a.doctorId}</td>
                    <td><span style="color: var(--accent-primary); font-weight: 600;">${a.bedNumber}</span><div style="font-size:11px; color:var(--text-muted);">${a.wardName}</div></td>
                    <td>${a.diagnosis}</td><td>${new Date(a.admissionTime).toLocaleDateString()}</td>
                    <td>${(state.role === 'ADMIN' || state.role === 'DOCTOR' || state.role === 'RECEPTIONIST') ? `<button onclick="promptDischarge(${a.id})" class="btn btn-xs btn-danger-subtle">Discharge</button>` : 'Active'}</td>
                </tr>
            `).join('');
        } catch (e) { tbody.innerHTML = `<tr><td colspan="7" style="color: var(--accent-rose); text-align:center;">Failed to load.</td></tr>`; }
    }

    if (canAdmit) {
        const admitForm = document.getElementById('admit-patient-form');
        if (admitForm) {
            admitForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await authFetch('/admissions', {
                        method: 'POST',
                        body: JSON.stringify({
                            patientId: parseInt(document.getElementById('admit-patient-id').value),
                            doctorId: parseInt(document.getElementById('admit-doctor-id').value),
                            bedId: parseInt(document.getElementById('admit-bed-select').value),
                            diagnosis: document.getElementById('admit-diagnosis').value.trim()
                        })
                    });
                    showToast('Patient admitted and bed locked!', 'success');
                    admitForm.reset();
                    loadAvailableBedsDropdown();
                    loadActiveAdmissionsTable();
                } catch (err) {}
            });
        }
    }

    const refAdm = document.getElementById('refresh-admissions-btn');
    if (refAdm) {
        refAdm.addEventListener('click', () => { 
            loadAvailableBedsDropdown(); 
            loadActiveAdmissionsTable(); 
        });
    }
    loadAvailableBedsDropdown(); 
    loadActiveAdmissionsTable();
}

window.promptDischarge = async function(admissionId) {
    const notes = prompt("Enter clinical discharge notes:");
    if (notes === null) return;
    try {
        await authFetch(`/admissions/${admissionId}/discharge`, {
            method: 'PATCH',
            body: JSON.stringify({ dischargeNotes: notes || "Discharged in stable condition." })
        });
        showToast('Patient discharged and bed released!', 'success');
        loadView('admissions');
    } catch (err) {}
};

// ----------------------------------------------------
// 5. Diagnostic Lab View
// ----------------------------------------------------
async function renderLabView(container) {
    const isAdmin = state.role === 'ADMIN';
    const isDoctor = state.role === 'DOCTOR' || isAdmin;
    const isLabTech = state.role === 'LAB_TECHNICIAN' || isAdmin;

    container.innerHTML = `
        <div class="view-grid-layout" style="${(!isAdmin && !isDoctor) ? 'grid-template-columns: 1fr;' : ''}">
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 24px;">
                ${isAdmin ? `
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-plus-circle"></i> Add Test to Catalog</h3></div>
                    <form id="create-lab-test-form">
                        <div class="input-group"><label>Test Name</label><input type="text" id="test-name" class="ui-input" required placeholder="e.g. Complete Blood Count"></div>
                        <div class="input-group"><label>Tariff (₹)</label><input type="number" id="test-price" class="ui-input" required placeholder="350"></div>
                        <button type="submit" class="btn btn-primary btn-block">Add to Catalog</button>
                    </form>
                </div>
                ` : ''}

                ${isDoctor ? `
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-flask-vial"></i> Order Test</h3></div>
                    <form id="order-lab-form">
                        <div class="input-group"><label>Admission ID</label><input type="number" id="lab-order-admission-id" class="ui-input" required placeholder="Adm ID"></div>
                        <div class="input-group"><label>Doctor ID</label><input type="number" id="lab-order-doctor-id" class="ui-input" required placeholder="Doc ID"></div>
                        <div class="input-group"><label>Test</label><select id="lab-test-select" class="ui-input" required></select></div>
                        <div class="input-group"><label>Priority</label><select id="lab-order-priority" class="ui-input" required><option value="ROUTINE">ROUTINE</option><option value="URGENT">URGENT</option><option value="STAT">STAT</option></select></div>
                        <button type="submit" class="btn btn-primary btn-block">Requisition Test</button>
                    </form>
                </div>
                ` : ''}
            </div>

            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-microscope"></i> Lab Orders</h3>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="lookup-lab-adm-id" class="ui-input" placeholder="Adm ID" style="width: 100px; padding: 6px 10px; height: 32px;">
                        <button id="fetch-lab-orders-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead><tr><th>Order ID</th><th>Test</th><th>Priority</th><th>Status</th><th>Findings</th><th>Action</th></tr></thead>
                        <tbody id="lab-orders-table-body"><tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Enter Admission ID to load orders.</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    async function loadTestCatalogDropdown() {
        if (!isDoctor) return;
        const select = document.getElementById('lab-test-select');
        if (!select) return;
        try {
            const tests = await authFetch('/lab/tests');
            select.innerHTML = tests && tests.length > 0 ? tests.map(t => `<option value="${t.id}">${t.testName} (₹${t.price})</option>`).join('') : '<option value="">No tests</option>';
        } catch (e) {}
    }

    async function fetchLabOrders(admId) {
        const tbody = document.getElementById('lab-orders-table-body');
        if (!tbody) return;
        try {
            const orders = await authFetch(`/lab/orders/admission/${admId}`);
            if (!orders || orders.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">No orders found for #${admId}.</td></tr>`; return; }
            tbody.innerHTML = orders.map(o => `
                <tr>
                    <td><b>#${o.id}</b></td><td><span style="font-weight:600;">${o.testName}</span><div style="font-size:11px; color:var(--text-muted);">₹${o.price}</div></td>
                    <td><span class="badge badge-${o.priority.toLowerCase()}">${o.priority}</span></td><td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                    <td>${o.resultFindings ? `<span style="font-size: 12px; color: var(--accent-green);">${o.resultFindings}</span>` : `<span style="color: var(--text-dim); font-size: 12px;">Pending</span>`}</td>
                    <td>${(o.status !== 'COMPLETED' && isLabTech) ? `<button onclick="publishLabResult(${o.id}, ${admId})" class="btn btn-xs" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-green);">Publish</button>` : `<span style="color: var(--text-dim); font-size: 12px;">${o.status}</span>`}</td>
                </tr>
            `).join('');
        } catch (e) { tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-rose); text-align: center;">Failed to load.</td></tr>`; }
    }

    if (isAdmin) {
        const cLab = document.getElementById('create-lab-test-form');
        if (cLab) {
            cLab.addEventListener('submit', async (e) => {
                e.preventDefault();
                try { 
                    await authFetch('/lab/tests', { 
                        method: 'POST', 
                        body: JSON.stringify({ 
                            testName: document.getElementById('test-name').value.trim(), 
                            price: parseFloat(document.getElementById('test-price').value) 
                        }) 
                    }); 
                    showToast('Test added!', 'success'); 
                    loadTestCatalogDropdown(); 
                } catch (err) {}
            });
        }
    }

    if (isDoctor) {
        const oLab = document.getElementById('order-lab-form');
        if (oLab) {
            oLab.addEventListener('submit', async (e) => {
                e.preventDefault();
                const admId = parseInt(document.getElementById('lab-order-admission-id').value);
                try { 
                    await authFetch('/lab/orders', { 
                        method: 'POST', 
                        body: JSON.stringify({ 
                            admissionId: admId, 
                            doctorId: parseInt(document.getElementById('lab-order-doctor-id').value), 
                            testId: parseInt(document.getElementById('lab-test-select').value), 
                            priority: document.getElementById('lab-order-priority').value 
                        }) 
                    }); 
                    showToast('Order placed!', 'success'); 
                    fetchLabOrders(admId); 
                } catch (err) {}
            });
        }
    }

    const fetchBtn = document.getElementById('fetch-lab-orders-btn');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', () => { 
            const id = document.getElementById('lookup-lab-adm-id').value; 
            if(id) fetchLabOrders(id); 
        });
    }
    loadTestCatalogDropdown();
}

window.publishLabResult = async function(orderId, admId) {
    const findings = prompt("Enter clinical pathology findings:");
    if (!findings) return;
    try { 
        await authFetch(`/lab/orders/${orderId}/results`, { 
            method: 'PATCH', 
            body: JSON.stringify({ resultFindings: findings }) 
        }); 
        showToast('Results published!', 'success'); 
        const fetchBtn = document.getElementById('fetch-lab-orders-btn');
        if (fetchBtn) fetchBtn.click(); 
    } catch (err) {}
};

// ----------------------------------------------------
// 6. Medication Administration Record (MAR)
// ----------------------------------------------------
async function renderMarView(container) {
    const canPrescribe = state.role === 'DOCTOR' || state.role === 'ADMIN';
    const canAdminister = state.role === 'NURSE' || state.role === 'ADMIN';

    container.innerHTML = `
        <div class="view-grid-layout" style="${!canPrescribe ? 'grid-template-columns: 1fr;' : ''}">
            ${canPrescribe ? `
            <div class="ui-card panel-card">
                <div class="panel-header"><h3><i class="fa-solid fa-prescription"></i> Multi-Drug Prescription</h3></div>
                <form id="bulk-prescribe-form">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div class="input-group" style="margin:0;"><label>Admission ID</label><input type="number" id="mar-adm-id" class="ui-input" required placeholder="Adm ID"></div>
                        <div class="input-group" style="margin:0;"><label>Doctor ID</label><input type="number" id="mar-doc-id" class="ui-input" required placeholder="Doc ID"></div>
                    </div>
                    <div class="panel-header" style="margin-bottom: 12px; padding-bottom: 8px;">
                        <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">MEDICATION ITEMS</span>
                        <button type="button" onclick="addMedicineRow()" class="btn btn-xs" style="background: rgba(59, 130, 246, 0.1); color: var(--accent-primary);"><i class="fa-solid fa-plus"></i> Add Row</button>
                    </div>
                    <div id="medicine-items-repeater" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;"></div>
                    <button type="submit" class="btn btn-primary btn-block">Submit Prescription Sheet</button>
                </form>
            </div>
            ` : ''}

            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-syringe"></i> Administration Log</h3>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="lookup-mar-adm-id" class="ui-input" placeholder="Adm ID" style="width: 100px; padding: 6px 10px; height: 32px;">
                        <button id="fetch-mar-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead><tr><th>Rx ID</th><th>Medicine</th><th>Route/Freq</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody id="mar-table-body"><tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Enter Admission ID to load logs.</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    window.addMedicineRow = function() {
        const repeater = document.getElementById('medicine-items-repeater');
        if (!repeater) return;
        const row = document.createElement('div');
        row.className = 'med-item-row';
        row.style.cssText = 'padding: 12px; background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 8px;';
        row.innerHTML = `
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px;">
                <input type="text" class="ui-input med-name" placeholder="Drug & Strength (e.g. Paracetamol 500mg)" required>
                <input type="text" class="ui-input med-dosage" placeholder="Dose (e.g. 1 Tab)" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <select class="ui-input med-route" required><option value="ORAL">ORAL</option><option value="INTRAVENOUS">IV</option><option value="INTRAMUSCULAR">IM</option></select>
                <input type="text" class="ui-input med-frequency" placeholder="Freq (TDS)" required>
                <input type="number" class="ui-input med-price" min="1" placeholder="Price (₹)" required>
            </div>
            ${repeater.children.length > 0 ? `<button type="button" onclick="this.closest('.med-item-row').remove()" class="btn btn-xs btn-danger-subtle" style="align-self: flex-end;"><i class="fa-solid fa-trash"></i></button>` : ''}
        `;
        repeater.appendChild(row);
    };

    if (canPrescribe) {
        window.addMedicineRow();
        const bulkForm = document.getElementById('bulk-prescribe-form');
        if (bulkForm) {
            bulkForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const admId = parseInt(document.getElementById('mar-adm-id').value);
                const items = Array.from(document.querySelectorAll('.med-item-row')).map(row => ({
                    admissionId: admId,
                    doctorId: parseInt(document.getElementById('mar-doc-id').value),
                    medicineName: row.querySelector('.med-name').value.trim(),
                    dosage: row.querySelector('.med-dosage').value.trim(),
                    route: row.querySelector('.med-route').value,
                    frequency: row.querySelector('.med-frequency').value.trim(),
                    unitPrice: parseFloat(row.querySelector('.med-price').value)
                }));
                try {
                    await authFetch('/mar/prescriptions/bulk', { method: 'POST', body: JSON.stringify({ prescriptions: items }) });
                    showToast('Prescriptions recorded!', 'success');
                    document.getElementById('medicine-items-repeater').innerHTML = '';
                    window.addMedicineRow();
                    document.getElementById('lookup-mar-adm-id').value = admId;
                    const fBtn = document.getElementById('fetch-mar-btn');
                    if (fBtn) fBtn.click();
                } catch (err) {}
            });
        }
    }

    const fMarBtn = document.getElementById('fetch-mar-btn');
    if (fMarBtn) {
        fMarBtn.addEventListener('click', async () => {
            const admId = document.getElementById('lookup-mar-adm-id').value;
            if (!admId) return;
            const tbody = document.getElementById('mar-table-body');
            if (!tbody) return;
            try {
                const meds = await authFetch(`/mar/admissions/${admId}`);
                if (!meds || meds.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">No medications found.</td></tr>`; return; }
                tbody.innerHTML = meds.map(m => `
                    <tr>
                        <td><b>#${m.id}</b></td><td><span style="font-weight:600;">${m.medicineName}</span><div style="font-size:11px; color:var(--text-muted);">${m.dosage}</div></td>
                        <td><span class="badge badge-doctor">${m.route}</span><div style="font-size:11px; color:var(--text-muted); margin-top:4px;">${m.frequency}</div></td>
                        <td><span style="color:var(--accent-primary); font-weight:600;">₹${m.unitPrice}</span></td>
                        <td>${m.dispensed ? `<span class="badge badge-completed">Given</span>` : `<span class="badge badge-pending">Pending</span>`}</td>
                        <td>${(!m.dispensed && canAdminister) ? `<button onclick="administerDose(${m.id}, ${admId})" class="btn btn-xs" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-green);">Administer</button>` : `<span style="font-size:12px; color:var(--text-dim);">${m.dispensed ? 'Done' : 'Waiting'}</span>`}</td>
                    </tr>
                `).join('');
            } catch (e) { tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-rose); text-align: center;">Failed to load.</td></tr>`; }
        });
    }
}

window.administerDose = async function(orderId, admId) {
    try {
        await authFetch(`/mar/orders/${orderId}/administer`, { 
            method: 'PATCH', 
            body: JSON.stringify({ nurseId: 1, administrationNotes: "Administered as prescribed." }) 
        });
        showToast('Dose administered!', 'success');
        const fBtn = document.getElementById('fetch-mar-btn');
        if (fBtn) fBtn.click();
    } catch (err) {}
};

// ----------------------------------------------------
// 7. OT Suite
// ----------------------------------------------------
async function renderOtView(container) {
    const isAdmin = state.role === 'ADMIN';
    const isDoctor = state.role === 'DOCTOR' || isAdmin;
    container.innerHTML = `
        <div class="view-grid-layout" style="${(!isAdmin && !isDoctor) ? 'grid-template-columns: 1fr;' : ''}">
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 24px;">
                ${isAdmin ? `
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-door-open"></i> Register OT</h3></div>
                    <form id="create-ot-room-form">
                        <div class="input-group"><label>Room Number</label><input type="text" id="ot-room-number" class="ui-input" required placeholder="e.g. OT-01"></div>
                        <div class="input-group"><label>Specialty</label><input type="text" id="ot-room-type" class="ui-input" required placeholder="General / Cardiac"></div>
                        <button type="submit" class="btn btn-primary btn-block">Register OT</button>
                    </form>
                </div>` : ''}

                ${isDoctor ? `
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-calendar-plus"></i> Schedule Surgery</h3></div>
                    <form id="schedule-surgery-form">
                        <div class="input-group"><label>OT Room</label><select id="ot-room-select" class="ui-input" required></select></div>
                        <div class="input-group"><label>Admission ID</label><input type="number" id="ot-admission-id" class="ui-input" required placeholder="Adm ID"></div>
                        <div class="input-group"><label>Lead Surgeon ID</label><input type="number" id="ot-surgeon-id" class="ui-input" required placeholder="Doc ID"></div>
                        <div class="input-group"><label>Procedure Name</label><input type="text" id="ot-procedure-name" class="ui-input" required placeholder="Procedure"></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div class="input-group"><label>Start Time</label><input type="datetime-local" id="ot-start-time" class="ui-input" required></div>
                            <div class="input-group"><label>End Time</label><input type="datetime-local" id="ot-end-time" class="ui-input" required></div>
                        </div>
                        <div class="input-group"><label>Tariff (₹)</label><input type="number" id="ot-charge" class="ui-input" required placeholder="25000"></div>
                        <button type="submit" class="btn btn-primary btn-block">Schedule Surgery</button>
                    </form>
                </div>` : ''}
            </div>

            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-clock-rotate-left"></i> Surgical Schedules</h3>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="lookup-ot-adm-id" class="ui-input" placeholder="Adm ID" style="width: 100px; padding: 6px 10px; height: 32px;">
                        <button id="fetch-ot-schedules-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead><tr><th>ID</th><th>Room</th><th>Procedure</th><th>Surgeon</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody id="ot-schedules-table-body"><tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Enter Admission ID to load.</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    async function loadOtRoomsDropdown() {
        if (!isDoctor) return;
        const select = document.getElementById('ot-room-select');
        if (!select) return;
        try {
            const rooms = await authFetch('/ot/rooms');
            select.innerHTML = rooms && rooms.length > 0 ? rooms.map(r => `<option value="${r.id}">${r.roomNumber} (${r.roomType})</option>`).join('') : '<option value="">No rooms</option>';
        } catch (e) {}
    }

    if (isAdmin) {
        const cOt = document.getElementById('create-ot-room-form');
        if (cOt) {
            cOt.addEventListener('submit', async (e) => {
                e.preventDefault();
                try { 
                    await authFetch('/ot/rooms', { 
                        method: 'POST', 
                        body: JSON.stringify({ 
                            roomNumber: document.getElementById('ot-room-number').value.trim(), 
                            roomType: document.getElementById('ot-room-type').value.trim() 
                        }) 
                    }); 
                    showToast('OT Room registered!', 'success'); 
                    loadOtRoomsDropdown(); 
                } catch (err) {}
            });
        }
    }

    if (isDoctor) {
        const sSurg = document.getElementById('schedule-surgery-form');
        if (sSurg) {
            sSurg.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await authFetch('/ot/schedules', {
                        method: 'POST',
                        body: JSON.stringify({
                            otRoomId: parseInt(document.getElementById('ot-room-select').value),
                            admissionId: parseInt(document.getElementById('ot-admission-id').value),
                            leadSurgeonId: parseInt(document.getElementById('ot-surgeon-id').value),
                            procedureName: document.getElementById('ot-procedure-name').value.trim(),
                            startTime: document.getElementById('ot-start-time').value,
                            endTime: document.getElementById('ot-end-time').value,
                            procedureCharge: parseFloat(document.getElementById('ot-charge').value)
                        })
                    });
                    showToast('Surgery scheduled!', 'success');
                    document.getElementById('lookup-ot-adm-id').value = document.getElementById('ot-admission-id').value;
                    const fBtn = document.getElementById('fetch-ot-schedules-btn');
                    if (fBtn) fBtn.click();
                } catch (err) {}
            });
        }
    }

    const fOtBtn = document.getElementById('fetch-ot-schedules-btn');
    if (fOtBtn) {
        fOtBtn.addEventListener('click', async () => {
            const admId = document.getElementById('lookup-ot-adm-id').value;
            const tbody = document.getElementById('ot-schedules-table-body');
            if(!admId || !tbody) return;
            try {
                const schedules = await authFetch(`/ot/schedules/admission/${admId}`);
                if (!schedules || schedules.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">No surgeries found.</td></tr>`; return; }
                tbody.innerHTML = schedules.map(s => `
                    <tr>
                        <td><b>#${s.id}</b></td><td><span style="font-weight:600;">${s.roomNumber}</span></td>
                        <td><span style="font-weight:600;">${s.procedureName}</span><div style="font-size:11px; color:var(--accent-primary);">₹${s.procedureCharge}</div></td>
                        <td>Dr. #${s.leadSurgeonId}</td>
                        <td><span class="badge badge-${s.status.toLowerCase()}">${s.status}</span></td>
                        <td>
                            ${isDoctor ? `
                                <div style="display: flex; gap: 6px;">
                                    ${s.status === 'SCHEDULED' ? `<button onclick="updateOtStatus(${s.id}, 'IN_PROGRESS', ${admId})" class="btn btn-xs" style="background: rgba(245, 158, 11, 0.1); color: var(--accent-amber);">Start</button>` : ''}
                                    ${s.status === 'IN_PROGRESS' ? `<button onclick="completeSurgeryModal(${s.id}, ${admId})" class="btn btn-xs" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-green);">Finish</button>` : ''}
                                </div>
                            ` : ''}
                        </td>
                    </tr>
                `).join('');
            } catch (e) { tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-rose); text-align: center;">Failed to load.</td></tr>`; }
        });
    }

    loadOtRoomsDropdown();
}

window.updateOtStatus = async function(id, status, admId) { 
    try { 
        await authFetch(`/ot/schedules/${id}/status?status=${status}`, { method: 'PATCH' }); 
        const fBtn = document.getElementById('fetch-ot-schedules-btn');
        if (fBtn) fBtn.click(); 
    } catch (err) {} 
};

window.completeSurgeryModal = async function(id, admId) { 
    try { 
        await authFetch(`/ot/schedules/${id}/complete`, { 
            method: 'PATCH', 
            body: JSON.stringify({ surgicalNotes: "Completed without complications." }) 
        }); 
        const fBtn = document.getElementById('fetch-ot-schedules-btn');
        if (fBtn) fBtn.click(); 
    } catch (err) {} 
};

// ----------------------------------------------------
// 8. Inpatient Billing & Razorpay Checkout
// ----------------------------------------------------
async function renderBillingView(container) {
    const canSettle = state.role === 'ADMIN' || state.role === 'ACCOUNTANT';
    container.innerHTML = `
        <div class="view-grid-layout" style="${!canSettle ? 'grid-template-columns: 1fr;' : ''}">
            ${canSettle ? `
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 24px;">
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-calculator"></i> Aggregate & Generate Bill</h3></div>
                    <form id="generate-invoice-form">
                        <div class="input-group"><label>Admission ID</label><input type="number" id="bill-admission-id" class="ui-input" required placeholder="Adm ID"></div>
                        <button type="submit" class="btn btn-primary btn-block">Generate Invoice</button>
                    </form>
                </div>
                <div class="ui-card panel-card">
                    <div class="panel-header"><h3><i class="fa-solid fa-money-bill-wave"></i> Offline Settlement</h3></div>
                    <form id="settle-offline-form">
                        <div class="input-group"><label>Invoice ID</label><input type="number" id="offline-invoice-id" class="ui-input" required placeholder="Invoice ID"></div>
                        <div class="input-group"><label>Payment Mode</label><select id="offline-payment-mode" class="ui-input" required><option value="CASH">CASH</option><option value="INSURANCE">INSURANCE</option></select></div>
                        <button type="submit" class="btn btn-block" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.3);">Settle Bill</button>
                    </form>
                </div>
            </div>` : ''}

            <div class="ui-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-file-invoice-dollar"></i> Inpatient Invoice Summary</h3>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="lookup-bill-adm-id" class="ui-input" placeholder="Adm ID" style="width: 100px; padding: 6px 10px; height: 32px;">
                        <button id="fetch-invoice-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>
                <div id="invoice-display-container"><div style="text-align: center; color: var(--text-muted); padding: 40px;">Enter Admission ID to inspect charges.</div></div>
            </div>
        </div>
    `;

    if (canSettle) {
        const genForm = document.getElementById('generate-invoice-form');
        if (genForm) {
            genForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const admId = document.getElementById('bill-admission-id').value;
                try { 
                    await authFetch(`/billing/invoices/admission/${admId}/generate`, { method: 'POST' }); 
                    showToast('Invoice generated!', 'success'); 
                    document.getElementById('lookup-bill-adm-id').value = admId; 
                    const fBtn = document.getElementById('fetch-invoice-btn');
                    if (fBtn) fBtn.click(); 
                } catch (err) {}
            });
        }

        const setForm = document.getElementById('settle-offline-form');
        if (setForm) {
            setForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try { 
                    await authFetch(`/billing/invoices/${document.getElementById('offline-invoice-id').value}/settle-offline?mode=${document.getElementById('offline-payment-mode').value}`, { method: 'PATCH' }); 
                    showToast('Invoice settled!', 'success'); 
                    const fBtn = document.getElementById('fetch-invoice-btn');
                    if (fBtn) fBtn.click(); 
                } catch (err) {}
            });
        }
    }

    const fInvBtn = document.getElementById('fetch-invoice-btn');
    if (fInvBtn) {
        fInvBtn.addEventListener('click', async () => {
            const admId = document.getElementById('lookup-bill-adm-id').value;
            if(!admId) return;
            const container = document.getElementById('invoice-display-container');
            if (!container) return;
            try {
                const inv = await authFetch(`/billing/invoices/admission/${admId}`);
                if (!inv) { container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px;">No invoice found.</div>`; return; }
                container.innerHTML = `
                    <div class="invoice-card">
                        <div class="invoice-header-row">
                            <div><h3 style="font-size: 18px; font-weight: 700;">Invoice #${inv.id}</h3><span style="font-size: 12px; color: var(--text-muted);">Adm Ref: #${inv.admissionId}</span></div>
                            <span class="badge ${inv.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">${inv.paymentStatus}</span>
                        </div>
                        <div class="tariff-breakdown">
                            <div class="tariff-item"><span><i class="fa-solid fa-bed" style="width: 20px; color: var(--accent-primary);"></i> Room / Bed:</span><b>₹${inv.roomCharges.toFixed(2)}</b></div>
                            <div class="tariff-item"><span><i class="fa-solid fa-flask-vial" style="width: 20px; color: var(--accent-indigo);"></i> Pathology:</span><b>₹${inv.labCharges.toFixed(2)}</b></div>
                            <div class="tariff-item"><span><i class="fa-solid fa-pills" style="width: 20px; color: var(--accent-amber);"></i> Pharmacy:</span><b>₹${inv.medicineCharges.toFixed(2)}</b></div>
                            <div class="tariff-item"><span><i class="fa-solid fa-syringe" style="width: 20px; color: var(--accent-rose);"></i> Surgeries:</span><b>₹${inv.otCharges.toFixed(2)}</b></div>
                            <div class="tariff-total-row"><span>Total Payable:</span><span>₹${inv.totalAmount.toFixed(2)}</span></div>
                        </div>
                        ${inv.paymentStatus === 'PAID' ? `
                            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 12px; border-radius: var(--radius-sm); font-size: 12px; color: var(--accent-green); margin-top: 8px;">
                                <div><b>Settled via:</b> ${inv.paymentMode}</div>
                            </div>
                        ` : `<button onclick="launchRazorpayCheckout(${inv.id}, ${inv.admissionId})" class="btn btn-primary btn-block" style="margin-top: 12px;"><i class="fa-solid fa-bolt"></i> Pay with Razorpay</button>`}
                    </div>
                `;
            } catch (e) { container.innerHTML = `<div style="color:var(--accent-rose); text-align:center;">Error loading invoice.</div>`; }
        });
    }
}

window.launchRazorpayCheckout = async function(invoiceId, admId) {
    try {
        const orderData = await authFetch(`/billing/invoices/${invoiceId}/create-razorpay-order`, { method: 'POST' });
        const options = {
            "key": orderData.razorpayKeyId,
            "amount": Math.round(orderData.amount * 100),
            "currency": orderData.currency,
            "name": "CarePulse Hospital",
            "description": `Inpatient Settlement (Adm #${admId})`,
            "order_id": orderData.razorpayOrderId,
            "handler": async function (response) {
                try {
                    await authFetch(`/billing/invoices/${invoiceId}/verify-payment`, {
                        method: 'POST',
                        body: JSON.stringify({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        })
                    });
                    showToast('Payment verified and invoice settled!', 'success');
                    const fBtn = document.getElementById('fetch-invoice-btn');
                    if (fBtn) fBtn.click();
                } catch (verifyErr) { showToast('Verification failed.', 'error'); }
            },
            "theme": { "color": "#3b82f6" }
        };
        new Razorpay(options).open();
    } catch (err) { showToast(err.message, 'error'); }
};
