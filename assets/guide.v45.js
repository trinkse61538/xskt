(() => {
  const DATA = window.V51_DATA || [];
  const HIST = window.XSMN_HISTORY || {};
  const $ = id => document.getElementById(id);
  if (!$('screen-guide')) return;

  const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const PAYOUT_MULTIPLIER = 80 / 15;
  const NUMBERS_PER_DAY = 2;
  const DAY_OPTIONS = [4,7,15,20];

  const latest = HIST.updatedThrough || new Date().toISOString().slice(0,10);
  const latestParts = latest.split('-').map(Number);
  let guideYear = Math.min(2050, Math.max(2026, latestParts[0] || 2026));
  let guideMonth = Math.min(12, Math.max(1, latestParts[1] || 1));
  let guideDays = 4;
  let baseStake = 75000;

  function safe(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function money(v) {
    const n = Math.round(Number(v) || 0);
    if (n >= 1e9) return `${(n/1e9).toLocaleString('vi-VN',{maximumFractionDigits:2})} tỷ`;
    if (n >= 1e6) return `${(n/1e6).toLocaleString('vi-VN',{maximumFractionDigits:2})} triệu`;
    if (n >= 1e3) return `${Math.round(n/1e3).toLocaleString('vi-VN')}k`;
    return `${n.toLocaleString('vi-VN')}đ`;
  }
  function fmtDate(iso) {
    const [y,m,d] = iso.split('-');
    return `${d}/${m}`;
  }
  function priority(r) {
    return .65 * Number(r.v5 || 0) + .35 * Number(r.agreement || 0);
  }
  function statusWeight(status) {
    return status === 'CHÍNH' ? 0 : status === 'PHỤ A' ? 1 : status === 'PHỤ B' ? 2 : 3;
  }

  function recommendedDays(year,month,count) {
    const rows = DATA.filter(r => r.y === year && r.m === month);
    const mains = rows.filter(r => r.status === 'CHÍNH').sort((a,b) => a.date.localeCompare(b.date));
    if (count === 4 && mains.length >= 4) return mains.slice(0,4);

    const mainDates = new Set(mains.map(r => r.date));
    const extras = rows.filter(r => !mainDates.has(r.date)).sort((a,b) =>
      statusWeight(a.status) - statusWeight(b.status) ||
      priority(b) - priority(a) ||
      Number(a.monthRank || 999) - Number(b.monthRank || 999) ||
      a.date.localeCompare(b.date)
    );
    return [...mains, ...extras].slice(0,count).sort((a,b) => a.date.localeCompare(b.date));
  }

  function progression(count,base) {
    const rows = [];
    let cumulative = 0;
    for (let i=1;i<=count;i++) {
      let multiple = 1;
      while ((PAYOUT_MULTIPLIER - NUMBERS_PER_DAY) * (multiple * base) <= cumulative + 0.0001) multiple++;
      const perNumber = multiple * base;
      const dayTotal = NUMBERS_PER_DAY * perNumber;
      cumulative += dayTotal;
      const oneHitPayout = PAYOUT_MULTIPLIER * perNumber;
      const profitIfHit = oneHitPayout - cumulative;
      rows.push({i,multiple,perNumber,dayTotal,cumulative,oneHitPayout,profitIfHit});
    }
    return rows;
  }

  function riskInfo(count,maxCapital) {
    if (count <= 4) return {cls:'guide-risk-ok',title:'Chu kỳ ngắn',text:`Nếu miss toàn bộ ${count} ngày, vốn tối đa là ${money(maxCapital)}.`};
    if (count <= 7) return {cls:'guide-risk-warn',title:'Rủi ro cao',text:`Để vẫn giữ điều kiện “1 hit cover tất cả”, vốn có thể tăng tới ${money(maxCapital)} nếu thua liên tục.`};
    return {cls:'guide-risk-danger',title:'Progression phình rất mạnh',text:`Vốn lý thuyết nếu miss ${count} ngày lên tới ${money(maxCapital)}. Đây chỉ nên xem như mô phỏng toán học, không phải mức cược hợp lý.`};
  }

  function shiftMonth(delta) {
    guideMonth += delta;
    if (guideMonth < 1) { guideMonth = 12; guideYear--; }
    if (guideMonth > 12) { guideMonth = 1; guideYear++; }
    if (guideYear < 2026) { guideYear = 2026; guideMonth = 1; }
    if (guideYear > 2050) { guideYear = 2050; guideMonth = 12; }
    renderGuide();
  }

  function renderGuide() {
    $('guidePeriod').textContent = `${MONTHS[guideMonth-1]} ${guideYear}`;
    document.querySelectorAll('#guideDayCount button').forEach(btn => btn.classList.toggle('active',+btn.dataset.days === guideDays));
    if ($('guideStake') && document.activeElement !== $('guideStake')) $('guideStake').value = String(baseStake);

    const selected = recommendedDays(guideYear,guideMonth,guideDays);
    const plan = progression(guideDays,baseStake);
    const maxCapital = plan.at(-1)?.cumulative || 0;
    const maxPerNumber = plan.at(-1)?.perNumber || 0;
    const oneDayHit = 1 - Math.pow(.98,18);
    const cycleHit = 1 - Math.pow(1-oneDayHit,guideDays);
    const risk = riskInfo(guideDays,maxCapital);

    $('guideSummary').innerHTML = `
      <div class="guide-summary-grid">
        <div><span>Số ngày</span><b>${guideDays}</b></div>
        <div><span>Ngày 1 / mỗi số</span><b>${money(baseStake)}</b></div>
        <div><span>Vốn tối đa nếu miss hết</span><b>${money(maxCapital)}</b></div>
        <div><span>Mức cao nhất / mỗi số</span><b>${money(maxPerNumber)}</b></div>
      </div>
      <div class="guide-stop-rule"><b>STOP ON WIN</b><span>Ngay khi tổng P/L của chu kỳ chuyển dương, dừng toàn bộ các ngày còn lại.</span></div>
      <div class="guide-prob-note">Mô hình tham khảo 1 đài/ngày, 2 số, 18 đuôi: xác suất có ≥1 hit trong ${guideDays} ngày ≈ <b>${(cycleHit*100).toFixed(1)}%</b>. Đây không phải xác suất V5.1 dự báo.</div>
      <div class="guide-risk ${risk.cls}"><b>${risk.title}</b><span>${risk.text}</span></div>`;

    $('guideDates').innerHTML = selected.length ? selected.map((r,idx) => `
      <div class="guide-date-chip ${r.status==='CHÍNH'?'main':''}">
        <span>#${idx+1} · ${fmtDate(r.date)}</span>
        <b>${safe((r.picks||[])[0] || '—')} · ${safe((r.picks||[])[1] || '—')}</b>
        <small>${safe(r.status)} · Priority ${priority(r).toFixed(1)}</small>
      </div>`).join('') : '<div class="empty">Không có dữ liệu tháng này.</div>';

    $('guidePlan').innerHTML = plan.map((p,idx) => {
      const r = selected[idx];
      const isMain = r?.status === 'CHÍNH';
      return `<article class="guide-plan-row ${isMain?'is-main':''}">
        <div class="guide-plan-day">
          <span>Ngày ${p.i}</span>
          <b>${r ? fmtDate(r.date) : '—'}</b>
          <small>${r ? `${safe((r.picks||[])[0]||'—')} · ${safe((r.picks||[])[1]||'—')}` : 'Chưa có ngày'}</small>
        </div>
        <div class="guide-plan-money">
          <div><span>Mỗi số</span><b>${money(p.perNumber)}</b><small>${p.multiple}× base</small></div>
          <div><span>Tổng ngày</span><b>${money(p.dayTotal)}</b></div>
          <div><span>Tổng vốn đã cược</span><b>${money(p.cumulative)}</b></div>
          <div><span>1 nháy trả</span><b>${money(p.oneHitPayout)}</b></div>
        </div>
        <div class="guide-profit"><span>Nếu hit 1 nháy</span><b>+${money(p.profitIfHit)}</b><small>→ DỪNG CHU KỲ</small></div>
      </article>`;
    }).join('');

    $('guideFormula').innerHTML = `Tỷ lệ đang dùng: <b>15k → 80k / nháy</b>. Mỗi ngày đánh <b>2 số</b>. Mức ngày sau được làm tròn lên theo <b>bội của tiền ngày 1</b> và chọn bội nhỏ nhất để 1 nháy vẫn cover toàn bộ tiền đã cược trước đó.`;
  }

  $('guidePrev')?.addEventListener('click',() => shiftMonth(-1));
  $('guideNext')?.addEventListener('click',() => shiftMonth(1));
  $('guideDayCount')?.addEventListener('click',e => {
    const btn = e.target.closest('[data-days]');
    if (!btn) return;
    const n = +btn.dataset.days;
    if (!DAY_OPTIONS.includes(n)) return;
    guideDays = n;
    renderGuide();
  });
  $('guideStake')?.addEventListener('input',e => {
    const n = Math.round(Number(e.target.value));
    if (Number.isFinite(n) && n >= 1000) {
      baseStake = n;
      renderGuide();
    }
  });

  document.querySelectorAll('.bottom-nav button[data-screen="guide"]').forEach(btn => {
    btn.addEventListener('click',() => {
      if ($('screenTitle')) $('screenTitle').textContent = 'Hướng dẫn đánh';
      renderGuide();
    });
  });

  const moreNav = $('moreNav');
  const moreOverlay = $('moreNavOverlay');
  function openMore() { if (moreOverlay) moreOverlay.hidden = false; }
  function closeMore() { if (moreOverlay) moreOverlay.hidden = true; }
  moreNav?.addEventListener('click',e => { e.preventDefault(); openMore(); });
  moreOverlay?.addEventListener('click',e => {
    if (e.target.closest('[data-close-more]')) { closeMore(); return; }
    const item = e.target.closest('[data-more-screen]');
    if (!item) return;
    const target = document.querySelector(`.bottom-nav button[data-screen="${item.dataset.moreScreen}"]`);
    closeMore();
    if (target) {
      target.click();
      moreNav?.classList.add('active');
    }
  });
  document.querySelectorAll('.bottom-nav button').forEach(btn => btn.addEventListener('click',() => moreNav?.classList.remove('active')));

  renderGuide();
})();
