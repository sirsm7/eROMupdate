// assets/js/app.js
import { supa } from "../../src/api/supabaseClient.js";

/* ========= Tetapan paparan ========= */
const SHOW_PAST_DAYS = false;

/* ========= Konstanta bilik & kategori ========= */
const ROOM_OPTIONS = [
  "PKG Ganun - Bilik Kursus (30 orang)",
  "PKG Melekek - Bilik Kuliah (25 orang)",      // Nama telah dikemaskini
  "PKG Melekek - Bilik Mesyuarat (25 orang)",   // Bilik baharu ditambah
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

/* ========= Sektor -> Nama ========= */
const NAMA_MENGIKUT_SEKTOR = {
  "Pengurusan Tertinggi": ["Tuan Haji Ab Malek Bin Kasim (B.K.T)","En. Azhar Bin Md Nor (B.C.M)","En. Abd Jabar Bin Md Yusup (P.J.K)","En. Muhammad Hamka Bin Dollah","En. Bashir Bin Abu Bakar"],
  "School Improvement Partner (SIP+)": ["En. Amran Bin Abdul Sukor","En. Abd. Razak Bin Adam","Pn. Rafidah Binti Abd Rahim"],
  "Sektor Perancangan": ["En. Saifullah Bin Abdul Wahab","En. Hairoldin Rahim Bin Taya"],
  "Sektor Pembelajaran": ["En. Hairuljaki Bin Omar","Pn. Zuraini Binti Bakri","Ustazah Pauziah Binti Othman","En. Razman Bin Mohammad","En. Mohd Anis Bin Abdul Majid","Pn. Norasiah Binti Ahmad","Pn. Wan Norhayati Binti Wan Ibrahim","Pn. Sabiah Binti Ninggal","Pn. Puteri Hanizah Binti Megat Amaddin","Pn. Khairul Bariah Binti Ismail","Pn. Rohana Binti Jantan","En. Fakrul Izhar Bin Ramlee","Ustaz Mahadi Bin Suboh","Ustaz Kamarul Zaman Bin Sahat","En. Mohd Shahril Amri B. Mohamed Shahar","En. Mohd Eirwan Bin Halim","Pn. Mariyam Binti Ahmad","En. Wan Norarif Bin Wan Muhammad","Pn. Nor Jamilahton Holija'ah Bt Ariffin","En. Munzir Bin Md Rosnan","En. Mohd Rizal Bin Maslah","Pn. Faezah Binti Ali","En. Mohd Izwan Bin Othman","En. Muhammad Afif bin Noor Azman","En. Malik Abdullah Bin Adanan","Pn. Mas Azahwati Binti Ab Aziz"],
  "Sektor Pengurusan Sekolah": ["Pn. Addelennoor Binti Abu","Pn. Siti Noorus Sa'adah Binti Md Ramli","En. Muhammad Hafiz Bin Hamdan","En. Mazli Bin Malek","En. Mohd Kamarul Hafiz Bin Abdul Rashid","En. Kadin Bin Abu @ Sim Ah Tong","En. Nor Afandi Bin Safar","En. Adnan Bin Isenin","Pn. Kavitha A/P Kannan","Pn. Irmadila Binti Mat Ismail","Cik Nurain Nabihah Binti Nasaruddin","Pn. Masayu Binti Kari"],
  "Sektor Pembangunan Murid": ["En. Helmizal Bin Abu Bakar","En. Ismail Asib Bin Md Amin","En. Mohammad Misbahuddin Bin Abu Mansor"],
  "Sektor Pentaksiran & Peperiksaan": ["En. Mohd Rahdi Bin Ahmad","En. Zaidi Bin Jaafar"],
  "Psikologi & Kaunseling": ["En. Mohd Saberi Bin Minhat @ Bulat"],
  "Sektor Pengurusan": ["Pn. Asmalaili Binti Ahmad Sanusi","En. Mohd Anuar Bin Abdul Hamid","Pn. Fahizah Binti Mohd Yusoff","Cik Nurul Jannah Binti Mohd Nasir","Pn. Nor Fizana Binti Md Idris","Pn. Nurul Ain Binti Mohd Zaini","En. Md Zaki Zabani Bin Mohd Nor","Pn. Faizzah Binti Zulkefli","En. Mustafa Bin Musa","En. Rozamni Bin Muhamad","Pn. Katijah Binti Mohd Ali","En. Zasmeini Bin Zaimun","Pn. Suzanawati Binti Mohd Said","Pn. Kamsiah Binti Hashim","Pn. Hartiniwatie Binti Abang","En. Azharul Nizam Bin Othmawi","Pn. Rosedah Binti Muhamad","Pn. Noor 'Izzati Binti Johari","En. Mohd Arifin Bin Kamarudin","Pn. Siti Rajunah Binti Ab. Rahman","Pn. Fairus Binti Zainal","En. Hanizah Binti Minhat","Cik Siti Aishah Binti Md Hassan","En. Mohd Fauzi Bin Mohamed Ali","En. Nor Azmin bin Ahmad","En. Muhammad Fadhli Mustaqim Bin Mazlan","En. Muhammad Afiq Bin Yang Rosdi","Pn. Haslina Binti Beeran Kutty"]
};

/* ========= Utiliti ========= */
const Toast = Swal.mixin({ toast:true, position:'top', showConfirmButton:false, timer:2200, timerProgressBar:true });
const $ = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2,'0');
const formatMonthLabel = (y,m)=> new Intl.DateTimeFormat('ms-MY',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
const toYMD = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const firstDay = (y,m)=> `${y}-${pad2(m)}-01`;
const lastDay  = (y,m)=> toYMD(new Date(Date.UTC(y,m,0)));
const todayYMD = ()=> toYMD(new Date());

/* ===== [TAMBAH] Normalisasi masa & tarikh ===== */
function toHHMM(x){
  if (x == null) return "";
  const s = String(x).trim();
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0,5);              // "09:00" atau "09:00:00"
  const d = new Date(s);
  if (!isNaN(d)) return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${pad2(m[1])}:${m[2]}`;
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
const diffHours = (start,end)=> (toMinutes(end)-toMinutes(start))/60;
function toastOk(t){Toast.fire({icon:'success',title:t});}
function toastInfo(t){Toast.fire({icon:'info',title:t});}
function toastWarn(t){Toast.fire({icon:'warning',title:t});}
function modalLoading(title='Memproses...'){ Swal.fire({ title, allowOutsideClick:false, didOpen:()=>Swal.showLoading() }); }
function modalClose(){ Swal.close(); }
function modalError(title, text){ Swal.fire(title||'Ralat', text||'Terjadi ralat yang tidak dijangka.', 'error'); }
async function modalConfirm(title, text){ const r=await Swal.fire({ title, text, icon:'question', showCancelButton:true, confirmButtonText:'Teruskan', cancelButtonText:'Batal' }); return r.isConfirmed; }
function markInvalid(el){ el.classList.add('invalid'); setTimeout(()=>el.classList.remove('invalid'), 1200); el.focus(); }
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function addDaysYMD(ymd,n){ const [y,m,d]=ymd.split('-').map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+n); return toYMD(dt); }

/* ========= State ========= */
let state = { isAdmin:false, year:null, month:null, room:'', days:[], selectedDate:null, range:{from:null,to:null}, rangeMode:false, adminItems: [] };
let ov = { year:null, month:null, days:[], bookings:[], view:'calendar', filterRoom:'' };
let ADMIN_PASSWORD = '';

/* ========= API ========= */
async function getInit(){
  return { rooms:[...ROOM_OPTIONS], categories:[...CATEGORY_OPTIONS], sektor:Object.keys(NAMA_MENGIKUT_SEKTOR) };
}

/* ===== Kalendar bilik (Tempahan) ===== */
async function getMonthView({ room, year, month }){
  const from = firstDay(year, month), to = lastDay(year, month);
  // Gunakan VIEW v_bookings_active yang telah dibuat di SQL
  const { data, error } = await supa
    .from('v_bookings_active')
    .select('tarikh, masa_mula, masa_tamat, kategori, tujuan')
    .eq('bilik', room)
    .gte('tarikh', from).lte('tarikh', to)
    .order('tarikh',{ascending:true})
    .order('masa_mula',{ascending:true});
  if (error) throw error;

  const byDate = new Map();
  (data||[]).forEach(r=>{
    const tarikh = toYMDNorm(r.tarikh);
    const cur = byDate.get(tarikh) || { list:[], count:0, hasLong:false, totalMin:0 };
    const start = toHHMM(r.masa_mula);
    const end   = toHHMM(r.masa_tamat);
    const durMin = Math.max(0, toMinutes(end) - toMinutes(start));
    cur.list.push({ start, end, category:r.kategori, note:r.tujuan||'' });
    cur.count += 1;
    cur.totalMin += durMin;
    if (durMin >= 360) cur.hasLong = true;
    byDate.set(tarikh, cur);
  });

  const days = [];
  const last = Number(to.slice(-2));
  for(let d=1; d<=last; d++){
    const ymd = `${year}-${pad2(month)}-${pad2(d)}`;
    const dayInfo = byDate.get(ymd) || { list:[], count:0, hasLong:false, totalMin:0 };
    const status = (dayInfo.hasLong || dayInfo.totalMin >= 360 || dayInfo.count >= 6)
      ? 'red'
      : (dayInfo.count===0 ? 'green' : 'orange');
    days.push({ date: ymd, weekday:(new Date(ymd).getDay()), isPast: ymd < todayYMD(), status, bookings: dayInfo.list });
  }
  return { days };
}

/* ===== Rumusan semua bilik (Kalendar) ===== */
async function getMonthRoomsOverview({ year, month }) {
  const from = firstDay(year, month), to = lastDay(year, month);
  const { data, error } = await supa
    .from('v_bookings_active')
    .select('tarikh,bilik,masa_mula,masa_tamat')
    .gte('tarikh', from).lte('tarikh', to);
  if (error) throw error;

  const perRoomPerDay = new Map();
  (data || []).forEach(r => {
    const date = toYMDNorm(r.tarikh);
    const key = `${date}|${r.bilik}`;
    const cur = perRoomPerDay.get(key) || { count: 0, hasLong: false, totalMin: 0 };
    const start = toHHMM(r.masa_mula);
    const end   = toHHMM(r.masa_tamat);
    const durMin = Math.max(0, toMinutes(end) - toMinutes(start));
    cur.count += 1;
    cur.totalMin += durMin;
    if (durMin >= 360) cur.hasLong = true;
    perRoomPerDay.set(key, cur);
  });

  const daysMap = new Map();
  const last = Number(to.slice(-2));
  for (let d=1; d<=last; d++){
    const ymd = `${year}-${pad2(month)}-${pad2(d)}`;
    daysMap.set(ymd, { date: ymd, rooms: [], counts: { red: 0, orange: 0 } });
  }

  perRoomPerDay.forEach((val, key) => {
    const [date, room] = key.split('|');
    const day = daysMap.get(date);
    if (!day) return;
    const status = (val.hasLong || val.totalMin >= 360 || val.count >= 6) ? 'red' : 'orange';
    day.rooms.push({ room, status });
    if (status === 'red') day.counts.red++; else day.counts.orange++;
  });

  return { days: [...daysMap.values()] };
}

/* ===== Rumusan semua bilik (Jadual) ===== */
async function getMonthBookingsList({ year, month }) {
  const from = firstDay(year, month), to = lastDay(year, month);
  const { data, error } = await supa
    .from('v_bookings_active')
    .select('tarikh, masa_mula, masa_tamat, bilik, kategori, tujuan, nama_penempah, sektor')
    .gte('tarikh', from).lte('tarikh', to)
    .order('tarikh', { ascending: true })
    .order('masa_mula', { ascending: true });
  if (error) throw error;
  
  const items = (data || []).map(r => ({
    date: toYMDNorm(r.tarikh),
    start: toHHMM(r.masa_mula),
    end: toHHMM(r.masa_tamat),
    room: r.bilik,
    category: r.kategori,
    note: r.tujuan,
    nama: r.nama_penempah,
    sektor: r.sektor
  }));

  items.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.start.localeCompare(a.start);
  });
  
  return { items };
}

async function adminCheck(pw){
  const { data, error } = await supa.rpc('fn_admin_check', { pw });
  if (error) throw error;
  return { ok: !!data, isAdmin: !!data };
}
async function createBooking(args){
  const { data, error } = await supa.rpc('fn_create_booking', {
    p_room: args.room, p_date: args.date, p_start: args.start, p_end: args.end,
    p_category: args.category, p_note: args.note, p_sektor: args.sektor, p_nama: args.nama
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || 'Gagal menyimpan');
  return data;
}
async function createBookingRange(args){
  const { data, error } = await supa.rpc('fn_create_booking_range', {
    p_room: args.room,
    p_from: args.startDate,
    p_to: args.endDate,
    p_start: args.start,
    p_end: args.end,
    p_category: args.category,
    p_note: args.note,
    p_sektor: args.sektor,
    p_nama: args.nama
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || 'Gagal menyimpan julat');
  return data;
}
async function listUpcomingBookings({ room }){
  const today = todayYMD();
  const { data, error } = await supa
    .from('v_bookings_active')
    .select('booking_id, tarikh, masa_mula, masa_tamat, bilik, kategori, tujuan, nama_penempah, sektor')
    .eq('bilik', room)
    .gte('tarikh', today)
    .order('tarikh',{ascending:true})
    .order('masa_mula',{ascending:true});
  if (error) throw error;
  
  const items = (data||[]).map(r=>({
    id:r.booking_id,
    date: toYMDNorm(r.tarikh),
    start: toHHMM(r.masa_mula),
    end: toHHMM(r.masa_tamat),
    room:r.bilik, category:r.kategori, note:r.tujuan,
    nama:r.nama_penempah, sektor:r.sektor
  }));

  items.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.start.localeCompare(a.start);
  });
  
  return { items };
}
async function batalTempahanBulk({ ids, reason, adminPassword }){
  const { data, error } = await supa.rpc('fn_batal_tempahan_bulk', {
    p_ids: ids, p_admin_password: adminPassword, p_reason: reason
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || 'Gagal batal');
  return { updated: data.updated|0 };
}
async function updateBooking(args) {
  const { data, error } = await supa.rpc('fn_update_booking', {
    p_booking_id: args.id,
    p_date: args.date,
    p_start: args.start,
    p_end: args.end,
    p_category: args.category,
    p_note: args.note,
    p_sektor: args.sektor,
    p_nama: args.nama,
    p_admin_password: args.adminPassword
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || 'Gagal mengemas kini');
  return data;
}

/* ========= Bootstrap ========= */
window.addEventListener('unhandledrejection', e => { modalClose(); Toast.fire({icon:'error', title:e.reason?.message || 'Ralat tidak dijangka.'}); });
window.addEventListener('load', bootstrap);

async function bootstrap(){
  const now = new Date();
  state.year = now.getFullYear(); state.month = now.getMonth()+1;
  ov.year = now.getFullYear(); ov.month = now.getMonth()+1;

  setupUI();

  modalLoading('Memuat data awal...');
  try{
    const boot = await getInit();
    hydrateSelect($('roomSelect'), ['Sila Pilih Bilik', ...boot.rooms], true);
    hydrateSelect($('category'), boot.categories);
    hydrateSelect($('sektor'), ['— Pilih Sektor —', ...Object.keys(NAMA_MENGIKUT_SEKTOR)], true);
    hydrateSelect($('adminRoom'), ['Sila Pilih Bilik', ...ROOM_OPTIONS], true);
    populateOvRoomFilter();
    lockAdmin();
    populateNamaOptions();
    toggleCalendarHint();
    
    // PEMBAIKAN GOVNET FRIENDLY: Mula-mula cuba muat data
    // Jika gagal, blok 'catch' di bawah akan menganalisis ralat
    await loadOverview(true);
    
    modalClose();
    toastOk('Aplikasi sedia digunakan');
  }catch(err){
    modalClose();
    // DETEKTOR FIREWALL:
    // Jika ralat berkaitan rangkaian (fetch failed), beri amaran khusus
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
       Swal.fire({
         icon: 'error',
         title: 'Akses Disekat',
         html: 'Talian internet anda mungkin menyekat akses ke pangkalan data (Firewall Kerajaan/KPM).<br><br><b>Sila cuba tukar ke data mudah alih (Hotspot) untuk akses.</b>',
         footer: 'Kod Ralat: ERR_NETWORK_BLOCK',
         allowOutsideClick: false,
         confirmButtonText: 'Faham'
       });
    } else {
       modalError('Gagal memuat', err.message);
    }
  }
}

/* ========= UI helpers ========= */
function hydrateSelect(sel, items, includeFirstAsPlaceholder=false){
  sel.innerHTML=''; items.forEach((v,i)=> sel.appendChild(new Option(v, includeFirstAsPlaceholder && i===0 ? '' : v)));
}
function setupUI(){
  $('monthLabel').textContent = formatMonthLabel(state.year, state.month);
  $('ovMonthLabel').textContent = formatMonthLabel(ov.year, ov.month);

  $('tabTempahanBtn').addEventListener('click', ()=> switchTab('tempahan'));
  $('tabKalendarBtn').addEventListener('click', ()=> switchTab('kalendar'));
  $('tabAdminBtn').addEventListener('click', ()=> switchTab('admin'));

  $('roomSelect').addEventListener('change', onRoomSelectChange);
  $('btnRefresh').addEventListener('click', ()=>{ resetUI(); toastInfo('Antara muka ditetapkan semula'); });
  $('btnBook').addEventListener('click', onBook);
  $('pickedDate').addEventListener('change', onPickedDateChange);
  $('toggleRangeOff').addEventListener('click', ()=>setRangeMode(false));
  $('toggleRangeOn').addEventListener('click', ()=>setRangeMode(true));
  $('fromDate').addEventListener('change', onRangeChange);
  $('toDate').addEventListener('change', onRangeChange);
  $('grid').addEventListener('click', onGridClick);
  $('sektor').addEventListener('change', populateNamaOptions);

  setupMonthNavigator({ stateObj: state, prevBtn:'btnPrev', nextBtn:'btnNext', label:'monthLabel', onShift: ()=>{ if(state.room) refreshMonth(true); } });
  setupMonthNavigator({ stateObj: ov,    prevBtn:'ovPrev', nextBtn:'ovNext', label:'ovMonthLabel', onShift: ()=> loadOverview(true) });

  $('btnViewCalendar').addEventListener('click', ()=>switchOverviewView('calendar'));
  $('btnViewTable').addEventListener('click', ()=>switchOverviewView('table'));

  $('ovRoomFilter').addEventListener('change', ()=>{ ov.filterRoom = $('ovRoomFilter').value; renderOvTable(); });

  $('btnAdminLogin').addEventListener('click', onAdminLogin);
  $('btnAdminLoad').addEventListener('click', loadAdminUpcoming);
  $('btnBulkCancel').addEventListener('click', onBulkCancel);
  $('adminList').addEventListener('click', onAdminListClick);
}
function setupMonthNavigator({ stateObj, prevBtn, nextBtn, label, onShift }) {
  $(prevBtn).addEventListener('click', () => shiftMonth(-1));
  $(nextBtn).addEventListener('click', () => shiftMonth(1));
  function shiftMonth(delta) {
    let y = stateObj.year, m = stateObj.month + delta;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    stateObj.year = y; stateObj.month = m;
    $(label).textContent = formatMonthLabel(y, m);
    onShift();
  }
}
function switchTab(name){
  const map={tempahan:{btn:'tabTempahanBtn',pane:'tabTempahan'},kalendar:{btn:'tabKalendarBtn',pane:'tabKalendar'},admin:{btn:'tabAdminBtn',pane:'tabAdmin'}};
  Object.keys(map).forEach(k=>{ const {btn,pane}=map[k]; $(btn).classList.toggle('active',k===name); $(pane).classList.toggle('active',k===name); });
  if(name==='kalendar' && (!ov.days || !ov.days.length)){ loadOverview(true); }
}
function lockAdmin(){ state.isAdmin=false; ADMIN_PASSWORD=''; $('adminLoginBox').style.display='block'; $('adminPanel').style.display='none'; $('adminWho').textContent='Belum log masuk'; }
function unlockAdmin(){ state.isAdmin=true; $('adminLoginBox').style.display='none'; $('adminPanel').style.display='block'; }
function toggleCalendarHint(){ $('noRoomHint').style.display = state.room ? 'none' : 'block'; }
function populateNamaOptions(){
  const sekVal=$('sektor').value, namaSel=$('nama'); namaSel.innerHTML='';
  const list=NAMA_MENGIKUT_SEKTOR[sekVal];
  if(!sekVal || !list){ namaSel.appendChild(new Option('— Sila pilih sektor dahulu —','')); namaSel.disabled=true; return; }
  namaSel.disabled=false; namaSel.appendChild(new Option('— Pilih nama —','')); list.forEach(n=> namaSel.appendChild(new Option(n,n)));
}
function populateOvRoomFilter(){ const sel=$('ovRoomFilter'); sel.innerHTML='<option value="">— Semua Bilik —</option>'; ROOM_OPTIONS.forEach(r=> sel.appendChild(new Option(r,r))); }

function resetUI(){
  const now=new Date(); state.year=now.getFullYear(); state.month=now.getMonth()+1; $('monthLabel').textContent=formatMonthLabel(state.year,state.month);
  state.days=[]; $('grid').innerHTML=''; document.querySelectorAll('.tile.sel').forEach(el=>el.classList.remove('sel'));
  $('roomSelect').value=''; state.room=''; toggleCalendarHint();
  resetBookingForm(true);
  $('adminRoom').value=''; $('adminList').innerHTML=''; state.adminItems=[];
  lockAdmin();
  switchTab('tempahan'); window.scrollTo({top:0,behavior:'smooth'});
}
function resetBookingForm(clearFields){
  setRangeMode(false);
  $('pickedDate').required=true; $('fromDate').required=false; $('toDate').required=false;
  $('rangeCounter').style.display='none'; $('rangeCounter').textContent='';
  if (clearFields){
    ['pickedDate','fromDate','toDate','startTime','endTime','note'].forEach(id => $(id).value='');
    const sek=$('sektor'); if(sek && sek.options.length) sek.selectedIndex=0;
    populateNamaOptions();
  }
  state.selectedDate=null; state.range={from:null,to:null};
}
function setRangeMode(on){
  state.rangeMode=!!on;
  $('toggleRangeOff').classList.toggle('active',!on);
  $('toggleRangeOn').classList.toggle('active',on);
  $('pickedDate').closest('div').style.display = on ? 'none' : 'block';
  $('fromDateWrap').style.display = on ? 'block' : 'none';
  $('toDateWrap').style.display = on ? 'block' : 'none';
  $('rangeCounter').style.display = on ? 'inline-block' : 'none';
  state.selectedDate=null; $('pickedDate').value='';
  state.range={from:null,to:null}; $('fromDate').value=''; $('toDate').value='';
  document.querySelectorAll('#grid .tile.sel').forEach(el=>el.classList.remove('sel'));
  highlightRangeTiles(); updateRangeCounter();
}

/* ========= Kalendar bilik ========= */
function onRoomSelectChange(){ state.room=$('roomSelect').value; resetBookingForm(false); toggleCalendarHint(); if(state.room){ refreshMonth(true); } else { $('grid').innerHTML=''; } }
async function refreshMonth(showLoading){
  if(!state.room){ toggleCalendarHint(); return; }
  if(showLoading) modalLoading('Memuat kalendar...');
  try{
    const res = await getMonthView({ room: state.room, year: state.year, month: state.month });
    state.days = res.days || [];
    renderCalendar(); highlightSelectedTile(); highlightRangeTiles(); updateRangeCounter();
    if(showLoading){ modalClose(); toastOk('Kalendar dikemas kini'); }
  }catch(err){ if(showLoading) modalClose(); modalError('Gagal memuat kalendar', err.message); }
}
function renderCalendar(){
  const grid=$('grid'); grid.innerHTML=''; if(state.days.length===0) return;

  const days = SHOW_PAST_DAYS ? state.days : state.days.filter(d=>!d.isPast);
  if (days.length === 0) { grid.innerHTML='<div class="small" style="padding:1rem">Tiada hari untuk dipaparkan.</div>'; return; }

  const docFrag=document.createDocumentFragment();
  const first=days[0]; const weekday=(new Date(first.date).getDay()+6)%7; // 0 = Isnin
  for(let i=0;i<weekday;i++){ const x=document.createElement('div'); x.className='blank'; docFrag.appendChild(x); }
  for(const dayData of days){ docFrag.appendChild(buildTile(dayData)); }
  grid.appendChild(docFrag);
}
function buildTile(day){
  const isWeekend = (new Date(day.date).getDay()===0 || new Date(day.date).getDay()===6);
  const tile=document.createElement('div');
  tile.className=`tile ${ (day.isPast||isWeekend) ? 'disabled':'' }`;
  tile.dataset.date=day.date;
  const top=document.createElement('div'); top.className='date'; top.textContent=Number(day.date.slice(8,10));
  if (!day.isPast && !isWeekend) {
    const statusMap = {red:'Penuh', orange:'Separa Penuh', green:'Tiada tempahan'};
    const badge=document.createElement('span'); badge.className=`badge ${day.status}`; badge.textContent = statusMap[day.status] || '';
    top.appendChild(badge);
  }
  tile.appendChild(top);
  const body=document.createElement('div'); body.className='body';
  if(!day.isPast && !isWeekend){
    const list=document.createElement('div'); list.className='small';
    if(day.bookings && day.bookings.length > 0){
      (day.bookings||[]).forEach(b=>{
        const p=document.createElement('div');
        const note=b.note?` • ${String(b.note).slice(0,30)}${b.note.length>30?'…':''}`:'';
        p.textContent=`${toHHMM(b.start)}–${toHHMM(b.end)} • ${b.category}${note}`;
        list.appendChild(p);
      });
    } else {
      const p=document.createElement('div'); p.className='small'; p.textContent='Tiada tempahan.'; list.appendChild(p);
    }
    body.appendChild(list);
  }
  tile.appendChild(body);
  return tile;
}
function onGridClick(ev){
  const tile = ev.target.closest('.tile'); if(!tile || tile.classList.contains('disabled')) return;
  const dayData = state.days.find(d => d.date === tile.dataset.date);
  if (dayData && dayData.status === 'red') { toastWarn('Bilik ini telah penuh pada tarikh tersebut.'); return; }
  if(state.rangeMode){
    const clickedDate = tile.dataset.date;
    if(!state.range.from){ state.range.from = clickedDate; toastInfo('Tarikh mula dipilih'); }
    else if(!state.range.to){ if(clickedDate < state.range.from){ state.range.to = state.range.from; state.range.from = clickedDate; } else { state.range.to = clickedDate; } toastOk('Julat tarikh ditetapkan'); }
    else { state.range = {from: clickedDate, to: null}; toastInfo('Pilih tarikh akhir'); }
    $('fromDate').value = state.range.from || '';
    $('toDate').value = state.range.to || '';
    highlightRangeTiles(); updateRangeCounter(); onRangeChange();
  } else {
    document.querySelectorAll('#grid .tile.sel').forEach(el=>el.classList.remove('sel'));
    tile.classList.add('sel');
    state.selectedDate=tile.dataset.date;
    $('pickedDate').value=state.selectedDate;
    toastInfo(`Tarikh dipilih: ${state.selectedDate}`);
  }
}
function onPickedDateChange(){
  state.selectedDate = $('pickedDate').value || null;
  if (!state.selectedDate) { highlightSelectedTile(); return; }
  const day = state.days.find(x=>x.date===state.selectedDate);
  if(day && day.status==='red'){ toastWarn('Tarikh ini penuh. Pilih tarikh lain.'); $('pickedDate').value=''; state.selectedDate=null; }
  highlightSelectedTile();
}
function highlightSelectedTile(){
  document.querySelectorAll('#grid .tile.sel').forEach(el=>el.classList.remove('sel'));
  if(!state.selectedDate) return;
  const el=document.querySelector(`#grid .tile[data-date="${state.selectedDate}"]`); if(el) el.classList.add('sel');
}
function highlightRangeTiles(){
  document.querySelectorAll('#grid .tile.range').forEach(el=>el.classList.remove('range'));
  if(!state.range.from || !state.range.to) return;
  let d = state.range.from;
  while (d <= state.range.to){
    const el=document.querySelector(`#grid .tile[data-date="${d}"]`); if(el) el.classList.add('range');
    d = addDaysYMD(d, 1);
  }
}
function onRangeChange(){
  state.range.from=$('fromDate').value||null; state.range.to=$('toDate').value||null;
  if(state.range.from && state.range.to && state.range.from > state.range.to){ toastWarn('Tarikh Dari mesti sebelum atau sama dengan Tarikh Hingga'); }
  highlightRangeTiles(); updateRangeCounter();
}
function updateRangeCounter(){
  if(!state.rangeMode){ $('rangeCounter').textContent=''; return;}
  let d=state.range.from, n=0; if(!state.range.from||!state.range.to){ $('rangeCounter').textContent='Akan ditempah: 0 hari bekerja'; return; }
  while(d<=state.range.to){
    const wk=[0,6].includes(new Date(d+'T00:00:00').getDay());
    const past=d<todayYMD();
    if(!wk && !past) n++;
    d=addDaysYMD(d,1);
  }
  $('rangeCounter').textContent=`Akan ditempah: ${n} hari bekerja`;
}

