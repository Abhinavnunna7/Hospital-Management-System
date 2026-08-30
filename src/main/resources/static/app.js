// CarePulse Enterprise Frontend Core
const API_BASE_URL = window.location.origin + '/api';

const state = {
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
    role: localStorage.getItem('role') || null,
    currentView: 'dashboard'
};

// Centralized Secure API Fetch Client
async function authFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            showToast('Session expired. Please sign in.', 'error');
            handleLogout();
            throw new Error('Unauthorized');
        }

        if (response.status === 403) {
            showToast('Access Denied: Your role is not authorized for this operation.', 'error');
            throw new Error('Forbidden');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        return await response.json().catch(() => null);
    } catch (error) {
        if (error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
            showToast(error.message, 'error');
        }
        throw error;
    }
}

// Toast Notifications
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

// Role-Based UI Filtering Rules
function applyRoleBasedNavigation() {
    const role = state.role || '';
    
    // Matrix of permissions per role
    const permissions = {
        ADMIN: ['dashboard', 'beds', 'admissions', 'lab', 'mar', 'ot', 'billing'],
        DOCTOR: ['dashboard', 'beds', 'admissions', 'lab', 'mar', 'ot'],
        NURSE: ['dashboard', 'beds', 'admissions', 'mar', 'ot'],
        RECEPTIONIST: ['dashboard', 'beds', 'admissions'],
        LAB_TECHNICIAN: ['dashboard', 'lab'],
        ACCOUNTANT: ['dashboard', 'admissions', 'billing']
    };

    const allowedViews = permissions[role] || ['dashboard'];

    document.querySelectorAll('.nav-item').forEach(button => {
        const view = button.getAttribute('data-view');
        if (allowedViews.includes(view)) {
            button.classList.remove('hidden');
        } else {
            button.classList.add('hidden');
        }
    });

    if (!allowedViews.includes(state.currentView)) {
        state.currentView = allowedViews[0];
    }
}

// Auth Lifecycle & UI State
function checkAuthState() {
    const loginModal = document.getElementById('login-modal');
    const appContainer = document.getElementById('app-container');

    if (state.token && state.username) {
        loginModal.classList.add('hidden');
        appContainer.classList.remove('hidden');

        document.getElementById('user-name-display').innerText = state.username;
        document.getElementById('user-avatar-initial').innerText = state.username.charAt(0).toUpperCase();

        const roleBadge = document.getElementById('user-role-badge');
        roleBadge.innerText = state.role;
        roleBadge.className = `badge badge-${state.role ? state.role.toLowerCase() : 'admin'}`;

        applyRoleBasedNavigation();
        loadView(state.currentView);
    } else {
        loginModal.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

// Auth Tab Switching
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
        tabLogin.style.background = 'var(--accent-blue)';
        tabLogin.style.color = '#fff';
        tabRegister.style.background = 'transparent';
        tabRegister.style.color = 'var(--text-muted)';
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.style.background = 'var(--accent-blue)';
        tabRegister.style.color = '#fff';
        tabLogin.style.background = 'transparent';
        tabLogin.style.color = 'var(--text-muted)';
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
}

// Handle Sign In
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                throw new Error('Invalid credentials. Please verify your username and password.');
            }

            const data = await res.json();
            state.token = data.token;
            state.username = data.username;
            state.role = data.role;

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);

            showToast(`Signed in as ${data.username} (${data.role})`, 'success');
            checkAuthState();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

// Handle User Registration
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            username: document.getElementById('reg-username').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value
        };

        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(err.message || 'Registration failed');
            }

            showToast('Account registered successfully! Please sign in.', 'success');
            registerForm.reset();
            tabLogin.click();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

// Handle Logout
function handleLogout() {
    state.token = null;
    state.username = null;
    state.role = null;
    localStorage.clear();
    checkAuthState();
}
document.getElementById('logout-btn').addEventListener('click', handleLogout);

// View Router
function loadView(viewName) {
    state.currentView = viewName;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    const titleMap = {
        dashboard: { title: 'Hospital Telemetry', sub: 'Real-time census, inpatient load & system health' },
        beds: { title: 'Ward & Bed Occupancy Matrix', sub: 'Infrastructure tracking, availability & state management' },
        admissions: { title: 'Inpatient Admissions (IPD)', sub: 'Clinical check-in, physician assignment & discharge' },
        lab: { title: 'Diagnostic Pathology & Radiology', sub: 'Test requisitions, workflow routing & clinical reports' },
        mar: { title: 'Medication Administration Record (MAR)', sub: 'Physician multi-drug prescription & nurse dosage logs' },
        ot: { title: 'Operation Theater Suite', sub: 'Surgical scheduling, room allocation & PACU notes' },
        billing: { title: 'Inpatient Settlement & Invoicing', sub: 'Tariff aggregation, cash counter & live Razorpay checkout' }
    };

    const header = titleMap[viewName] || { title: 'Hospital Management', sub: 'CarePulse Enterprise' };
    document.getElementById('view-title').innerText = header.title;
    document.getElementById('view-subtitle').innerText = header.sub;

    const mainContent = document.getElementById('main-content');

    if (viewName === 'dashboard') renderDashboardOverview(mainContent);
    else if (viewName === 'beds') renderBedsView(mainContent);
    else if (viewName === 'admissions') renderAdmissionsView(mainContent);
    else if (viewName === 'lab') renderLabView(mainContent);
    else if (viewName === 'mar') renderMarView(mainContent);
    else if (viewName === 'ot') renderOtView(mainContent);
    else if (viewName === 'billing') renderBillingView(mainContent);
}

