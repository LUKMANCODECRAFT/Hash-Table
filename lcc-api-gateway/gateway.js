/* ==========================================================================
   LCC SERVICE GATEWAY & TOKEN VAULT v2.0 ENGINE
   ========================================================================== */

// System State Registry
const state = {
    tokens: [],
    routes: [
        { id: 'rt_1', method: 'POST', path: '/v2/users/auth', target: 'svc-auth-master', status: '200 OK', enabled: true },
        { id: 'rt_2', method: 'POST', path: '/v2/metrics/push', target: 'svc-telemetry-collector', status: '200 OK', enabled: true },
        { id: 'rt_3', method: 'PUT', path: '/v1/projects/deploy', target: 'svc-deploy-pipeline', status: '200 OK', enabled: true },
        { id: 'rt_4', method: 'DELETE', path: '/v2/billing/invoice', target: 'svc-billing-ledger', status: '200 OK', enabled: true }
    ],
    logs: [],
    metrics: {
        totalRequests: 0,
        successRequests: 0,
        blockedRequests: 0,
        latencies: []
    },
    streamPaused: false,
    logFilter: 'ALL',
    activeTab: 'vault'
};

// DOM Query Cache
const DOM = {
    // Navigation & Header
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    clockDisplay: document.getElementById('clock-display'),
    activeTokensCount: document.getElementById('active-tokens-count'),
    activeRoutesCount: document.getElementById('active-routes-count'),
    
    // Vault Form & Table
    tokenForm: document.getElementById('token-form'),
    tokenNameInput: document.getElementById('token-name'),
    tokenScopeSelect: document.getElementById('token-scope'),
    tokenExpirationSelect: document.getElementById('token-expiration'),
    tokenRateLimitSelect: document.getElementById('token-ratelimit'),
    tokensTableBody: document.getElementById('tokens-table-body'),

    // Route Configurator
    routesTableBody: document.getElementById('routes-table-body'),
    addRouteBtn: document.getElementById('add-route-btn'),
    customRouteCard: document.getElementById('custom-route-card'),
    routeForm: document.getElementById('route-form'),
    cancelRouteBtn: document.getElementById('cancel-route-btn'),

    // Telemetry & Metrics
    metricTotalReq: document.getElementById('metric-total-req'),
    metricSuccessRate: document.getElementById('metric-success-rate'),
    metricAvgLatency: document.getElementById('metric-avg-latency'),
    metricBlockedReq: document.getElementById('metric-blocked-req'),
    logTerminal: document.getElementById('log-terminal'),
    logFilterSelect: document.getElementById('log-filter-select'),
    toggleStreamBtn: document.getElementById('toggle-stream-btn'),
    clearTerminalBtn: document.getElementById('clear-terminal-btn'),
    exportLogsBtn: document.getElementById('export-logs-btn'),

    // Sandbox Simulator
    sandboxForm: document.getElementById('sandbox-form'),
    sandboxMethod: document.getElementById('sandbox-method'),
    sandboxEndpoint: document.getElementById('sandbox-endpoint'),
    sandboxTokenSelect: document.getElementById('sandbox-token-select'),
    sandboxBody: document.getElementById('sandbox-body'),
    sandboxStatusBadge: document.getElementById('sandbox-status-badge'),
    sandboxMetrics: document.getElementById('sandbox-metrics'),
    sandboxLatency: document.getElementById('sandbox-latency'),
    sandboxResponseBody: document.getElementById('sandbox-response-body')
};

/* ==========================================================================
   INITIALIZATION & TAB SYSTEM
   ========================================================================== */
function initSystem() {
    setupTabNavigation();
    setupClock();
    seedInitialData();
    setupEventListeners();
    renderAll();
    startTelemetryEngine();
}

function setupTabNavigation() {
    DOM.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabKey = item.getAttribute('data-tab');
            switchTab(tabKey);
        });
    });
}