/* ========= Simpan tempahan ========= */
async function onBook(){
  const inputs = {
    room: $('roomSelect').value, start: toHHMM($('startTime').value), end: toHHMM($('endTime').value),
    category: $('category').value, note: $('note').value.trim(), nama: $('nama').value.trim(), sektor: $('sektor').value
  };
  if(!inputs.room){ markInvalid($('roomSelect')); return toastWarn('Sila pilih bilik'); }
  if(!inputs.start){ markInvalid($('startTime')); return toastWarn('Sila pilih masa mula'); }
  if(!inputs.end){ markInvalid($('endTime')); return toastWarn('Sila pilih masa tamat'); }
  if(!inputs.category){ markInvalid($('category')); return toastWarn('Sila pilih kategori'); }
  if(!inputs.note){ markInvalid($('note')); return toastWarn('Isi tujuan / ringkasan'); }
  if(!inputs.sektor){ markInvalid($('sektor')); return toastWarn('Sila pilih sektor'); }
  if(!inputs.nama){ markInvalid($('nama')); return toastWarn('Sila pilih nama penempah'); }

  const ok = await modalConfirm('Sahkan tempahan?', state.rangeMode ? 'Anda akan merekod tempahan berturut mengikut julat tarikh.' : 'Anda akan merekod satu tempahan pada tarikh dipilih.');
  if(!ok) return;

  $('btnBook').disabled = true;
  modalLoading('Menyimpan tempahan...');
  try {
    if (state.rangeMode) {
      const startDate = $('fromDate').value;
      const endDate   = $('toDate').value;
      if (!startDate){ modalClose(); markInvalid($('fromDate')); return toastWarn('Isi Tarikh Dari'); }
      if (!endDate){ modalClose(); markInvalid($('toDate')); return toastWarn('Isi Tarikh Hingga'); }
      const res = await createBookingRange({ ...inputs, startDate, endDate });
      modalClose(); toastOk(`Disimpan: ${res.created|0} hari`);
    } else {
      const date = $('pickedDate').value;
      if (!date){ modalClose(); markInvalid($('pickedDate')); return toastWarn('Pilih Tarikh Dipilih'); }
      await createBooking({ ...inputs, date });
      modalClose(); toastOk('Tempahan disimpan');
    }
    if(state.room) await refreshMonth(false);
    await loadOverview(false);
  } catch(err){
    modalClose(); modalError('Gagal menyimpan', err.message);
  } finally {
    $('btnBook').disabled = false;
  }
}

