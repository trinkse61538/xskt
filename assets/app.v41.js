(() => {
  const DATA = window.V51_DATA || [];
  const HIST = window.XSMN_HISTORY || {stations:{},baseline:1-Math.pow(.99,18)};
  const RESEARCH = window.XSMN_RESEARCH || {};
  const byDate = new Map(DATA.map(r => [r.date, r]));
  const $ = id => document.getElementById(id);

  const VN_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const screenTitles = {today:'Hôm nay', main:'4 ngày chính', calendar:'Lịch tháng', compare:'Đối chiếu', all:'Tất cả ngày', method:'Quy ước'};
  let activeScreen = 'today';

  function localISO(d = new Date()) {
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function fmtDate(iso) {
    const [y,m,d]=iso.split('-');
    return `${d}/${m}/${y}`;
  }
  function lunarLabel(r, full=false) {
    const leap = r.lunarLeap ? ' nhuận' : '';
    return full ? `${r.lunarDay}/${r.lunarMonth}/${r.lunarYear}${leap}` : `${r.lunarDay}/${r.lunarMonth}${r.lunarLeap?'N':''}`;
  }
  function statusClass(s) {
    return s==='CHÍNH'?'status-main':s==='PHỤ A'?'status-pa':s==='PHỤ B'?'status-pb':'status-pc';
  }
  function cardClass(s){ return s==='CHÍNH'?'main':''; }
  function safe(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  const XSMN_SCHEDULE = {
    "0":["TP.HCM","Đồng Tháp","Cà Mau"],
    "1":["Bến Tre","Vũng Tàu","Bạc Liêu"],
    "2":["Đồng Nai","Cần Thơ","Sóc Trăng"],
    "3":["Tây Ninh","An Giang","Bình Thuận"],
    "4":["Vĩnh Long","Bình Dương","Trà Vinh"],
    "5":["TP.HCM","Long An","Bình Phước","Hậu Giang"],
    "6":["Tiền Giang","Kiên Giang","Đà Lạt"]
  };

  function weekdayIndexFromISO(iso) {
    const [y,m,d]=iso.split('-').map(Number);
    return (new Date(y,m-1,d).getDay()+6)%7;
  }
  function stationsForDate(iso) {
    return XSMN_SCHEDULE[String(weekdayIndexFromISO(iso))] || [];
  }
  function stationBlock(r) {
    const stations=stationsForDate(r.date);
    return `<div class="station-panel caution">
      <div class="station-panel-head">
        <div><span>XSMN ngày này · ${stations.length} đài</span><b>Không xếp đài ưu tiên</b></div>
      </div>
      ${stations.map((s,i)=>`<div class="station-row">
        <div class="station-rank">${i+1}</div>
        <div class="station-name"><b>${safe(s)}</b><span>Mở thưởng theo lịch tuần XSMN</span></div>
        <div class="station-score"><b>—</b><span>no rank</span></div>
      </div>`).join('')}
      <div class="station-note">Walk-forward dài hạn 2011–2025 không xác nhận lợi thế chọn một đài: đài được chọn đạt khoảng 41.23% Top3 so với baseline 42.15%.</div>
      <div class="station-foot">Lịch 2027–2050 đang giả định chu kỳ đài hiện hành không đổi. Nếu lịch chính thức thay đổi, cập nhật XSMN_SCHEDULE.</div>
    </div>`;
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
    if (name==='calendar') renderCalendar();
    if (name==='compare') renderCompare();
    if (name==='all') renderAllDays();
    if (name==='method') { /* static methodology screen */ }
    window.scrollTo({top:0,behavior:'instant'});
  }
  document.querySelectorAll('.bottom-nav button').forEach(btn => btn.addEventListener('click', () => setScreen(btn.dataset.screen)));


  // ---------------- QUANT RESEARCH ----------------
  const WEIGHT_CONFIGS=[
    {name:'Core',b:.55,g:.35,c:.10},
    {name:'50/40',b:.50,g:.40,c:.10},
    {name:'60/30',b:.60,g:.30,c:.10},
    {name:'45/45',b:.45,g:.45,c:.10},
    {name:'65/25',b:.65,g:.25,c:.10},
  ];
  function separationLabel(p){
    if(p>=85)return 'Rất rõ';
    if(p>=65)return 'Rõ';
    if(p>=40)return 'Trung bình';
    return 'Nhiễu';
  }
  function eventLabel(delta){
    if(delta>=3)return 'Thuận hơn quẻ chuẩn';
    if(delta<=-3)return 'Yếu hơn quẻ chuẩn';
    return 'Gần quẻ chuẩn';
  }
  function monthRows(r){return DATA.filter(x=>x.y===r.y&&x.m===r.m)}
  function rankUnderWeights(r,cfg){
    const ranked=monthRows(r).map(x=>{
      const consensus=Math.max(0,100-Math.abs(x.bazi-x.gua));
      const v=cfg.b*x.bazi+cfg.g*x.gua+cfg.c*consensus;
      const priority=.65*v+.35*x.agreement;
      return {date:x.date,priority};
    }).sort((a,b)=>b.priority-a.priority||a.date.localeCompare(b.date));
    return ranked.findIndex(x=>x.date===r.date)+1;
  }
  function selectedUnderWeights(r,cfg){
    const ranked=monthRows(r).map(x=>{
      const consensus=Math.max(0,100-Math.abs(x.bazi-x.gua));
      const v=cfg.b*x.bazi+cfg.g*x.gua+cfg.c*consensus;
      return {...x,_p:.65*v+.35*x.agreement};
    }).sort((a,b)=>b._p-a._p||a.date.localeCompare(b.date));
    const selected=[];
    for(const x of ranked){
      const xd=new Date(x.date+'T12:00:00');
      if(selected.every(s=>Math.abs((xd-new Date(s.date+'T12:00:00'))/86400000)>=5))selected.push(x);
      if(selected.length===4)break;
    }
    return selected.some(x=>x.date===r.date);
  }
  function weightRobustness(r){
    const ranks=WEIGHT_CONFIGS.map(c=>rankUnderWeights(r,c));
    const mainCount=WEIGHT_CONFIGS.filter(c=>selectedUnderWeights(r,c)).length;
    const spread=Math.max(...ranks)-Math.min(...ranks);
    let label=mainCount===5?'Rất vững':mainCount>=4?'Vững':mainCount>=2?'Nhạy trọng số':'Không vững';
    return {ranks,mainCount,spread,label};
  }
  function seasonChip(el,state){
    return `<div class="season-chip state-${safe(state)}"><span>${el}</span><b>${safe(state)}</b></div>`;
  }
  function quantBlock(r){
    const q=r.quant||{};
    const wr=weightRobustness(r);
    return `<section class="quant-panel">
      <div class="quant-title"><div><span>QUANT RESEARCH</span><b>Chất lượng tín hiệu</b></div><em>Không phải xác suất</em></div>
      <div class="quant-grid">
        <div class="quant-card">
          <span>Độ phân tách</span>
          <b>${q.sepPct??'—'} percentile</b>
          <small>${separationLabel(q.sepPct||0)} · Z₁ ${q.z1??'—'}σ</small>
        </div>
        <div class="quant-card">
          <span>Độ vững ngày</span>
          <b>${wr.mainCount}/5 cấu hình</b>
          <small>${safe(wr.label)} · rank ${Math.min(...wr.ranks)}–${Math.max(...wr.ranks)}</small>
        </div>
      </div>
      <div class="event-time-card">
        <div><span>Quẻ chuẩn · 12:00</span><b>${r.gua}</b></div>
        <div class="event-arrow">→</div>
        <div><span>Giờ xổ · Thân ~16:15</span><b>${q.eventScore??'—'}</b></div>
        <strong>${safe(eventLabel(q.eventDelta||0))} (${(q.eventDelta||0)>0?'+':''}${q.eventDelta??0})</strong>
        <small>${safe(q.eventPrimary||'')} · Hào ${q.eventMoving||'—'} · ${safe(q.eventTD||'')}</small>
      </div>
      <div class="season-title">Vượng · Tướng · Hưu · Tù · Tử theo tháng</div>
      <div class="season-grid">${Object.entries(q.season||{}).map(([el,st])=>seasonChip(el,st)).join('')}</div>
      <div class="quant-foot">Backtest dài hạn chưa cho thấy Signal Separation, giờ Thân hay Seasonal challenger tạo predictive edge. Chúng được giữ để giải thích và kiểm tra chéo.</div>
    </section>`;
  }

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
            <div class="hero-date">${fmtDate(r.date)}</div><div class="lunar-hero">Âm lịch · ${lunarLabel(r,true)}</div>
          </div>
          <span class="status-pill ${statusClass(r.status)}">${safe(r.status)}</span>
        </div>
        <div class="today-verdict"><strong>${scoreLabel(r)}</strong><br>${recommendedText(r)}</div>
        <div class="big-picks">
          ${r.picks.slice(0,3).map(x=>`<span class="big-num">${safe(x)}</span>`).join('')}
        </div>
        <div class="metric-row">
          <div class="metric"><span>Điểm ngày</span><b>${r.v5}</b></div>
          <div class="metric"><span>Độ đồng thuận</span><b>${r.agreement}</b></div>
          <div class="metric"><span>Hạng tháng</span><b>#${r.monthRank}</b></div>
        </div>
        <button class="primary-action" data-open="${r.date}">Xem chi tiết hôm nay</button>
      </article>

      <div class="section-title">Tóm tắt nhanh</div>
      <div class="quick-grid">
        <div class="quick-card"><span>Âm lịch</span><b>${lunarLabel(r,true)}</b></div><div class="quick-card"><span>Can-Chi</span><b>${safe(r.canChi)}</b></div>
        <div class="quick-card"><span>12 Trực</span><b>${safe(r.officer)}</b></div>
        <div class="quick-card"><span>Thể / Dụng</span><b>${safe(r.td)}</b></div>
        <div class="quick-card"><span>Nhóm theo dõi</span><b>${safe(r.tracking)}</b></div>
      </div>
      ${quantBlock(r)}
      <div class="section-title">Đài XSMN hôm nay</div>
      ${stationBlock(r)}
    `;
  }

  // ---------------- 4 MAIN DAYS ----------------
  const now = new Date();
  let mainYear = now.getFullYear()>=2026 && now.getFullYear()<=2050 ? now.getFullYear() : 2026;
  let mainMonth = now.getFullYear()>=2026 && now.getFullYear()<=2050 ? now.getMonth()+1 : 1;

  function shiftMain(delta) {
    mainMonth += delta;
    if(mainMonth<1){ mainMonth=12; mainYear--; }
    if(mainMonth>12){ mainMonth=1; mainYear++; }
    if(mainYear<2026){mainYear=2026;mainMonth=1}
    if(mainYear>2050){mainYear=2050;mainMonth=12}
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
          <div class="day-sub">Âm ${lunarLabel(r)} · ${safe(r.canChi)} · XSMN: ${stationsForDate(r.date).join(" · ")}</div>
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


  // ---------------- CALENDAR ----------------
  let calYear = now.getFullYear()>=2026 && now.getFullYear()<=2050 ? now.getFullYear() : 2026;
  let calMonth = now.getFullYear()>=2026 && now.getFullYear()<=2050 ? now.getMonth()+1 : 1;

  function shiftCalendar(delta){
    calMonth += delta;
    if(calMonth<1){calMonth=12;calYear--}
    if(calMonth>12){calMonth=1;calYear++}
    if(calYear<2026){calYear=2026;calMonth=1}
    if(calYear>2050){calYear=2050;calMonth=12}
    renderCalendar();
  }
  $('calPrev').addEventListener('click',()=>shiftCalendar(-1));
  $('calNext').addEventListener('click',()=>shiftCalendar(1));

  function calendarCell(r, isToday){
    const cls = r.status==='CHÍNH'?'cal-main':r.status==='PHỤ A'?'cal-pa':r.status==='PHỤ B'?'cal-pb':'cal-pc';
    const lunarMonthMark = r.lunarDay===1 ? `/${r.lunarMonth}${r.lunarLeap?'N':''}` : '';
    return `<button class="calendar-cell ${cls} ${isToday?'today':''}" data-open="${r.date}">
      <span class="solar-day">${r.date.slice(8,10).replace(/^0/,'')}</span>
      <span class="lunar-day">${r.lunarDay}${lunarMonthMark}</span>
      <span class="cal-score">${r.v5}</span>
    </button>`;
  }

  function renderCalendar(){
    $('calPeriod').textContent=`${VN_MONTHS[calMonth-1]} ${calYear}`;
    const first=new Date(calYear,calMonth-1,1);
    const lastDay=new Date(calYear,calMonth,0).getDate();
    const mondayIndex=(first.getDay()+6)%7; // Mon=0
    let html='';
    for(let i=0;i<mondayIndex;i++) html+='<div class="calendar-cell blank"></div>';
    const todayISO=localISO();
    for(let day=1;day<=lastDay;day++){
      const iso=`${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const r=byDate.get(iso);
      html+=r?calendarCell(r,iso===todayISO):'<div class="calendar-cell blank"></div>';
    }
    $('calendarGrid').innerHTML=html;
  }


  // ---------------- RECENT FORM / ĐỐI CHIẾU ----------------
  let compareStation=null;
  let compareWindow=30;

  function stationHistory(name){ return HIST.stations?.[name] || null; }
  function numMetric(st,num,N){
    if(!st) return {n:0,count:0,rate:0,gap:null,allRate:0};
    const draws=(st.draws||[]).slice(0,N);
    const key=String(num).padStart(2,'0');
    let count=0,gap=null;
    draws.forEach((d,i)=>{
      if((d.h||[]).includes(key)){ count++; if(gap===null) gap=i; }
    });
    return {
      n:draws.length,count,rate:draws.length?count/draws.length:0,gap:gap===null?draws.length:gap,
      allRate:st.n ? (st.all?.[+key]||0)/st.n : 0
    };
  }
  function pct(x){ return `${(100*x).toFixed(1)}%`; }
  function rateTone(rate){
    const b=HIST.baseline||(.1655);
    if(rate>=b+.10)return 'recent-hot';
    if(rate<=Math.max(0,b-.10))return 'recent-cold';
    return 'recent-normal';
  }
  function renderCompare(){
    const r=closestRecord();
    const stations=stationsForDate(r.date);
    if(!compareStation || !stations.includes(compareStation)) compareStation=stations[0];
    const st=stationHistory(compareStation);
    $('compareStations').innerHTML=stations.map(s=>`
      <button class="${s===compareStation?'active':''}" data-station="${safe(s)}">${safe(s)}</button>`).join('');
    $('compareWindow').querySelectorAll('button').forEach(b=>b.classList.toggle('active',+b.dataset.window===compareWindow));

    const latest=st?.latest ? fmtDate(st.latest) : 'chưa có';
    $('compareMeta').innerHTML=`Dữ liệu <b>${safe(compareStation||'')}</b> tới <b>${latest}</b> · ${st?.n||0} kỳ lịch sử.`;

    const pickCards=r.picks.map((num,i)=>{
      const m10=numMetric(st,num,10),m30=numMetric(st,num,30),m100=numMetric(st,num,100);
      return `<article class="pick-history-card ${i===0?'primary':''}">
        <div class="pick-history-head"><b>${safe(num)}</b><span>${i===0?'Chủ 1':i===1?'Chủ 2':i===2?'Đảo/phụ':'Mở rộng'}</span></div>
        <div class="history-rates">
          <div><span>10 kỳ</span><b>${m10.count}/${m10.n}</b><small>${pct(m10.rate)}</small></div>
          <div><span>30 kỳ</span><b>${m30.count}/${m30.n}</b><small>${pct(m30.rate)}</small></div>
          <div><span>100 kỳ</span><b>${m100.count}/${m100.n}</b><small>${pct(m100.rate)}</small></div>
        </div>
        <div class="pick-history-foot">Toàn lịch sử: ${pct(m100.allRate)} · Vắng hiện tại: ${m100.gap} kỳ</div>
      </article>`;
    }).join('');
    $('comparePicks').innerHTML=pickCards;

    const metrics=[];
    for(let n=0;n<100;n++){
      const num=String(n).padStart(2,'0');
      const m=numMetric(st,num,compareWindow);
      metrics.push({num,...m});
    }
    const top=[...metrics].sort((a,b)=>b.rate-a.rate || a.gap-b.gap || a.num.localeCompare(b.num)).slice(0,12);
    $('recentTop').innerHTML=top.map((m,i)=>`
      <div class="recent-top-row ${rateTone(m.rate)}">
        <span class="recent-rank">#${i+1}</span><b>${m.num}</b>
        <span>${m.count}/${m.n} kỳ</span><strong>${pct(m.rate)}</strong>
      </div>`).join('');

    $('numberGrid').innerHTML=metrics.map(m=>`
      <div class="history-num ${rateTone(m.rate)}">
        <b>${m.num}</b><span>${pct(m.rate)}</span><small>${m.count}/${m.n}</small>
      </div>`).join('');

    $('baselineText').textContent=`Baseline lý thuyết: ${pct(HIST.baseline||(.1655))} / một số / một kỳ đài.`;
    $('compareWarning').innerHTML=`<b>Đây không phải xác suất kỳ tới.</b> Backtest recent-form không ổn định qua các giai đoạn; dữ liệu 10/30/100 kỳ chỉ dùng để đối chiếu với V5.1 và không được cộng vào điểm số.`;
  }

  $('compareStations').addEventListener('click',e=>{
    const b=e.target.closest('button[data-station]'); if(!b)return;
    compareStation=b.dataset.station; renderCompare();
  });
  $('compareWindow').addEventListener('click',e=>{
    const b=e.target.closest('button[data-window]'); if(!b)return;
    compareWindow=+b.dataset.window; renderCompare();
  });


  function monteCarloMethodCard(){
    const mc=RESEARCH.quantResearch?.monteCarlo;
    if(!mc)return '';
    const row=(label,x)=>`<div class="mc-row"><span>${label}</span><b>${x.observed.toFixed(2)}%</b><em>random ${x.randomMean.toFixed(2)}%</em><small>95% ${x.lo95.toFixed(2)}–${x.hi95.toFixed(2)}% · percentile ${x.percentile.toFixed(1)}%</small></div>`;
    return `<div class="mc-card"><div class="mc-head"><b>Monte Carlo · ${mc.sims.toLocaleString('vi-VN')} lần</b><span>Real vs random</span></div>${row('Chủ 1',mc.primary)}${row('Top 3',mc.top3)}${row('Top 5',mc.top5)}<p>${safe(mc.conclusion)}</p></div>`;
  }
  // ---------------- ALL DAYS ----------------
  const allYear = $('allYear'), allMonth = $('allMonth'), allSearch=$('allSearch');
  for(let y=2026;y<=2050;y++) allYear.insertAdjacentHTML('beforeend',`<option value="${y}">${y}</option>`);
  allMonth.innerHTML='<option value="ALL">Cả năm</option>'+VN_MONTHS.map((x,i)=>`<option value="${i+1}">${x}</option>`).join('');
  const inRange=now.getFullYear()>=2026&&now.getFullYear()<=2050;
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



  const STEMS=['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  const BRANCHES=['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const BR_EL={'Tý':'Thủy','Sửu':'Thổ','Dần':'Mộc','Mão':'Mộc','Thìn':'Thổ','Tỵ':'Hỏa','Ngọ':'Hỏa','Mùi':'Thổ','Thân':'Kim','Dậu':'Kim','Tuất':'Thổ','Hợi':'Thủy'};
  const EL_FIT={'Hỏa':1,'Thổ':.72,'Kim':.10,'Thủy':-.35,'Mộc':-.65};
  const HETU={1:'Thủy',6:'Thủy',2:'Hỏa',7:'Hỏa',3:'Mộc',8:'Mộc',4:'Kim',9:'Kim',5:'Thổ',0:'Thổ'};
  const LUOSHU={1:'Thủy',2:'Thổ',3:'Mộc',4:'Mộc',5:'Thổ',6:'Kim',7:'Kim',8:'Thổ',9:'Hỏa',0:'Thổ'};
  const GUA_SOURCES=['Quẻ chủ thượng','Quẻ chủ hạ','Quẻ hỗ thượng','Quẻ hỗ hạ','Quẻ biến thượng','Quẻ biến hạ','Hào động'];

  function ensureExplain(r){
    if(r.explain)return r.explain;
    const [ds,db,ms,mb,idx,ny]=r.x.s;
    const gd=r.x.g,gn=r.x.gn,top=r.x.top;
    const scores={}; const reasons={};
    for(let d=0;d<10;d++){scores[d]=.7*EL_FIT[LUOSHU[d]];reasons[d]=[]}
    const add=(d,v,source,text)=>{scores[d]+=v;reasons[d].push({source,value:+v.toFixed(2),text})};
    for(let d=0;d<10;d++){
      const v=.7*EL_FIT[LUOSHU[d]];
      if(Math.abs(v)>=.3) reasons[d].push({source:'Nền Hỷ/Dụng',value:+v.toFixed(2),text:`Số ${d} quy về ${LUOSHU[d]} theo Lạc Thư`});
    }
    [[STEMS.indexOf(ds)%10,3,'Thiên Can ngày',ds],[BRANCHES.indexOf(db)%10,3,'Địa Chi ngày',db],
     [STEMS.indexOf(ms)%10,2,'Thiên Can tháng',ms],[BRANCHES.indexOf(mb)%10,2,'Địa Chi tháng',mb],
     [idx%10,2,'Chỉ số Lục Thập Hoa Giáp',String(idx+1)],[Math.floor(idx/10)%10,1.3,'Nhóm Lục Thập Hoa Giáp',String(Math.floor(idx/10)+1)]]
    .forEach(([d,v,s,l])=>add(d,v,s,`${l} → tín hiệu số ${d} theo quy ước V5`));
    gd.forEach((d,i)=>add(d,i<2?3:(i<4?2.2:1.8),GUA_SOURCES[i],`${i===6?'Hào '+d:gn[i]||''} → số Tiên Thiên ${d}`));
    for(let d=0;d<10;d++){
      const h=1.1*EL_FIT[HETU[d]],l=1.1*EL_FIT[LUOSHU[d]];
      scores[d]+=h+l;
      if(Math.abs(h)>=.3) reasons[d].push({source:'Hà Đồ',value:+h.toFixed(2),text:`Số ${d} thuộc ${HETU[d]}`});
      if(Math.abs(l)>=.3) reasons[d].push({source:'Lạc Thư',value:+l.toFixed(2),text:`Số ${d} thuộc ${LUOSHU[d]}`});
      if([BR_EL[db],ny].includes(LUOSHU[d])) add(d,1,'Cộng hưởng ngày',`Ngũ hành số ${d} trùng Chi ngày/Nạp âm (${BR_EL[db]}/${ny})`);
    }
    const rankMap={}; top.forEach((n,i)=>rankMap[+n]=i+1);
    const rankScore={1:100,2:88,3:78,4:68,5:60,6:54};
    const numbers=r.picks.map((numtxt,i)=>{
      const n=+numtxt,a=Math.floor(n/10),b=n%10,rank=rankMap[n]||Math.min(i+1,6);
      const rev=+String(numtxt).split('').reverse().join('');
      const revSupport=(top.includes(String(rev).padStart(2,'0'))&&rev!==n)?100:(rev===n?70:35);
      const components={
        rank:+(.48*rankScore[rank]).toFixed(1),
        day:+(.22*Math.max(0,Math.min(100,50+(r.v5-55)*3))).toFixed(1),
        agreement:+(.16*r.agreement).toFixed(1),
        reverse:+(.09*revSupport).toFixed(1),
        diversity:+(.05*(a!==b?62:48)).toFixed(1)
      };
      const digits=[a,b].map((d,j)=>{
        const rr=[...reasons[d]].sort((x,y)=>y.value-x.value);
        return {digit:d,position:j?'hàng đơn vị':'hàng chục',element:LUOSHU[d],digitScore:+scores[d].toFixed(2),
          positive:rr.filter(x=>x.value>0).slice(0,4),negative:rr.filter(x=>x.value<0).slice(0,1)};
      });
      const pairBonuses=[];
      if(a===b)pairBonuses.push({source:'Phạt số kép',value:-1.7,text:'Hai chữ số trùng nhau'});
      else pairBonuses.push({source:'Thưởng cặp khác số',value:.5,text:'Hai chữ số khác nhau'});
      if(LUOSHU[a]!==LUOSHU[b])pairBonuses.push({source:'Đa dạng ngũ hành',value:.3,text:`${LUOSHU[a]} + ${LUOSHU[b]}`});
      if(gd.includes(a))pairBonuses.push({source:'Cộng hưởng quẻ',value:.6,text:`Chữ số ${a} xuất hiện trong tín hiệu quẻ`});
      if(gd.includes(b))pairBonuses.push({source:'Cộng hưởng quẻ',value:.6,text:`Chữ số ${b} xuất hiện trong tín hiệu quẻ`});
      return {number:numtxt,role:i===0?'Chủ 1':i===1?'Chủ 2':i===2?'Đảo/phụ':`Mở rộng ${i-2}`,
        v5Rank:rank,v51Score:r.scores[i],components,reverse:String(rev).padStart(2,'0'),
        reverseText:rev!==n&&top.includes(String(rev).padStart(2,'0'))?`Số đảo ${String(rev).padStart(2,'0')} cũng nằm Top 6 nên được hỗ trợ mạnh.`:
          (rev===n?'Số kép nên đảo không tạo cặp mới.':`Số đảo ${String(rev).padStart(2,'0')} không nằm Top 6 nên hỗ trợ đảo thấp.`),
        digits,pairBonuses};
    });
    const guaDigits=gd.map((d,i)=>({digit:d,source:GUA_SOURCES[i],label:i===6?`Hào ${d}`:gn[i]}));
    r.explain={daySignals:{dayStem:ds,dayBranch:db,monthStem:ms,monthBranch:mb,nayin:ny,guaDigits},top6:top,numbers};
    return r.explain;
  }

  function componentBar(label,value,maxValue,help){
    const pct=Math.max(3,Math.min(100,(value/maxValue)*100));
    return `<div class="component-row"><div class="component-head"><span>${label}</span><b>+${value.toFixed(1)}</b></div><div class="component-track"><i style="width:${pct}%"></i></div><div class="component-help">${help}</div></div>`;
  }
  function reasonList(items){
    if(!items||!items.length)return '<div class="muted-small">Không có tín hiệu nổi bật.</div>';
    return `<div class="reason-list">${items.map(x=>`<div class="reason-item"><span class="reason-source">${safe(x.source)}</span><span class="reason-text">${safe(x.text)}</span><b class="${x.value>=0?'plus':'minus'}">${x.value>=0?'+':''}${x.value}</b></div>`).join('')}</div>`;
  }
  function numberExplanationCard(n,idx){
    return `<article class="why-number ${idx===0?'primary':''}"><div class="why-head"><div class="why-num">${safe(n.number)}</div><div><strong>${safe(n.role)}</strong><span>Hạng V5 #${n.v5Rank} · Điểm V5.1 ${n.v51Score}</span></div></div><div class="why-summary"><b>Vì sao được chọn?</b><span>Cặp ${safe(n.number)} đứng hạng #${n.v5Rank} trong engine số thuần Đông của ngày. V5.1 sau đó cộng thêm chất lượng ngày, độ đồng thuận, hỗ trợ số đảo và độ đa dạng chữ số.</span></div><details class="why-details" ${idx===0?'open':''}><summary>Phân rã điểm V5.1</summary><div class="component-box">${componentBar('Thứ hạng trong Top 6',n.components.rank,48,'48% trọng số — cặp đứng càng cao trong engine V5 càng mạnh.')}${componentBar('Chất lượng ngày',n.components.day,22,'22% trọng số — lấy từ điểm V5 của ngày.')}${componentBar('Độ đồng thuận',n.components.agreement,16,'16% trọng số — Bát Tự và Quẻ càng nhất quán càng được cộng.')}${componentBar('Hỗ trợ số đảo',n.components.reverse,9,'9% trọng số — xem cặp đảo có đồng thời nằm trong Top 6 hay không.')}${componentBar('Đa dạng chữ số',n.components.diversity,5,'5% trọng số — tránh khóa quá mạnh vào số kép.')}</div></details><details class="why-details"><summary>Chữ số ${n.digits[0].digit} (${safe(n.digits[0].element)}) được hỗ trợ bởi gì?</summary>${reasonList(n.digits[0].positive)}${n.digits[0].negative.length?`<div class="negative-block"><b>Yếu tố giảm điểm</b>${reasonList(n.digits[0].negative)}</div>`:''}</details><details class="why-details"><summary>Chữ số ${n.digits[1].digit} (${safe(n.digits[1].element)}) được hỗ trợ bởi gì?</summary>${reasonList(n.digits[1].positive)}${n.digits[1].negative.length?`<div class="negative-block"><b>Yếu tố giảm điểm</b>${reasonList(n.digits[1].negative)}</div>`:''}</details><details class="why-details"><summary>Bonus / penalty của cặp</summary>${reasonList(n.pairBonuses)}<div class="reverse-note">${safe(n.reverseText)}</div></details></article>`;
  }
  // ---------------- DETAIL ----------------
  const overlay=$('detailOverlay');
  function openDetail(date) {
    const r=byDate.get(date); if(!r)return;
    ensureExplain(r);
    $('detailMeta').textContent=`${r.dow} · ${fmtDate(r.date)} · Âm ${lunarLabel(r)} · ${r.status}`;
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
        <h3>Quant Research</h3>
        ${quantBlock(r)}
      </section>

      <section class="detail-section">
        <h3>Đài XSMN ngày này</h3>
        ${stationBlock(r)}
      </section>

      <section class="detail-section"><h3>Vì sao ngày này?</h3><div class="explain-callout"><b>${safe(r.canChi)} · ${safe(r.td)}</b><span>Điểm ngày V5 = ${r.v5}, Độ đồng thuận = ${r.agreement}. Engine số gom tín hiệu từ Can-Chi ngày/tháng, Lục Thập Hoa Giáp, Hà Đồ/Lạc Thư, quẻ chủ, quẻ hỗ, quẻ biến và hào động.</span></div><div class="signal-chips">${r.explain.daySignals.guaDigits.map(x=>`<span>${safe(x.source)}: <b>${x.digit}</b></span>`).join('')}</div><div class="top6-line"><span>Top 6 gốc của ngày</span><b>${r.explain.top6.join(' · ')}</b></div></section>

      <section class="detail-section"><h3>Vì sao chọn từng số?</h3><div class="why-list">${r.explain.numbers.map(numberExplanationCard).join('')}</div></section>
      <section class="detail-section">
        <h3>Điểm & xếp hạng</h3>
        <div class="info-list">
          <div class="info-item"><span>Điểm ngày</span><b>${r.v5}</b></div>
          <div class="info-item"><span>Độ đồng thuận</span><b>${r.agreement}</b></div>
          <div class="info-item"><span>Tier</span><b>${safe(r.tier)}</b></div>
          <div class="info-item"><span>Hạng tháng</span><b>#${r.monthRank}${r.secondaryRank?` · phụ #${r.secondaryRank}`:''}</b></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Can-Chi & lịch</h3>
        <div class="info-list">
          <div class="info-item"><span>Ngày âm</span><b>${lunarLabel(r,true)}</b></div>
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
  renderToday(); renderMainDays(); renderCalendar(); renderCompare(); renderAllDays();
  if($('mcResearch')) $('mcResearch').innerHTML=monteCarloMethodCard();
})();