// ----------------------------------------------------
// 1. Dashboard Overview View
// ----------------------------------------------------
async function renderDashboardOverview(container) {
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            <div class="glass-card" style="padding: 16px;">
                <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase; font-weight: 700;">Available Beds</span>
                <h3 id="stat-beds" style="font-size: 24px; margin-top: 6px; color: var(--accent-green);"><i class="fa-solid fa-spinner fa-spin"></i></h3>
            </div>
            <div class="glass-card" style="padding: 16px;">
                <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase; font-weight: 700;">Active Inpatients</span>
                <h3 id="stat-admissions" style="font-size: 24px; margin-top: 6px; color: var(--accent-blue);"><i class="fa-solid fa-spinner fa-spin"></i></h3>
            </div>
            <div class="glass-card" style="padding: 16px;">
                <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase; font-weight: 700;">System Port</span>
                <h3 style="font-size: 24px; margin-top: 6px; color: var(--accent-cyan);">8081 (ONLINE)</h3>
            </div>
        </div>
    `;

    try {
        const availableBeds = await authFetch('/infrastructure/beds/available');
        const activeAdmissions = await authFetch('/admissions/active');
        document.getElementById('stat-beds').innerText = availableBeds ? availableBeds.length : 0;
        document.getElementById('stat-admissions').innerText = activeAdmissions ? activeAdmissions.length : 0;
    } catch (e) {}
}

// ----------------------------------------------------
// 2. Ward & Bed Occupancy Matrix View
// ----------------------------------------------------
async function renderBedsView(container) {
    const isAdmin = state.role === 'ADMIN';

    container.innerHTML = `
        <div class="view-grid-layout" style="${!isAdmin ? 'grid-template-columns: 1fr;' : ''}">
            ${isAdmin ? `
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 12px;">
                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-hospital"></i> Create Ward</h3>
                    </div>
                    <form id="create-ward-form">
                        <div class="input-group">
                            <label>Ward Name</label>
                            <input type="text" id="ward-name" required placeholder="e.g. ICU Wing A">
                        </div>
                        <div class="input-group">
                            <label>Category</label>
                            <select id="ward-category" required>
                                <option value="GENERAL">General Ward</option>
                                <option value="ICU">ICU (Intensive Care)</option>
                                <option value="PRIVATE">Private Suite</option>
                                <option value="SEMI_PRIVATE">Semi-Private</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Daily Tariff (₹)</label>
                            <input type="number" id="ward-rate" min="1" step="1" required placeholder="2500">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Register Ward</button>
                    </form>
                </div>

                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-bed"></i> Add Bed</h3>
                    </div>
                    <form id="add-bed-form">
                        <div class="input-group">
                            <label>Ward</label>
                            <select id="bed-ward-select" required>
                                <option value="">Loading wards...</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Bed Number / Code</label>
                            <input type="text" id="bed-number" required placeholder="e.g. ICU-01">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Add Bed</button>
                    </form>
                </div>
            </div>
            ` : ''}

            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-table-cells-large"></i> Bed Occupancy Matrix</h3>
                    <button id="refresh-beds-btn" class="btn btn-xs" style="background: rgba(255,255,255,0.05); color: var(--text-main);">
                        <i class="fa-solid fa-rotate-right"></i> Refresh
                    </button>
                </div>
                <div id="beds-container" class="beds-grid">
                    <div style="color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading beds...</div>
                </div>
            </div>
        </div>
    `;

    async function loadWardsDropdown() {
        if (!isAdmin) return;
        const select = document.getElementById('bed-ward-select');
        try {
            const wards = await authFetch('/infrastructure/wards');
            select.innerHTML = wards && wards.length > 0 
                ? wards.map(w => `<option value="${w.id}">${w.name} (${w.category} - ₹${w.dailyRate}/day)</option>`).join('')
                : `<option value="">No wards found. Create one above.</option>`;
        } catch (e) {
            select.innerHTML = `<option value="">Error loading wards</option>`;
        }
    }

    async function loadBedsGrid() {
        const grid = document.getElementById('beds-container');
        try {
            const availableBeds = await authFetch('/infrastructure/beds/available');
            if (!availableBeds || availableBeds.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">No beds available in pool.</div>`;
                return;
            }
            grid.innerHTML = availableBeds.map(b => `
                <div class="bed-card ${b.status.toLowerCase()}">
                    <div class="bed-header">
                        <span class="bed-title">${b.bedNumber}</span>
                        <span class="badge badge-nurse">${b.status}</span>
                    </div>
                    <div class="bed-ward">${b.wardName} (${b.wardCategory})</div>
                    <div class="bed-price">₹${b.dailyRate} / day</div>
                    ${(state.role === 'ADMIN' || state.role === 'NURSE') ? `
                        <button onclick="toggleBedStatus(${b.id}, 'UNDER_MAINTENANCE')" class="btn btn-xs" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); margin-top: 4px;">
                            <i class="fa-solid fa-wrench"></i> Maintenance
                        </button>
                    ` : ''}
                </div>
            `).join('');
        } catch (e) {
            grid.innerHTML = `<div style="color: var(--accent-rose);">Failed to load beds.</div>`;
        }
    }

    if (isAdmin) {
        document.getElementById('create-ward-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const rate = parseFloat(document.getElementById('ward-rate').value);
            if (rate <= 0 || isNaN(rate)) {
                showToast('Tariff must be greater than zero.', 'error');
                return;
            }
            const payload = {
                name: document.getElementById('ward-name').value.trim(),
                category: document.getElementById('ward-category').value,
                dailyRate: rate
            };
            try {
                await authFetch('/infrastructure/wards', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Ward created successfully!', 'success');
                document.getElementById('create-ward-form').reset();
                loadWardsDropdown();
            } catch (err) {}
        });

        document.getElementById('add-bed-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                wardId: parseInt(document.getElementById('bed-ward-select').value),
                bedNumber: document.getElementById('bed-number').value.trim()
            };
            try {
                await authFetch('/infrastructure/beds', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Bed added successfully!', 'success');
                document.getElementById('bed-number').value = '';
                loadBedsGrid();
            } catch (err) {}
        });
    }

    document.getElementById('refresh-beds-btn').addEventListener('click', loadBedsGrid);
    loadWardsDropdown();
    loadBedsGrid();
}

window.toggleBedStatus = async function(bedId, status) {
    try {
        await authFetch(`/infrastructure/beds/${bedId}/status?status=${status}`, { method: 'PATCH' });
        showToast(`Bed state updated to ${status}`, 'success');
        loadView('beds');
    } catch (err) {}
};

