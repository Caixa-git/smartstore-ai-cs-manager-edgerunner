/* ============================================
   스마트스토어 AI CS 매니저 — App Logic
   Cycle 03: Data Viz, AI Simulation, CSV, Form
   ============================================ */

let inquiries = [];
let currentFilter = 'all';
let currentSort = 'latest';
let currentRiskFilter = 'all';
let currentSearch = '';
let searchDebounceTimer = null;

const FILTER_LABEL = {
  'all': '전체',
  'owner': '사장님 확인 필요',
  'auto': '자동 답변 가능',
  'risk': '클레임 위험',
  '배송': '배송문의',
  '교환/환불': '교환/환불'
};

const SORT_LABEL = {
  'latest': '최신순',
  'priority': '우선순위 높은순',
  'risk': '위험도 높은순',
  'owner_first': '사장님 확인 필요 우선'
};

const RISK_LEVEL_ORDER = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
const PRIORITY_ORDER = { 'high': 0, 'medium': 1, 'low': 2 };

const PRIORITY_LABEL = { 'high': '높음', 'medium': '보통', 'low': '낮음' };
const STATUS_LABEL = { 'new': '신규', 'processing': '처리 중', 'needs_owner_review': '확인 필요', 'auto_resolved': '자동 답변', 'done': '완료' };
const RISK_LABEL = { 'critical': '🔴 치명', 'high': '🔴 높음', 'medium': '🟡 보통', 'low': '🟢 낮음' };
const RISK_BADGE_CLASS = { 'critical': 'badge-risk-critical', 'high': 'badge-risk-high', 'medium': 'badge-risk-medium', 'low': 'badge-risk-low' };
const SENTIMENT_LABEL = {
  'positive': '🟢 긍정',
  'neutral': '⚪ 중립',
  'negative': '🟡 부정',
  'angry': '🔴 화남',
  'urgent': '🔴 긴급'
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupFilters();
  setupSort();
  setupRiskFilter();
  setupSearch();
  setupModal();
  setupSimulation();
  setupCsvExport();
  setupInquiryForm();
  setTimeout(renderHighlights, 100); // slight delay for layout
});

