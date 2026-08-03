(() => {
  const DATA = window.V51_DATA || [];
  const byDate = new Map(DATA.map(r => [r.date, r]));
  const $ = id => document.getElementById(id);

  const VN_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const screenTitles = {today:'Hôm nay', main:'4 ngày chính', all:'Tất cả ngày'};
  let activeScreen = 'today';

  function localISO(d = new Date()) {
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function fmtDate(iso) {
    const [y,m,d]=iso.split('-');
    return `${d}/${m}/${y}`;
  }
  function statusClass(s) {
    return s==='CHÍNH'?'status-main':s==='PHỤ A'?'status-pa':s==='PHỤ B'?'status-pb':'status-pc';
  }
  function cardClass(s){ return s==='CHÍNH'?'main':''; }
  function safe(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function scoreLabel(r) {
    if (r.status==='CHÍNH') return 'Ngày ưu tiên của tháng';
    if (r.status==='PHỤ A') return 'Ngày phụ mạnh';
    if (r.status==='PHỤ B') return 'Ngày phụ theo dõi';
    return 'Ngày tham khảo';
  }
  function recommendedText(r) {
    if (r.status==='CHÍNH') return 'Đây là một trong 4 ngày chính của tháng.';
    if (r.status==='PHỤ A') return 'Không nằm trong 4 ngày chính nhưng thuộc nhóm phụ mạnh.';
    if (r.status==='PHỤ B') return 'Có thể theo dõi, ưu tiên thấp hơn ngày chính.';
    return 'Mức tham khảo. Nếu giữ kỷ luật V5.1 thì mặc định nên bỏ qua.';
  }

  function setScreen(name) {
    activeScreen = name;
    document.querySelectorAll('.screen').forEach(x => x.classList.toggle('active', x.id===`screen-${name}`));
    document.querySelectorAll('.bottom-nav button').forEach(x => x.classList.toggle('active', x.dataset.screen===name));
    $('screenTitle').textContent = screenTitles[name];
    if (name==='today') renderToday();
    if (name==='main') renderMainDays();
    if (name==='all') renderAllDays();
    window.scrollTo({top:0,behavior:'instant'});
  }
  document.querySelectorAll('.bottom-nav button').forEach(btn => btn.addEventListener('click', () => setScreen(btn.dataset.screen)));

  // ---------------- TODAY ----------------
  function closestRecord() {
    const today = localISO();
    if (byDate.has(today)) return byDate.get(today);
    const all = DATA.map(r=>r.date);
    if (today < all[0]) return DATA[0];
    return DATA[DATA.length-1];
  }
  function renderToday() {
    const r = closestRecord();
    const isActualToday = r.date === localISO();
    $('todayContent').innerHTML = `
      <article class="hero-card ${r.status==='CHÍNH'?'main-day':''}">
        <div class="hero-top">
          <div>
            <div class="eyebrow">${isActualToday?'HÔM NAY':'NGÀY GẦN NHẤT TRONG DỮ LIỆU'} · ${safe(r.dow)}</div>
            <div class="hero-date">${fmtDate(r.date)}</div>
          </div>
          <span class="status-pill ${statusClass(r.status)}">${safe(r.status)}</span>
        </div>
        <div class="today-verdict"><strong>${scoreLabel(r)}</strong><br>${recommendedText(r)}</div>
        <div class="big-picks">
          ${r.picks.slice(0,3).map(x=>`<span class="big-num">${safe(x)}</span>`).join('')}
        </div>
        <div class="metric-row">
          <div class="metric"><span>V5</span><b>${r.v5}</b></div>
          <div class="metric"><span>Agreement</span><b>${r.agreement}</b></div>
          <div class="metric"><span>Hạng tháng</span><b>#${r.monthRank}</b></div>
        </div>
        <button class="primary-action" data-open="${r.date}">Xem chi tiết hôm nay</button>
      </article>

      <div class="section-title">Tóm tắt nhanh</div>
      <div class="quick-grid">
        <div class="quick-card"><span>Can-Chi</span><b>${safe(r.canChi)}</b></div>
        <div class="quick-card"><span>12 Trực</span><b>${safe(r.officer)}</b></div>
        <div class="quick-card"><span>Thể / Dụng</span><b>${safe(r.td)}</b></div>
        <div class="quick-card"><span>Nhóm theo dõi</span><b>${safe(r.tracking)}</b></div>
      </div>
    `;
  }

  // ---------------- 4 MAIN DAYS ----------------
  const now = new Date();
  let mainYear = now.getFullYear()>=2026 && now.getFullYear()<=2030 ? now.getFullYear() : 2026;
  let mainMonth = now.getFullYear()>=2026 && now.getFullYear()<=2030 ? now.getMonth()+1 : 1;

  function shiftMain(delta) {
    mainMonth += delta;
    if(mainMonth<1){ mainMonth=12; mainYear--; }
    if(mainMonth>12){ mainMonth=1; mainYear++; }
    if(mainYear<2026){mainYear=2026;mainMonth=1}
    if(mainYear>2030){mainYear=2030;mainMonth=12}
    renderMainDays();
  }
  $('mainPrev').addEventListener('click',()=>shiftMain(-1));
  $('mainNext').addEventListener('click',()=>shiftMain(1));

  function dayCard(r) {
    const day = r.date.slice(8,10);
    const month = r.date.slice(5,7);
    return `
      <article class="day-card ${cardClass(r.status)}" data-open="${r.date}">
        <div class="day-calendar"><small>${safe(r.dow)}</small><b>${day}</b></div>
        <div>
          <div class="day-mainline">
            <strong>${day}/${month}</strong>
            <span class="small-pill">${safe(r.status)}</span>
            <span class="small-pill">V5 ${r.v5}</span>
          </div>
          <div class="mini-picks">${r.picks.slice(0,5).map(x=>`<span class="mini-num">${safe(x)}</span>`).join('')}</div>
          <div class="day-sub">${safe(r.canChi)} · ${safe(r.td)}</div>
        </div>
        <div class="chevron">›</div>
      </article>`;
  }
  function renderMainDays() {
    $('mainPeriod').textContent = `${VN_MONTHS[mainMonth-1]} ${mainYear}`;
    const rows = DATA.filter(r=>r.y===mainYear && r.m===mainMonth && r.status==='CHÍNH')
                     .sort((a,b)=>a.date.localeCompare(b.date));
    $('mainDays').innerHTML = rows.length ? rows.map(dayCard).join('') : '<div class="empty">Không có dữ liệu.</div>';
  }

  // ---------------- ALL DAYS ----------------
  const allYear = $('allYear'), allMonth = $('allMonth'), allSearch=$('allSearch');
  for(let y=2026;y<=2030;y++) allYear.insertAdjacentHTML('beforeend',`<option value="${y}">${y}</option>`);
  allMonth.innerHTML='<option value="ALL">Cả năm</option>'+VN_MONTHS.map((x,i)=>`<option value="${i+1}">${x}</option>`).join('');
  const inRange=now.getFullYear()>=2026&&now.getFullYear()<=2030;
  allYear.value=inRange?String(now.getFullYear()):'2026';
  allMonth.value=inRange?String(now.getMonth()+1):'ALL';
  let allType='ALL';

  $('allType').addEventListener('click',e=>{
    const btn=e.target.closest('button[data-type]'); if(!btn)return;
    allType=btn.dataset.type;
    $('allType').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===btn));
    renderAllDays();
  });
  allYear.addEventListener('change',renderAllDays);
  allMonth.addEventListener('change',renderAllDays);
  allSearch.addEventListener('input',renderAllDays);

  function renderAllDays() {
    const y=+allYear.value,m=allMonth.value,q=allSearch.value.trim().toLowerCase();
    let rows=DATA.filter(r=>r.y===y&&(m==='ALL'||r.m===+m)&&(allType==='ALL'||r.status===allType));
    if(q) rows=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
    rows.sort((a,b)=>a.date.localeCompare(b.date));
    const mainCount=rows.filter(r=>r.status==='CHÍNH').length;
    const strong=rows.filter(r=>r.status==='PHỤ A'||r.status==='PHỤ B').length;
    $('allSummary').textContent=`${rows.length} ngày · ${mainCount} chính · ${strong} phụ A/B`;
    $('allDays').innerHTML=rows.length?rows.map(dayCard).join(''):'<div class="empty">Không có kết quả phù hợp.</div>';
  }

  // ---------------- DETAIL ----------------
  const overlay=$('detailOverlay');
  function openDetail(date) {
    const r=byDate.get(date); if(!r)return;
    $('detailMeta').textContent=`${r.dow} · ${fmtDate(r.date)} · ${r.status}`;
    $('detailTitle').textContent=scoreLabel(r);
    $('detailBody').innerHTML=`
      <section class="detail-section">
        <div class="number-table">
          ${r.picks.map((x,i)=>`
            <div class="number-item"><b>${safe(x)}</b><span>${i===0?'Chủ 1':i===1?'Chủ 2':i===2?'Đảo/phụ':'Mở rộng'} · ${r.scores[i]}</span></div>
          `).join('')}
        </div>
      </section>
      <section class="detail-section">
        <h3>Điểm & xếp hạng</h3>
        <div class="info-list">
          <div class="info-item"><span>V5</span><b>${r.v5}</b></div>
          <div class="info-item"><span>Agreement</span><b>${r.agreement}</b></div>
          <div class="info-item"><span>Tier</span><b>${safe(r.tier)}</b></div>
          <div class="info-item"><span>Hạng tháng</span><b>#${r.monthRank}${r.secondaryRank?` · phụ #${r.secondaryRank}`:''}</b></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Can-Chi & lịch</h3>
        <div class="info-list">
          <div class="info-item"><span>Can-Chi</span><b>${safe(r.canChi)}</b></div>
          <div class="info-item"><span>12 Trực</span><b>${safe(r.officer)}</b></div>
          <div class="info-item"><span>Nạp âm</span><b>${safe(r.nayin)}</b></div>
          <div class="info-item"><span>Thể / Dụng</span><b>${safe(r.td)}</b></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Dòng quẻ</h3>
        <div class="gua-flow">
          <div class="gua-box"><small>Quẻ chủ</small><b>${safe(r.primary)}</b></div>
          <div class="gua-arrow">→</div>
          <div class="gua-box"><small>Quẻ hỗ</small><b>${safe(r.mutual)}</b></div>
          <div class="gua-arrow">→</div>
          <div class="gua-box"><small>Hào ${r.moving} động</small><b>${safe(r.changed)}</b></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Thể – Dụng & phân bổ</h3>
        <div class="info-list">
          <div class="info-item"><span>Thể</span><b>${safe(r.body)}</b></div>
          <div class="info-item"><span>Dụng</span><b>${safe(r.use)}</b></div>
          <div class="info-item"><span>Quan hệ</span><b>${safe(r.td)}</b></div>
          <div class="info-item"><span>Đơn vị tham chiếu</span><b>${r.units.join(' / ')}</b></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Diễn giải sử dụng</h3>
        <div class="screen-intro"><strong>${safe(r.tracking)}</strong><span>${recommendedText(r)}</span></div>
      </section>`;
    overlay.hidden=false;
    document.body.style.overflow='hidden';
  }
  function closeDetail(){overlay.hidden=true;document.body.style.overflow=''}
  document.addEventListener('click',e=>{
    const opener=e.target.closest('[data-open]');
    if(opener) openDetail(opener.dataset.open);
    if(e.target.closest('[data-close-detail]')) closeDetail();
  });

  // ---------------- PWA INSTALL ----------------
  let deferredInstallPrompt=null;
  const installBtn=$('installBtn'),iosHint=$('iosInstallHint');
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(isIOS&&!standalone&&!localStorage.getItem('hideIosInstallHint')) iosHint.hidden=false;
  $('closeIosHint').addEventListener('click',()=>{iosHint.hidden=true;localStorage.setItem('hideIosInstallHint','1')});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(!standalone)installBtn.hidden=false});
  installBtn.addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;installBtn.hidden=true});
  window.addEventListener('appinstalled',()=>{installBtn.hidden=true;iosHint.hidden=true});

  // Initial render
  renderToday(); renderMainDays(); renderAllDays();
})();
