// assets/js/app.js
import { supa } from "../../src/api/supabaseClient.js";

/* ==========================================================================
   1. KONSTANTA & TETAPAN (CONFIGURATION)
   ========================================================================== */
const SHOW_PAST_DAYS = false; // Erom Style: Sembunyikan hari lepas untuk paparan bersih

const ROOM_OPTIONS = [
  "PKG Ganun - Bilik Kursus (30 orang)",
  "PKG Melekek - Bilik Kuliah (25 orang)",      
  "PKG Melekek - Bilik Mesyuarat (25 orang)",   
  "PKG Masjid Tanah - Bilik Seri Cempaka (24 orang)",
  "PKG Masjid Tanah - Bilik Seri Melur (18 orang)",
  "PKG Masjid Tanah - Bilik Pendidikan Digital (12 orang)",
  "Bilik Mesyuarat PPDAG di SK Alor Gajah 1 (40 orang)",
  "Bilik Mesyuarat Utama PPDAG (73 orang)",
  "Bilik Mesyuarat Kecil PPDAG (15 orang)",
  "Makmal Komputer PPDAG (31 orang)",
  "Bilik Seminar PPDAG (22 orang)",
  "Bilik Temuduga PPDAG (4 orang)",
  "Bilik Runding Cara PPDAG (4 orang)",
  "Kafeteria PPDAG (30 orang)"
];

const CATEGORY_OPTIONS = ["Mesyuarat / Taklimat","Bengkel / Kursus","Lain-Lain"];

/* ==========================================================================
   2. UTILITIES
   ========================================================================== */
const $ = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2,'0');
const formatMonthLabel = (y,m)=> new Intl.DateTimeFormat('ms-MY',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
const toYMD = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const firstDay = (y,m)=> `${y}-${pad2(m)}-01`;
const lastDay  = (y,m)=> toYMD(new Date(Date.UTC(y,m,0)));
const todayYMD = ()=> toYMD(new Date());

function toHHMM(x){
  if (x == null) return "";
  const s = String(x).trim();
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0,5);              
  const d = new Date(s);
  if (!isNaN(d)) return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return s;
}

function toYMDNorm(x){
  if (x == null) return "";
  const s = String(x);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d)) return toYMD(d);
  return s.slice(0,10);
}

const toMinutes = t => { if(!t) return 0; const [h,m]=toHHMM(t).split(':').map(Number); return (h*60)+(m||0); };
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function addDaysYMD(ymd,n){ const [y,m,d]=ymd.split('-').map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+n); return toYMD(dt); }

/* UI Helpers */
const Toast = Swal.mixin({ toast:true, position:'top', showConfirmButton:false, timer:2200, timerProgressBar:true });
function toastOk(t){Toast.fire({icon:'success',title:t});}
function toastInfo(t){Toast.fire({icon:'info',title:t});}
function toastWarn(t){Toast.fire({icon:'warning',title:t});}
function toastErr(t){Toast.fire({icon:'error',title:t});}
function modalLoading(title='Memproses...'){ Swal.fire({ title, allowOutsideClick:false, didOpen:()=>Swal.showLoading() }); }
function modalClose(){ Swal.close(); }
function markInvalid(el){ el.classList.add('invalid'); setTimeout(()=>el.classList.remove('invalid'), 1200); el.focus(); }
function createEl(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

/* === SECURITY HELPERS (CONFIRMATION) === */
async function modalConfirm(title, text, confirmText = 'Ya, Teruskan') {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal'
  });
  return result.isConfirmed;
}

/* ==========================================================================
   3. STATE MANAGEMENT
   ========================================================================== */
// State Permulaan untuk User (memudahkan reset)
const DEFAULT_USER_STATE = {
  user: null,
  isAdmin: false
};

let state = { 
  ...DEFAULT_USER_STATE, // Spread default properties
  year: new Date().getFullYear(),
  month: new Date().getMonth()+1,
  room: '',
  days: [],
  selectedDate: null,
  range:{from:null,to:null}, 
  rangeMode:false 
};

let ov = { 
  year: new Date().getFullYear(),
  month: new Date().getMonth()+1,
  days:[], // Untuk calendar view (stats bilik)
  bookings:[], // Untuk table view (senarai penuh)
  view:'calendar', 
  filterRoom:'' 
};

let adminState = {
  bookings: [] 
};

/* ==========================================================================
   4. INITIALIZATION (BOOTSTRAP)
   ========================================================================== */
window.addEventListener('load', bootstrap);

async function bootstrap(){
  setupUI();
  restoreSession(); 

  const roomSel = $('roomSelect');
  const adminRoomSel = $('adminRoom');
  ROOM_OPTIONS.forEach(r => {
    roomSel.appendChild(new Option(r, r));
    if(adminRoomSel) adminRoomSel.appendChild(new Option(r, r));
  });

  const catSel = $('category');
  CATEGORY_OPTIONS.forEach(c => catSel.appendChild(new Option(c, c)));
  
  const ovRoomFilter = $('ovRoomFilter');
  ROOM_OPTIONS.forEach(r => ovRoomFilter.appendChild(new Option(r,r)));

  toggleCalendarHint(); // Init hint

  await loadOverview(true);
}