/* ==================== DATA ==================== */
async function loadData() {
  try {
    const res = await fetch('data/sample_inquiries.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    inquiries = await res.json();
    if (!Array.isArray(inquiries) || inquiries.length < 28) {
      throw new Error(`데이터 부족: ${inquiries.length}개`);
    }
    renderHero();
    renderCharts();
    populateSimSelect();
    applyFilter();
  } catch (err) {
    console.error('Data load failed:', err);
    document.getElementById('hero-message').textContent = '⚠️ 데이터를 불러오지 못했습니다.';
  }
}

/* ==================== HERO ==================== */
function renderHero() {
  const total = inquiries.length;
  const autoCount = inquiries.filter(i => i.status === 'auto_resolved' || (!i.owner_review_required && i.status !== 'needs_owner_review')).length;
  const ownerCount = inquiries.filter(i => i.owner_review_required || i.status === 'needs_owner_review').length;

  document.getElementById('hero-total').textContent = total;
  document.getElementById('hero-auto').textContent = autoCount;
  document.getElementById('hero-owner').textContent = ownerCount;
  document.getElementById('hero-message').textContent =
    `오늘 들어온 문의 ${total}건 중 ${autoCount}건은 AI가 바로 답변 초안을 만들었습니다. 사장님은 위험 문의 ${ownerCount}건만 먼저 확인하면 됩니다.`;
}

/* ==================== CHARTS (Chart.js) ==================== */
function renderCharts() {
  // 1. 문의 유형별 비중 (bar chart)
  const catCounts = {};
  inquiries.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
  const catLabels = Object.keys(catCounts);
  const catData = Object.values(catCounts);

  new Chart(document.getElementById('chart-category'), {
    type: 'bar',
    data: {
      labels: catLabels,
      datasets: [{
        label: '문의 수',
        data: catData,
        backgroundColor: catLabels.map(() => '#E8856C'),
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
        x: { ticks: { font: { size: 10 } } }
      }
    }
  });

  // 2. 위험도별 문의 분포 (doughnut chart)
  const riskCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  inquiries.forEach(i => { riskCounts[i.risk_level] = (riskCounts[i.risk_level] || 0) + 1; });
  const riskLabels = ['🔴 치명', '🔴 높음', '🟡 보통', '🟢 낮음'];
  const riskData = [riskCounts.critical, riskCounts.high, riskCounts.medium, riskCounts.low];
  const riskColors = ['#7F1D1D', '#DC2626', '#D97706', '#059669'];

  new Chart(document.getElementById('chart-risk'), {
    type: 'doughnut',
    data: {
      labels: riskLabels,
      datasets: [{
        data: riskData,
        backgroundColor: riskColors,
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, padding: 8 }
        }
      }
    }
  });

  // 3. AI 처리 vs 사장님 확인 (bar chart)
  const autoCount = inquiries.filter(i => !i.owner_review_required && i.status !== 'needs_owner_review').length;
  const ownerCount = inquiries.filter(i => i.owner_review_required || i.status === 'needs_owner_review').length;

  new Chart(document.getElementById('chart-owner-vs-auto'), {
    type: 'bar',
    data: {
      labels: ['자동 답변 가능', '사장님 확인 필요'],
      datasets: [{
        data: [autoCount, ownerCount],
        backgroundColor: ['#22C55E', '#F59E0B'],
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
        y: { ticks: { font: { size: 12, weight: 'bold' } } }
      }
    }
  });
}

/* ==================== HIGHLIGHTS ==================== */
function renderHighlights() {
  const grid = document.getElementById('highlight-grid');

  const riskItem = inquiries.find(i => i.demo_highlight === 'risk' && i.risk_level === 'critical') ||
                   inquiries.find(i => i.demo_highlight === 'risk');
  const autoItem = inquiries.find(i => i.demo_highlight === 'auto_reply');
  const posItem = inquiries.find(i => i.demo_highlight === 'positive');

  const items = [
    riskItem && {
      type: 'risk',
      badge: '⚠️ 위험 클레임',
      title: riskItem.title || riskItem.message.slice(0, 30) + '...',
      before: `고객: "${riskItem.message.slice(0, 50)}..."`,
      after: `AI 감지 → 사장님 확인 필요 (${riskItem.risk_level === 'critical' ? '최고 위험' : '높은 위험'})\n추천 액션: ${riskItem.recommended_action}`
    },
    autoItem && {
      type: 'auto',
      badge: '✅ 자동 답변',
      title: autoItem.title || autoItem.message.slice(0, 30) + '...',
      before: `고객: "${autoItem.message.slice(0, 50)}..."`,
      after: `AI 자동 답변 완료\nAI: "${autoItem.draft_response.slice(0, 60)}..."`
    },
    posItem && {
      type: 'positive',
      badge: '⭐ 긍정 사례',
      title: posItem.title || posItem.message.slice(0, 30) + '...',
      before: `고객: "${posItem.message.slice(0, 50)}..."`,
      after: `AI 긍정 탐지 → 감사 답변 자동 발송\nAI: "${posItem.draft_response.slice(0, 60)}..."`
    }
  ].filter(Boolean);

  if (items.length === 0) {
    grid.innerHTML = '<p class="empty-state">하이라이트를 불러올 수 없습니다.</p>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="highlight-card ${item.type}-card" data-highlight="${item.type}">
      <div class="highlight-badge ${item.type}">${item.badge}</div>
      <div class="highlight-title">${escapeHtml(item.title)}</div>
      <div class="highlight-before">📩 ${escapeHtml(item.before)}</div>
      <div class="highlight-after">🤖 ${escapeHtml(item.after)}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.highlight-card').forEach(el => {
    el.addEventListener('click', () => {
      const type = el.dataset.highlight;
      const item = inquiries.find(i => i.demo_highlight === 
        (type === 'risk' ? 'risk' : type === 'auto' ? 'auto_reply' : 'positive'));
      if (item) showModal(item);
    });
  });
}

/* ==================== FILTERS ==================== */
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilter();
      document.getElementById('dashboard-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  document.getElementById('reset-filter').addEventListener('click', resetAll);
}

/* ==================== SORT ==================== */
function setupSort() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      applyFilter();
    });
  });
}