// ----------------------------------------------------
// 3. Inpatient Admissions (IPD) View
// ----------------------------------------------------
async function renderAdmissionsView(container) {
    const canAdmit = state.role === 'ADMIN' || state.role === 'RECEPTIONIST';

    container.innerHTML = `
        <div class="view-grid-layout" style="${!canAdmit ? 'grid-template-columns: 1fr;' : ''}">
            ${canAdmit ? `
            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-user-plus"></i> Inpatient Admission</h3>
                </div>
                <form id="admit-patient-form">
                    <div class="input-group">
                        <label>Patient ID</label>
                        <input type="number" id="admit-patient-id" min="1" required placeholder="Patient ID (e.g. 1)">
                    </div>
                    <div class="input-group">
                        <label>Attending Doctor ID</label>
                        <input type="number" id="admit-doctor-id" min="1" required placeholder="Doctor ID (e.g. 1)">
                    </div>
                    <div class="input-group">
                        <label>Select Available Bed</label>
                        <select id="admit-bed-select" required>
                            <option value="">Loading beds...</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Primary Diagnosis</label>
                        <textarea id="admit-diagnosis" rows="2" required placeholder="Provisional clinical diagnosis"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        <i class="fa-solid fa-check"></i> Admit & Lock Bed
                    </button>
                </form>
            </div>
            ` : ''}

            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-procedures"></i> Active Inpatient Census</h3>
                    <button id="refresh-admissions-btn" class="btn btn-xs" style="background: rgba(255,255,255,0.05); color: var(--text-main);">
                        <i class="fa-solid fa-rotate-right"></i> Refresh
                    </button>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Adm ID</th>
                                <th>Patient ID</th>
                                <th>Doctor ID</th>
                                <th>Ward / Bed</th>
                                <th>Diagnosis</th>
                                <th>Admitted At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="admissions-table-body">
                            <tr><td colspan="7" style="text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading inpatients...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    async function loadAvailableBedsDropdown() {
        if (!canAdmit) return;
        const select = document.getElementById('admit-bed-select');
        try {
            const availableBeds = await authFetch('/infrastructure/beds/available');
            select.innerHTML = availableBeds && availableBeds.length > 0 
                ? availableBeds.map(b => `<option value="${b.id}">${b.bedNumber} — ${b.wardName} (${b.wardCategory})</option>`).join('')
                : `<option value="">No available beds. Free a bed first.</option>`;
        } catch (e) {
            select.innerHTML = `<option value="">Error loading beds</option>`;
        }
    }

    async function loadActiveAdmissionsTable() {
        const tbody = document.getElementById('admissions-table-body');
        try {
            const admissions = await authFetch('/admissions/active');
            if (!admissions || admissions.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No active inpatients admitted.</td></tr>`;
                return;
            }
            tbody.innerHTML = admissions.map(a => `
                <tr>
                    <td><b>#${a.id}</b></td>
                    <td>Patient #${a.patientId}</td>
                    <td>Dr. #${a.doctorId}</td>
                    <td>
                        <span style="color: var(--accent-blue); font-weight: 600;">${a.bedNumber}</span>
                        <div style="font-size: 10px; color: var(--text-muted);">${a.wardName}</div>
                    </td>
                    <td>${a.diagnosis}</td>
                    <td>${new Date(a.admissionTime).toLocaleDateString()} ${new Date(a.admissionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>
                        ${(state.role === 'ADMIN' || state.role === 'DOCTOR' || state.role === 'RECEPTIONIST') ? `
                            <button onclick="promptDischarge(${a.id})" class="btn btn-xs" style="background: rgba(244, 63, 94, 0.2); color: var(--accent-rose);">
                                <i class="fa-solid fa-arrow-right-from-bracket"></i> Discharge
                            </button>
                        ` : '<span style="color: var(--text-muted); font-size: 11px;">Active</span>'}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="7" style="color: var(--accent-rose); text-align: center;">Failed to load admissions.</td></tr>`;
        }
    }

    if (canAdmit) {
        document.getElementById('admit-patient-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                patientId: parseInt(document.getElementById('admit-patient-id').value),
                doctorId: parseInt(document.getElementById('admit-doctor-id').value),
                bedId: parseInt(document.getElementById('admit-bed-select').value),
                diagnosis: document.getElementById('admit-diagnosis').value.trim()
            };
            try {
                await authFetch('/admissions', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Patient admitted and bed locked!', 'success');
                document.getElementById('admit-patient-form').reset();
                loadAvailableBedsDropdown();
                loadActiveAdmissionsTable();
            } catch (err) {}
        });
    }

    document.getElementById('refresh-admissions-btn').addEventListener('click', () => {
        loadAvailableBedsDropdown();
        loadActiveAdmissionsTable();
    });

    loadAvailableBedsDropdown();
    loadActiveAdmissionsTable();
}

window.promptDischarge = async function(admissionId) {
    const notes = prompt("Enter clinical discharge notes / summary:");
    if (notes === null) return;
    try {
        await authFetch(`/admissions/${admissionId}/discharge`, {
            method: 'PATCH',
            body: JSON.stringify({ dischargeNotes: notes || "Discharged in stable condition." })
        });
        showToast(`Patient #${admissionId} discharged and bed released!`, 'success');
        loadView('admissions');
    } catch (err) {}
};

