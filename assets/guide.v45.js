(() => {
  const DATA = window.V51_DATA || [];
  const HIST = window.XSMN_HISTORY || {};
  const $ = id => document.getElementById(id);
  if (!$('screen-guide')) return;

  const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const PAYOUT_MULTIPLIER = 80 / 15;
  const NUMBERS_PER_DAY = 2;
  const STEP_UNIT = 15000;
  const DAY_OPTIONS = [4,7,10,15,20,25];
  const XSMN_SCHEDULE = {
    0:['TP.HCM','Đồng Tháp','Cà Mau'],
    1:['Bến Tre','Vũng Tàu','Bạc Liêu'],
    2:['Đồng Nai','Cần Thơ','Sóc Trăng'],
    3:['Tây Ninh','An Giang','Bình Thuận'],
    4:['Vĩnh Long','Bình Dương','Trà Vinh'],
    5:['TP.HCM','Long An','Bình Phước','Hậu Giang'],
    6:['Tiền Giang','Kiên Giang','Đà Lạt']
  };

  const latest = HIST.updatedThrough || new Date().toISOString().slice(0,10);
  const latestParts = latest.split('-').map(Number);
  let guideYear = Math.min(2050, Math.max(2026, latestParts[0] || 2026));
  let guideMonth = Math.min(12, Math.max(1, latestParts[1] || 1));
  let guideDays = 4;
  let baseStake = 75000;
  let guideStartDate = '';

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
  function fmtFullDate(iso) {
    if (!iso) return '—';
    const [y,m,d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  function stepNumber(value) {
    return Number(value || 0) / STEP_UNIT;
  }
  function fmtStep(value) {
    const n = Number(value || 0);
    return Number.isInteger(n) ? String(n) : n.toLocaleString('vi-VN',{maximumFractionDigits:2});
  }
  function isWholeStep(value) {
    const n = stepNumber(value);
    return Number.isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9;
  }
  function stakeStepMessage(value) {
    const steps = stepNumber(value);
    if (!Number.isFinite(steps) || steps <= 0) return {warn:true,html:'Nhập số tiền lớn hơn 0.'};
    if (isWholeStep(value)) return {warn:false,html:`${fmtStep(steps)} bước × 15k = <b>${money(value)}</b> / số.`};
    const low = Math.max(1,Math.floor(steps));
    const high = Math.max(1,Math.ceil(steps));
    return {warn:true,html:`<b>⚠ Bước đang lẻ: ${fmtStep(steps)}</b>. Tiền mỗi số nên là bội của 15k. Gần nhất: <strong>bước ${low} = ${money(low*STEP_UNIT)}</strong> hoặc <strong>bước ${high} = ${money(high*STEP_UNIT)}</strong>.`};
  }
  function priority(r) {
    return .65 * Number(r.v5 || 0) + .35 * Number(r.agreement || 0);
  }
  function statusWeight(status) {
    return status === 'CHÍNH' ? 0 : status === 'PHỤ A' ? 1 : status === 'PHỤ B' ? 2 : 3;
  }
  function weekdayIndexFromISO(iso) {
    const [y,m,d] = iso.split('-').map(Number);
    return (new Date(y,m-1,d).getDay()+6)%7;
  }
  function stationsForDate(iso) {
    return XSMN_SCHEDULE[weekdayIndexFromISO(iso)] || [];
  }
  function stationDraw(station,date) {
    return (HIST.stations?.[station]?.draws || []).find(d => d.d === date) || null;
  }
  function corePicks(r) {
    return [...new Set((r?.picks || []).slice(0,2).map(x => String(x).padStart(2,'0')))];
  }
  function drawHits(draw,picks) {
    if (!draw) return [];
    const got = new Set(draw.h || []);
    return picks.filter(n => got.has(n));
  }
  function evaluateHistory(r) {
    if (!r) return null;
    const picks = corePicks(r);
    const stations = stationsForDate(r.date);
    const station1 = stations[0] || '—';
    const draw1 = stationDraw(station1,r.date);
    const hits1 = drawHits(draw1,picks);
    const station1State = !draw1 ? 'pending' : hits1.length ? 'win' : 'loss';
    const stationResults = stations.map(station => {
      const draw = stationDraw(station,r.date);
      return {station,draw,hits:drawHits(draw,picks)};
    });
    const anyHits = stationResults.filter(x => x.hits.length);
    const allResolved = stations.length > 0 && stationResults.every(x => !!x.draw);
    const anyState = anyHits.length ? 'win' : allResolved ? 'loss' : 'pending';
    return {picks,stations,station1,draw1,hits1,station1State,stationResults,anyHits,allResolved,anyState};
  }
  function stateText(state) {
    return state === 'win' ? 'WIN' : state === 'loss' ? 'MISS' : 'CHỜ KQ';
  }
  function anyHistoryText(h) {
    if (!h) return '—';
    if (h.anyHits.length) return h.anyHits.map(x => `${x.station}: ${x.hits.join(' · ')}`).join(' | ');
    return h.anyState === 'loss' ? 'Không trúng' : 'Chưa đủ kết quả';
  }

  function rankBestDays(rows,count) {
    return [...rows].sort((a,b) =>
      statusWeight(a.status) - statusWeight(b.status) ||
      priority(b) - priority(a) ||
      Number(a.monthRank || 999) - Number(b.monthRank || 999) ||
      a.date.localeCompare(b.date)
    ).slice(0,count).sort((a,b) => a.date.localeCompare(b.date));
  }

  function monthEndISO(year,month) {
    const last = new Date(year,month,0).getDate();
    return `${year}-${String(month).padStart(2,'0')}-${String(last).padStart(2,'0')}`;
  }

  function candidateDaysFromStart(startDate,count) {
    if (!startDate) return [];
    let [year,month] = startDate.split('-').map(Number);
    let endDate = monthEndISO(year,month);
    let rows = DATA.filter(r => r.date >= startDate && r.date <= endDate);

    while (rows.length < count && (year < 2050 || month < 12)) {
      month++;
      if (month > 12) { month = 1; year++; }
      endDate = monthEndISO(year,month);
      rows = DATA.filter(r => r.date >= startDate && r.date <= endDate);
    }
    return rows;
  }

  function bestDaysFromStart(startDate,count) {
    return rankBestDays(candidateDaysFromStart(startDate,count),count);
  }

  function selectedDays() {
    return guideStartDate ? bestDaysFromStart(guideStartDate,guideDays) : recommendedDays(guideYear,guideMonth,guideDays);
  }

  function setGuideStartDate(iso) {
    guideStartDate = iso || '';
    if (guideStartDate) {
      const [y,m] = guideStartDate.split('-').map(Number);
      guideYear = Math.min(2050,Math.max(2026,y || guideYear));
      guideMonth = Math.min(12,Math.max(1,m || guideMonth));
    }
  }

  function shiftCustomStartMonth(delta) {
    if (!guideStartDate) return false;
    let [y,m,d] = guideStartDate.split('-').map(Number);
    m += delta;
    while (m < 1) { m += 12; y--; }
    while (m > 12) { m -= 12; y++; }
    y = Math.min(2050,Math.max(2026,y));
    const last = new Date(y,m,0).getDate();
    d = Math.min(d,last);
    setGuideStartDate(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
    return true;
  }

  function ensureGuideExtras() {
    const dayBox = $('guideDayCount');
    if (dayBox && !dayBox.querySelector('[data-days="10"]')) {
      dayBox.innerHTML = DAY_OPTIONS.map(n => `<button data-days="${n}" class="${n===guideDays?'active':''}">${n} ngày</button>`).join('');
    }

    const stakeWrap = document.querySelector('#screen-guide .guide-stake-wrap');
    if (stakeWrap && !$('guideStep')) {
      stakeWrap.insertAdjacentHTML('beforeend',`
        <div class="guide-step-sync">
          <div class="guide-control-label"><span>Bước số ngày 1</span><b>1 bước = 15.000đ / số</b></div>
          <div class="guide-step-input">
            <input id="guideStep" type="number" min="0.1" step="1" value="5" inputmode="decimal" aria-label="Bước số ngày 1">
            <span>bước</span>
          </div>
          <div id="guideStakeWarning" class="guide-step-message"></div>
        </div>`);
      $('guideStep')?.addEventListener('input',e => {
        const steps = Number(e.target.value);
        if (!Number.isFinite(steps) || steps <= 0) return;
        baseStake = Math.round(steps * STEP_UNIT);
        if ($('guideStake')) $('guideStake').value = String(baseStake);
        renderGuide();
      });
    }

    const controls = document.querySelector('#screen-guide .guide-controls');
    if (controls && !$('guideStartDate')) {
      controls.insertAdjacentHTML('beforeend',`
        <div class="guide-start-wrap">
          <div class="guide-control-label"><span>Mốc bắt đầu chọn ngày</span><b>Tùy chọn</b></div>
          <div class="guide-start-input">
            <input id="guideStartDate" type="date" min="2026-01-01" max="2050-12-31" aria-label="Mốc bắt đầu chọn ngày">
            <button id="guideClearStart" type="button">Dùng ngày ưu tiên</button>
          </div>
          <div class="guide-hint">Bỏ trống: chọn N ngày V5.1 tốt nhất trong tháng. Nhập ngày: đây chỉ là <b>mốc sớm nhất</b>; app chọn N ngày tốt nhất từ mốc đó trở đi, không lấy các ngày liền kề. Ưu tiên CHÍNH → PHỤ A → PHỤ B → PHỤ C, sau đó Priority.</div>
        </div>`);
      $('guideStartDate')?.addEventListener('change',e => {
        setGuideStartDate(e.target.value);
        renderGuide();
      });
      $('guideClearStart')?.addEventListener('click',() => {
        setGuideStartDate('');
        if ($('guideStartDate')) $('guideStartDate').value = '';
        renderGuide();
      });
    }
  }

  function recommendedDays(year,month,count) {
    const rows = DATA.filter(r => r.y === year && r.m === month);
    const mains = rows.filter(r => r.status === 'CHÍNH').sort((a,b) => a.date.localeCompare(b.date));
    if (count === 4 && mains.length >= 4) return mains.slice(0,4);
    return rankBestDays(rows,count);
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
    if (shiftCustomStartMonth(delta)) {
      renderGuide();
      return;
    }
    guideMonth += delta;
    if (guideMonth < 1) { guideMonth = 12; guideYear--; }
    if (guideMonth > 12) { guideMonth = 1; guideYear++; }
    if (guideYear < 2026) { guideYear = 2026; guideMonth = 1; }
    if (guideYear > 2050) { guideYear = 2050; guideMonth = 12; }
    renderGuide();
  }

  function renderGuide() {
    ensureGuideExtras();
    $('guidePeriod').textContent = guideStartDate ? `Từ ${fmtFullDate(guideStartDate)} · ${guideDays} ngày tốt nhất` : `${MONTHS[guideMonth-1]} ${guideYear}`;
    document.querySelectorAll('#guideDayCount button').forEach(btn => btn.classList.toggle('active',+btn.dataset.days === guideDays));
    if ($('guideStake') && document.activeElement !== $('guideStake')) $('guideStake').value = String(baseStake);
    if ($('guideStep') && document.activeElement !== $('guideStep')) $('guideStep').value = String(Number(stepNumber(baseStake).toFixed(2)));
    if ($('guideStartDate') && document.activeElement !== $('guideStartDate')) $('guideStartDate').value = guideStartDate;
    const stepMsg = stakeStepMessage(baseStake);
    if ($('guideStakeWarning')) {
      $('guideStakeWarning').classList.toggle('warning',stepMsg.warn);
      $('guideStakeWarning').innerHTML = stepMsg.html;
    }
    const dateTitle = $('guideDates')?.previousElementSibling;
    if (dateTitle?.classList.contains('section-title')) dateTitle.textContent = guideStartDate ? `${guideDays} ngày tốt nhất từ ${fmtFullDate(guideStartDate)}` : 'Ngày V5.1 được chọn';

    const selected = selectedDays();
    const plan = progression(guideDays,baseStake);
    const history = selected.map(evaluateHistory);
    const maxCapital = plan.at(-1)?.cumulative || 0;
    const maxPerNumber = plan.at(-1)?.perNumber || 0;
    const oneDayHit = 1 - Math.pow(.98,18);
    const cycleHit = 1 - Math.pow(1-oneDayHit,guideDays);
    const risk = riskInfo(guideDays,maxCapital);

    let reviewedDays = 0;
    let stopIdx = -1;
    for (let i=0;i<history.length;i++) {
      const state = history[i]?.station1State || 'pending';
      if (state === 'pending') break;
      reviewedDays++;
      if (state === 'win') { stopIdx = i; break; }
    }
    const resolved = history.filter(h => h && h.station1State !== 'pending');
    const totalWins = resolved.filter(h => h.station1State === 'win').length;
    const totalMiss = resolved.filter(h => h.station1State === 'loss').length;
    let reviewHtml = '<div class="guide-review pending"><b>REVIEW LỊCH SỬ</b><span>Chưa có ngày nào trong kế hoạch được chấm kết quả.</span></div>';
    if (stopIdx >= 0) {
      const r = selected[stopIdx];
      reviewHtml = `<div class="guide-review win"><b>REVIEW · ĐÃ CÓ ĐIỂM DỪNG</b><span>Đài 1 WIN tại <strong>ngày #${stopIdx+1} · ${fmtDate(r.date)}</strong>. Theo progression và giả định tối thiểu 1 nháy, chu kỳ dừng tại đây với lãi tối thiểu <strong>+${money(plan[stopIdx].profitIfHit)}</strong>. Các ngày sau chỉ để review, không cần đánh theo stop-on-win.</span></div>`;
    } else if (reviewedDays > 0) {
      const currentLoss = plan[Math.min(reviewedDays-1,plan.length-1)]?.cumulative || 0;
      const complete = reviewedDays === selected.length;
      reviewHtml = `<div class="guide-review ${complete?'loss':'pending'}"><b>REVIEW · ${totalWins} WIN / ${totalMiss} MISS</b><span>${complete ? `Không có WIN trong ${reviewedDays} ngày đã chấm. Nếu theo progression, chu kỳ kết thúc ở <strong>-${money(currentLoss)}</strong>.` : `Đã chấm ${reviewedDays} ngày đầu và chưa có WIN; P/L mô phỏng hiện tại <strong>-${money(currentLoss)}</strong>. Các ngày sau đang chờ kết quả.`}</span></div>`;
    }

    $('guideSummary').innerHTML = `
      <div class="guide-summary-grid">
        <div><span>Số ngày</span><b>${guideDays}</b></div>
        <div><span>Ngày 1 / mỗi số</span><b>${money(baseStake)}</b><small>Bước ${fmtStep(stepNumber(baseStake))}</small></div>
        <div><span>Mốc chọn từ</span><b>${guideStartDate ? fmtFullDate(guideStartDate) : 'Theo tháng V5.1'}</b></div>
        <div><span>Vốn tối đa nếu miss hết</span><b>${money(maxCapital)}</b></div>
        <div><span>Mức cao nhất / mỗi số</span><b>${money(maxPerNumber)}</b></div>
      </div>
      <div class="guide-stop-rule"><b>STOP ON WIN</b><span>Ngay khi tổng P/L của chu kỳ chuyển dương, dừng toàn bộ các ngày còn lại.</span></div>
      ${reviewHtml}
      <div class="guide-prob-note">Mô hình tham khảo 1 đài/ngày, 2 số, 18 đuôi: xác suất có ≥1 hit trong ${guideDays} ngày ≈ <b>${(cycleHit*100).toFixed(1)}%</b>. Đây không phải xác suất V5.1 dự báo.</div>
      <div class="guide-risk ${risk.cls}"><b>${risk.title}</b><span>${risk.text}</span></div>`;

    $('guideDates').innerHTML = selected.length ? selected.map((r,idx) => {
      const h = history[idx];
      const state = h?.station1State || 'pending';
      const afterStop = stopIdx >= 0 && idx > stopIdx;
      return `<div class="guide-date-chip ${r.status==='CHÍNH'?'main':''} ${state} ${afterStop?'after-stop':''}">
        <div class="guide-chip-top"><span>#${idx+1} · ${fmtDate(r.date)}</span><em class="guide-result-badge ${state}">${stateText(state)}</em></div>
        <b>${safe((r.picks||[])[0] || '—')} · ${safe((r.picks||[])[1] || '—')}</b>
        <small>${safe(r.status)} · Priority ${priority(r).toFixed(1)}</small>
        <small class="guide-chip-result">${h ? `Đài 1 ${safe(h.station1)}${state==='win' ? ` · trúng ${safe(h.hits1.join(' · '))}` : ''}` : 'Chưa có dữ liệu'}</small>
        ${afterStop?'<small class="guide-after-stop">Theo kế hoạch: không đánh</small>':''}
      </div>`;
    }).join('') : '<div class="empty">Không có dữ liệu tháng này.</div>';

    $('guidePlan').innerHTML = plan.map((p,idx) => {
      const r = selected[idx];
      const h = history[idx];
      const isMain = r?.status === 'CHÍNH';
      const state = h?.station1State || 'pending';
      const afterStop = stopIdx >= 0 && idx > stopIdx;
      const isStop = stopIdx === idx;
      const primaryResult = !h ? 'Chưa có dữ liệu' : state === 'win' ? `WIN · trúng ${h.hits1.join(' · ')}` : state === 'loss' ? 'MISS · không trúng' : 'CHỜ KQ';
      return `<article class="guide-plan-row ${isMain?'is-main':''} ${state} ${afterStop?'after-stop':''}">
        <div class="guide-plan-day">
          <span>Ngày ${p.i}</span>
          <b>${r ? fmtDate(r.date) : '—'}</b>
          <small>${r ? `${safe((r.picks||[])[0]||'—')} · ${safe((r.picks||[])[1]||'—')}` : 'Chưa có ngày'}</small>
        </div>
        ${r ? `<div class="guide-history-result ${state}">
          <div><span>Đài 1 · ${safe(h?.station1 || '—')}</span><b>${safe(primaryResult)}</b></div>
          <em>${isStop?'→ DỪNG TẠI ĐÂY':afterStop?'KHÔNG ĐÁNH':stateText(state)}</em>
          <small>Any Station: ${safe(anyHistoryText(h))}</small>
        </div>` : ''}
        <div class="guide-plan-money">
          <div><span>Mỗi số</span><b>${money(p.perNumber)}</b><small>Bước ${fmtStep(stepNumber(p.perNumber))} · ${p.multiple}× base</small></div>
          <div><span>Tổng ngày</span><b>${money(p.dayTotal)}</b></div>
          <div><span>Tổng vốn đã cược</span><b>${money(p.cumulative)}</b></div>
          <div><span>1 nháy trả</span><b>${money(p.oneHitPayout)}</b></div>
        </div>
        <div class="guide-profit"><span>Nếu hit 1 nháy</span><b>+${money(p.profitIfHit)}</b><small>→ DỪNG CHU KỲ</small></div>
      </article>`;
    }).join('');

    $('guideFormula').innerHTML = `Tỷ lệ đang dùng: <b>15k → 80k / nháy</b>. Quy ước <b>1 bước = 15k / số</b>; ví dụ 5 bước = 75k. Mỗi ngày đánh <b>2 số</b>. Mức ngày sau vẫn theo <b>bội của tiền ngày 1</b> như kế hoạch hiện tại và chọn bội nhỏ nhất để 1 nháy cover toàn bộ tiền đã cược trước đó.<br><br><b>Chọn ngày:</b> 4 ngày vẫn giữ 4 ngày CHÍNH khi dùng chế độ theo tháng. Với 7/10/15/20/25 ngày, app chọn các ngày V5.1 tốt nhất theo nhóm CHÍNH → PHỤ A → PHỤ B → PHỤ C, rồi Priority. Nếu nhập mốc bắt đầu, app chỉ xét các ngày từ mốc đó trở đi và vẫn chọn ngày tốt nhất — <b>không lấy ngày liên tiếp</b>.<br><br><b>Review lịch sử:</b> WIN/MISS được chấm theo Đài 1; Any Station hiển thị thêm để đối chiếu. Dữ liệu hiện xác định số có xuất hiện hay không, không dùng để khẳng định số nháy lặp; P/L review vì vậy lấy mức tối thiểu <b>1 nháy</b> khi WIN.`;
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
