// ==========================================================================
// LUKMAN CODECRAFT (LCC) - FREELANCE COMMAND CENTER CORE ENGINE (v2.0)
// ==========================================================================

// Global FX Rates & Currency Memory Map
let fxRates = {
    NGN: 1500,
    EUR: 0.92,
    GBP: 0.78,
    CAD: 1.36,
    AUD: 1.52,
    JPY: 155.0,
    USD: 1.0
};

const currencySymbols = {
    NGN: "₦",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    JPY: "¥",
    USD: "$"
};

let selectedCurrency = localStorage.getItem("lcc_target_currency") || "NGN";

// ==========================================================================
// LOCAL STORAGE VAULT & DATA MIGRATION ENGINE
// ==========================================================================
let rawVaultData = JSON.parse(localStorage.getItem("leadsVault")) || [];

// Ensure all stored leads follow schema v2
let savedLeads = rawVaultData.map((lead, index) => {
    return {
        id: lead.id || `lead_${Date.now()}_${index}`,
        name: lead.name || "Unknown Client",
        email: lead.email || "",
        project: lead.project || "General Automation",
        budget: Number(lead.budget) || 0,
        speed: Number(lead.speed) || 1.0,
        stage: lead.stage || "New",
        notes: lead.notes || "",
        createdAt: lead.createdAt || new Date().toISOString()
    };
});

// Sync sanitized schema back to storage
localStorage.setItem("leadsVault", JSON.stringify(savedLeads));

// ==========================================================================
// DOM ELEMENT HOOKS
// ==========================================================================
// Metric Displays
const metricTotalValuation = document.getElementById("metric-total-valuation");
const metricLocalValuation = document.getElementById("metric-local-valuation");
const metricLeadCount = document.getElementById("metric-lead-count");
const metricWonCount = document.getElementById("metric-won-count");
const metricRiskCount = document.getElementById("metric-risk-count");
const metricAvgBudget = document.getElementById("metric-avg-budget");

// FX Rate Sync Controls
const currencySelect = document.getElementById("target-currency-select");
const syncButton = document.getElementById("sync-btn");
const rateDisplay = document.getElementById("rate-display");

// Lead Form Inputs
const leadForm = document.getElementById("lead-form");
const clientNameInput = document.getElementById("client-name");
const clientEmailInput = document.getElementById("client-email");
const projectTypeInput = document.getElementById("project-type");
const clientBudgetInput = document.getElementById("client-budget");
const clientSpeedInput = document.getElementById("client-speed");
const leadStageInput = document.getElementById("lead-stage");
const clientNotesInput = document.getElementById("client-notes");

// Vetting Results Box
const outputBox = document.getElementById("output-box");
const resultName = document.getElementById("res-name");
const resultProject = document.getElementById("res-project");
const resultValuation = document.getElementById("res-valuation");
const resultTrafficLoss = document.getElementById("res-traffic-loss");
const resultStatus = document.getElementById("res-status");
const evaluationTimestamp = document.getElementById("evaluation-timestamp");

// Table & Toolbar
const ledgerRows = document.getElementById("ledger-rows");
const emptyLedgerNotice = document.getElementById("empty-ledger-notice");
const searchInput = document.getElementById("search-input");
const filterStageSelect = document.getElementById("filter-stage");
const filterScoreSelect = document.getElementById("filter-score");
const exportCsvBtn = document.getElementById("export-csv-btn");

// Modal Pitch Viewer
const pitchModal = document.getElementById("pitch-modal");
const pitchModalText = document.getElementById("pitch-modal-text");
const closeModalBtn = document.getElementById("close-modal-btn");
const closeModalSecondary = document.getElementById("close-modal-secondary");
const copyPitchBtn = document.getElementById("copy-pitch-btn");

// Initialize currency selector state
if (currencySelect) {
    currencySelect.value = selectedCurrency;
}

// ==========================================================================
// MODULE 1: FINANCIAL FX NETWORK ENGINE
// ==========================================================================
async function fetchFxRates() {
    rateDisplay.textContent = "Syncing live rates...";
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data && data.rates) {
            fxRates = { ...fxRates, ...data.rates };
            updateRateDisplay();
            updateDashboardMetrics();
            renderLedger();
        }
    } catch (error) {
        console.error("FX rate sync failed:", error);
        rateDisplay.textContent = `Offline (Using 1 USD = ${formatCurrency(fxRates[selectedCurrency], selectedCurrency)})`;
    }
}