// ----------------------------------------------------
// 4. Diagnostic Pathology & Radiology (Lab) View
// ----------------------------------------------------
async function renderLabView(container) {
    const isAdmin = state.role === 'ADMIN';
    const isDoctor = state.role === 'DOCTOR' || isAdmin;
    const isLabTech = state.role === 'LAB_TECHNICIAN' || isAdmin;

    container.innerHTML = `
        <div class="view-grid-layout" style="${(!isAdmin && !isDoctor) ? 'grid-template-columns: 1fr;' : ''}">
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 12px;">
                ${isAdmin ? `
                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-plus-circle"></i> Add Test to Catalog</h3>
                    </div>
                    <form id="create-lab-test-form">
                        <div class="input-group">
                            <label>Test Name</label>
                            <input type="text" id="test-name" required placeholder="e.g. Serum Electrolytes">
                        </div>
                        <div class="input-group">
                            <label>Tariff (₹)</label>
                            <input type="number" id="test-price" min="1" step="1" required placeholder="450">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Add to Catalog</button>
                    </form>
                </div>
                ` : ''}

                ${isDoctor ? `
                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-flask-vial"></i> Order Diagnostic Test</h3>
                    </div>
                    <form id="order-lab-form">
                        <div class="input-group">
                            <label>Admission ID</label>
                            <input type="number" id="lab-order-admission-id" min="1" required placeholder="Admission ID (e.g. 2)">
                        </div>
                        <div class="input-group">
                            <label>Doctor ID</label>
                            <input type="number" id="lab-order-doctor-id" min="1" required placeholder="Doctor ID (e.g. 1)">
                        </div>
                        <div class="input-group">
                            <label>Diagnostic Test</label>
                            <select id="lab-test-select" required>
                                <option value="">Loading catalog...</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Priority</label>
                            <select id="lab-order-priority" required>
                                <option value="ROUTINE">ROUTINE (Standard)</option>
                                <option value="URGENT">URGENT (4 Hours)</option>
                                <option value="STAT">STAT (Immediate Emergency)</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Requisition Test</button>
                    </form>
                </div>
                ` : ''}
            </div>

            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-microscope"></i> Admission Lab Orders</h3>
                    <div style="display: flex; gap: 6px;">
                        <input type="number" id="lookup-lab-adm-id" min="1" placeholder="Adm ID (e.g. 2)" style="width: 120px; padding: 5px 8px; font-size: 11px; background: rgba(7,13,30,0.6); border: 1px solid var(--glass-border); color: var(--text-main); border-radius: 4px;">
                        <button id="fetch-lab-orders-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Test</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Findings / Report</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="lab-orders-table-body">
                            <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Enter an Admission ID and click Lookup to load lab orders.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    async function loadTestCatalogDropdown() {
        if (!isDoctor) return;
        const select = document.getElementById('lab-test-select');
        try {
            const tests = await authFetch('/lab/tests');
            select.innerHTML = tests && tests.length > 0
                ? tests.map(t => `<option value="${t.id}">${t.testName} (₹${t.price})</option>`).join('')
                : `<option value="">No tests found in catalog.</option>`;
        } catch (e) {
            select.innerHTML = `<option value="">Error fetching catalog</option>`;
        }
    }

    async function fetchLabOrders(admissionId) {
        const tbody = document.getElementById('lab-orders-table-body');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Fetching orders...</td></tr>`;
        try {
            const orders = await authFetch(`/lab/orders/admission/${admissionId}`);
            if (!orders || orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No diagnostic orders found for Admission #${admissionId}.</td></tr>`;
                return;
            }
            tbody.innerHTML = orders.map(o => `
                <tr>
                    <td><b>#${o.id}</b></td>
                    <td>
                        <span style="font-weight: 600; color: var(--text-main);">${o.testName}</span>
                        <div style="font-size: 10px; color: var(--accent-blue);">₹${o.price}</div>
                    </td>
                    <td><span class="badge badge-${o.priority.toLowerCase()}">${o.priority}</span></td>
                    <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                    <td>${o.resultFindings ? `<span style="font-size: 11px; color: var(--accent-green);">${o.resultFindings}</span>` : `<span style="color: var(--text-dim); font-size: 11px;">Pending analysis</span>`}</td>
                    <td>
                        ${(o.status !== 'COMPLETED' && isLabTech) ? `
                            <button onclick="publishLabResult(${o.id}, ${admissionId})" class="btn btn-xs" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-green);">
                                <i class="fa-solid fa-file-signature"></i> Publish
                            </button>
                        ` : `<span style="color: var(--accent-green); font-size: 11px;"><i class="fa-solid fa-check"></i> ${o.status}</span>`}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-rose); text-align: center;">Failed to fetch lab orders.</td></tr>`;
        }
    }

    if (isAdmin) {
        document.getElementById('create-lab-test-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const price = parseFloat(document.getElementById('test-price').value);
            if (price <= 0 || isNaN(price)) {
                showToast('Price must be greater than zero.', 'error');
                return;
            }
            const payload = {
                testName: document.getElementById('test-name').value.trim(),
                price: price
            };
            try {
                await authFetch('/lab/tests', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Diagnostic test added to catalog!', 'success');
                document.getElementById('create-lab-test-form').reset();
                loadTestCatalogDropdown();
            } catch (err) {}
        });
    }

    if (isDoctor) {
        document.getElementById('order-lab-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const admId = parseInt(document.getElementById('lab-order-admission-id').value);
            const payload = {
                admissionId: admId,
                doctorId: parseInt(document.getElementById('lab-order-doctor-id').value),
                testId: parseInt(document.getElementById('lab-test-select').value),
                priority: document.getElementById('lab-order-priority').value
            };
            try {
                await authFetch('/lab/orders', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Lab test order placed successfully!', 'success');
                document.getElementById('lookup-lab-adm-id').value = admId;
                fetchLabOrders(admId);
            } catch (err) {}
        });
    }

    document.getElementById('fetch-lab-orders-btn').addEventListener('click', () => {
        const admId = document.getElementById('lookup-lab-adm-id').value.trim();
        if (admId) fetchLabOrders(parseInt(admId));
    });

    loadTestCatalogDropdown();
}

window.publishLabResult = async function(orderId, admissionId) {
    const findings = prompt("Enter diagnostic / pathology findings:");
    if (!findings) return;
    try {
        await authFetch(`/lab/orders/${orderId}/results`, {
            method: 'PATCH',
            body: JSON.stringify({ resultFindings: findings })
        });
        showToast('Lab results published!', 'success');
        const admInput = document.getElementById('lookup-lab-adm-id');
        if (admInput) {
            admInput.value = admissionId;
            document.getElementById('fetch-lab-orders-btn').click();
        }
    } catch (err) {}
};

