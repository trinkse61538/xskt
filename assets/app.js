(() => {
  const DATA = window.V51_DATA || [];
  const $ = id => document.getElementById(id);
  const year = $('year'), month = $('month'), type = $('type'), search = $('search');

  for (let y = 2026; y <= 2030; y++) {
    year.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
  }
  month.innerHTML =
    '<option value="ALL">Cả năm</option>' +
    Array.from({length:12},(_,i)=>`<option value="${i+1}">Tháng ${i+1}</option>`).join('');

  const now = new Date();
  const inRange = now.getFullYear() >= 2026 && now.getFullYear() <= 2030;
  year.value = inRange ? String(now.getFullYear()) : '2026';
  month.value = inRange ? String(now.getMonth()+1) : 'ALL';

  function cardClass(status) {
    return status === 'CHÍNH' ? 'main' :
           status === 'PHỤ A' ? 'pa' :
           status === 'PHỤ B' ? 'pb' : 'pc';
  }
  function safe(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function render() {
    const y = +year.value, m = month.value, t = type.value, q = search.value.trim().toLowerCase();
    let rows = DATA.filter(r =>
      r.y === y &&
      (m === 'ALL' || r.m === +m) &&
      (t === 'ALL' || (t === 'PHỤ' ? r.status.startsWith('PHỤ') : r.status === t))
    );
    if (q) rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
    rows.sort((a,b)=>a.date.localeCompare(b.date));

    const counts = Object.fromEntries(['CHÍNH','PHỤ A','PHỤ B','PHỤ C'].map(k => [k, rows.filter(r=>r.status===k).length]));
    $('stats').innerHTML = `
      <div class="stat"><span>Đang hiển thị</span><b>${rows.length}</b></div>
      <div class="stat"><span>Ngày chính</span><b>${counts['CHÍNH']}</b></div>
      <div class="stat"><span>Phụ A/B</span><b>${counts['PHỤ A'] + counts['PHỤ B']}</b></div>
      <div class="stat"><span>Phụ C</span><b>${counts['PHỤ C']}</b></div>`;

    if (!rows.length) {
      $('grid').innerHTML = '<div class="empty">Không có ngày phù hợp với bộ lọc hiện tại.</div>';
      return;
    }

    $('grid').innerHTML = rows.map(r => {
      const dd = r.date.split('-').reverse().join('/');
      const rankText = r.secondaryRank ? ` · phụ #${r.secondaryRank}` : '';
      return `
        <article class="card ${cardClass(r.status)}">
          <div class="top">
            <div>
              <div class="date">${safe(r.dow)} · ${dd}</div>
              <div class="detail">Hạng tháng #${r.monthRank}${rankText}</div>
            </div>
            <span class="badge">${safe(r.status)}</span>
          </div>
          <div class="score">
            <span>V5 <b>${r.v5}</b></span>
            <span>Agreement <b>${r.agreement}</b></span>
            <span>Tier <b>${safe(r.tier)}</b></span>
          </div>
          <div class="picks">
            ${r.picks.map((x,i)=>`<span class="num" title="Điểm ${r.scores[i]}">${safe(x)}</span>`).join('')}
          </div>
          <div class="detail">
            <strong>${safe(r.tracking)}</strong> · ${safe(r.canChi)} · ${safe(r.officer)} · Nạp âm ${safe(r.nayin)}<br>
            <strong>${safe(r.td)}</strong>
          </div>
          <details>
            <summary>Xem quẻ & phân bổ</summary>
            <div class="detail">
              Quẻ chủ: ${safe(r.primary)}<br>
              Quẻ hỗ: ${safe(r.mutual)}<br>
              Hào ${r.moving} → ${safe(r.changed)}<br>
              Thể: ${safe(r.body)} · Dụng: ${safe(r.use)}<br>
              Đơn vị tham chiếu: ${r.units.join(' / ')}
            </div>
          </details>
        </article>`;
    }).join('');
  }

  [year, month, type].forEach(el => el.addEventListener('change', render));
  search.addEventListener('input', render);
  render();
})();