function updateRateDisplay() {
    const rate = fxRates[selectedCurrency] || 1;
    const symbol = currencySymbols[selectedCurrency] || selectedCurrency;
    rateDisplay.textContent = `1 USD = ${symbol}${rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${selectedCurrency}`;
}

currencySelect.addEventListener("change", function () {
    selectedCurrency = currencySelect.value;
    localStorage.setItem("lcc_target_currency", selectedCurrency);
    updateRateDisplay();
    updateDashboardMetrics();
    renderLedger();
});

syncButton.addEventListener("click", fetchFxRates);

// Helper function to format money
function formatCurrency(amount, currCode = "USD") {
    const symbol = currencySymbols[currCode] || "$";
    return `${symbol}${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// ==========================================================================
// MODULE 2: MONETIZATION SCORING & PROPOSAL PITCH GENERATOR
// ==========================================================================
function evaluateLeadScore(budget, speed) {
    if (speed > 3.0 && budget >= 1000) {
        const estimatedLoss = Math.min(45, Math.round((speed - 1.0) * 11));
        return {
            tier: "RISK",
            title: "⚠️ HIGH-VALUE RETENTION RISK",
            trafficLossText: `~${estimatedLoss}% Traffic Bounce`,
            message: `Client losing up to ${estimatedLoss}% of mobile visitors due to ${speed}s page latency! Pitch custom optimized LCC API architecture.`,
            cssClass: "high-risk"
        };
    } else if (budget >= 1000) {
        return {
            tier: "HIGH",
            title: "🟢 HIGH-VALUE RADAR TARGET",
            trafficLossText: "Optimal (< 3.0s)",
            message: "Speed profile stable. Initiate outreach for specialized AI workflow integration & backend feature expansion.",
            cssClass: "high-target"
        };
    } else {
        return {
            tier: "LOW",
            title: "🔴 PASS / LOW PRIORITY",
            trafficLossText: "N/A",
            message: "Budget tier below premium LCC parameters. Suggest standardized automated self-service package.",
            cssClass: "low-priority"
        };
    }
}

function generateProposalPitch(lead) {
    const rate = fxRates[selectedCurrency] || 1;
    const localVal = lead.budget * rate;
    const evaluation = evaluateLeadScore(lead.budget, lead.speed);

    return `SUBJECT: Technical Performance Audit & Optimization Proposal for ${lead.name}

Dear ${lead.name} Team,

I conducted an algorithmic speed & infrastructure analysis on your ${lead.project} portal.

Key Diagnostic Findings:
• Current Front-end Load Latency: ${lead.speed} seconds
• Estimated Visitor Bounce Risk: ${evaluation.trafficLossText}
• Recommended Technical Upgrade: Custom High-Concurrency API & Next.js Architecture

By optimizing your application's rendering pipeline and database queries, we can decrease load times to under 1.2 seconds, directly boosting user retention and conversion efficiency by up to 35%.

Project Estimate: $${lead.budget.toLocaleString()} USD (${formatCurrency(localVal, selectedCurrency)})
Target Timeline: 10-14 Days Execution Cycle

Let me know if you would like to review the technical blueprint this week.

Best regards,

Lukman CodeCraft (LCC) Technical Lead
Website: https://lukmancodecraft.github.io/freelance-dashboard/`;
}

// ==========================================================================
// MODULE 3: LEAD INTAKE FORM PROCESSOR
// ==========================================================================
leadForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const clientName = clientNameInput.value.trim();
    const clientEmail = clientEmailInput.value.trim();
    const projectType = projectTypeInput.value.trim();
    const clientBudget = Number(clientBudgetInput.value);
    const clientSpeed = Number(clientSpeedInput.value);
    const leadStage = leadStageInput.value;
    const clientNotes = clientNotesInput.value.trim();

    const evaluation = evaluateLeadScore(clientBudget, clientSpeed);
    const rate = fxRates[selectedCurrency] || 1;
    const localValuation = clientBudget * rate;

    // Display Output Card
    outputBox.style.display = "block";
    resultName.textContent = clientName;
    resultProject.textContent = projectType;
    resultValuation.textContent = formatCurrency(localValuation, selectedCurrency);
    resultTrafficLoss.textContent = evaluation.trafficLossText;
    resultStatus.className = `status-alert ${evaluation.cssClass}`;
    resultStatus.innerHTML = `<strong>${evaluation.title}:</strong> ${evaluation.message}`;
    evaluationTimestamp.textContent = `Evaluated ${new Date().toLocaleTimeString()}`;

    // Create New Lead Object
    const newLead = {
        id: `lead_${Date.now()}`,
        name: clientName,
        email: clientEmail,
        project: projectType,
        budget: clientBudget,
        speed: clientSpeed,
        stage: leadStage,
        notes: clientNotes,
        createdAt: new Date().toISOString()
    };

    // Save to Vault
    savedLeads.unshift(newLead); // Latest first
    localStorage.setItem("leadsVault", JSON.stringify(savedLeads));

    // Refresh UI
    updateDashboardMetrics();
    renderLedger();

    // Reset Form
    leadForm.reset();

    // Smooth scroll to output box
    outputBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ==========================================================================