// ----------------------------------------------------
// 5. Medication Administration Record (MAR) View
// ----------------------------------------------------
async function renderMarView(container) {
    const canPrescribe = state.role === 'DOCTOR' || state.role === 'ADMIN';
    const canAdminister = state.role === 'NURSE' || state.role === 'ADMIN';

    container.innerHTML = `
        <div class="view-grid-layout" style="${!canPrescribe ? 'grid-template-columns: 1fr;' : ''}">
            ${canPrescribe ? `
            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-prescription"></i> Multi-Drug Prescription</h3>
                </div>
                <form id="bulk-prescribe-med-form">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div class="input-group">
                            <label>Admission ID</label>
                            <input type="number" id="mar-adm-id" min="1" required placeholder="Adm ID (e.g. 2)">
                        </div>
                        <div class="input-group">
                            <label>Doctor ID</label>
                            <input type="number" id="mar-doc-id" min="1" required placeholder="Doctor ID (e.g. 1)">
                        </div>
                    </div>

                    <div class="panel-header" style="margin-bottom: 8px; padding-bottom: 4px;">
                        <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Medication Items</span>
                        <button type="button" onclick="addMedicineRow()" class="btn btn-xs" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-blue);">
                            <i class="fa-solid fa-plus"></i> Add Row
                        </button>
                    </div>

                    <div id="medicine-items-repeater" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;"></div>

                    <button type="submit" class="btn btn-primary btn-block">
                        <i class="fa-solid fa-paper-plane"></i> Submit Prescription Sheet
                    </button>
                </form>
            </div>
            ` : ''}

            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-syringe"></i> MAR Dosage Administration Log</h3>
                    <div style="display: flex; gap: 6px;">
                        <input type="number" id="lookup-mar-adm-id" min="1" placeholder="Adm ID (e.g. 2)" style="width: 120px; padding: 5px 8px; font-size: 11px; background: rgba(7,13,30,0.6); border: 1px solid var(--glass-border); color: var(--text-main); border-radius: 4px;">
                        <button id="fetch-mar-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Rx ID</th>
                                <th>Medicine</th>
                                <th>Route / Freq</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="mar-table-body">
                            <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Enter an Admission ID and click Lookup to load MAR records.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    window.addMedicineRow = function() {
        const repeater = document.getElementById('medicine-items-repeater');
        if (!repeater) return;
        const rowDiv = document.createElement('div');
        rowDiv.className = 'med-item-row';
        rowDiv.style.cssText = 'padding: 10px; background: rgba(7,13,30,0.5); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 6px;';
        
        rowDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 6px;">
                <input type="text" class="med-name" placeholder="Drug & Strength (e.g. Paracetamol 500mg)" required style="padding: 6px 8px; font-size: 11px;">
                <input type="text" class="med-dosage" placeholder="Dose (e.g. 1 Tab)" required style="padding: 6px 8px; font-size: 11px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                <select class="med-route" required style="padding: 6px; font-size: 11px;">
                    <option value="ORAL">ORAL</option>
                    <option value="INTRAVENOUS">IV</option>
                    <option value="INTRAMUSCULAR">IM</option>
                    <option value="SUBCUTANEOUS">SC</option>
                    <option value="TOPICAL">TOPICAL</option>
                </select>
                <input type="text" class="med-frequency" placeholder="Freq (e.g. TDS)" required style="padding: 6px 8px; font-size: 11px;">
                <input type="number" class="med-price" min="1" step="1" placeholder="Price (₹)" required style="padding: 6px 8px; font-size: 11px;">
            </div>
            ${repeater.children.length > 0 ? `
                <button type="button" onclick="this.closest('.med-item-row').remove()" class="btn btn-xs" style="align-self: flex-end; background: rgba(244,63,94,0.15); color: var(--accent-rose);">
                    <i class="fa-solid fa-trash"></i> Remove
                </button>
            ` : ''}
        `;
        repeater.appendChild(rowDiv);
    };

    if (canPrescribe) {
        window.addMedicineRow();

        document.getElementById('bulk-prescribe-med-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const admId = parseInt(document.getElementById('mar-adm-id').value);
            const docId = parseInt(document.getElementById('mar-doc-id').value);

            const rowNodes = document.querySelectorAll('.med-item-row');
            const items = [];

            for (let row of rowNodes) {
                const price = parseFloat(row.querySelector('.med-price').value);
                if (price <= 0 || isNaN(price)) {
                    showToast('Each medicine price must be greater than zero.', 'error');
                    return;
                }
                items.push({
                    admissionId: admId,
                    doctorId: docId,
                    medicineName: row.querySelector('.med-name').value.trim(),
                    dosage: row.querySelector('.med-dosage').value.trim(),
                    route: row.querySelector('.med-route').value,
                    frequency: row.querySelector('.med-frequency').value.trim(),
                    unitPrice: price
                });
            }

            try {
                await Promise.all(items.map(item => 
                    authFetch('/mar/prescriptions', {
                        method: 'POST',
                        body: JSON.stringify(item)
                    })
                ));

                showToast(`${items.length} prescription order(s) submitted!`, 'success');
                document.getElementById('medicine-items-repeater').innerHTML = '';
                window.addMedicineRow();
                document.getElementById('lookup-mar-adm-id').value = admId;
                fetchMarRecords(admId);
            } catch (err) {}
        });
    }

    async function fetchMarRecords(admissionId) {
        const tbody = document.getElementById('mar-table-body');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Fetching MAR logs...</td></tr>`;
        try {
            const meds = await authFetch(`/mar/admissions/${admissionId}`);
            if (!meds || meds.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No prescribed medications found for Admission #${admissionId}.</td></tr>`;
                return;
            }
            tbody.innerHTML = meds.map(m => `
                <tr>
                    <td><b>#${m.id}</b></td>
                    <td>
                        <span style="font-weight: 600; color: var(--text-main);">${m.medicineName}</span>
                        <div style="font-size: 10px; color: var(--text-muted);">${m.dosage}</div>
                    </td>
                    <td>
                        <span class="badge badge-doctor">${m.route}</span>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${m.frequency}</div>
                    </td>
                    <td style="color: var(--accent-blue); font-weight: 600;">₹${m.unitPrice}</td>
                    <td>
                        ${m.dispensed ? `
                            <span class="badge badge-completed"><i class="fa-solid fa-check"></i> Given</span>
                            <div style="font-size: 9px; color: var(--text-muted); margin-top: 1px;">Nurse #${m.administeredByNurseId}</div>
                        ` : `
                            <span class="badge badge-pending">Pending Dose</span>
                        `}
                    </td>
                    <td>
                        ${(!m.dispensed && canAdminister) ? `
                            <button onclick="administerDose(${m.id}, ${admissionId})" class="btn btn-xs" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-green);">
                                <i class="fa-solid fa-check-double"></i> Administer
                            </button>
                        ` : `<span style="font-size: 10px; color: var(--text-dim);">${m.administrationNotes || (m.dispensed ? 'Administered' : 'Awaiting Nurse')}</span>`}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-rose); text-align: center;">Failed to fetch MAR records.</td></tr>`;
        }
    }

    document.getElementById('fetch-mar-btn').addEventListener('click', () => {
        const admId = document.getElementById('lookup-mar-adm-id').value.trim();
        if (admId) fetchMarRecords(parseInt(admId));
    });
}