function switchTab(tabKey) {
    state.activeTab = tabKey;
    
    // Update nav links styling
    DOM.navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabKey) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update tab visibility
    DOM.tabContents.forEach(tab => {
        if (tab.id === `tab-${tabKey}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Dynamic header text update
    const headers = {
        vault: { title: 'Token Vault & Credential Management', sub: 'Generate, scope, and control microservice authorization tokens.' },
        routes: { title: 'Proxy Route Configurator', sub: 'Manage API gateway endpoints, upstream microservices, and response mocks.' },
        monitor: { title: 'Telemetry & Live Analytics', sub: 'Real-time proxy traffic stream, latency metrics, and log diagnostics.' },
        sandbox: { title: 'Interactive API Sandbox Simulator', sub: 'Compose and execute mock proxy requests to verify token policies.' }
    };

    if (headers[tabKey]) {
        DOM.pageTitle.textContent = headers[tabKey].title;
        DOM.pageSubtitle.textContent = headers[tabKey].sub;
    }

    if (tabKey === 'sandbox') {
        populateSandboxDropdowns();
    }
}

function setupClock() {
    setInterval(() => {
        const now = new Date();
        DOM.clockDisplay.textContent = now.toISOString().slice(11, 19) + ' UTC';
    }, 1000);
}

function seedInitialData() {
    // Generate a default master token for immediate out-of-the-box demonstration
    generateToken('Core API Gateway Proxy', 'admin:full', 'never', '1000 req/min');
    pushLogEntry('SYSTEM', 'Gateway state initialized with default core security context.');
}

/* ==========================================================================
   TOKEN VAULT ENGINE
   ========================================================================== */
function generateToken(name, scope, expiration, ratelimit) {
    const segments = new Uint32Array(4);
    window.crypto.getRandomValues(segments);
    const hexString = Array.from(segments, num => num.toString(16).padStart(8, '0')).join('');
    
    const tokenObj = {
        id: `tok_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: name || 'Unnamed Service Worker',
        rawToken: `lcc_live_${hexString}`,
        scope: scope,
        expiration: expiration,
        ratelimit: ratelimit,
        status: 'ACTIVE',
        isRevealed: false,
        createdAt: new Date().toLocaleDateString()
    };

    state.tokens.push(tokenObj);
    pushLogEntry('SUCCESS', `Issued Access Token [${tokenObj.name}] with scope [${scope}].`);
    renderTokens();
    populateSandboxDropdowns();
}

function revokeToken(tokenId) {
    const tokenObj = state.tokens.find(t => t.id === tokenId);
    if (tokenObj) {
        tokenObj.status = 'REVOKED';
        pushLogEntry('WARNING', `Token Revocation: Key credential [${tokenObj.name}] marked as REVOKED.`);
        renderTokens();
        populateSandboxDropdowns();
    }
}

function toggleTokenReveal(tokenId) {
    const tokenObj = state.tokens.find(t => t.id === tokenId);
    if (tokenObj) {
        tokenObj.isRevealed = !tokenObj.isRevealed;
        if (tokenObj.isRevealed) {
            pushLogEntry('WARNING', `Security Alert: Plaintext secret key displayed for [${tokenObj.name}].`);
        }
        renderTokens();
    }
}

async function copyTokenToClipboard(rawToken, buttonEl) {
    try {
        await navigator.clipboard.writeText(rawToken);
        const originalText = buttonEl.textContent;
        buttonEl.textContent = 'Copied!';
        pushLogEntry('SUCCESS', 'Credential key buffer piped to host OS clipboard.');
        setTimeout(() => {
            buttonEl.textContent = originalText;
        }, 1500);
    } catch (err) {
        pushLogEntry('ERROR', 'Clipboard write error: Permissions denied by host browser.');
    }
}

function renderTokens() {
    const activeTokens = state.tokens.filter(t => t.status === 'ACTIVE');
    DOM.activeTokensCount.textContent = activeTokens.length;

    DOM.tokensTableBody.innerHTML = '';

    if (state.tokens.length === 0) {
        DOM.tokensTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">No active credentials. Issue a token above.</td></tr>`;
        return;
    }

    state.tokens.forEach(tok => {
        const row = document.createElement('tr');
        
        const masked = tok.rawToken.slice(0, 9) + '••••••••••••••••••••••••';
        const displayKey = tok.isRevealed ? tok.rawToken : masked;
        const statusBadgeClass = tok.status === 'ACTIVE' ? 'status-badge active' : 'status-badge revoked';

        row.innerHTML = `
            <td><strong>${escapeHtml(tok.name)}</strong></td>
            <td class="token-cell">${displayKey}</td>
            <td><span class="scope-badge">${tok.scope}</span></td>
            <td>${tok.expiration}</td>
            <td><span class="${statusBadgeClass}">${tok.status}</span></td>
            <td>
                <div class="action-group">
                    <button class="btn-secondary btn-sm toggle-btn">${tok.isRevealed ? 'Hide' : 'Reveal'}</button>
                    <button class="btn-secondary btn-sm copy-btn">Copy</button>
                    ${tok.status === 'ACTIVE' ? `<button class="btn-danger btn-sm revoke-btn">Revoke</button>` : ''}
                </div>
            </td>
        `;

        // Action event listeners
        const toggleBtn = row.querySelector('.toggle-btn');
        const copyBtn = row.querySelector('.copy-btn');
        const revokeBtn = row.querySelector('.revoke-btn');

        toggleBtn.addEventListener('click', () => toggleTokenReveal(tok.id));
        copyBtn.addEventListener('click', () => copyTokenToClipboard(tok.rawToken, copyBtn));
        if (revokeBtn) {
            revokeBtn.addEventListener('click', () => revokeToken(tok.id));
        }

        DOM.tokensTableBody.appendChild(row);
    });
}

/* ==========================================================================
   ROUTE CONFIGURATOR ENGINE
   ========================================================================== */
function renderRoutes() {
    DOM.activeRoutesCount.textContent = state.routes.filter(r => r.enabled).length;
    DOM.routesTableBody.innerHTML = '';

    state.routes.forEach(route => {
        const row = document.createElement('tr');
        
        let statusBadgeClass = 'status-badge ok';
        if (route.status.startsWith('4')) statusBadgeClass = 'status-badge warning';
        if (route.status.startsWith('5')) statusBadgeClass = 'status-badge error';

        row.innerHTML = `
            <td><span class="method-badge ${route.method}">${route.method}</span></td>
            <td><code style="font-family: var(--font-mono); color: var(--accent-blue);">${route.path}</code></td>
            <td>${route.target}</td>
            <td>
                <select class="select-sm route-status-select">
                    <option value="200 OK" ${route.status === '200 OK' ? 'selected' : ''}>200 OK</option>
                    <option value="201 Created" ${route.status === '201 Created' ? 'selected' : ''}>201 Created</option>
                    <option value="400 Bad Request" ${route.status === '400 Bad Request' ? 'selected' : ''}>400 Bad Request</option>
                    <option value="401 Unauthorized" ${route.status === '401 Unauthorized' ? 'selected' : ''}>401 Unauthorized</option>
                    <option value="429 Rate Limited" ${route.status === '429 Rate Limited' ? 'selected' : ''}>429 Rate Limited</option>
                    <option value="503 Maintenance" ${route.status === '503 Maintenance' ? 'selected' : ''}>503 Maintenance</option>
                </select>
            </td>
            <td>
                <span class="${route.enabled ? 'status-badge active' : 'status-badge revoked'}">
                    ${route.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td>
                <button class="btn-secondary btn-sm toggle-route-btn">${route.enabled ? 'Disable' : 'Enable'}</button>
            </td>
        `;

        const statusSelect = row.querySelector('.route-status-select');
        const toggleRouteBtn = row.querySelector('.toggle-route-btn');

        statusSelect.addEventListener('change', (e) => {
            route.status = e.target.value;
            pushLogEntry('SYSTEM', `Route configuration changed for [${route.path}] status: ${route.status}`);
            renderRoutes();
        });

        toggleRouteBtn.addEventListener('click', () => {
            route.enabled = !route.enabled;
            pushLogEntry('SYSTEM', `Route [${route.path}] ${route.enabled ? 'ENABLED' : 'DISABLED'}.`);
            renderRoutes();
            populateSandboxDropdowns();
        });

        DOM.routesTableBody.appendChild(row);
    });
}

function addCustomRoute(method, path, target, status) {
    const newRoute = {
        id: `rt_${Date.now()}`,
        method: method,
        path: path.startsWith('/') ? path : `/${path}`,
        target: target,
        status: status,
        enabled: true
    };

    state.routes.push(newRoute);
    pushLogEntry('SUCCESS', `Added new custom proxy route: ${method} ${newRoute.path} -> ${target}`);
    renderRoutes();
    populateSandboxDropdowns();
}

/* ==========================================================================
   TELEMETRY & LOGGING ENGINE
   ========================================================================== */
function pushLogEntry(type, message) {
    const timestamp = new Date().toISOString().slice(11, 19);
    const logObj = { timestamp, type, message };
    state.logs.push(logObj);
    
    // Keep max 200 logs buffer
    if (state.logs.length > 200) {
        state.logs.shift();
    }

    renderLogs();
}

function renderLogs() {
    DOM.logTerminal.innerHTML = '';
    
    const filtered = state.logs.filter(log => {
        if (state.logFilter === 'ALL') return true;
        return log.type === state.logFilter;
    });

    filtered.forEach(log => {
        const line = document.createElement('div');
        line.className = `log-line ${log.type.toLowerCase()}`;
        line.textContent = `[${log.timestamp}] [${log.type}] ${log.message}`;
        DOM.logTerminal.appendChild(line);
    });

    DOM.logTerminal.scrollTop = DOM.logTerminal.scrollHeight;
}

function startTelemetryEngine() {
    setInterval(() => {
        if (state.streamPaused) return;

        const enabledRoutes = state.routes.filter(r => r.enabled);
        if (enabledRoutes.length === 0) return;

        const randomRoute = enabledRoutes[Math.floor(Math.random() * enabledRoutes.length)];
        const activeTokens = state.tokens.filter(t => t.status === 'ACTIVE');
        
        let statusCode = randomRoute.status;
        let logType = 'SUCCESS';

        if (activeTokens.length === 0 || Math.random() < 0.15) {
            statusCode = '401 Unauthorized';
            logType = 'WARNING';
        } else if (randomRoute.status.startsWith('4')) {
            logType = 'WARNING';
        } else if (randomRoute.status.startsWith('5')) {
            logType = 'ERROR';
        }

        const latency = Math.floor(Math.random() * 45) + 8; // 8ms - 53ms latency

        // Record metrics
        state.metrics.totalRequests++;
        if (logType === 'SUCCESS') {
            state.metrics.successRequests++;
        } else {
            state.metrics.blockedRequests++;
        }
        state.metrics.latencies.push(latency);
        if (state.metrics.latencies.length > 50) state.metrics.latencies.shift();

        updateMetricsUI();

        pushLogEntry(logType, `Proxy Event: ${randomRoute.method} ${randomRoute.path} -> ${randomRoute.target} - Status: ${statusCode} (${latency}ms)`);
    }, 3500);
}

function updateMetricsUI() {
    DOM.metricTotalReq.textContent = state.metrics.totalRequests.toLocaleString();
    
    const successRate = state.metrics.totalRequests > 0 
        ? ((state.metrics.successRequests / state.metrics.totalRequests) * 100).toFixed(1) + '%'
        : '100%';
    DOM.metricSuccessRate.textContent = successRate;

    const avgLatency = state.metrics.latencies.length > 0
        ? Math.round(state.metrics.latencies.reduce((a, b) => a + b, 0) / state.metrics.latencies.length) + ' ms'
        : '18 ms';
    DOM.metricAvgLatency.textContent = avgLatency;

    DOM.metricBlockedReq.textContent = state.metrics.blockedRequests.toLocaleString();
}

function exportLogs(format = 'json') {
    if (state.logs.length === 0) {
        alert('No telemetry logs available to export.');
        return;
    }

    let dataStr = '';
    let mimeType = '';
    let fileName = `telemetry_logs_${Date.now()}`;

    if (format === 'csv') {
        mimeType = 'text/csv';
        fileName += '.csv';
        dataStr = 'Timestamp,Type,Message\n' + 
            state.logs.map(l => `"${l.timestamp}","${l.type}","${l.message.replace(/"/g, '""')}"`).join('\n');
    } else {
        mimeType = 'application/json';
        fileName += '.json';
        dataStr = JSON.stringify(state.logs, null, 2);
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    pushLogEntry('SYSTEM', `Exported ${state.logs.length} log lines to file [${fileName}].`);
}

/* ==========================================================================
   API SANDBOX ENGINE
   ========================================================================== */
function populateSandboxDropdowns() {
    DOM.sandboxEndpoint.innerHTML = '';
    state.routes.forEach(r => {
        if (r.enabled) {
            const opt = document.createElement('option');
            opt.value = r.path;
            opt.textContent = `${r.method} ${r.path} (${r.target})`;
            DOM.sandboxEndpoint.appendChild(opt);
        }
    });

    DOM.sandboxTokenSelect.innerHTML = `<option value="">No Authorization Header (Unauthenticated)</option>`;
    state.tokens.forEach(t => {
        if (t.status === 'ACTIVE') {
            const opt = document.createElement('option');
            opt.value = t.rawToken;
            opt.textContent = `${t.name} [${t.scope}] (${t.rawToken.slice(0, 16)}...)`;
            DOM.sandboxTokenSelect.appendChild(opt);
        }
    });
}

function executeSandboxRequest(method, endpointPath, tokenHeader, bodyText) {
    const route = state.routes.find(r => r.path === endpointPath);
    const tokenObj = state.tokens.find(t => t.rawToken === tokenHeader);

    const startTime = performance.now();

    let statusCode = '200 OK';
    let responsePayload = {};
    let isSuccess = true;

    if (!route || !route.enabled) {
        statusCode = '503 Maintenance';
        isSuccess = false;
        responsePayload = {
            error: 'Service Unavailable',
            message: 'Target route endpoint is disabled or missing in proxy router rules.',
            status: 503
        };
    } else if (!tokenHeader) {
        statusCode = '401 Unauthorized';
        isSuccess = false;
        responsePayload = {
            error: 'Missing Credentials',
            message: 'No authorization token supplied in HTTP header Authorization: Bearer <token>',
            status: 401
        };
    } else if (tokenObj && tokenObj.status === 'REVOKED') {
        statusCode = '403 Forbidden';
        isSuccess = false;
        responsePayload = {
            error: 'Credential Revoked',
            message: 'Provided API production token has been revoked by workspace security administrator.',
            status: 403
        };
    } else {
        statusCode = route.status;
        isSuccess = statusCode.startsWith('2');

        let parsedBody = {};
        try { parsedBody = JSON.parse(bodyText); } catch (e) { parsedBody = { raw: bodyText }; }

        responsePayload = {
            status: statusCode,
            timestamp: new Date().toISOString(),
            proxyGateway: 'lcc-edge-gateway-v2',
            clientContext: {
                tokenName: tokenObj ? tokenObj.name : 'Unknown',
                scope: tokenObj ? tokenObj.scope : 'none',
                rateLimit: tokenObj ? tokenObj.ratelimit : 'default'
            },
            routeInfo: {
                endpoint: route.path,
                targetService: route.target,
                method: method
            },
            data: parsedBody
        };
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime + (Math.random() * 12 + 6));

    // Update Sandbox UI Response Panel
    DOM.sandboxStatusBadge.textContent = statusCode;
    DOM.sandboxStatusBadge.className = isSuccess ? 'status-badge ok' : 'status-badge error';

    DOM.sandboxMetrics.classList.remove('hidden');
    DOM.sandboxLatency.textContent = `${duration} ms`;

    DOM.sandboxResponseBody.textContent = JSON.stringify(responsePayload, null, 2);

    // Push log to telemetry stream
    pushLogEntry(isSuccess ? 'SUCCESS' : 'WARNING', `Sandbox Request: ${method} ${endpointPath} - Status: ${statusCode} (${duration}ms)`);
}

/* ==========================================================================
   EVENT LISTENERS & BINDINGS
   ========================================================================== */
function setupEventListeners() {
    // Issue Token Form Submit
    DOM.tokenForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = DOM.tokenNameInput.value.trim();
        const scope = DOM.tokenScopeSelect.value;
        const expiration = DOM.tokenExpirationSelect.value;
        const rateLimit = DOM.tokenRateLimitSelect.value;

        generateToken(name, scope, expiration, rateLimit);
        DOM.tokenNameInput.value = '';
    });

    // Custom Route Form Toggle & Submit
    DOM.addRouteBtn.addEventListener('click', () => {
        DOM.customRouteCard.classList.remove('hidden');
    });

    DOM.cancelRouteBtn.addEventListener('click', () => {
        DOM.customRouteCard.classList.add('hidden');
    });

    DOM.routeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const method = document.getElementById('route-method').value;
        const path = document.getElementById('route-path').value.trim();
        const target = document.getElementById('route-target').value.trim();
        const status = document.getElementById('route-status').value;

        addCustomRoute(method, path, target, status);
        DOM.customRouteCard.classList.add('hidden');
        DOM.routeForm.reset();
    });

    // Log Controls
    DOM.logFilterSelect.addEventListener('change', (e) => {
        state.logFilter = e.target.value;
        renderLogs();
    });

    DOM.toggleStreamBtn.addEventListener('click', () => {
        state.streamPaused = !state.streamPaused;
        DOM.toggleStreamBtn.textContent = state.streamPaused ? '▶️ Resume Stream' : '⏸️ Pause Stream';
        pushLogEntry('SYSTEM', `Telemetry stream simulation ${state.streamPaused ? 'PAUSED' : 'RESUMED'}.`);
    });

    DOM.clearTerminalBtn.addEventListener('click', () => {
        state.logs = [];
        renderLogs();
        pushLogEntry('SYSTEM', 'Log terminal buffer cleared by user.');
    });

    DOM.exportLogsBtn.addEventListener('click', () => {
        exportLogs('json');
    });

    // Sandbox Form Submit
    DOM.sandboxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const method = DOM.sandboxMethod.value;
        const endpoint = DOM.sandboxEndpoint.value;
        const token = DOM.sandboxTokenSelect.value;
        const body = DOM.sandboxBody.value;

        executeSandboxRequest(method, endpoint, token, body);
    });
}

function renderAll() {
    renderTokens();
    renderRoutes();
    renderLogs();
    updateMetricsUI();
    populateSandboxDropdowns();
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

// Boot application when DOM is ready
document.addEventListener('DOMContentLoaded', initSystem);