// MODULE 4: ANALYTICS & METRICS ENGINE
// ==========================================================================
function updateDashboardMetrics() {
    const totalLeads = savedLeads.length;
    const totalUsdValuation = savedLeads.reduce((sum, lead) => sum + lead.budget, 0);
    const wonCount = savedLeads.filter(lead => lead.stage === "Won").length;
    const riskCount = savedLeads.filter(lead => lead.speed > 3.0 && lead.budget >= 1000).length;
    const avgBudget = totalLeads > 0 ? Math.round(totalUsdValuation / totalLeads) : 0;

    const rate = fxRates[selectedCurrency] || 1;
    const localValuationTotal = totalUsdValuation * rate;

    metricTotalValuation.textContent = formatCurrency(totalUsdValuation, "USD");
    metricLocalValuation.textContent = `Local: ${formatCurrency(localValuationTotal, selectedCurrency)}`;
    metricLeadCount.textContent = totalLeads;
    metricWonCount.textContent = `${wonCount} Closed-Won`;
    metricRiskCount.textContent = riskCount;
    metricAvgBudget.textContent = formatCurrency(avgBudget, "USD");
}

// ==========================================================================
// MODULE 5: LEDGER TABLE RENDER & ACTION HANDLERS
// ==========================================================================
function renderLedger() {
    ledgerRows.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase().trim();
    const stageFilter = filterStageSelect.value;
    const scoreFilter = filterScoreSelect.value;

    const filteredLeads = savedLeads.filter(lead => {
        // Search filter
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm) ||
                              lead.project.toLowerCase().includes(searchTerm) ||
                              lead.email.toLowerCase().includes(searchTerm) ||
                              lead.notes.toLowerCase().includes(searchTerm);

        // Stage filter
        const matchesStage = (stageFilter === "ALL") || (lead.stage === stageFilter);

        // Score filter
        const evalScore = evaluateLeadScore(lead.budget, lead.speed);
        const matchesScore = (scoreFilter === "ALL") || (evalScore.tier === scoreFilter);

        return matchesSearch && matchesStage && matchesScore;
    });

    if (filteredLeads.length === 0) {
        emptyLedgerNotice.style.display = "block";
        return;
    } else {
        emptyLedgerNotice.style.display = "none";
    }

    const rate = fxRates[selectedCurrency] || 1;

    filteredLeads.forEach(lead => {
        const localVal = lead.budget * rate;
        const evalScore = evaluateLeadScore(lead.budget, lead.speed);

        let badgeClass = "badge-new";
        if (lead.stage === "Pitching") badgeClass = "badge-pitching";
        if (lead.stage === "Won") badgeClass = "badge-won";
        if (lead.stage === "Lost") badgeClass = "badge-lost";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="client-cell">${escapeHtml(lead.name)}</div>
                <div class="client-sub">${escapeHtml(lead.email || "No email provided")}</div>
            </td>
            <td>
                <div style="font-weight: 500;">${escapeHtml(lead.project)}</div>
                ${lead.notes ? `<div class="client-sub" style="font-style: italic;">"${escapeHtml(lead.notes.substring(0, 45))}${lead.notes.length > 45 ? '...' : ''}"</div>` : ''}
            </td>
            <td>
                <div style="font-weight: 600;">$${lead.budget.toLocaleString()}</div>
                <div class="client-sub" style="color: ${lead.speed > 3.0 ? 'var(--warning)' : 'var(--text-muted)'};">
                    ⚡ ${lead.speed}s load time (${evalScore.tier === 'RISK' ? 'Retention Risk' : 'Normal'})
                </div>
            </td>
            <td style="font-weight: 600; color: var(--text-primary);">
                ${formatCurrency(localVal, selectedCurrency)}
            </td>
            <td>
                <select class="stage-selector-inline" data-id="${lead.id}" style="padding: 4px 24px 4px 8px; font-size: 0.8rem; border-radius: 4px;">
                    <option value="New" ${lead.stage === 'New' ? 'selected' : ''}>New</option>
                    <option value="Pitching" ${lead.stage === 'Pitching' ? 'selected' : ''}>Pitching</option>
                    <option value="Won" ${lead.stage === 'Won' ? 'selected' : ''}>Won</option>
                    <option value="Lost" ${lead.stage === 'Lost' ? 'selected' : ''}>Lost</option>
                </select>
            </td>
            <td style="text-align: right;">
                <div class="table-actions" style="justify-content: flex-end;">
                    <button class="btn btn-outline btn-sm view-pitch-btn" data-id="${lead.id}" title="Generate & View Proposal Pitch">
                        Pitch
                    </button>
                    <button class="btn btn-danger btn-sm delete-lead-btn" data-id="${lead.id}" title="Delete Lead">
                        &times;
                    </button>
                </div>
            </td>
        `;
        ledgerRows.appendChild(tr);
    });

    // Attach Event Listeners to Inline Controls
    document.querySelectorAll(".stage-selector-inline").forEach(select => {
        select.addEventListener("change", function () {
            const id = this.getAttribute("data-id");
            const newStage = this.value;
            updateLeadStage(id, newStage);
        });
    });

    document.querySelectorAll(".view-pitch-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            openPitchModal(id);
        });
    });

    document.querySelectorAll(".delete-lead-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            deleteLead(id);
        });
    });
}

function updateLeadStage(id, newStage) {
    const lead = savedLeads.find(l => l.id === id);
    if (lead) {
        lead.stage = newStage;
        localStorage.setItem("leadsVault", JSON.stringify(savedLeads));
        updateDashboardMetrics();
        renderLedger();
    }
}

function deleteLead(id) {
    if (confirm("Are you sure you want to delete this prospect from the vault?")) {
        savedLeads = savedLeads.filter(l => l.id !== id);
        localStorage.setItem("leadsVault", JSON.stringify(savedLeads));
        updateDashboardMetrics();
        renderLedger();
    }
}

function openPitchModal(id) {
    const lead = savedLeads.find(l => l.id === id);
    if (lead) {
        const pitchText = generateProposalPitch(lead);
        pitchModalText.textContent = pitchText;
        pitchModal.classList.add("active");
    }
}

// Modal Listeners
closeModalBtn.addEventListener("click", () => pitchModal.classList.remove("active"));
closeModalSecondary.addEventListener("click", () => pitchModal.classList.remove("active"));
pitchModal.addEventListener("click", (e) => {
    if (e.target === pitchModal) pitchModal.classList.remove("active");
});

copyPitchBtn.addEventListener("click", () => {
    const text = pitchModalText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        copyPitchBtn.textContent = "Copied to Clipboard!";
        setTimeout(() => {
            copyPitchBtn.textContent = "Copy Proposal Pitch";
        }, 2000);
    }).catch(err => {
        console.error("Clipboard copy failed:", err);
    });
});

// Search and Filter Listeners
searchInput.addEventListener("input", renderLedger);
filterStageSelect.addEventListener("change", renderLedger);
filterScoreSelect.addEventListener("change", renderLedger);

// ==========================================================================
// MODULE 6: CSV EXPORT UTILITY
// ==========================================================================
exportCsvBtn.addEventListener("click", function () {
    if (savedLeads.length === 0) {
        alert("The leads vault is empty. Add prospects before exporting.");
        return;
    }

    const headers = ["Client Name", "Contact Email", "Project Domain", "Budget (USD)", "Speed (Sec)", "Stage", "Notes", "Created At"];
    const rows = savedLeads.map(lead => [
        `"${escapeCsv(lead.name)}"`,
        `"${escapeCsv(lead.email)}"`,
        `"${escapeCsv(lead.project)}"`,
        lead.budget,
        lead.speed,
        `"${escapeCsv(lead.stage)}"`,
        `"${escapeCsv(lead.notes)}"`,
        `"${escapeCsv(lead.createdAt)}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lcc_freelance_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Helper Escape utilities
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

function escapeCsv(str) {
    if (!str) return "";
    return str.replace(/"/g, '""');
}

// ==========================================================================
// INITIAL RENDER RUNTIME
// ==========================================================================
updateRateDisplay();
updateDashboardMetrics();
renderLedger();
fetchFxRates();