window.administerDose = async function(orderId, admissionId) {
    const notes = prompt("Enter nurse administration notes (e.g. Given IV Push):");
    if (notes === null) return;
    try {
        await authFetch(`/mar/orders/${orderId}/administer`, {
            method: 'PATCH',
            body: JSON.stringify({
                nurseId: 1,
                administrationNotes: notes || "Administered as prescribed."
            })
        });
        showToast('Medication dose logged as administered!', 'success');
        const admInput = document.getElementById('lookup-mar-adm-id');
        if (admInput) {
            admInput.value = admissionId;
            document.getElementById('fetch-mar-btn').click();
        }
    } catch (err) {}
};

// ----------------------------------------------------
// 6. Operation Theater (OT) Suite View
// ----------------------------------------------------
async function renderOtView(container) {
    const isAdmin = state.role === 'ADMIN';
    const isDoctor = state.role === 'DOCTOR' || isAdmin;

    container.innerHTML = `
        <div class="view-grid-layout" style="${(!isAdmin && !isDoctor) ? 'grid-template-columns: 1fr;' : ''}">
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 12px;">
                ${isAdmin ? `
                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-door-open"></i> Register OT Room</h3>
                    </div>
                    <form id="create-ot-room-form">
                        <div class="input-group">
                            <label>Room Number / Code</label>
                            <input type="text" id="ot-room-number" required placeholder="e.g. OT-01">
                        </div>
                        <div class="input-group">
                            <label>Specialty</label>
                            <input type="text" id="ot-room-type" required placeholder="e.g. Cardiac & Vascular Surgery">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Register OT Room</button>
                    </form>
                </div>
                ` : ''}

                ${isDoctor ? `
                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-calendar-plus"></i> Schedule Surgery</h3>
                    </div>
                    <form id="schedule-surgery-form">
                        <div class="input-group">
                            <label>OT Room</label>
                            <select id="ot-room-select" required>
                                <option value="">Loading rooms...</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Admission ID</label>
                            <input type="number" id="ot-admission-id" min="1" required placeholder="Admission ID (e.g. 2)">
                        </div>
                        <div class="input-group">
                            <label>Lead Surgeon (Doctor ID)</label>
                            <input type="number" id="ot-surgeon-id" min="1" required placeholder="Doctor ID (e.g. 1)">
                        </div>
                        <div class="input-group">
                            <label>Procedure Name</label>
                            <input type="text" id="ot-procedure-name" required placeholder="e.g. Laparoscopic Appendectomy">
                        </div>
                        <div class="input-group">
                            <label>Start Time</label>
                            <input type="datetime-local" id="ot-start-time" required>
                        </div>
                        <div class="input-group">
                            <label>End Time</label>
                            <input type="datetime-local" id="ot-end-time" required>
                        </div>
                        <div class="input-group">
                            <label>Procedure Tariff (₹)</label>
                            <input type="number" id="ot-charge" min="1" step="100" required placeholder="25000">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Schedule Surgery</button>
                    </form>
                </div>
                ` : ''}
            </div>

            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-clock-rotate-left"></i> Admission Surgical Schedules</h3>
                    <div style="display: flex; gap: 6px;">
                        <input type="number" id="lookup-ot-adm-id" min="1" placeholder="Adm ID (e.g. 2)" style="width: 120px; padding: 5px 8px; font-size: 11px; background: rgba(7,13,30,0.6); border: 1px solid var(--glass-border); color: var(--text-main); border-radius: 4px;">
                        <button id="fetch-ot-schedules-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Schedule ID</th>
                                <th>Room</th>
                                <th>Procedure</th>
                                <th>Surgeon</th>
                                <th>Window</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="ot-schedules-table-body">
                            <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">Enter an Admission ID to view scheduled surgeries.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    async function loadOtRoomsDropdown() {
        if (!isDoctor) return;
        const select = document.getElementById('ot-room-select');
        try {
            const rooms = await authFetch('/ot/rooms');
            select.innerHTML = rooms && rooms.length > 0
                ? rooms.map(r => `<option value="${r.id}">${r.roomNumber} (${r.roomType})</option>`).join('')
                : `<option value="">No OT rooms found.</option>`;
        } catch (e) {
            select.innerHTML = `<option value="">Error loading OT rooms</option>`;
        }
    }

    async function fetchOtSchedules(admissionId) {
        const tbody = document.getElementById('ot-schedules-table-body');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading surgical schedule...</td></tr>`;
        try {
            const schedules = await authFetch(`/ot/schedules/admission/${admissionId}`);
            if (!schedules || schedules.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No surgical records found for Admission #${admissionId}.</td></tr>`;
                return;
            }

            tbody.innerHTML = schedules.map(s => `
                <tr>
                    <td><b>#${s.id}</b></td>
                    <td>
                        <span style="font-weight: 600; color: var(--accent-blue);">${s.roomNumber}</span>
                        <div style="font-size: 10px; color: var(--text-muted);">${s.roomType}</div>
                    </td>
                    <td>
                        <span style="font-weight: 600; color: var(--text-main);">${s.procedureName}</span>
                        <div style="font-size: 10px; color: var(--accent-blue);">₹${s.procedureCharge}</div>
                    </td>
                    <td>Dr. #${s.leadSurgeonId}</td>
                    <td style="font-size: 11px;">
                        <div><b>Start:</b> ${new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <div><b>End:</b> ${new Date(s.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td><span class="badge badge-${s.status.toLowerCase()}">${s.status}</span></td>
                    <td>
                        ${isDoctor ? `
                            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                ${s.status === 'SCHEDULED' ? `
                                    <button onclick="updateOtStatus(${s.id}, 'IN_PROGRESS', ${admissionId})" class="btn btn-xs" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-amber);">
                                        <i class="fa-solid fa-play"></i> Start
                                    </button>
                                    <button onclick="updateOtStatus(${s.id}, 'CANCELLED', ${admissionId})" class="btn btn-xs" style="background: rgba(244, 63, 94, 0.2); color: var(--accent-rose);">
                                        <i class="fa-solid fa-ban"></i> Cancel
                                    </button>
                                ` : ''}
                                ${s.status === 'IN_PROGRESS' ? `
                                    <button onclick="completeSurgeryModal(${s.id}, ${admissionId})" class="btn btn-xs" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-green);">
                                        <i class="fa-solid fa-check"></i> Finish
                                    </button>
                                ` : ''}
                                ${s.status === 'COMPLETED' ? `
                                    <span style="color: var(--accent-green); font-size: 11px;"><i class="fa-solid fa-circle-check"></i> Done</span>
                                ` : ''}
                            </div>
                        ` : `<span style="font-size: 11px; color: var(--text-muted);">${s.status}</span>`}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="7" style="color: var(--accent-rose); text-align: center;">Failed to fetch surgical records.</td></tr>`;
        }
    }

    if (isAdmin) {
        document.getElementById('create-ot-room-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                roomNumber: document.getElementById('ot-room-number').value.trim(),
                roomType: document.getElementById('ot-room-type').value.trim()
            };
            try {
                await authFetch('/ot/rooms', { method: 'POST', body: JSON.stringify(payload) });
                showToast('OT Room registered successfully!', 'success');
                document.getElementById('create-ot-room-form').reset();
                loadOtRoomsDropdown();
            } catch (err) {}
        });
    }

    if (isDoctor) {
        document.getElementById('schedule-surgery-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const admId = parseInt(document.getElementById('ot-admission-id').value);
            const startTimeStr = document.getElementById('ot-start-time').value;
            const endTimeStr = document.getElementById('ot-end-time').value;
            const charge = parseFloat(document.getElementById('ot-charge').value);

            if (charge <= 0 || isNaN(charge)) {
                showToast('Procedure charge must be greater than zero.', 'error');
                return;
            }

            if (new Date(startTimeStr) >= new Date(endTimeStr)) {
                showToast('Surgery end time must be after start time.', 'error');
                return;
            }

            const payload = {
                otRoomId: parseInt(document.getElementById('ot-room-select').value),
                admissionId: admId,
                leadSurgeonId: parseInt(document.getElementById('ot-surgeon-id').value),
                procedureName: document.getElementById('ot-procedure-name').value.trim(),
                startTime: startTimeStr,
                endTime: endTimeStr,
                procedureCharge: charge
            };

            try {
                await authFetch('/ot/schedules', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Surgery scheduled successfully!', 'success');
                document.getElementById('lookup-ot-adm-id').value = admId;
                fetchOtSchedules(admId);
            } catch (err) {}
        });
    }

    document.getElementById('fetch-ot-schedules-btn').addEventListener('click', () => {
        const admId = document.getElementById('lookup-ot-adm-id').value.trim();
        if (admId) fetchOtSchedules(parseInt(admId));
    });

    loadOtRoomsDropdown();
}

