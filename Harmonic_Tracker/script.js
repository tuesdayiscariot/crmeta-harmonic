// Constants & Config
// Excel Logic Replication
// Tolerance: +/- 10%
const TOLERANCE = 0.10;

// Pattern Definitions with Target Ratios
// Note: Ranges are implemented as Target +/- 10%
const PATTERNS = {
    BAT: { name: 'BAT', xb: 0.50, ac: [0.382, 0.886], xd: 0.886, prz_factors: [0.886] },
    GARTLEY: { name: 'GARTLEY', xb: 0.618, ac: [0.382, 0.886], xd: 0.786, prz_factors: [0.786] },
    CRAB: { name: 'CRAB', xb: 0.618, ac: [0.382, 0.886], xd: 1.618, prz_factors: [1.618] },
    DEEP_CRAB: { name: 'DEEP CRAB', xb: 0.886, ac: [0.382, 0.886], xd: 1.618, prz_factors: [2.24, 3.618] }, // Multi-target
    BUTTERFLY: { name: 'BUTTERFLY', xb: 0.786, ac: [0.382, 0.886], xd: 1.27, prz_factors: [1.272, 1.618] }, // Multi-target
    CYPHER: { name: 'CYPHER', xb: 0.50, ac: [1.13, 1.414], xd: 0.786, prz_factors: [0.786] },
    SHARK: { name: 'SHARK', xb: 0.50, ac: [1.13, 1.618], xd: 0.886, prz_factors: [0.886] }
};

// State
let state = {
    tab: null, // Default null to trigger initial setTab
    inputs: { x: null, a: null, b: null, c: null },
    decimals: 4
};

// DOM Elements
const els = {
    tabAbcd: document.getElementById('tab-abcd'),
    tabHarmonic: document.getElementById('tab-harmonic'),
    inputGroupX: document.getElementById('input-group-x'),
    inputs: {
        x: document.getElementById('input-x'),
        a: document.getElementById('input-a'),
        b: document.getElementById('input-b'),
        c: document.getElementById('input-c')
    },
    resultsArea: document.getElementById('results-area'),
    dEmptyMsg: document.getElementById('d-empty-msg'),
    descDynamic: document.getElementById('desc-dynamic')
};