function setupUI(){
  // Auth Controls
  $('mainLoginBtn').addEventListener('click', showLoginModal);
  $('userProfileBadge').addEventListener('click', showUserProfile);

  // Tabs
  $('tabTempahanBtn').addEventListener('click', ()=> switchTab('tempahan'));
  $('tabKalendarBtn').addEventListener('click', ()=> switchTab('kalendar'));
  $('tabAdminBtn').addEventListener('click', ()=> switchTab('admin'));

  // Tempahan Toolbar
  $('roomSelect').addEventListener('change', onRoomSelectChange);
  
  // LOGIK RESET UI (Segar Semula) - Reset Sepenuhnya
  $('btnRefresh').addEventListener('click', ()=>{ 
    resetUI(); 
    toastInfo('Antara muka ditetapkan semula'); 
  });
  
  // Month Nav
  $('btnPrev').addEventListener('click', () => changeMonth(state, -1, true));
  $('btnNext').addEventListener('click', () => changeMonth(state, 1, true));
  $('ovPrev').addEventListener('click', () => changeMonth(ov, -1, false));
  $('ovNext').addEventListener('click', () => changeMonth(ov, 1, false));
  
  $('monthLabel').textContent = formatMonthLabel(state.year, state.month);
  $('ovMonthLabel').textContent = formatMonthLabel(ov.year, ov.month);

  // Range & Date
  $('toggleRangeOff').addEventListener('click', ()=>setRangeMode(false));
  $('toggleRangeOn').addEventListener('click', ()=>setRangeMode(true));
  $('pickedDate').addEventListener('change', onDateChange);
  
  // Input tarikh manual (trigger logic range)
  $('fromDate').addEventListener('change', onRangeChange);
  $('toDate').addEventListener('change', onRangeChange);
  
  // Klik Grid (Logik Utama)
  $('grid').addEventListener('click', onGridClick);

  // Submit
  $('btnBook').addEventListener('click', onBook);

  // Overview
  $('btnViewCalendar').addEventListener('click', ()=>switchOverviewView('calendar'));
  $('btnViewTable').addEventListener('click', ()=>switchOverviewView('table'));
  $('ovRoomFilter').addEventListener('change', ()=>{ ov.filterRoom = $('ovRoomFilter').value; renderOvTable(); });

  // Admin
  if($('adminRefreshUsers')) $('adminRefreshUsers').addEventListener('click', loadAdminUserList);
  if($('btnAdminLoad')) $('btnAdminLoad').addEventListener('click', loadAdminBookingList);
  if($('btnBulkCancel')) $('btnBulkCancel').addEventListener('click', executeBulkCancel);
}

// FUNGSI RESET PENUH
function resetUI(){
  const now = new Date(); 
  state.year = now.getFullYear(); 
  state.month = now.getMonth()+1; 
  $('monthLabel').textContent = formatMonthLabel(state.year,state.month);
  
  state.days = []; 
  $('grid').innerHTML = ''; 
  document.querySelectorAll('.tile.sel').forEach(el=>el.classList.remove('sel'));
  
  $('roomSelect').value = ''; 
  state.room = ''; 
  toggleCalendarHint();
  
  resetBookingForm(true); // Ini akan reset mode range dan input
  
  $('adminRoom').value = ''; 
  $('adminList').innerHTML = ''; 
  adminState.bookings = [];
  
  // Paparan Admin
  if(state.user && state.user.role === 'ADMIN') {
     // Admin stay logged in
  } else {
     $('adminLoginBox').style.display='block'; 
     $('adminPanel').style.display='none';
  }
  
  switchTab('tempahan'); 
  window.scrollTo({top:0, behavior:'smooth'});
  
  // Reset Overview ke bulan semasa
  ov.year = now.getFullYear();
  ov.month = now.getMonth()+1;
  $('ovMonthLabel').textContent = formatMonthLabel(ov.year, ov.month);
  loadOverview(true);
}

function resetBookingForm(clearFields){
  setRangeMode(false); // Reset ke Single Day mode
  $('pickedDate').required = true; 
  $('fromDate').required = false; 
  $('toDate').required = false;
  $('rangeCounter').style.display = 'none'; 
  $('rangeCounter').textContent = '';
  
  if (clearFields){
    ['pickedDate','fromDate','toDate','startTime','endTime','note'].forEach(id => $(id).value='');
    const sek = $('sektor'); if(sek && sek.options.length) sek.selectedIndex=0;
    const nama = $('nama'); 
    nama.innerHTML = ''; 
    nama.appendChild(new Option('— Sila pilih sektor dahulu —', ''));
    nama.disabled = true;
    
    // Auto-fill jika user ada
    if(state.user) {
      const sekSel = $('sektor');
      sekSel.innerHTML = '';
      sekSel.appendChild(new Option(state.user.sektor, state.user.sektor));
      sekSel.value = state.user.sektor;
      
      nama.innerHTML = '';
      nama.appendChild(new Option(state.user.nama, state.user.nama));
      nama.value = state.user.nama;
    }
  }
  state.selectedDate = null; 
  state.range = {from:null, to:null};
  highlightRangeTiles(); // Clear highlights
}

function changeMonth(obj, delta, refreshCal){
  let m = obj.month + delta, y = obj.year;
  if(m<1){ m=12; y--; } else if(m>12){ m=1; y++; }
  obj.month = m; obj.year = y;
  
  if(obj === state) $('monthLabel').textContent = formatMonthLabel(y,m);
  if(obj === ov) {
    $('ovMonthLabel').textContent = formatMonthLabel(y,m);
    loadOverview(true);
  }
  
  if(refreshCal && state.room) refreshCalendar(true);
}

function switchTab(name){
  document.querySelectorAll('.tabbtn').forEach(b => b.classList.toggle('active', b.id === `tab${name.charAt(0).toUpperCase() + name.slice(1)}Btn`));
  document.querySelectorAll('.tabpane').forEach(p => p.classList.toggle('active', p.id === `tab${name.charAt(0).toUpperCase() + name.slice(1)}`));

  if(name === 'admin'){
    if(state.user && state.user.role === 'ADMIN'){
      $('adminLoginBox').style.display = 'none';
      $('adminPanel').style.display = 'block';
      const userBody = $('adminUserListBody');
      if(userBody && userBody.children.length <= 1) loadAdminUserList();
    } else {
      $('adminLoginBox').style.display = 'block';
      $('adminPanel').style.display = 'none';
      if(state.user && state.user.role !== 'ADMIN'){
         Swal.fire('Akses Ditolak', 'Hanya akaun PENTADBIR dibenarkan.', 'warning');
         switchTab('tempahan'); 
      }
    }
  }
}