window.updateOtStatus = async function(scheduleId, status, admissionId) {
    try {
        await authFetch(`/ot/schedules/${scheduleId}/status?status=${status}`, { method: 'PATCH' });
        showToast(`Surgery status updated to ${status}`, 'success');
        const admInput = document.getElementById('lookup-ot-adm-id');
        if (admInput) {
            admInput.value = admissionId;
            document.getElementById('fetch-ot-schedules-btn').click();
        }
    } catch (err) {}
};

window.completeSurgeryModal = async function(scheduleId, admissionId) {
    const notes = prompt("Enter post-op surgical notes & recovery summary:");
    if (notes === null) return;
    try {
        await authFetch(`/ot/schedules/${scheduleId}/complete`, {
            method: 'PATCH',
            body: JSON.stringify({ surgicalNotes: notes || "Procedure completed successfully without complications." })
        });
        showToast('Surgery marked as completed!', 'success');
        const admInput = document.getElementById('lookup-ot-adm-id');
        if (admInput) {
            admInput.value = admissionId;
            document.getElementById('fetch-ot-schedules-btn').click();
        }
    } catch (err) {}
};

// ----------------------------------------------------
// 7. Inpatient Billing & Live Razorpay Checkout View
// ----------------------------------------------------
async function renderBillingView(container) {
    const canSettle = state.role === 'ADMIN' || state.role === 'ACCOUNTANT';

    container.innerHTML = `
        <div class="view-grid-layout" style="${!canSettle ? 'grid-template-columns: 1fr;' : ''}">
            ${canSettle ? `
            <div class="panel-column" style="display: flex; flex-direction: column; gap: 12px;">
                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-calculator"></i> Aggregate & Generate Bill</h3>
                    </div>
                    <form id="generate-invoice-form">
                        <div class="input-group">
                            <label>Admission ID</label>
                            <input type="number" id="bill-admission-id" min="1" required placeholder="Admission ID (e.g. 2)">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fa-solid fa-file-invoice"></i> Generate Inpatient Invoice
                        </button>
                    </form>
                </div>

                <div class="glass-card panel-card">
                    <div class="panel-header">
                        <h3><i class="fa-solid fa-money-bill-wave"></i> Offline Counter Settle</h3>
                    </div>
                    <form id="settle-offline-form">
                        <div class="input-group">
                            <label>Invoice ID</label>
                            <input type="number" id="offline-invoice-id" min="1" required placeholder="Invoice ID (e.g. 1)">
                        </div>
                        <div class="input-group">
                            <label>Payment Mode</label>
                            <select id="offline-payment-mode" required>
                                <option value="CASH">CASH (Counter Settlement)</option>
                                <option value="INSURANCE">INSURANCE (TPA Settlement)</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-block" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.4);">
                            <i class="fa-solid fa-receipt"></i> Settle Bill
                        </button>
                    </form>
                </div>
            </div>
            ` : ''}

            <div class="glass-card panel-card">
                <div class="panel-header">
                    <h3><i class="fa-solid fa-file-invoice-dollar"></i> Inpatient Invoice Summary</h3>
                    <div style="display: flex; gap: 6px;">
                        <input type="number" id="lookup-bill-adm-id" min="1" placeholder="Adm ID (e.g. 2)" style="width: 120px; padding: 5px 8px; font-size: 11px; background: rgba(7,13,30,0.6); border: 1px solid var(--glass-border); color: var(--text-main); border-radius: 4px;">
                        <button id="fetch-invoice-btn" class="btn btn-xs btn-primary">Lookup</button>
                    </div>
                </div>

                <div id="invoice-display-container">
                    <div style="text-align: center; color: var(--text-muted); padding: 30px;">
                        <i class="fa-solid fa-receipt" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>Generate an invoice or enter an Admission ID to view tariff summary.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    async function loadInvoiceData(admissionId) {
        const container = document.getElementById('invoice-display-container');
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Aggregating charges...</div>`;
        try {
            const inv = await authFetch(`/billing/invoices/admission/${admissionId}`);
            if (!inv) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">No invoice found for Admission #${admissionId}. Generate one using the left panel.</div>`;
                return;
            }

            container.innerHTML = `
                <div class="invoice-card">
                    <div class="invoice-header-row">
                        <div>
                            <h3 style="font-size: 16px;">Invoice #${inv.id}</h3>
                            <span style="font-size: 11px; color: var(--text-muted);">Admission Reference: #${inv.admissionId}</span>
                        </div>
                        <span class="badge ${inv.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">${inv.paymentStatus}</span>
                    </div>

                    <div class="tariff-breakdown">
                        <div class="tariff-item">
                            <span><i class="fa-solid fa-bed" style="width: 18px;"></i> Room / Bed Charges:</span>
                            <b>₹${inv.roomCharges.toFixed(2)}</b>
                        </div>
                        <div class="tariff-item">
                            <span><i class="fa-solid fa-flask-vial" style="width: 18px;"></i> Diagnostic Pathology / Lab:</span>
                            <b>₹${inv.labCharges.toFixed(2)}</b>
                        </div>
                        <div class="tariff-item">
                            <span><i class="fa-solid fa-pills" style="width: 18px;"></i> Pharmacy / MAR Medications:</span>
                            <b>₹${inv.medicineCharges.toFixed(2)}</b>
                        </div>
                        <div class="tariff-item">
                            <span><i class="fa-solid fa-syringe" style="width: 18px;"></i> OT & Surgical Procedures:</span>
                            <b>₹${inv.otCharges.toFixed(2)}</b>
                        </div>

                        <div class="tariff-total-row">
                            <span>Net Payable Amount:</span>
                            <span>₹${inv.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    ${inv.paymentStatus === 'PAID' ? `
                        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 10px; border-radius: var(--radius-sm); font-size: 11px; color: var(--accent-green);">
                            <div><i class="fa-solid fa-check-circle"></i> <b>Settled via:</b> ${inv.paymentMode}</div>
                            ${inv.razorpayPaymentId ? `<div><b>Payment Ref:</b> ${inv.razorpayPaymentId}</div>` : ''}
                            <div><b>Settled At:</b> ${new Date(inv.settledAt).toLocaleString()}</div>
                        </div>
                    ` : `
                        <div style="display: flex; gap: 10px; margin-top: 6px;">
                            <button onclick="launchRazorpayCheckout(${inv.id}, ${inv.admissionId})" class="btn btn-primary btn-block">
                                <i class="fa-solid fa-bolt"></i> Pay with Razorpay (UPI / Card)
                            </button>
                        </div>
                    `}
                </div>
            `;
        } catch (e) {
            container.innerHTML = `<div style="color: var(--accent-rose); text-align: center; padding: 24px;">Error retrieving invoice records.</div>`;
        }
    }

    if (canSettle) {
        document.getElementById('generate-invoice-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const admId = parseInt(document.getElementById('bill-admission-id').value);
            try {
                await authFetch(`/billing/invoices/admission/${admId}/generate`, { method: 'POST' });
                showToast(`Invoice generated for Admission #${admId}!`, 'success');
                document.getElementById('lookup-bill-adm-id').value = admId;
                loadInvoiceData(admId);
            } catch (err) {}
        });

        document.getElementById('settle-offline-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const invId = parseInt(document.getElementById('offline-invoice-id').value);
            const mode = document.getElementById('offline-payment-mode').value;
            try {
                await authFetch(`/billing/invoices/${invId}/settle-offline?mode=${mode}`, { method: 'PATCH' });
                showToast(`Invoice #${invId} settled successfully via ${mode}!`, 'success');
                const admId = document.getElementById('lookup-bill-adm-id').value;
                if (admId) loadInvoiceData(parseInt(admId));
            } catch (err) {}
        });
    }

    document.getElementById('fetch-invoice-btn').addEventListener('click', () => {
        const admId = document.getElementById('lookup-bill-adm-id').value.trim();
        if (admId) loadInvoiceData(parseInt(admId));
    });
}

