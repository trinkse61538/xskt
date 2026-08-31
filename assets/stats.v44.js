(() => {
  const DATA = window.V51_DATA || [];
  const HIST = window.XSMN_HISTORY || {stations:{},baseline:1-Math.pow(.99,18)};
  const $ = id => document.getElementById(id);

  if (!$('screen-stats')) return;

  const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const XSMN_SCHEDULE = {
    0:['TP.HCM','Đồng Tháp','Cà Mau'],
    1:['Bến Tre','Vũng Tàu','Bạc Liêu'],
    2:['Đồng Nai','Cần Thơ','Sóc Trăng'],
    3:['Tây Ninh','An Giang','Bình Thuận'],
    4:['Vĩnh Long','Bình Dương','Trà Vinh'],
    5:['TP.HCM','Long An','Bình Phước','Hậu Giang'],
    6:['Tiền Giang','Kiên Giang','Đà Lạt']
  };

  function safe(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function fmtDate(iso) {
    const [y,m,d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  function pct(v) {
    return Number.isFinite(v) ? `${(v*100).toFixed(1)}%` : '—';
  }
  function weekdayIndexFromISO(iso) {
    const [y,m,d] = iso.split('-').map(Number);
    return (new Date(y,m-1,d).getDay()+6)%7;
  }
  function stationsForDate(iso) {
    return XSMN_SCHEDULE[weekdayIndexFromISO(iso)] || [];
  }
  function stationDraw(station,date) {
    const draws = HIST.stations?.[station]?.draws || [];
    return draws.find(d => d.d === date) || null;
  }
  function corePicks(r) {
    return [...new Set((r.picks || []).slice(0,2).map(x => String(x).padStart(2,'0')))];
  }
  function hits(draw,picks) {
    if (!draw) return [];
    const got = new Set(draw.h || []);
    return picks.filter(n => got.has(n));
  }
  function evaluateDay(r) {
    const stations = stationsForDate(r.date);
    const picks = corePicks(r);
    const station1 = stations[0] || '—';
    const draw1 = stationDraw(station1,r.date);
    const hits1 = hits(draw1,picks);
    const station1State = !draw1 ? 'pending' : hits1.length ? 'win' : 'loss';

    const stationResults = stations.map(station => {
      const draw = stationDraw(station,r.date);
      return {station,draw,hits:hits(draw,picks)};
    });
    const anyHits = stationResults.filter(x => x.hits.length);
    const allResolved = stations.length > 0 && stationResults.every(x => !!x.draw);
    const anyState = anyHits.length ? 'win' : allResolved ? 'loss' : 'pending';

    return {
      r,picks,stations,station1,draw1,hits1,station1State,
      stationResults,anyHits,allResolved,anyState
    };
  }
  function summarize(rows,key) {
    const resolved = rows.filter(x => x[key] !== 'pending');
    const wins = resolved.filter(x => x[key] === 'win').length;
    return {wins,total:resolved.length,rate:resolved.length ? wins/resolved.length : NaN};
  }
  function statusText(state) {
    return state === 'win' ? 'WIN' : state === 'loss' ? 'MISS' : 'CHỜ KQ';
  }
  function hitText(nums) {
    return nums?.length ? nums.join(' · ') : '—';
  }
  function anyHitText(row) {
    if (!row.anyHits.length) return row.anyState === 'pending' ? 'Chưa đủ kết quả' : 'Không trúng';
    return row.anyHits.map(x => `${x.station}: ${x.hits.join(' · ')}`).join(' | ');
  }

  const latest = HIST.updatedThrough || DATA[0]?.date || '2026-01-01';
  const latestParts = latest.split('-').map(Number);
  let statsYear = latestParts[0] || 2026;
  let statsMonth = latestParts[1] || 1;
  let statsFilter = 'ALL';

  function shiftMonth(delta) {
    statsMonth += delta;
    if (statsMonth < 1) { statsMonth = 12; statsYear--; }
    if (statsMonth > 12) { statsMonth = 1; statsYear++; }
    if (statsYear < 2026) { statsYear = 2026; statsMonth = 1; }
    if (statsYear > 2050) { statsYear = 2050; statsMonth = 12; }
    renderStats();
  }

  function kpiCard(label,summary,note,accent='') {
    return `<article class="stats-kpi ${accent}">
      <span>${safe(label)}</span>
      <b>${summary.total ? pct(summary.rate) : '—'}</b>
      <strong>${summary.wins}/${summary.total} ngày</strong>
      <small>${safe(note)}</small>
    </article>`;
  }

  function renderStats() {
    $('statsPeriod').textContent = `${MONTHS[statsMonth-1]} ${statsYear}`;

    const monthRecords = DATA
      .filter(r => r.y === statsYear && r.m === statsMonth)
      .sort((a,b) => a.date.localeCompare(b.date));
    const rows = monthRecords.map(evaluateDay);
    const resolved1 = rows.filter(x => x.station1State !== 'pending');
    const last7 = resolved1.slice(-7);
    const mainRows = rows.filter(x => x.r.status === 'CHÍNH');

    const monthS = summarize(rows,'station1State');
    const weekS = summarize(last7,'station1State');
    const main1S = summarize(mainRows,'station1State');
    const mainAnyS = summarize(mainRows,'anyState');

    $('statsKpis').innerHTML = [
      kpiCard('Toàn tháng · Đài 1',monthS,`${monthS.total} ngày đã có kết quả`,'primary'),
      kpiCard('7 ngày gần nhất · Đài 1',weekS,last7.length ? `${fmtDate(last7[0].r.date)} → ${fmtDate(last7[last7.length-1].r.date)}` : 'Chưa đủ dữ liệu'),
      kpiCard('Ngày chính · Đài 1',main1S,`${main1S.total}/${mainRows.length} ngày chính đã chấm`,'main-kpi'),
      kpiCard('Ngày chính · Any Station',mainAnyS,`${mainAnyS.total}/${mainRows.length} ngày chính đã đủ dữ liệu`,'main-kpi')
    ].join('');

    const baseline = 1 - Math.pow(1 - Math.min(2,Math.max(1,corePicks(monthRecords[0] || {picks:['00','01']}).length))/100,18);
    const delta = Number.isFinite(monthS.rate) ? monthS.rate - baseline : NaN;
    $('statsBaseline').innerHTML = `<b>Baseline lý thuyết 2 số / 1 đài: ${pct(baseline)}</b>
      <span>${Number.isFinite(delta) ? `Tháng này ${delta>=0?'+':''}${(delta*100).toFixed(1)} điểm % so với baseline.` : 'Chưa đủ dữ liệu để so sánh.'}</span>
      <small>Baseline chỉ là mô hình 18 đuôi độc lập, phân bố đều; không phải xác suất dự báo cho kỳ kế tiếp.</small>`;

    $('statsFreshness').innerHTML = `Lịch sử đang cập nhật tới <b>${HIST.updatedThrough ? fmtDate(HIST.updatedThrough) : 'chưa rõ'}</b>. `+
      `WIN = ít nhất một trong <b>Chủ 1 / Chủ 2</b> xuất hiện trong đài được chấm.`;

    const filtered = rows.filter(row => {
      if (statsFilter === 'WIN') return row.station1State === 'win';
      if (statsFilter === 'MISS') return row.station1State === 'loss';
      if (statsFilter === 'MAIN') return row.r.status === 'CHÍNH';
      return true;
    });

    $('statsSummary').innerHTML = `Hiển thị <b>${filtered.length}</b>/${rows.length} ngày · `+
      `<b>${monthS.wins}</b> WIN · <b>${Math.max(0,monthS.total-monthS.wins)}</b> MISS · <b>${rows.length-monthS.total}</b> chờ KQ.`;

    $('statsDays').innerHTML = filtered.length ? filtered.map(row => {
      const main = row.r.status === 'CHÍNH';
      const state = row.station1State;
      return `<article class="stats-day ${state} ${main?'is-main':''}">
        <div class="stats-date">
          <small>${safe(row.r.dow || '')}</small>
          <b>${row.r.date.slice(8,10)}</b>
          <span>${row.r.date.slice(5,7)}/${row.r.date.slice(0,4)}</span>
        </div>
        <div class="stats-day-body">
          <div class="stats-day-head">
            <div class="stats-core"><span>Chủ 1</span><b>${safe(row.picks[0] || '—')}</b><span>Chủ 2</span><b>${safe(row.picks[1] || '—')}</b></div>
            ${main?'<em class="stats-main-badge">CHÍNH</em>':''}
          </div>
          <div class="stats-result-line"><span>Đài 1 · ${safe(row.station1)}</span><b>${state==='win' ? `Trúng ${safe(hitText(row.hits1))}` : state==='loss' ? 'Không trúng' : 'Chờ kết quả'}</b></div>
          <div class="stats-any-line"><span>Any Station</span><small>${safe(anyHitText(row))}</small></div>
        </div>
        <div class="stats-state ${state}">${statusText(state)}</div>
      </article>`;
    }).join('') : '<div class="empty">Không có ngày phù hợp bộ lọc.</div>';

    document.querySelectorAll('#statsFilter button').forEach(btn => {
      btn.classList.toggle('active',btn.dataset.statsFilter === statsFilter);
    });
  }

  $('statsPrev')?.addEventListener('click',() => shiftMonth(-1));
  $('statsNext')?.addEventListener('click',() => shiftMonth(1));
  $('statsFilter')?.addEventListener('click',e => {
    const btn = e.target.closest('[data-stats-filter]');
    if (!btn) return;
    statsFilter = btn.dataset.statsFilter;
    renderStats();
  });

  document.querySelectorAll('.bottom-nav button[data-screen="stats"]').forEach(btn => {
    btn.addEventListener('click',() => {
      const title = $('screenTitle');
      if (title) title.textContent = 'Thống kê';
      renderStats();
    });
  });

  renderStats();
})();