function toggleCalendarHint(){ 
  $('noRoomHint').style.display = state.room ? 'none' : 'block'; 
}

/* ==========================================================================
   5. AUTHENTICATION & SESSION MANAGEMENT
   ========================================================================== */
function resetUserState() {
  // PENTING: Fungsi ini memastikan state user bersih sepenuhnya
  // Menggunakan Object.assign untuk reset tanpa memutuskan rujukan objek state
  Object.assign(state, DEFAULT_USER_STATE);
  // Pastikan isAdmin juga false
  state.isAdmin = false;
  state.user = null;
}

function restoreSession(){
  const saved = localStorage.getItem('erom_user');
  if(saved){
    try {
      state.user = JSON.parse(saved);
      onLoginSuccess();
    } catch(e) { 
      console.error('Session corrupt', e); 
      onLogout(); 
    }
  } else {
    // Pastikan UI bersih jika tiada sesi
    onLogout();
  }
}

async function showLoginModal(){
  const { value: formValues } = await Swal.fire({
    title: 'Log Masuk Pegawai',
    html: `
      <input id="swal-email" class="swal2-input" placeholder="Emel Rasmi (moe.gov.my)" type="email">
      <input id="swal-pass" type="password" class="swal2-input" placeholder="Kata Laluan">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Log Masuk',
    preConfirm: () => [$('swal-email').value, $('swal-pass').value]
  });

  if (formValues) {
    const [email, pass] = formValues;
    if(!email || !pass) return toastErr('Sila isi maklumat');
    
    modalLoading('Mengesahkan...');
    const { data, error } = await supa.rpc('fn_login_secure', { p_email: email, p_password: pass });
    modalClose();

    if(error) return Swal.fire('Ralat Sistem', error.message, 'error');
    if(!data.ok) return Swal.fire('Gagal', data.error, 'error');

    state.user = data.user;
    localStorage.setItem('erom_user', JSON.stringify(state.user));
    onLoginSuccess();
    toastOk(`Selamat datang, ${state.user.nama}`);
  }
}

function onLoginSuccess(){
  $('mainLoginBtn').style.display = 'none';
  $('userProfileBadge').classList.add('active');
  $('userDisplayName').textContent = state.user.nama.split(' ')[0];
  
  const roleTag = $('userRoleTag');
  roleTag.textContent = state.user.role;
  roleTag.className = `user-role ${state.user.role === 'ADMIN' ? 'admin' : ''}`;

  state.isAdmin = (state.user.role === 'ADMIN');
  
  if(state.isAdmin) {
    $('tabAdminBtn').style.display = 'inline-block';
    if($('tabAdmin').classList.contains('active')){
      $('adminLoginBox').style.display = 'none';
      $('adminPanel').style.display = 'block';
      loadAdminUserList();
    }
  }
  
  toggleBookingForm(true);
  
  // PENTING: Paksa render semula jadual untuk kemaskini butang "Delete"
  // berdasarkan peranan pengguna yang baru log masuk.
  if(ov.view === 'table') {
    // Kosongkan dahulu untuk elak 'flicker' data lama
    $('ovTableBody').innerHTML = ''; 
    renderOvTable();
  }
}

function onLogout(){
  // 1. DEEP RESET STATE
  resetUserState();
  localStorage.removeItem('erom_user');
  
  // 2. UI RESET
  $('mainLoginBtn').style.display = 'block';
  $('userProfileBadge').classList.remove('active');
  
  $('tabAdminBtn').style.display = 'none';
  $('adminLoginBox').style.display = 'block';
  $('adminPanel').style.display = 'none';
  
  toggleBookingForm(false);
  
  if($('tabAdmin').classList.contains('active')) switchTab('tempahan');

  // 3. FORCE CLEAR OVERVIEW TABLE
  // Ini penting untuk mengelakkan "ghost buttons" (butang delete Admin kekal)
  if(ov.view === 'table') {
    $('ovTableBody').innerHTML = ''; // Visual wipe serta merta
    renderOvTable(); // Render semula sebagai guest
  }
  
  toastInfo('Log keluar berjaya');
}

function showUserProfile(){
  Swal.fire({
    title: state.user.nama,
    html: `
      <div style="text-align:left; margin-bottom:15px; font-size:0.9rem;">
        <p><strong>Sektor:</strong> ${state.user.sektor}</p>
        <p><strong>Emel:</strong> ${state.user.email}</p>
      </div>
      <button id="btnChangePass" class="swal2-confirm swal2-styled" style="background:#4b5563; margin-right:5px;">Tukar Password</button>
      <button id="btnLogout" class="swal2-cancel swal2-styled" style="background:#ef4444;">Log Keluar</button>
    `,
    showConfirmButton: false
  });
  
  setTimeout(() => {
    $('btnLogout').onclick = () => { Swal.close(); onLogout(); };
    $('btnChangePass').onclick = () => { Swal.close(); changeOwnPassword(); };
  }, 100);
}

async function changeOwnPassword(){
  const { value: form } = await Swal.fire({
    title: 'Tukar Kata Laluan',
    html: `
      <input id="oldP" type="password" class="swal2-input" placeholder="Kata Laluan Lama">
      <input id="newP" type="password" class="swal2-input" placeholder="Kata Laluan Baru">
    `,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => [$('oldP').value, $('newP').value]
  });
  
  if(form){
    modalLoading('Mengemaskini...');
    const { data } = await supa.rpc('fn_change_own_password', {
      p_email: state.user.email, p_old_pass: form[0], p_new_pass: form[1]
    });
    modalClose();
    if(data && data.ok) Swal.fire('Berjaya', 'Kata laluan ditukar.', 'success');
    else Swal.fire('Gagal', data?.error || 'Ralat', 'error');
  }
}

/* ========= 6. BOOKING LOGIC (DYNAMIC FILL) ========= */
function toggleBookingForm(enable){
  const fields = document.querySelectorAll('#bookingFormContainer input, #bookingFormContainer select, #bookingFormContainer button');
  fields.forEach(f => f.disabled = !enable);
  
  $('loginWarning').style.display = enable ? 'none' : 'block';
  $('btnBook').style.display = enable ? 'inline-block' : 'none';

  if(enable){
    resetBookingForm(true); // Populate user data but keep date if set
  }
}

async function onBook(){
  if(!state.user) return toastErr('Sila log masuk dahulu');

  const inputs = {
    room: state.room,
    date: $('pickedDate').value,
    start: $('startTime').value,
    end: $('endTime').value,
    category: $('category').value,
    note: $('note').value.trim(),
    sektor: $('sektor').value,
    nama: $('nama').value      
  };

  if(!inputs.room) return toastWarn('Sila pilih bilik');
  if(state.rangeMode){
    if(!$('fromDate').value || !$('toDate').value) return toastWarn('Sila pilih julat tarikh');
  } else {
    if(!inputs.date) return toastWarn('Sila pilih tarikh');
  }
  if(!inputs.start || !inputs.end) return toastWarn('Sila tetapkan masa');
  if(!inputs.note) { markInvalid($('note')); return toastWarn('Sila isi tujuan'); }

  // [SAFETY GUARD] Pengesahan sebelum hantar
  const confirmMsg = state.rangeMode 
    ? 'Anda pasti mahu merekod tempahan berturut (julat tarikh)?' 
    : `Sahkan tempahan pada ${inputs.date}?`;

  const isConfirmed = await modalConfirm('Sahkan Tempahan?', confirmMsg);
  if(!isConfirmed) return;

  modalLoading('Menghantar tempahan...');
  try {
    let res;
    if(state.rangeMode){
      res = await supa.rpc('fn_create_booking_range_secure', {
        p_bilik: inputs.room,
        p_from: $('fromDate').value,
        p_to: $('toDate').value,
        p_start: inputs.start,
        p_end: inputs.end,
        p_category: inputs.category,
        p_note: inputs.note,
        p_sektor: inputs.sektor,
        p_nama: inputs.nama
      });
    } else {
      res = await supa.rpc('fn_create_booking_secure', {
        p_bilik: inputs.room,
        p_date: inputs.date,
        p_start: inputs.start,
        p_end: inputs.end,
        p_category: inputs.category,
        p_note: inputs.note,
        p_sektor: inputs.sektor,
        p_nama: inputs.nama
      });
    }

    modalClose();

    if(res.data && res.data.ok){
      Swal.fire('Berjaya', 'Tempahan telah direkodkan.', 'success');
      if(state.room) refreshCalendar(false);
      loadOverview(false);
      $('note').value = '';
    } else {
      Swal.fire('Gagal', res.data?.error || 'Ralat tidak diketahui', 'error');
    }

  } catch(e){
    modalClose();
    Swal.fire('Ralat Rangkaian', e.message, 'error');
  }
}

/* ==========================================================================
   7. CALENDAR LOGIC (Fixed for Devtest)
   ========================================================================== */
function onRoomSelectChange(e){
  state.room = e.target.value;
  // Partial reset, don't clear everything
  $('pickedDate').value = '';
  $('fromDate').value = '';
  $('toDate').value = '';
  state.selectedDate = null;
  state.range = {from:null, to:null};
  document.querySelectorAll('.tile.sel').forEach(el=>el.classList.remove('sel'));
  highlightRangeTiles(); // Clear range highlights
  
  if(state.room){
    $('noRoomHint').style.display = 'none';
    refreshCalendar(true);
  } else {
    $('grid').innerHTML = '';
    $('noRoomHint').style.display = 'block';
  }
}

async function refreshCalendar(showLoading){
  if(showLoading) modalLoading('Memuatkan kalendar...');
  
  const start = firstDay(state.year, state.month);
  const end = lastDay(state.year, state.month);

  const { data, error } = await supa
    .from('v_bookings_active')
    .select('*')
    .eq('bilik', state.room)
    .gte('tarikh', start)
    .lte('tarikh', end);

  if(showLoading) modalClose();
  if(error) return toastErr('Gagal memuatkan data');

  state.days = processBookingsForCalendar(data || []);
  renderCalendar();
  highlightSelectedTile();
  if(state.rangeMode) highlightRangeTiles();
}

function processBookingsForCalendar(bookings){
  const map = {};
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  const today = todayYMD();
  
  for(let d=1; d<=daysInMonth; d++){
    const ymd = `${state.year}-${pad2(state.month)}-${pad2(d)}`;
    // Erom Logic: Kira status
    map[ymd] = { 
      date: ymd, 
      bookings: [], 
      totalMin: 0, 
      count: 0,
      isPast: ymd < today,
      status: 'green' // Default
    };
  }

  bookings.forEach(b => {
    const ymd = toYMDNorm(b.tarikh);
    if(map[ymd]){
      const min = toMinutes(b.masa_tamat) - toMinutes(b.masa_mula);
      map[ymd].bookings.push(b);
      map[ymd].totalMin += min;
      map[ymd].count += 1;
    }
  });

  // Tentukan status (Merah/Jingga/Hijau) ikut logik Erom
  Object.values(map).forEach(day => {
    if(day.totalMin >= 360 || day.count >= 6) {
      day.status = 'red';
    } else if(day.count > 0) {
      day.status = 'orange';
    } else {
      day.status = 'green';
    }
  });

  return Object.values(map); 
}

function renderCalendar(){
  const grid = $('grid'); 
  grid.innerHTML = '';

  const daysToShow = SHOW_PAST_DAYS ? state.days : state.days.filter(d => !d.isPast);

  if(daysToShow.length === 0){
    grid.innerHTML = '<div class="small" style="padding:1rem">Tiada tarikh untuk dipaparkan.</div>';
    return;
  }

  const docFrag = document.createDocumentFragment();
  const first = daysToShow[0];
  const weekday = (new Date(first.date).getDay() + 6) % 7; // 0=Isnin

  // Spacer untuk hari pertama
  for(let i=0; i<weekday; i++){ 
    const x = createEl('div', 'blank'); 
    docFrag.appendChild(x); 
  }

  daysToShow.forEach(day => {
    docFrag.appendChild(buildTile(day));
  });

  grid.appendChild(docFrag);
}

function buildTile(day){
  const isWeekend = (new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6);
  const tile = createEl('div', `tile ${day.isPast || isWeekend ? 'disabled' : ''}`);
  tile.dataset.date = day.date;

  // Header Tile
  const top = createEl('div', 'date');
  top.textContent = Number(day.date.slice(8,10)); // Hari (1-31)

  // Badge Status
  if (!day.isPast && !isWeekend) {
    const statusMap = { 'red': 'PENUH', 'orange': 'SEPARA PENUH', 'green': 'TIADA TEMPAHAN' };
    const badge = createEl('span', `badge ${day.status}`);
    badge.textContent = statusMap[day.status] || '';
    top.appendChild(badge);
  }
  tile.appendChild(top);

  // Body Tile
  const body = createEl('div', 'body');
  if(!day.isPast && !isWeekend){
    const list = createEl('div', 'small');
    
    if(day.bookings && day.bookings.length > 0){
      day.bookings.sort((a,b)=> a.masa_mula.localeCompare(b.masa_mula));
      day.bookings.forEach(b => {
        const p = createEl('div');
        const note = b.tujuan ? ` • ${String(b.tujuan).slice(0,30)}${b.tujuan.length>30?'…':''}` : '';
        p.textContent = `${toHHMM(b.masa_mula)}–${toHHMM(b.masa_tamat)} • ${b.kategori}${note}`;
        list.appendChild(p);
      });
    } else {
      const p = createEl('div'); 
      p.className = 'small'; 
      p.textContent = 'Tiada tempahan.'; 
      list.appendChild(p);
    }
    body.appendChild(list);
  }
  tile.appendChild(body);

  // Note: Event listener is attached to #grid parent, but tile properties matter
  return tile;
}

// LOGIK KLIK GRID (DIPERBAIKI UNTUK DEVTEST)
function onGridClick(e){
  const tile = e.target.closest('.tile');
  if(!tile || tile.classList.contains('disabled')) return;
  const date = tile.dataset.date;

  // Check Full Status
  const dayData = state.days.find(d => d.date === date);
  if (dayData && dayData.status === 'red') { 
    toastWarn('Bilik ini telah PENUH pada tarikh tersebut.'); 
    return; 
  }

  if(state.rangeMode){
    const clickedDate = date;
    // Logik Erom Asal:
    if(!state.range.from){
       state.range.from = clickedDate;
       toastInfo('Tarikh mula dipilih');
    }
    else if(!state.range.to){
       if(clickedDate < state.range.from){
          state.range.to = state.range.from;
          state.range.from = clickedDate;
       } else {
          state.range.to = clickedDate;
       }
       toastOk('Julat tarikh ditetapkan');
    }
    else {
       // Reset jika kedua-dua sudah ada
       state.range = {from: clickedDate, to: null};
       toastInfo('Pilih tarikh akhir');
    }
    
    // Kemaskini input melalui fungsi centralized
    $('fromDate').value = state.range.from || '';
    $('toDate').value = state.range.to || '';
    onRangeChange(); // PENTING: Panggil validasi & highlight
  } 
  else {
    // Mode Single Day
    document.querySelectorAll('.tile.sel').forEach(el => el.classList.remove('sel'));
    tile.classList.add('sel');
    state.selectedDate = date;
    $('pickedDate').value = date;
    toastInfo(`Tarikh dipilih: ${state.selectedDate}`);
  }
}

function setRangeMode(on){
  state.rangeMode = on;
  $('toggleRangeOn').classList.toggle('active', on);
  $('toggleRangeOff').classList.toggle('active', !on);
  $('pickedDate').parentElement.style.display = on ? 'none' : 'block';
  $('fromDateWrap').style.display = on ? 'block' : 'none';
  $('toDateWrap').style.display = on ? 'block' : 'none';
  $('rangeCounter').style.display = on ? 'block' : 'none';
  
  // Reset selection
  state.range = {from:null, to:null};
  state.selectedDate = null;
  $('pickedDate').value = '';
  $('fromDate').value = '';
  $('toDate').value = '';
  
  document.querySelectorAll('.tile.sel').forEach(el=>el.classList.remove('sel'));
  highlightRangeTiles();
  updateRangeCounter();
}

function onDateChange(e){ 
  state.selectedDate = e.target.value; 
  const day = state.days.find(d => d.date === state.selectedDate);
  if(day && day.status === 'red'){
    toastWarn('Tarikh penuh!');
    state.selectedDate = null;
    $('pickedDate').value = '';
    return;
  }
  highlightSelectedTile(); 
}

// LOGIK HIGHLIGHT RANGE (FIXED SELECTOR)
function highlightRangeTiles(){
  // PENTING: Guna selector #grid untuk elak konflik dengan calendar overview yang tersembunyi
  document.querySelectorAll('#grid .tile.range').forEach(el=>el.classList.remove('range'));
  
  if(!state.range.from) return;

  // Tambahan: Highlight Start Date (supaya user nampak pilihan pertama)
  if(state.range.from && !state.range.to){
     const el = document.querySelector(`#grid .tile[data-date="${state.range.from}"]`);
     if(el) el.classList.add('range');
     return;
  }
  
  // Highlight Julat
  let d = state.range.from;
  // Safety check untuk elak infinite loop jika tarikh tak valid
  if (state.range.to < state.range.from) return;

  while(d <= state.range.to){
    const el = document.querySelector(`#grid .tile[data-date="${d}"]`);
    if(el) el.classList.add('range');
    d = addDaysYMD(d, 1);
  }
}

function highlightSelectedTile(){
  if(!state.selectedDate) return;
  const el = document.querySelector(`#grid .tile[data-date="${state.selectedDate}"]`);
  if(el) el.classList.add('sel');
}

// FUNGSI BARU (DARI EROM)
function onRangeChange(){
  state.range.from = $('fromDate').value || null; 
  state.range.to = $('toDate').value || null;
  
  if(state.range.from && state.range.to && state.range.from > state.range.to){ 
      toastWarn('Tarikh Dari mesti sebelum atau sama dengan Tarikh Hingga'); 
  }
  highlightRangeTiles(); 
  updateRangeCounter();
}

function updateRangeCounter(){
  if(!state.rangeMode) return;
  const d1 = state.range.from, d2 = state.range.to;
  
  if(!d1 && !d2) { $('rangeCounter').textContent = 'Pilih julat tarikh...'; return; }
  // Jika hanya satu tarikh dipilih
  if(d1 && !d2) { $('rangeCounter').textContent = 'Sila pilih tarikh akhir...'; return; }
  
  let count = 0, curr = d1;
  while(curr <= d2){
     const day = new Date(curr).getDay();
     if(day !== 0 && day !== 6) count++; // Kecualikan Sabtu/Ahad
     curr = addDaysYMD(curr, 1);
  }
  $('rangeCounter').textContent = `Akan ditempah: ${count} hari bekerja`;
}

/* ==========================================================================
   8. OVERVIEW LOGIC
   ========================================================================== */
async function loadOverview(loading){
  if(loading) modalLoading('Mengemaskini...');
  const start = firstDay(ov.year, ov.month);
  const end = lastDay(ov.year, ov.month);

  const { data } = await supa
    .from('v_bookings_active')
    .select('*')
    .gte('tarikh', start)
    .lte('tarikh', end)
    .order('tarikh', {ascending:true})
    .order('masa_mula', {ascending:true});

  if(loading) modalClose();
  
  ov.bookings = data || [];
  processOverviewData(ov.bookings);

  renderOvTable();
  renderOvCalendar();
}

function processOverviewData(bookings){
  const daysMap = new Map();
  const daysInMonth = new Date(ov.year, ov.month, 0).getDate();

  for(let d=1; d<=daysInMonth; d++){
    const ymd = `${ov.year}-${pad2(ov.month)}-${pad2(d)}`;
    daysMap.set(ymd, { date: ymd, rooms: [], counts: { red: 0, orange: 0 } });
  }

  const perRoomPerDay = new Map(); 
  bookings.forEach(b => {
    const ymd = toYMDNorm(b.tarikh);
    const key = `${ymd}|${b.bilik}`;
    if(!perRoomPerDay.has(key)){ perRoomPerDay.set(key, { count: 0, totalMin: 0 }); }
    const curr = perRoomPerDay.get(key);
    curr.count += 1;
    curr.totalMin += (toMinutes(b.masa_tamat) - toMinutes(b.masa_mula));
  });

  perRoomPerDay.forEach((val, key) => {
    const [date, roomName] = key.split('|');
    const dayData = daysMap.get(date);
    if(dayData){
      const isFull = (val.totalMin >= 360 || val.count >= 6);
      const status = isFull ? 'red' : 'orange';
      dayData.rooms.push({ room: roomName, status: status });
      if(isFull) dayData.counts.red++; else dayData.counts.orange++;
    }
  });

  ov.days = Array.from(daysMap.values());
}

function switchOverviewView(view){
  ov.view = view;
  $('btnViewCalendar').classList.toggle('active', view==='calendar');
  $('btnViewTable').classList.toggle('active', view==='table');
  $('ovCalendarWrap').style.display = view==='calendar' ? 'block' : 'none';
  $('ovTableWrap').style.display = view==='table' ? 'block' : 'none';
  
  if(view === 'table') {
     renderOvTable();
  }
}

function renderOvTable(){
  // [DEBUG] Semak identiti user di console
  console.log('[DEBUG] Render Table User:', state.user ? state.user.nama : 'Guest', '| Role:', state.user ? state.user.role : 'None');

  const tbody = $('ovTableBody'); 
  tbody.innerHTML = ''; // Pastikan bersih sebelum loop
  
  let list = ov.bookings;
  if(ov.filterRoom) list = list.filter(b => b.bilik === ov.filterRoom);

  if(!list.length){ 
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:15px">Tiada tempahan.</td></tr>'; 
    return; 
  }

  const today = toYMD(new Date()); 
  list.forEach(b => {
    const tr = createEl('tr');
    const bDate = toYMDNorm(b.tarikh);
    const isFuture = bDate >= today; 

    let canAction = false;
    if(state.user && state.user.role){
       if(state.user.role === 'ADMIN') {
         canAction = true; 
       }
       else if(state.user.nama === b.nama_penempah && isFuture) {
         canAction = true;
       }
    }

    const actionHtml = canAction 
      ? `<button class="btn-icon-del" data-id="${b.booking_id}" title="Batal Tempahan">🗑️</button>` 
      : `<span style="color:#ccc; font-size:0.8rem;">-</span>`;

    tr.innerHTML = `
      <td>${b.tarikh}</td>
      <td style="font-family:monospace">${toHHMM(b.masa_mula)}-${toHHMM(b.masa_tamat)}</td>
      <td>${b.bilik}</td>
      <td>${escapeHtml(b.tujuan)}</td>
      <td><strong>${escapeHtml(b.nama_penempah)}</strong></td>
      <td style="text-align:center">${actionHtml}</td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-icon-del').forEach(btn => {
    btn.addEventListener('click', () => cancelBooking(btn.dataset.id));
    btn.style.cssText = "background:none; border:none; cursor:pointer; font-size:1.1rem;";
  });
}

function renderOvCalendar(){
  const grid = $('ovGrid'); grid.innerHTML='';
  
  const lastDayOfMonth = new Date(ov.year, ov.month, 0).getDate();
  const firstDow = (new Date(ov.year, ov.month-1, 1).getDay() + 6) % 7;
  
  for(let i=0; i<firstDow; i++) grid.appendChild(createEl('div','blank'));
  
  const dayMap = new Map((ov.days||[]).map(d => [d.date, d]));
  
  for(let d=1; d<=lastDayOfMonth; d++){
    const ymd = `${ov.year}-${pad2(ov.month)}-${pad2(d)}`;
    const dayData = dayMap.get(ymd);
    
    const tile = createEl('div', 'tile');
    
    const top = createEl('div', 'date');
    top.textContent = d;
    
    if (dayData && (dayData.counts.red > 0 || dayData.counts.orange > 0)) {
      const div = createEl('div', 'cnt-group');
      if(dayData.counts.red > 0) div.innerHTML += `<span class="cnt-pill red">P:${dayData.counts.red}</span>`;
      if(dayData.counts.orange > 0) div.innerHTML += `<span class="cnt-pill orange">S:${dayData.counts.orange}</span>`;
      top.appendChild(div);
    }
    tile.appendChild(top);
    
    const body = createEl('div', 'body');
    if (dayData && dayData.rooms.length > 0){
      const list = createEl('div', 'listRooms'); 
      dayData.rooms.forEach(it => {
        const pill = createEl('span', `pill ${it.status}`);
        pill.textContent = it.room; 
        list.appendChild(pill);
      });
      body.appendChild(list);
    }
    tile.appendChild(body);
    grid.appendChild(tile);
  }
  
  renderOvSummary();
}

function renderOvSummary(){
  const list = $('ovSummaryList'); 
  list.innerHTML='';
  const counter = new Map();
  ov.bookings.forEach(b => {
    counter.set(b.bilik, (counter.get(b.bilik)||0) + 1);
  });
  
  if(counter.size === 0) {
    list.innerHTML = 'Tiada data.';
    return;
  }
  
  const rows = ROOM_OPTIONS
    .map(room => [room, counter.get(room)||0])
    .filter(x => x[1] > 0) 
    .sort((a,b)=> (b[1]-a[1])); 
    
  list.innerHTML = rows.map(([room,c])=> `• ${room} (<strong>${c}</strong> tempahan)`).join('<br>');
  $('ovSummaryWrap').style.display='block';
}

async function cancelBooking(id){
  // [SAFETY GUARD] Pengesahan padam rekod (User/Self)
  const { isConfirmed } = await Swal.fire({
    title: 'HAPUSKAN TEMPAHAN?',
    text: "Tindakan ini akan memadam rekod anda secara kekal dan tidak boleh dikembalikan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33', // Merah untuk bahaya
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus Serta-merta',
    cancelButtonText: 'Batal',
    focusCancel: true // Letak fokus pada butang Batal (Safety)
  });

  if(isConfirmed){
    modalLoading('Membatalkan...');
    const { data } = await supa.rpc('fn_cancel_booking_secure', {
      p_booking_id: id,
      p_email: state.user.email
    });
    modalClose();
    
    if(data && data.ok){
      toastOk('Berjaya dibatalkan');
      loadOverview(false);
      if(state.room) refreshCalendar(false);
    } else {
      Swal.fire('Gagal', data?.error || 'Ralat', 'error');
    }
  }
}

/* ==========================================================================
   9. ADMIN PANEL LOGIC (USER & BOOKING MANAGEMENT)
   ========================================================================== */
async function loadAdminUserList(){
  const tbody = $('adminUserListBody');
  if(!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:15px">Memuatkan...</td></tr>';
  
  const { data, error } = await supa.rpc('fn_get_all_users_secure', { p_email: state.user.email });
  
  if(error || !data || !data.ok){
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red">Gagal akses data pengguna.</td></tr>';
    console.error(error || data?.error);
    return;
  }

  const users = data.data;

  if(!users || users.length === 0){
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:15px">Tiada pengguna ditemui.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = createEl('tr');
    tr.style.borderBottom = '1px solid #f1f5f9';
    tr.innerHTML = `
      <td style="padding:10px">${escapeHtml(u.nama)}</td>
      <td style="padding:10px">${escapeHtml(u.sektor)}</td>
      <td style="padding:10px">${escapeHtml(u.email)}</td>
      <td style="padding:10px; text-align:center">
        <button class="btn-reset" data-id="${u.id}" data-email="${u.email}">Reset</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  document.querySelectorAll('.btn-reset').forEach(btn => {
    btn.onclick = () => adminResetPassword(btn.dataset.id, btn.dataset.email);
  });
}

async function adminResetPassword(id, email){
  const { isConfirmed } = await Swal.fire({
    title: 'Reset Kata Laluan?',
    text: `Reset password ${email} kepada 'ppdag@12345'?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Reset'
  });
  if(isConfirmed){
    modalLoading('Memproses...');
    const { data } = await supa.rpc('fn_admin_reset_password', {
       p_admin_email: state.user.email,
       p_target_id: id
    });
    modalClose();
    if(data && data.ok) Swal.fire('Berjaya', 'Kata laluan telah ditetapkan semula.', 'success');
    else Swal.fire('Gagal', data?.error || 'Ralat tidak diketahui', 'error');
  }
}

async function loadAdminBookingList(){
  const room = $('adminRoom').value;
  if(!room) return toastWarn('Sila pilih bilik dahulu');
  
  const listDiv = $('adminList');
  listDiv.innerHTML = '<div style="padding:10px;text-align:center">Memuatkan...</div>';
  
  const { data } = await supa.rpc('fn_admin_list_bookings', {
    p_email: state.user.email,
    p_bilik: room
  });

  if(!data || !data.ok){
    listDiv.innerHTML = '<div style="color:red">Ralat memuatkan data.</div>';
    return;
  }
  
  const bookings = data.data;
  adminState.bookings = bookings; 

  if(bookings.length === 0){
    listDiv.innerHTML = '<div style="padding:10px;text-align:center">Tiada tempahan akan datang.</div>';
    return;
  }

  let html = `
    <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
      <thead>
        <tr style="background:#f8fafc; text-align:left;">
          <th style="padding:8px;width:30px"><input type="checkbox" id="chkAllDynamic"></th>
          <th style="padding:8px">Tarikh</th>
          <th style="padding:8px">Masa</th>
          <th style="padding:8px">Tujuan</th>
          <th style="padding:8px">Penempah</th>
          <th style="padding:8px;text-align:center">Edit</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  bookings.forEach(b => {
    html += `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:8px;text-align:center"><input type="checkbox" class="chk-item" value="${b.id}"></td>
        <td style="padding:8px">${b.tarikh}</td>
        <td style="padding:8px">${toHHMM(b.masa_mula)}-${toHHMM(b.masa_tamat)}</td>
        <td style="padding:8px">${escapeHtml(b.tujuan)}</td>
        <td style="padding:8px">${escapeHtml(b.nama_penempah)}</td>
        <td style="padding:8px;text-align:center">
          <button class="btn-edit" data-id="${b.id}" style="border:none;background:none;cursor:pointer">✏️</button>
        </td>
      </tr>
    `;
  });
  
  html += `</tbody></table>`;
  listDiv.innerHTML = html;

  $('chkAllDynamic').addEventListener('change', (e)=>{
    document.querySelectorAll('.chk-item').forEach(c => c.checked = e.target.checked);
  });
  
  document.querySelectorAll('.btn-edit').forEach(b => {
    b.onclick = () => openEditModal(b.dataset.id);
  });
}

async function executeBulkCancel(){
  const checked = document.querySelectorAll('.chk-item:checked');
  if(checked.length === 0) return toastWarn('Pilih sekurang-kurangnya satu tempahan.');
  
  const ids = Array.from(checked).map(c => c.value);
  
  // [SAFETY GUARD] Langkah 1: Minta Sebab
  const { value: reason } = await Swal.fire({
    title: 'Sebab Pembatalan?',
    input: 'text',
    inputPlaceholder: 'Cth: Penyelenggaraan Bilik',
    showCancelButton: true
  });
  
  if(reason){
    // [SAFETY GUARD] Langkah 2: Pengesahan Akhir
    const isConfirmed = await modalConfirm(
      'Sahkan Pembatalan Pukal?',
      `Anda akan membatalkan ${ids.length} tempahan terpilih dengan sebab: "${reason}".`
    );

    if (!isConfirmed) return;

    modalLoading('Membatalkan...');
    const { data } = await supa.rpc('fn_delete_booking_bulk_secure', {
      p_ids: ids,
      p_email: state.user.email,
      p_reason: reason
    });
    modalClose();
    
    if(data && data.ok){
      toastOk(`${data.updated} tempahan dibatalkan.`);
      loadAdminBookingList(); 
    } else {
      Swal.fire('Ralat', data?.error, 'error');
    }
  }
}

async function openEditModal(id){
  const b = adminState.bookings.find(x => x.id === id);
  if(!b) return;

  const { value: form } = await Swal.fire({
    title: 'Edit Tempahan',
    html: `
      <label class="small">Tarikh</label><input id="eDate" type="date" class="swal2-input" value="${b.tarikh}">
      <label class="small">Masa Mula</label><input id="eStart" type="time" class="swal2-input" value="${toHHMM(b.masa_mula)}">
      <label class="small">Masa Tamat</label><input id="eEnd" type="time" class="swal2-input" value="${toHHMM(b.masa_tamat)}">
      <label class="small">Tujuan</label><input id="eNote" class="swal2-input" value="${b.tujuan}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    preConfirm: () => ({
      d: $('eDate').value,
      s: $('eStart').value,
      e: $('eEnd').value,
      n: $('eNote').value
    })
  });

  if(form){
    // [SAFETY GUARD] Pengesahan Edit
    const isConfirmed = await modalConfirm(
      'Simpan Perubahan?',
      'Maklumat tempahan asal akan digantikan dengan data baharu.'
    );
    if (!isConfirmed) return;

    modalLoading('Menyimpan...');
    const { data } = await supa.rpc('fn_update_booking_secure', {
      p_booking_id: id,
      p_email: state.user.email, 
      p_date: form.d,
      p_start: form.s,
      p_end: form.e,
      p_category: b.kategori,
      p_note: form.n,
      p_sektor: b.sektor,
      p_nama: b.nama_penempah
    });
    modalClose();
    
    if(data && data.ok){
      toastOk('Tempahan dikemaskini.');
      loadAdminBookingList();
      if(state.room) refreshCalendar(false);
    } else {
      Swal.fire('Ralat', data?.error, 'error');
    }
  }
}