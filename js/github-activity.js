(function () {
  'use strict';

  window.EdanPortfolio = window.EdanPortfolio || {};

  const USERNAME = 'WaniBoogles';
  const CONTRIB_API = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;
  const EVENTS_API = `https://api.github.com/users/${USERNAME}/events/public?per_page=15`;
  const CACHE_KEY = 'edan_gh_contrib_v1';

  const gridEl = document.getElementById('ghHeatmapGrid');
  const monthsEl = document.getElementById('ghMonthsRow');
  const scrollWrap = document.getElementById('ghHeatmapScroll');
  const totalEl = document.getElementById('ghTotalCount');
  const streakEl = document.getElementById('ghStreakCount');
  const latestEl = document.getElementById('ghLatestPush');
  const statusDot = document.getElementById('ghStatusDot');
  const statusText = document.getElementById('ghStatusText');
  const refreshBtn = document.getElementById('ghRefreshBtn');
  const tooltipEl = document.getElementById('ghTooltip');

  if (!gridEl) return;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDateLabel = (iso) => {
    const parts = iso.split('-').map(Number);
    if (parts.length !== 3) return iso;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (isoTimestamp) => {
    if (!isoTimestamp) return 'Recent';
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 1000));
    if (diffSec < 60) return 'Just now';
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const computeStreak = (contributions) => {
    if (!Array.isArray(contributions) || !contributions.length) return 0;
    let streak = 0;
    let idx = contributions.length - 1;
    // Allow today to be 0 if user hasn't pushed yet today, and count from yesterday
    if (contributions[idx] && contributions[idx].count === 0) {
      idx -= 1;
    }
    while (idx >= 0 && contributions[idx].count > 0) {
      streak += 1;
      idx -= 1;
    }
    return streak;
  };

  const levelForCount = (count, fallbackLevel) => {
    if (typeof fallbackLevel === 'number' && fallbackLevel >= 0 && fallbackLevel <= 4) return fallbackLevel;
    if (count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const showTooltip = (cell) => {
    if (!tooltipEl || !cell) return;
    const count = Number(cell.dataset.count || 0);
    const date = cell.dataset.date || '';
    const word = count === 1 ? 'contribution' : 'contributions';
    tooltipEl.textContent = `${count} ${word} · ${formatDateLabel(date)}`;
    tooltipEl.classList.add('visible');
  };

  const hideTooltip = () => {
    if (tooltipEl) tooltipEl.classList.remove('visible');
  };

  const renderHeatmap = (contributions, totalCount, latestPushInfo) => {
    if (!Array.isArray(contributions) || !contributions.length) return;

    // Pad start so column 0 begins on Sunday
    const firstParts = contributions[0].date.split('-').map(Number);
    const firstDate = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]);
    const startPad = firstDate.getDay();

    const cells = [];
    for (let i = 0; i < startPad; i += 1) {
      cells.push(null);
    }
    contributions.forEach((entry) => cells.push(entry));

    const weeks = Math.ceil(cells.length / 7);
    gridEl.style.setProperty('--gh-weeks', String(weeks));
    gridEl.innerHTML = '';

    const frag = document.createDocumentFragment();
    for (let i = 0; i < cells.length; i += 1) {
      const item = cells[i];
      const cell = document.createElement('button');
      cell.type = 'button';
      if (!item) {
        cell.className = 'gh-cell is-pad';
        cell.tabIndex = -1;
        cell.setAttribute('aria-hidden', 'true');
      } else {
        const lv = levelForCount(item.count, item.level);
        cell.className = `gh-cell lv-${lv}`;
        cell.dataset.date = item.date;
        cell.dataset.count = String(item.count);
        const word = item.count === 1 ? 'contribution' : 'contributions';
        cell.setAttribute('aria-label', `${item.count} ${word} on ${formatDateLabel(item.date)}`);
        cell.addEventListener('mouseenter', () => showTooltip(cell));
        cell.addEventListener('focus', () => showTooltip(cell));
        cell.addEventListener('click', () => showTooltip(cell));
      }
      frag.appendChild(cell);
    }
    gridEl.appendChild(frag);
    gridEl.onmouseleave = hideTooltip;

    // Build month labels aligned to week columns
    if (monthsEl) {
      monthsEl.innerHTML = '';
      monthsEl.style.setProperty('--gh-weeks', String(weeks));
      let lastMonth = -1;
      for (let w = 0; w < weeks; w += 1) {
        const span = document.createElement('span');
        span.className = 'gh-month-lbl';
        const sample = cells[w * 7] || cells[w * 7 + 6];
        if (sample && sample.date) {
          const m = Number(sample.date.split('-')[1]) - 1;
          if (m !== lastMonth && m >= 0 && m < 12) {
            span.textContent = MONTHS[m];
            lastMonth = m;
          }
        }
        monthsEl.appendChild(span);
      }
    }

    // Stats
    const computedTotal = typeof totalCount === 'number'
      ? totalCount
      : contributions.reduce((sum, c) => sum + (Number(c.count) || 0), 0);
    if (totalEl) totalEl.textContent = computedTotal.toLocaleString();

    const streak = computeStreak(contributions);
    if (streakEl) streakEl.textContent = `${streak}d`;

    if (latestEl) {
      if (latestPushInfo && latestPushInfo.repo) {
        latestEl.textContent = `${latestPushInfo.repo} · ${formatRelativeTime(latestPushInfo.at)}`;
      } else {
        // Fallback to most recent active date in contributions
        const lastActive = [...contributions].reverse().find((c) => c.count > 0);
        latestEl.textContent = lastActive ? formatDateLabel(lastActive.date) : 'Active';
      }
    }

    // Auto-scroll to latest (rightmost) weeks on narrow/mobile screens
    if (scrollWrap) {
      requestAnimationFrame(() => {
        scrollWrap.scrollLeft = scrollWrap.scrollWidth;
      });
    }
  };

  const renderPlaceholder = () => {
    const today = new Date();
    const fallback = [];
    for (let i = 364; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      fallback.push({ date: iso, count: 0, level: 0 });
    }
    renderHeatmap(fallback, 0, null);
    if (totalEl) totalEl.textContent = 'Offline';
    if (streakEl) streakEl.textContent = '—';
    if (latestEl) latestEl.textContent = 'Connect to sync';
  };

  const setStatus = (mode, text) => {
    if (statusDot) {
      statusDot.classList.remove('is-live', 'is-syncing', 'is-offline');
      statusDot.classList.add(`is-${mode}`);
    }
    if (statusText) statusText.textContent = text;
  };

  const fetchLiveContributions = async (manual) => {
    setStatus('syncing', manual ? 'Syncing…' : 'Syncing GitHub…');
    if (refreshBtn) refreshBtn.classList.add('is-spinning');

    try {
      const bust = `&_t=${Date.now()}`;
      const [contribRes, eventsRes] = await Promise.allSettled([
        fetch(CONTRIB_API + bust, { cache: 'no-store' }),
        fetch(EVENTS_API, { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } })
      ]);

      if (contribRes.status !== 'fulfilled' || !contribRes.value.ok) {
        throw new Error('Contributions API unavailable');
      }

      const contribData = await contribRes.value.json();
      const contributions = Array.isArray(contribData.contributions) ? contribData.contributions : [];
      let totalCount = contribData.total && typeof contribData.total.lastYear === 'number'
        ? contribData.total.lastYear
        : contributions.reduce((s, c) => s + (Number(c.count) || 0), 0);

      let latestPushInfo = null;
      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        const events = await eventsRes.value.json();
        if (Array.isArray(events)) {
          const pushEvent = events.find((ev) => ev.type === 'PushEvent');
          if (pushEvent) {
            const repoFull = (pushEvent.repo && pushEvent.repo.name) || '';
            const shortRepo = repoFull.includes('/') ? repoFull.split('/').pop() : repoFull;
            latestPushInfo = {
              repo: shortRepo || USERNAME,
              at: pushEvent.created_at || ''
            };

            // Real-time boost: if a push happened today and the cached graph hasn't caught up yet
            const pushDay = (pushEvent.created_at || '').slice(0, 10);
            const commitsToday = events
              .filter((ev) => ev.type === 'PushEvent' && (ev.created_at || '').slice(0, 10) === pushDay)
              .reduce((sum, ev) => sum + ((ev.payload && ev.payload.size) || 1), 0);
            const todayCell = contributions.find((c) => c.date === pushDay);
            if (todayCell && commitsToday > todayCell.count) {
              const delta = commitsToday - todayCell.count;
              todayCell.count = commitsToday;
              todayCell.level = levelForCount(commitsToday);
              totalCount += delta;
            }
          }
        }
      }

      renderHeatmap(contributions, totalCount, latestPushInfo);
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setStatus('live', `Live · Synced ${nowTime}`);

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          contributions,
          totalCount,
          latestPushInfo,
          savedAt: Date.now()
        }));
      } catch (_) {}
    } catch (_) {
      // Offline / network fallback: use localStorage cache if available
      let restored = false;
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Array.isArray(cached.contributions) && cached.contributions.length) {
          renderHeatmap(cached.contributions, cached.totalCount, cached.latestPushInfo);
          setStatus('offline', 'Cached snapshot · Offline');
          restored = true;
        }
      } catch (_) {}

      if (!restored) {
        renderPlaceholder();
        setStatus('offline', 'Offline · Connects when online');
      }
    } finally {
      if (refreshBtn) refreshBtn.classList.remove('is-spinning');
    }
  };

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => fetchLiveContributions(true));
  }

  // Initial load + automatic 5-minute live refresh while page is open
  fetchLiveContributions(false);
  setInterval(() => {
    if (!document.hidden) fetchLiveContributions(false);
  }, 5 * 60 * 1000);

  window.EdanPortfolio.githubActivity = {
    refresh: () => fetchLiveContributions(true)
  };
})();
