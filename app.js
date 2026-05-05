/* ============================================
   스마트스토어 AI CS 매니저 — App Logic
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
  renderHighlights();
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

/* ==================== HIGHLIGHTS ==================== */
function renderHighlights() {
  const grid = document.getElementById('highlight-grid');

  // Pick 3 highlights: risk, auto, positive
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

  // Click handlers
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
    // Debounce: wait 250ms after last keystroke
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
  // Reset search
  currentSearch = '';
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').classList.add('hidden');

  // Reset filter
  currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

  // Reset sort
  currentSort = 'latest';
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.sort-btn[data-sort="latest"]').classList.add('active');

  // Reset risk filter
  currentRiskFilter = 'all';
  document.querySelectorAll('.risk-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.risk-btn[data-risk="all"]').classList.add('active');

  applyFilter();
  document.getElementById('dashboard-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==================== APPLY FILTER (combined) ==================== */
function applyFilter() {
  let filtered = inquiries;

  // 1. Apply main filter
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

  // 2. Apply risk sub-filter (if not 'all')
  if (currentRiskFilter !== 'all') {
    filtered = filtered.filter(i => i.risk_level === currentRiskFilter);
  }

  // 3. Apply search (full-text across 5 fields)
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

  // 4. Apply sort
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
}

/* ==================== UTILITY ==================== */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