/* ========= Rumusan ========= */
async function loadOverview(showLoading){
  try{
    if(showLoading) modalLoading('Memuat rumusan...');
    ov.days = []; 
    ov.bookings = [];

    if (ov.view === 'calendar') {
      const res = await getMonthRoomsOverview({ year: ov.year, month: ov.month });
      ov.days = Array.isArray(res.days) ? res.days : [];
    } else {
      const res = await getMonthBookingsList({ year: ov.year, month: ov.month });
      ov.bookings = Array.isArray(res.items) ? res.items : [];
    }
    renderOverview();
    if(showLoading){ modalClose(); toastOk('Rumusan dikemas kini'); }
  }catch(err){ 
    if(showLoading) modalClose(); 
    // Lempar ralat ke atas supaya 'bootstrap' boleh tangkap (untuk detektor GovNet)
    throw err;
  }
}
function switchOverviewView(view){
  ov.view = (view === 'table') ? 'table' : 'calendar';
  $('btnViewCalendar').classList.toggle('active', ov.view==='calendar');
  $('btnViewTable').classList.toggle('active', ov.view==='table');
  $('ovCalendarWrap').style.display = ov.view==='calendar' ? 'block' : 'none';
  $('ovTableWrap').style.display = ov.view==='table' ? 'block' : 'none';

  const calDataLoaded = ov.days && ov.days.length > 0;
  const tableDataLoaded = ov.bookings && ov.bookings.length > 0;

  if (ov.view === 'calendar' && !calDataLoaded) {
    loadOverview(true).catch(err => modalError('Gagal memuat', err.message));
  } else if (ov.view === 'table' && !tableDataLoaded) {
    loadOverview(true).catch(err => modalError('Gagal memuat', err.message));
  } else {
    renderOverview();
  }
}
function renderOverview(){
  if (ov.view === 'calendar') { 
    renderOvCalendar(); 
    renderOvSummary(); 
  } else { 
    renderOvTable(); 
    $('ovSummaryWrap').style.display='none';
  }
}