const DESCRIPTIONS = {
    abcd: `
        <h3 class="font-bold text-black mb-4 uppercase text-base inline-block bg-yellow-300 px-2 py-1">AB=CD Structures</h3>
        
        <div class="overflow-x-auto mb-8 pl-2">
            <table class="w-full text-base text-left border-collapse border-b-2 border-slate-500">
                <thead>
                    <tr class="border-b-2 border-slate-500">
                        <th class="py-2 font-bold text-black w-1/3">Structure</th>
                        <th class="py-2 font-bold text-black w-1/3">Ratio / Condition</th>
                        <th class="py-2 font-bold text-black w-1/3">Note</th>
                    </tr>
                </thead>
                <tbody class="text-black">
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Standard AB=CD</td>
                        <td class="py-2">CD ≈ AB (±5–8%)</td>
                        <td class="py-2">Typical reaction zone</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Alternate (Extended)</td>
                        <td class="py-2">CD > AB (1.272–1.618)</td>
                        <td class="py-2">Deeper pullbacks often occur</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Contracted AB=CD</td>
                        <td class="py-2">CD < AB (0.707–0.886)</td>
                        <td class="py-2">Weaker reactions, trend continuation likely</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">5–0 Basis</td>
                        <td class="py-2">D = 0.500 BC Retracement</td>
                        <td class="py-2">Requires BC extension first</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    harmonic: `
        <h3 class="font-bold text-black mb-4 uppercase text-base inline-block bg-yellow-300 px-2 py-1">Harmonic Pattern Ratio Summary</h3>
        
        <div class="overflow-x-auto mb-8 pl-2">
            <table class="w-full text-base text-left border-collapse border-b-2 border-slate-500">
                <thead>
                    <tr class="border-b-2 border-slate-500">
                        <th class="py-2 font-bold text-black">Pattern</th>
                        <th class="py-2 font-bold text-black">B</th>
                        <th class="py-2 font-bold text-black">C</th>
                        <th class="py-2 font-bold text-black">D (PRZ)</th>
                    </tr>
                </thead>
                <tbody class="text-black">
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Gartley</td>
                        <td class="py-2">0.618</td>
                        <td class="py-2">0.382–0.886</td>
                        <td class="py-2">0.786</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Bat</td>
                        <td class="py-2">0.382–0.500</td>
                        <td class="py-2">0.382–0.886</td>
                        <td class="py-2">0.886</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Butterfly</td>
                        <td class="py-2">0.786</td>
                        <td class="py-2">0.382–0.886</td>
                        <td class="py-2">1.272 / 1.618</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Crab</td>
                        <td class="py-2">0.382–0.618</td>
                        <td class="py-2">0.382–0.886</td>
                        <td class="py-2">1.618</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Deep Crab</td>
                        <td class="py-2">0.886</td>
                        <td class="py-2">0.382–0.886</td>
                        <td class="py-2">2.24–3.618</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Cypher</td>
                        <td class="py-2">0.382–0.618</td>
                        <td class="py-2">1.13–1.414 (Ext)</td>
                        <td class="py-2">0.786 (X - C)</td>
                    </tr>
                    <tr class="border-b border-slate-200">
                        <td class="py-2 font-bold text-black">Shark</td>
                        <td class="py-2">0.382–0.618</td>
                        <td class="py-2">1.13–1.618 (Ext)</td>
                        <td class="py-2">0.886 (O - X)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 class="font-bold text-black mb-2 uppercase text-base mt-8 inline-block bg-yellow-300 px-2 py-1">Extended / Post-Harmonic Patterns (Reference)</h3>
        <p class="text-base text-black mb-6 italic leading-8 pl-2">(These structures are not entry signals but post-pattern equilibrium behaviors.)</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base leading-7 pl-2">
            <div>
                <p class="font-bold text-black mb-2">5–0 Pattern</p>
                <ul class="list-disc pl-4 space-y-2">
                    <li>Originates only from a Shark completion</li>
                    <li>Requires D = 0.500 retracement of BC</li>
                    <li>Focus: Exhausted reversion after over-extension</li>
                </ul>
            </div>
            <div>
                <p class="font-bold text-black mb-2">3-Drive Structure</p>
                <ul class="list-disc pl-4 space-y-2">
                    <li>Progressive 1.272/1.618 extensions</li>
                    <li>Sequential symmetry between drives</li>
                    <li>Focus: End of repetitive exhaustion rhythm</li>
                </ul>
            </div>
            </div>
    `
};

// Initialization
function init() {
    setupEventListeners();
    // Initial UI State
    setTab('harmonic');
}

function setupEventListeners() {
    els.tabAbcd.addEventListener('click', () => setTab('abcd'));
    els.tabHarmonic.addEventListener('click', () => setTab('harmonic'));

    Object.values(els.inputs).forEach(input => {
        input.addEventListener('input', handleInput);
    });
}

function setTab(tab) {
    if (state.tab === tab) return;

    // Reset inputs on tab switch
    state.inputs = { x: null, a: null, b: null, c: null };
    Object.values(els.inputs).forEach(input => input.value = '');

    state.tab = tab;

    // Update Description
    els.descDynamic.innerHTML = DESCRIPTIONS[tab];

    if (tab === 'abcd') {
        setActiveTab(els.tabAbcd, els.tabHarmonic);
        els.inputGroupX.classList.add('hidden');
    } else {
        setActiveTab(els.tabHarmonic, els.tabAbcd);
        els.inputGroupX.classList.remove('hidden');
    }
    calculateAndRender();
}

function setActiveTab(active, inactive) {
    // Light Mode Active: Yellow bg, Black text, Black border, No Hover, Cursor Default
    active.className = "px-8 py-3 rounded-full text-sm font-bold uppercase transition-all duration-200 bg-yellow-300 text-black focus:outline-none border-2 border-black cursor-default";
    // Light Mode Inactive: Transparent Yellow bg, Slate-600 text, Gray border -> Hover: Yellow 100, Black Text, Black Border
    inactive.className = "px-8 py-3 rounded-full text-sm font-bold uppercase transition-all duration-200 bg-yellow-300/40 text-slate-600 hover:bg-yellow-300 hover:text-black hover:border-black focus:outline-none border-2 border-slate-300";
}

function handleInput(e) {
    const id = e.target.id.split('-')[1];
    const val = parseFloat(e.target.value);
    state.inputs[id] = isNaN(val) ? null : val;

    // Auto-detect decimals
    updateDecimals();

    calculateAndRender();
}

function updateDecimals() {
    let maxDecimals = 0;
    Object.values(state.inputs).forEach(val => {
        if (val !== null) {
            const strVal = val.toString();
            if (strVal.includes('.')) {
                const decimals = strVal.split('.')[1].length;
                if (decimals > maxDecimals) {
                    maxDecimals = decimals;
                }
            }
        }
    });
    // Default to at least 2, max 5 (or maybe more if input has more?)
    // Let's stick to user input precision, minimum 2.
    state.decimals = Math.max(2, maxDecimals);
}

function calculateAndRender() {
    els.resultsArea.innerHTML = '';
    if (state.tab === 'abcd') {
        renderABCD();
    } else {
        renderHarmonic();
    }
}

// --- Helper Functions ---

function format(num) {
    return num.toFixed(state.decimals);
}

function checkTolerance(value, target) {
    const min = target - (target * TOLERANCE);
    const max = target + (target * TOLERANCE);
    return value >= min && value <= max;
}

function checkRange(value, minTarget, maxTarget) {
    const min = minTarget - (minTarget * TOLERANCE);
    const max = maxTarget + (maxTarget * TOLERANCE);
    return value >= min && value <= max;
}

// --- AB=CD Logic ---

function renderABCD() {
    const { a, b, c } = state.inputs;

    if (a === null || b === null || c === null) {
        els.resultsArea.innerHTML = '';
        return;
    }

    const isBullish = a > b;
    const directionText = isBullish ? "Bullish" : "Bearish";
    const directionClass = isBullish ? "text-green-600" : "text-red-600";

    const targetD = c + (b - a);
    const abLength = Math.abs(a - b);

    const ext127 = isBullish ? c - (abLength * 1.27) : c + (abLength * 1.27);
    const ext1618 = isBullish ? c - (abLength * 1.618) : c + (abLength * 1.618);

    let html = `
        <div class="p-6 rounded-xl text-left">
            <div class="text-base font-normal mb-4 uppercase">
                <span class="${directionClass}">${directionText}</span> <span class="text-black">AB=CD D(PRZ):</span>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-base font-bold text-slate-700">AB=CD (1.000)</span>
                    <span class="font-mono text-lg font-bold text-slate-900">${format(targetD)}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-base font-bold text-slate-700">1.27 AB (1.270)</span>
                    <span class="font-mono text-lg font-bold text-slate-900">${format(ext127)}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-base font-bold text-slate-700">1.618 AB (1.618)</span>
                    <span class="font-mono text-lg font-bold text-slate-900">${format(ext1618)}</span>
                </div>
            </div>
        </div>
    `;

    els.resultsArea.innerHTML = html;
}

// --- Harmonic Logic (Excel Replication) ---

function renderHarmonic() {
    const { x, a, b, c, d } = state.inputs;

    if (x === null || a === null || b === null || c === null) {
        els.resultsArea.innerHTML = '';
        return;
    }

    // 1. Structure Check
    let isBullish = false;
    let isBearish = false;
    let structureError = null;

    if (a < x) {
        if (x > a && b > a && b < x && c < b) {
            isBearish = true;
        } else {
            structureError = "Bearish Structure Mismatch (Req: X>A, A<B<X, C<B)";
        }
    } else {
        if (x < a && b < a && b > x && c > b) {
            isBullish = true;
        } else {
            structureError = "Bullish Structure Mismatch (Req: X<A, A>B>X, C>B)";
        }
    }

    if (structureError) {
        els.resultsArea.innerHTML = `
            <div class="p-4 rounded-xl bg-red-50 text-center">
                <div class="text-red-600 font-bold mb-1">Structure Error</div>
                <div class="text-sm text-slate-500 font-medium">${structureError}</div>
            </div>
        `;
        return;
    }

    const directionLabel = isBullish ? "Bullish Pattern" : "Bearish Pattern";
    const directionColor = isBullish ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";

    // 2. Ratio Calculations
    const xb = Math.abs(a - b) / Math.abs(a - x);
    const ac = Math.abs(b - c) / Math.abs(b - a);
    let xd = null;
    if (d !== null) {
        xd = Math.abs(d - x) / Math.abs(a - x);
    }

    // 3. Pattern Classification
    let patternName = "N";
    const isNormalAC = checkRange(ac, 0.382, 0.886);
    const isCypherSharkAC = checkRange(ac, 1.13, 1.414) || checkRange(ac, 1.13, 1.618);

    if (isNormalAC) {
        if (checkTolerance(xb, 0.382) || checkTolerance(xb, 0.50)) {
            patternName = "BAT or CRAB";
        } else if (checkTolerance(xb, 0.618)) {
            patternName = "CRAB or GARTLEY";
        } else if (checkTolerance(xb, 0.886)) {
            patternName = "DEEP CRAB";
        } else if (checkTolerance(xb, 0.786)) {
            patternName = "BUTTERFLY";
        }
    } else if (isCypherSharkAC) {
        if (checkRange(xb, 0.382, 0.618)) {
            patternName = "CYPHER or SHARK";
        }
    }

    if (d !== null && patternName !== "N") {
        if (patternName.includes("BAT")) {
            if (checkTolerance(xd, 0.886)) patternName = "BAT";
            else if (checkTolerance(xd, 1.618)) patternName = "CRAB";
        } else if (patternName.includes("GARTLEY")) {
            if (checkTolerance(xd, 0.786)) patternName = "GARTLEY";
            else if (checkTolerance(xd, 1.618)) patternName = "CRAB";
        } else if (patternName.includes("CYPHER")) {
            if (checkTolerance(xd, 0.786)) patternName = "CYPHER";
            else if (checkTolerance(xd, 0.886) || checkTolerance(xd, 1.13)) patternName = "SHARK";
        }
    }

    // 4. PRZ Calculation
    // Only calculate for DETECTED patterns
    const przTargets = [];

    const standardPatterns = ['BAT', 'GARTLEY', 'CRAB', 'DEEP_CRAB', 'BUTTERFLY'];
    standardPatterns.forEach(key => {
        const p = PATTERNS[key];
        // Only calculate if this pattern is part of the detected class
        if (patternName.includes(p.name) ||
            (patternName === "BAT or CRAB" && (p.name === "BAT" || p.name === "CRAB")) ||
            (patternName === "CRAB or GARTLEY" && (p.name === "CRAB" || p.name === "GARTLEY"))) {

            p.prz_factors.forEach((factor, index) => {
                // Filter Logic for Deep Crab & Butterfly
                // Apply Tolerance to bounds: [Min * (1-TOL), Max * (1+TOL)]
                if (p.name === 'DEEP CRAB') {
                    const min = 2.24 * (1 - TOLERANCE);
                    const max = 3.618 * (1 + TOLERANCE);
                    if (factor < min || factor > max) return;
                }
                if (p.name === 'BUTTERFLY') {
                    const min = 1.272 * (1 - TOLERANCE);
                    const max = 1.618 * (1 + TOLERANCE);
                    if (factor < min || factor > max) return;
                }

                const d_target = a - (a - x) * factor;
                const suffix = p.prz_factors.length > 1 ? ` ${index + 1} (${factor})` : ` (${factor})`;
                // ... rest of the code
                przTargets.push({ name: `${p.name} PRZ${suffix} (XA기준)`, value: d_target });
            });
        }
    });

    const cypherShark = ['CYPHER', 'SHARK'];
    cypherShark.forEach(key => {
        const p = PATTERNS[key];
        if (patternName.includes(p.name) || patternName === "CYPHER or SHARK") {
            p.prz_factors.forEach((factor, index) => {
                const d_target = c - (c - x) * factor;
                const basis = p.name === 'SHARK' ? '(O - X)' : '(X - C)';
                const suffix = p.prz_factors.length > 1 ? ` ${index + 1} (${factor} ${basis})` : ` (${factor} ${basis})`;
                przTargets.push({ name: `${p.name} PRZ${suffix}`, value: d_target });
            });
        }
    });

    // Render Logic
    const directionText = isBullish ? "Bullish" : "Bearish";
    const directionClass = isBullish ? "text-green-600" : "text-red-600";

    let html = `
        <div class="p-6 rounded-xl text-left">
            <div class="text-base font-normal mb-4 uppercase">
                <span class="${directionClass}">${directionText}</span> <span class="text-black">${patternName} D(PRZ):</span>
            </div>
    `;

    // PRZ Table (Only detected)
    if (przTargets.length > 0) {
        html += `<div class="space-y-2">`;
        przTargets.forEach(t => {
            html += `
                <div class="flex justify-between items-center">
                    <span class="text-base font-bold text-slate-700">${t.name}</span>
                    <span class="font-mono text-lg font-bold text-slate-900">${format(t.value)}</span>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<div class="text-sm text-slate-500">No PRZ targets calculated.</div>`;
    }

    html += `</div>`; // Close main container

    els.resultsArea.innerHTML = html;
}

function createResultCard(label, value, colorClass, actualVal = null) {
    let diffHtml = '';
    if (actualVal !== null) {
        const diff = Math.abs(actualVal - value);
        const pDiff = (diff / value) * 100;
        diffHtml = `<div class="text-xs text-slate-500 mt-1 font-bold">Diff: ${pDiff.toFixed(2)}%</div>`;
    }

    return `
        <div class="bg-white/40 p-4 rounded-xl transition-colors">
            <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${label}</span>
            </div>
            <div class="text-2xl font-mono font-extrabold ${colorClass}">
                ${format(value)}
            </div>
            ${diffHtml}
        </div>
    `;
}

// Start
init();