/* ==================== RISK SUB-FILTER ==================== */
function setupRiskFilter() {
  document.querySelectorAll('.risk-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.risk-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRiskFilter = btn.dataset.risk;
      applyFilter();
    });
  });
}

/* ==================== SEARCH ==================== */
function setupSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');

  input.addEventListener('input', () => {
    const val = input.value.trim();
    clearBtn.classList.toggle('hidden', val.length === 0);
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      currentSearch = val;
      applyFilter();
    }, 250);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchDebounceTimer);
      currentSearch = input.value.trim();
      applyFilter();
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    currentSearch = '';
    applyFilter();
    input.focus();
  });
}

/* ==================== RESET ALL ==================== */
function resetAll() {
  currentSearch = '';
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').classList.add('hidden');

  currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

  currentSort = 'latest';
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.sort-btn[data-sort="latest"]').classList.add('active');

  currentRiskFilter = 'all';
  document.querySelectorAll('.risk-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.risk-btn[data-risk="all"]').classList.add('active');

  applyFilter();
  document.getElementById('dashboard-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==================== APPLY FILTER (combined) ==================== */
function applyFilter() {
  let filtered = inquiries;

  switch (currentFilter) {
    case 'owner':
      filtered = inquiries.filter(i => i.owner_review_required || i.status === 'needs_owner_review');
      break;
    case 'auto':
      filtered = inquiries.filter(i => !i.owner_review_required && i.status !== 'needs_owner_review' && i.status !== 'done');
      break;
    case 'risk':
      filtered = inquiries.filter(i => i.risk_level === 'high' || i.risk_level === 'critical');
      break;
    default:
      if (currentFilter !== 'all') {
        filtered = inquiries.filter(i => i.category === currentFilter);
      }
  }

  if (currentRiskFilter !== 'all') {
    filtered = filtered.filter(i => i.risk_level === currentRiskFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(i => {
      return (i.customer_label && i.customer_label.toLowerCase().includes(q)) ||
             (i.product_name && i.product_name.toLowerCase().includes(q)) ||
             (i.message && i.message.toLowerCase().includes(q)) ||
             (i.ai_summary && i.ai_summary.toLowerCase().includes(q)) ||
             (i.draft_response && i.draft_response.toLowerCase().includes(q));
    });
  }

  filtered = sortItems(filtered, currentSort);

  renderInquiries(filtered);
  updateResultCount(filtered.length);
}

function sortItems(items, mode) {
  const sorted = [...items];
  switch (mode) {
    case 'latest':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'priority':
      sorted.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99));
      break;
    case 'risk':
      sorted.sort((a, b) => (RISK_LEVEL_ORDER[a.risk_level] ?? 99) - (RISK_LEVEL_ORDER[b.risk_level] ?? 99));
      break;
    case 'owner_first':
      sorted.sort((a, b) => {
        const aOwner = a.owner_review_required ? 0 : 1;
        const bOwner = b.owner_review_required ? 0 : 1;
        if (aOwner !== bOwner) return aOwner - bOwner;
        return (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
      });
      break;
  }
  return sorted;
}

function updateResultCount(count) {
  const label = currentSearch ? `검색 결과` : `문의`;
  document.getElementById('filter-result-count').textContent = `${count}개 ${label}`;
}

/* ==================== INQUIRY GRID ==================== */
function renderInquiries(items) {
  const grid = document.getElementById('inquiry-grid');
  const empty = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptyDesc = document.getElementById('empty-desc');

  if (items.length === 0) {
    grid.innerHTML = '';
    if (currentSearch) {
      emptyTitle.textContent = '🔍 검색 결과가 없습니다';
      emptyDesc.textContent = `"${currentSearch}"에 해당하는 문의를 찾을 수 없습니다. 다른 키워드로 검색해 보세요.`;
    } else {
      emptyTitle.textContent = '조건에 맞는 문의가 없습니다';
      emptyDesc.textContent = '다른 필터를 선택해 보세요.';
    }
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = items.map(item => `
    <div class="inquiry-card priority-${item.priority} ${item.owner_review_required ? 'owner-needed' : ''}" data-id="${item.id}">
      <div class="card-header">
        <span class="card-title">${escapeHtml(item.message.slice(0, 40))}${item.message.length > 40 ? '...' : ''}</span>
        <div class="card-badges">
          ${item.risk_level ? `<span class="badge badge-risk ${RISK_BADGE_CLASS[item.risk_level] || ''}">${RISK_LABEL[item.risk_level] || item.risk_level}</span>` : ''}
          ${item.priority === 'high' ? `<span class="badge badge-high">높음</span>` : ''}
          ${item.owner_review_required ? `<span class="badge badge-owner">확인</span>` : ''}
          ${item.sentiment === 'angry' || item.sentiment === 'urgent' ? `<span class="badge badge-angry">${item.sentiment === 'angry' ? '화남' : '긴급'}</span>` : ''}
        </div>
      </div>
      <div class="card-channel">
        ${escapeHtml(item.channel)} · ${escapeHtml(item.category)} · ${SENTIMENT_LABEL[item.sentiment] || item.sentiment}
      </div>
      <div class="card-summary">${escapeHtml(item.ai_summary)}</div>
      <div class="card-meta">
        <span class="card-worker">🤖 ${escapeHtml(item.assigned_ai_worker)}</span>
        <span class="card-product">${escapeHtml(item.product_name || '')}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.inquiry-card').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const item = inquiries.find(i => i.id === id);
      if (item) showModal(item);
    });
  });
}

/* ==================== MODAL ==================== */
function setupModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function showModal(item) {
  const body = document.getElementById('modal-body');
  const modal = document.getElementById('modal');
  const overlay = document.getElementById('modal-overlay');

  body.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">${escapeHtml(item.title || item.message.slice(0, 40) + '...')}</div>
      <div class="modal-badges">
        <span class="badge badge-${item.priority}">${PRIORITY_LABEL[item.priority]}</span>
        ${item.owner_review_required ? '<span class="badge badge-owner">사장님 확인 필요</span>' : ''}
        ${item.sentiment === 'angry' ? '<span class="badge badge-angry">화난 고객</span>' : ''}
      </div>
    </div>

    <div class="modal-info-grid">
      <div class="modal-info-item">
        <label>문의 ID</label>
        <span>${escapeHtml(item.id)}</span>
      </div>
      <div class="modal-info-item">
        <label>접수 시간</label>
        <span>${escapeHtml(item.created_at)}</span>
      </div>
      <div class="modal-info-item">
        <label>고객</label>
        <span>${escapeHtml(item.customer_label)}</span>
      </div>
      <div class="modal-info-item">
        <label>채널</label>
        <span>${escapeHtml(item.channel)}</span>
      </div>
      <div class="modal-info-item">
        <label>카테고리</label>
        <span>${escapeHtml(item.category)}</span>
      </div>
      <div class="modal-info-item">
        <label>감정</label>
        <span>${SENTIMENT_LABEL[item.sentiment] || item.sentiment}</span>
      </div>
      <div class="modal-info-item">
        <label>위험 등급</label>
        <span>${RISK_LABEL[item.risk_level] || item.risk_level}</span>
      </div>
      <div class="modal-info-item">
        <label>담당 AI</label>
        <span>🤖 ${escapeHtml(item.assigned_ai_worker)}</span>
      </div>
      ${item.product_name ? `
      <div class="modal-info-item">
        <label>관련 상품</label>
        <span>${escapeHtml(item.product_name)}</span>
      </div>` : ''}
      <div class="modal-info-item">
        <label>상태</label>
        <span>${STATUS_LABEL[item.status] || item.status}</span>
      </div>
    </div>

    <div class="modal-section">
      <h4>📩 고객 원문</h4>
      <p>${escapeHtml(item.message)}</p>
    </div>

    <div class="modal-section">
      <h4>🤖 AI 요약</h4>
      <p>${escapeHtml(item.ai_summary)}</p>
    </div>

    <div class="modal-section">
      <h4>💬 AI 답변 초안</h4>
      <p>${escapeHtml(item.draft_response)}</p>
    </div>

    <div class="modal-section">
      <h4>✅ 추천 액션</h4>
      <p>${escapeHtml(item.recommended_action)}</p>
    </div>

    ${item.owner_review_required && item.review_reason ? `
    <div class="modal-section">
      <h4>⚠️ 사장님 확인 필요 이유</h4>
      <p class="owner-note">${escapeHtml(item.review_reason)}</p>
    </div>` : ''}

    <div class="modal-section">
      <h4>🎯 답변 톤 가이드</h4>
      <p class="tone-guide">${escapeHtml(item.tone_guide)}</p>
    </div>

    <div class="modal-section">
      <h4>🔧 실제 연동 시 처리 방식</h4>
      <p class="integration-note">${escapeHtml(item.integration_note)}</p>
    </div>
  `;

  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  // Also close sim modal if open
  document.getElementById('sim-modal').classList.add('hidden');
  document.getElementById('sim-modal-overlay').classList.add('hidden');
}

/* ==================== AI SIMULATION ==================== */
function populateSimSelect() {
  const select = document.getElementById('sim-select');
  inquiries.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `${item.id} — ${item.customer_label} — ${escapeHtml(item.message.slice(0, 30))}...`;
    select.appendChild(opt);
  });
}

function setupSimulation() {
  document.getElementById('sim-start-btn').addEventListener('click', startSimulation);
}

function startSimulation() {
  const select = document.getElementById('sim-select');
  const simId = select.value;
  if (!simId) {
    select.style.borderColor = '#EF4444';
    setTimeout(() => { select.style.borderColor = ''; }, 2000);
    return;
  }

  const item = inquiries.find(i => i.id === simId);
  if (!item) return;

  const btn = document.getElementById('sim-start-btn');
  const stepsEl = document.getElementById('sim-steps');
  const resultEl = document.getElementById('sim-result');
  btn.disabled = true;
  btn.textContent = '⏳ 처리 중...';
  stepsEl.classList.remove('hidden');
  resultEl.classList.add('hidden');

  // Reset all steps
  document.querySelectorAll('.sim-step').forEach(el => {
    el.classList.remove('active', 'done');
    el.querySelector('.sim-step-status').textContent = '';
  });

  const steps = [
    { step: 1, text: `문의 ${item.id} 접수 — "${escapeHtml(item.message.slice(0, 30))}..."`, status: '✅' },
    { step: 2, text: `문의 유형 분류: ${item.category}`, status: '📂' },
    { step: 3, text: `위험도 판단: ${RISK_LABEL[item.risk_level] || item.risk_level}`, status: '⚠️' },
    { step: 4, text: `답변 초안 생성 완료`, status: '💬' },
    { step: 5, text: `사장님 확인 ${item.owner_review_required ? '필요' : '불필요'}`, status: item.owner_review_required ? '🔴' : '🟢' }
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i > 0) {
      const prevEl = document.querySelector(`.sim-step[data-step="${i}"]`);
      if (prevEl) {
        prevEl.classList.remove('active');
        prevEl.classList.add('done');
      }
    }
    if (i < steps.length) {
      const curEl = document.querySelector(`.sim-step[data-step="${steps[i].step}"]`);
      if (curEl) {
        curEl.classList.add('active');
        curEl.querySelector('.sim-step-text').textContent = steps[i].text;
      }
      i++;
    } else {
      clearInterval(interval);
      btn.disabled = false;
      btn.textContent = '▶ AI 분석 시작';
      
      // Show result
      const ownerReq = item.owner_review_required;
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="sim-result-title">✅ AI 분석 완료</div>
        <div class="sim-result-grid">
          <div class="sim-result-item">
            <label>문의 ID</label>
            <span>${escapeHtml(item.id)}</span>
          </div>
          <div class="sim-result-item">
            <label>고객</label>
            <span>${escapeHtml(item.customer_label)}</span>
          </div>
          <div class="sim-result-item">
            <label>유형</label>
            <span>${escapeHtml(item.category)}</span>
          </div>
          <div class="sim-result-item">
            <label>위험도</label>
            <span>${RISK_LABEL[item.risk_level] || item.risk_level}</span>
          </div>
          <div class="sim-result-item">
            <label>담당 AI</label>
            <span>🤖 ${escapeHtml(item.assigned_ai_worker)}</span>
          </div>
          <div class="sim-result-item">
            <label>감정</label>
            <span>${SENTIMENT_LABEL[item.sentiment] || item.sentiment}</span>
          </div>
        </div>
        <div class="sim-result-answer">
          <strong>💬 AI 답변 초안</strong><br>
          ${escapeHtml(item.draft_response)}
        </div>
        ${ownerReq ? `
        <div class="sim-result-owner">
          ⚠️ 사장님 확인 필요 — ${escapeHtml(item.review_reason || '사장님의 최종 확인이 필요합니다')}
        </div>` : ''}
      `;

      // Scroll to result
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 800);
}

/* ==================== CSV EXPORT ==================== */
function setupCsvExport() {
  document.getElementById('csv-export-btn').addEventListener('click', () => {
    // Get currently displayed inquiries from the grid
    const cards = document.querySelectorAll('#inquiry-grid .inquiry-card');
    const ids = Array.from(cards).map(el => el.dataset.id);
    const displayed = inquiries.filter(i => ids.includes(i.id));

    if (displayed.length === 0) {
      alert('내보낼 문의가 없습니다.');
      return;
    }

    const headers = ['ID', '접수시간', '고객', '채널', '상품명', '카테고리', '감정', '위험도', '우선순위', '상태', '담당AI', '사장님확인필요', '문의내용', 'AI요약', '답변초안', '추천액션'];
    const rows = displayed.map(item => [
      item.id,
      item.created_at,
      item.customer_label,
      item.channel,
      item.product_name || '',
      item.category,
      item.sentiment,
      item.risk_level,
      item.priority,
      item.status,
      item.assigned_ai_worker,
      item.owner_review_required ? '예' : '아니오',
      `"${(item.message || '').replace(/"/g, '""')}"`,
      `"${(item.ai_summary || '').replace(/"/g, '""')}"`,
      `"${(item.draft_response || '').replace(/"/g, '""')}"`,
      `"${(item.recommended_action || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `momopet_cs_inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ==================== INQUIRY REGISTRATION FORM ==================== */
function setupInquiryForm() {
  document.getElementById('form-auto-classify').addEventListener('click', autoClassify);
  document.getElementById('form-submit-btn').addEventListener('click', submitInquiry);
}

function autoClassify() {
  const message = document.getElementById('form-message').value.trim();
  if (!message) {
    showFormFeedback('문의 내용을 입력한 후 자동 분류를 실행하세요.', 'error');
    return;
  }

  const msg = message.toLowerCase();
  let category = '상품문의';
  let risk = 'low';
  let sentiment = 'neutral';
  let priority = 'low';

  // Simple rule-based classification
  if (msg.includes('환불') || msg.includes('교환') || msg.includes('반품')) {
    category = '교환/환불';
    risk = 'medium';
    priority = 'medium';
  } else if (msg.includes('배송') || msg.includes('택배') || msg.includes('언제 오') || msg.includes('출고')) {
    category = '배송';
    risk = 'low';
    priority = 'low';
  } else if (msg.includes('별점') || msg.includes('1점') || msg.includes('클레임') || msg.includes('신고') || msg.includes('소비자원')) {
    category = '클레임';
    risk = 'high';
    sentiment = 'negative';
    priority = 'high';
  } else if (msg.includes('리뷰') || msg.includes('후기') || msg.includes('별점 5') || msg.includes('좋아요')) {
    category = '리뷰관리';
    risk = 'low';
    sentiment = 'positive';
    priority = 'low';
  } else if (msg.includes('할인') || msg.includes('쿠폰') || msg.includes('적립금')) {
    category = '쿠폰';
    risk = 'low';
    priority = 'low';
  } else if (msg.includes('사이즈') || msg.includes('크기') || msg.includes('색상') || msg.includes('재질')) {
    category = '상품문의';
    risk = 'low';
    priority = 'low';
  }

  // Override risk for angry/urgent messages
  if (msg.includes('화') || msg.includes('짜증') || msg.includes('당장') || msg.includes('빨리')) {
    if (sentiment !== 'negative') sentiment = 'urgent';
    priority = 'high';
    if (risk === 'low') risk = 'medium';
  }

  document.getElementById('form-category').value = category;

  showFormFeedback(
    `🤖 AI 분석 결과: <strong>${category}</strong> 유형, 위험도 <strong>${risk}</strong>, 감정 <strong>${sentiment}</strong>`,
    'success'
  );
}

function submitInquiry() {
  const customer = document.getElementById('form-customer').value.trim();
  const channel = document.getElementById('form-channel').value;
  const product = document.getElementById('form-product').value.trim();
  const message = document.getElementById('form-message').value.trim();
  const category = document.getElementById('form-category').value;

  if (!customer || !message) {
    showFormFeedback('고객 라벨과 문의 내용을 입력해주세요.', 'error');
    return;
  }

  // Determine risk from category and message
  const msg = message.toLowerCase();
  let risk = 'low';
  let priority = 'low';
  let sentiment = 'neutral';
  let ownerRequired = false;
  let reviewReason = '';

  if (category === '클레임' || category === '교환/환불') {
    risk = 'medium';
    priority = 'medium';
  }
  if (msg.includes('화') || msg.includes('짜증') || msg.includes('소비자원') || msg.includes('신고')) {
    risk = 'high';
    priority = 'high';
    sentiment = 'angry';
    ownerRequired = true;
    reviewReason = '화난 고객 클레임. 사장님 확인 필요.';
  }
  if (msg.includes('부작용') || msg.includes('이상해요') || msg.includes('냄새')) {
    risk = 'high';
    priority = 'high';
    ownerRequired = true;
    reviewReason = '제품 이상 의심. 사장님 확인 필요.';
  }

  // Generate a new ID
  const maxNum = inquiries.reduce((max, i) => {
    const n = parseInt(i.id.replace('INQ-', ''), 10);
    return n > max ? n : max;
  }, 0);
  const newId = `INQ-${String(maxNum + 1).padStart(3, '0')}`;

  // Assign AI worker
  const workers = ['문의분류 AI', '답변작성 AI', '클레임감지 AI', '주문정리 AI', '리뷰관리 AI', '위험감지 AI'];
  const assignedWorker = category === '클레임' ? '클레임감지 AI' :
                         category === '리뷰관리' ? '리뷰관리 AI' :
                         category === '배송' || category === '교환/환불' ? '주문정리 AI' :
                         '답변작성 AI';

  const newInquiry = {
    id: newId,
    created_at: new Date().toISOString().replace('T', 'T').slice(0, 19),
    customer_label: customer,
    channel: channel,
    product_name: product,
    message: message,
    category: category,
    sentiment: sentiment,
    priority: priority,
    risk_level: risk,
    status: ownerRequired ? 'needs_owner_review' : 'processing',
    assigned_ai_worker: assignedWorker,
    owner_review_required: ownerRequired,
    review_reason: reviewReason,
    demo_highlight: '',
    ai_summary: `[데모 등록] ${category} 관련 문의. ${message.slice(0, 30)}...`,
    draft_response: `안녕하세요. 문의 주셔서 감사합니다. ${category} 관련하여 확인 후 답변드리겠습니다.`,
    recommended_action: ownerRequired ? '사장님 확인 후 답변' : 'AI 답변 초안 작성 후 전송',
    tone_guide: sentiment === 'positive' ? '따뜻하고 긍정적인 톤' :
                sentiment === 'angry' ? '진심 어린 사과 + 빠른 대응' :
                '친절하고 정확하게',
    integration_note: '데모 등록 문의로 실제 연동 시 자동 분류되어 처리됩니다.'
  };

  inquiries.push(newInquiry);

  // Re-render
  renderHero();
  renderCharts();
  renderHighlights();
  applyFilter();

  // Reset form
  document.getElementById('form-customer').value = '고객_테스트';
  document.getElementById('form-product').value = '프리미엄 강아지 사료';
  document.getElementById('form-message').value = '';
  document.getElementById('form-category').value = '배송';

  // Also update sim select
  const select = document.getElementById('sim-select');
  const opt = document.createElement('option');
  opt.value = newInquiry.id;
  opt.textContent = `${newInquiry.id} — ${newInquiry.customer_label} — ${escapeHtml(newInquiry.message.slice(0, 30))}...`;
  select.appendChild(opt);

  showFormFeedback(
    `✅ 문의 ${newId} 등록 완료! 목록에서 확인하세요. (새로고침 시 사라집니다)`,
    'success'
  );

  // Scroll to dashboard
  document.getElementById('dashboard-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showFormFeedback(msg, type) {
  const el = document.getElementById('form-feedback');
  el.innerHTML = msg;
  el.className = 'form-feedback ' + type;
  el.classList.remove('hidden');
}

/* ==================== UTILITY ==================== */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