/* === [KEMASKINI] Paparan Rumusan yang lebih padat === */
function renderOvCalendar(){
  const grid = $('ovGrid'); grid.innerHTML='';
  const lastDayOfMonth = new Date(ov.year, ov.month, 0).getDate();
  const firstDow = (new Date(ov.year, ov.month - 1, 1).getDay() + 6) % 7; // 0=Isnin
  for(let i=0;i<firstDow;i++){ const x=document.createElement('div'); x.className='blank'; grid.appendChild(x); }
  const dayMap = new Map((ov.days||[]).map(d => [d.date, d]));
  
  for(let d=1; d<=lastDayOfMonth; d++){
    const ymd = `${ov.year}-${pad2(ov.month)}-${pad2(d)}`;
    const dayData = dayMap.get(ymd);
    const tile = document.createElement('div'); tile.className = 'tile';
    
    // Header Tarikh
    const top = document.createElement('div'); top.className='date'; top.textContent = d;
    
    // KEMASKINI: Guna Badge (Pills) bukannya teks panjang
    if (dayData && (dayData.counts?.red || dayData.counts?.orange)) {
      const div = document.createElement('div'); div.className='cnt-group';
      // Hanya tunjuk jika nilai > 0 untuk lebih kemas
      if(dayData.counts.red > 0) div.innerHTML += `<span class="cnt-pill red">P:${dayData.counts.red}</span>`;
      if(dayData.counts.orange > 0) div.innerHTML += `<span class="cnt-pill orange">S:${dayData.counts.orange}</span>`;
      top.appendChild(div);
    }
    
    tile.appendChild(top);
    
    const body = document.createElement('div'); body.className='body';
    if (dayData?.rooms?.length){
      const list = document.createElement('div'); list.className='listRooms';
      dayData.rooms.forEach(it=>{
        const pill = document.createElement('span'); pill.className = `pill ${it.status}`; pill.textContent = it.room; list.appendChild(pill);
      });
      body.appendChild(list);
    }
    tile.appendChild(body);
    grid.appendChild(tile);
  }
}
function renderOvSummary(){
  const list = $('ovSummaryList'); list.innerHTML='';
  const counter = new Map();
  (ov.days||[]).forEach(d=> (d.rooms||[]).forEach(r=> counter.set(r.room, (counter.get(r.room)||0) + 1)));
  const rows = ROOM_OPTIONS
    .map(room => [room, counter.get(room)||0])
    .sort((a,b)=> (b[1]-a[1]) || a[0].localeCompare(b[0],'ms'));
  list.innerHTML = rows.map(([room,c])=> `• ${room} (${c} tempahan)`).join('<br>');
  $('ovSummaryWrap').style.display='block';
}
function renderOvTable(){
  const tbody = $('ovTableBody'); tbody.innerHTML='';
  const bookings = ov.bookings || []; 
  const filtered = ov.filterRoom ? bookings.filter(b => b.room === ov.filterRoom) : bookings;
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:16px;" class="small">Tiada tempahan ditemui untuk bulan ini.</td></tr>';
    return;
  }
  const frag = document.createDocumentFragment();
  filtered.forEach(b => { 
    const tr = document.createElement('tr'); 
    tr.innerHTML = `
      <td>${b.date || ''}</td>
      <td>${toHHMM(b.start)}–${toHHMM(b.end)}</td>
      <td>${escapeHtml(b.room || '')}</td>
      <td>${escapeHtml(b.note || '')}</td>
      <td>${escapeHtml(b.nama || '')}<div class="small">${escapeHtml(b.sektor || '')}</div></td>
    `; 
    frag.appendChild(tr); 
  });
  tbody.appendChild(frag);
}