// Global Razorpay Checkout Trigger
window.launchRazorpayCheckout = async function(invoiceId, admissionId) {
    try {
        const orderData = await authFetch(`/billing/invoices/${invoiceId}/create-razorpay-order`, { method: 'POST' });

        if (!orderData || !orderData.razorpayOrderId) {
            throw new Error('Failed to initiate Razorpay order.');
        }

        const options = {
            "key": orderData.razorpayKeyId,
            "amount": Math.round(orderData.amount * 100),
            "currency": orderData.currency,
            "name": "CarePulse Hospital",
            "description": `Inpatient Settlement (Adm #${admissionId})`,
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
                    loadView('billing');
                    setTimeout(() => {
                        const admInput = document.getElementById('lookup-bill-adm-id');
                        if (admInput) {
                            admInput.value = admissionId;
                            document.getElementById('fetch-invoice-btn').click();
                        }
                    }, 300);
                } catch (verifyErr) {
                    showToast('Payment verification failed on server.', 'error');
                }
            },
            "prefill": {
                "name": state.username || "Patient Relative",
                "email": "billing@carepulse.hospital"
            },
            "theme": { "color": "#38bdf8" }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

// Global Nav Listeners
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        loadView(button.getAttribute('data-view'));
    });
});

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', checkAuthState);