/* ========= Admin ========= */
async function onAdminLogin(){
  const { value: pw } = await Swal.fire({ title:'Kata laluan pentadbir', input:'password', inputPlaceholder:'Masukkan kata laluan', inputAttributes:{autocapitalize:'off',autocorrect:'off'}, confirmButtonText:'Sahkan', showCancelButton:true });
  if (!pw) return;
  modalLoading('Mengesahkan akses...');
  try{
    const chk = await adminCheck(pw); modalClose();
    if (chk?.ok) { ADMIN_PASSWORD = pw; unlockAdmin(); toastOk('Akses pentadbir diaktifkan'); }
    else { Toast.fire({icon:'error', title:'Kata laluan salah'}); }
  }catch(err){ modalClose(); modalError('Gagal log masuk', err.message); }
}
async function loadAdminUpcoming(){
  const room = $('adminRoom').value;
  if(!state.isAdmin){ return toastWarn('Log masuk pentadbir dahulu'); }
  if(!room){ $('adminList').innerHTML='<div class="small">Sila pilih bilik untuk memuatkan senarai tempahan akan datang.</div>'; state.adminItems=[]; return; }
  $('adminList').innerHTML='<div class="small">Memuatkan data...</div>';
  try{
    const res = await listUpcomingBookings({ room });
    state.adminItems = res.items || [];
    const items = state.adminItems;
    if(!items.length){ $('adminList').innerHTML='<div class="small">Tiada tempahan akan datang untuk bilik ini.</div>'; return; }
    const html = ['<table><thead><tr><th style="width:34px"><input type="checkbox" id="chkAll"></th><th style="width:120px">Tarikh</th><th style="width:120px">Masa</th><th>Bilik</th><th style="width:160px">Kategori</th><th>Tujuan</th><th style="width:160px">Penempah</th><th style="width:40px">Tind.</th></tr></thead><tbody>'];
    for(const it of items){
      html.push(`<tr>
        <td><input type="checkbox" class="chkCancel" data-id="${it.id}"></td>
        <td>${it.date}</td>
        <td>${toHHMM(it.start)}–${toHHMM(it.end)}</td>
        <td>${it.room||''}</td>
        <td>${it.category||''}</td>
        <td>${escapeHtml(it.note||'')}</td>
        <td>${escapeHtml(it.nama||'')}<div class="small">${it.sektor||''}</div></td>
        <td><button class="btn-icon" data-id="${it.id}" title="Edit Tempahan">✏️</button></td>
      </tr>`);
    }
    html.push('</tbody></table>');
    $('adminList').innerHTML = html.join('');
    $('chkAll').addEventListener('change', e=> document.querySelectorAll('.chkCancel').forEach(cb=> cb.checked=e.target.checked));
    toastOk('Senarai dimuat');
  }catch(err){
    $('adminList').innerHTML='<div class="small" style="color:#dc2626">Gagal memuatkan data.</div>';
    state.adminItems=[];
    modalError('Ralat memuat senarai', err.message);
  }
}
async function onBulkCancel(){
  if(!state.isAdmin){ return toastWarn('Log masuk pentadbir dahulu'); }
  const checks=[...document.querySelectorAll('.chkCancel:checked')];
  if(!checks.length) return toastInfo('Tiada tempahan dipilih untuk dibatalkan');
  const ids = checks.map(x=>x.dataset.id);
  const { value: reason } = await Swal.fire({ title:'Sebab Pembatalan?', input:'text', inputPlaceholder:'Contoh: Pertindihan acara', showCancelButton:true, inputValidator: v=>!v && 'Sebab pembatalan wajib diisi.' });
  if (!reason) return;
  const ok = await modalConfirm('Sahkan pembatalan?', `Anda akan membatalkan ${ids.length} tempahan terpilih.`); if(!ok) return;
  modalLoading('Melaksanakan pembatalan...');
  try{
    const res = await batalTempahanBulk({ ids, reason, adminPassword: ADMIN_PASSWORD });
    modalClose(); toastOk(`Dibatalkan: ${res.updated} tempahan`);
    await loadAdminUpcoming(); if(state.room) await refreshMonth(false); await loadOverview(false);
  }catch(err){ modalClose(); modalError('Gagal membatalkan', err.message); }
}
function onAdminListClick(ev) {
  const btn = ev.target.closest('button.btn-icon[data-id]');
  if (!btn) return;
  if (!state.isAdmin) return toastWarn('Sila log masuk dahulu.');
  const id = btn.dataset.id;
  const bookingData = state.adminItems.find(item => String(item.id) === id);
  if (bookingData) { openEditModal(bookingData); } else { toastWarn('Data tempahan tidak ditemui.'); }
}
async function openEditModal(bookingData) {
  const createOptions = (list, selected) => list.map(item => `<option value="${escapeHtml(item)}" ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('');
  const sektorList = Object.keys(NAMA_MENGIKUT_SEKTOR);
  const sektorOptions = createOptions(sektorList, bookingData.sektor);
  const { value: formValues } = await Swal.fire({
    title: 'Edit Tempahan',
    html: `
      <div class="swal-form">
        <div>
          <label>Tarikh</label>
          <input id="swal-date" type="date" class="swal2-input" value="${escapeHtml(bookingData.date)}">
        </div>
        <div>
          <label>Kategori</label>
          <select id="swal-category" class="swal2-input">
            ${createOptions(CATEGORY_OPTIONS, bookingData.category)}
          </select>
        </div>
        <div>
          <label>Masa Mula</label>
          <input id="swal-start" type="time" class="swal2-input" step="1800" value="${escapeHtml(toHHMM(bookingData.start))}">
        </div>
        <div>
          <label>Masa Tamat</label>
          <input id="swal-end" type="time" class="swal2-input" step="1800" value="${escapeHtml(toHHMM(bookingData.end))}">
        </div>
        <div class="full-width">
          <label>Tujuan / Ringkasan</label>
          <input id="swal-note" type="text" class="swal2-input" value="${escapeHtml(bookingData.note)}" placeholder="Tujuan / Ringkasan">
        </div>
        <div>
          <label>Sektor</label>
          <select id="swal-sektor" class="swal2-input">
            <option value="">— Pilih Sektor —</option>
            ${sektorOptions}
          </select>
        </div>
        <div>
          <label>Nama Penempah</label>
          <select id="swal-nama" class="swal2-input" disabled>
            <option value="">— Pilih sektor dahulu —</option>
          </select>
        </div>
      </div>
    `,
    width: 700,
    confirmButtonText: 'Kemas Kini',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    didOpen: () => {
      const sektorSel = document.getElementById('swal-sektor');
      const namaSel = document.getElementById('swal-nama');
      const populateSwalNama = () => {
        const sek = sektorSel.value;
        const list = NAMA_MENGIKUT_SEKTOR[sek];
        namaSel.innerHTML = '';
        if (!sek || !list) {
          namaSel.add(new Option('— Pilih sektor dahulu —', ''));
          namaSel.disabled = true;
        } else {
          namaSel.disabled = false;
          namaSel.add(new Option('— Pilih nama —', ''));
          list.forEach(n => namaSel.add(new Option(n, n)));
        }
      };
      sektorSel.addEventListener('change', populateSwalNama);
      populateSwalNama();
      namaSel.value = bookingData.nama || '';
      if(namaSel.selectedIndex === -1) namaSel.selectedIndex = 0;
    },
    preConfirm: () => {
      const data = {
        date: document.getElementById('swal-date').value,
        start: document.getElementById('swal-start').value,
        end: document.getElementById('swal-end').value,
        category: document.getElementById('swal-category').value,
        note: document.getElementById('swal-note').value,
        sektor: document.getElementById('swal-sektor').value,
        nama: document.getElementById('swal-nama').value
      };
      if (!data.date || !data.start || !data.end || !data.category || !data.note || !data.sektor || !data.nama) {
        Swal.showValidationMessage('Semua medan wajib diisi');
        return false;
      }
      return data;
    }
  });

  if (formValues) {
    modalLoading('Mengemas kini tempahan...');
    try {
      await updateBooking({
        ...formValues,
        id: bookingData.id,
        adminPassword: ADMIN_PASSWORD
      });
      modalClose();
      toastOk('Tempahan berjaya dikemas kini');
      await loadAdminUpcoming();
      if (state.room) await refreshMonth(false);
      await loadOverview(false);
    } catch (err) {
      modalClose();
      modalError('Gagal Kemas Kini', err.message);
    }
  }
}