/* ============================================================
   ResQTh · script.js  (plain script, no modules, one file)
   Sections: 1 DATA · 2 HELPERS · 3 FR-4 PARSER · 4 STATE · 5 LANGUAGE (Thai/English) · 6 SAM'S PHONE (FR-1, FR-2, FR-4, FR-3 routing, nearby)
             7 FR-3 CASE PACK · 8 FR-5 SHARE SHEET · 9 FR-5 ALEX'S PHONE · 10 ACTIONS · 11 TIMERS
   A comment above each block says which requirement (FR-x / NFR-x) it serves.
   ============================================================ */

/* ############################################################
   SECTION 1 · DATA · sample content used by every screen (SRS: all data is sample data, NFR-8 verify before real use)
   ############################################################ */
// FR-2 categories: label, short label, icon, urgency (high/low) + FR-4 starter keywords. 9 categories (5 original + fire, disaster, water, animal)
var CATS={
  medical:{label:'Medical emergency',short:'Medical',icon:'hosp',urgency:'high',kw:['accident','crash','collision','injur','hurt','bleed','blood','unconscious','heart attack','chest pain','ambulance','overdose','drown','allergic','seizure','faint','อุบัติเหตุ','เจ็บ','เลือด','รถพยาบาล','หัวใจ','ไม่รู้สึกตัว','หมดสติ']},
  police:{label:'Police / crime',short:'Police',icon:'police',urgency:'high',kw:['assault','attack','robbed','robbery','mugged','weapon','knife','gun','threat','being followed','break-in','broke into','โดนทำร้าย','ปล้น','อาวุธ','โจร','คุกคาม']},
  passport:{label:'Lost passport',short:'Lost passport',icon:'imm',urgency:'low',kw:['passport','พาสปอร์ต','หนังสือเดินทาง']},
  theft:{label:'Theft (non-violent)',short:'Theft',icon:'bag',urgency:'low',kw:['stolen','stole','steal','theft','pickpocket','snatch','lost my wallet','lost my phone','ขโมย','ล้วง','ฉกกระเป๋า','กระเป๋าหาย']},
  tourist:{label:'Tourist Police',short:'Tourist Police',icon:'tour',urgency:'high',kw:['scam','overcharg','rip off','ripped off','cheated','taxi','tuk-tuk','tuk tuk','tour guide','tourist police','ถูกหลอก','โกง','แท็กซี่','ตำรวจท่องเที่ยว']},
  fire:{label:'Fire or gas leak',short:'Fire',icon:'fire',urgency:'high',kw:['fire','smoke','gas leak','explosion','ไฟไหม้','เพลิงไหม้','แก๊สรั่ว']},
  disaster:{label:'Earthquake or natural disaster',short:'Disaster',icon:'quake',urgency:'high',kw:['earthquake','flood','tsunami','landslide','storm','แผ่นดินไหว','น้ำท่วม','สึนามิ']},
  water:{label:'Water rescue',short:'Water rescue',icon:'wave',urgency:'high',kw:['drown','rip current','capsized','จมน้ำ','เรือล่ม']},
  animal:{label:'Animal bite or sting',short:'Animal bite',icon:'paw',urgency:'high',kw:['snake','bitten','stung','jellyfish','งูกัด','สุนัขกัด']}
};
// FR-4 parser order for ties: urgent categories first
var CAT_ORDER=['medical','police','fire','disaster','water','animal','passport','theft','tourist'];
// FR-2 order of the category buttons (home grid, filter chips, edit chips)
var CAT_LIST=['medical','police','fire','disaster','water','animal','tourist','passport','theft'];
// FR-1 supported provinces · covered:false = no local record, so national hotlines are shown (FR-3 AC4)
var PROVS=[
 {id:'bangkok',en:'Bangkok',th:'กรุงเทพมหานคร',covered:true,alias:['bangkok','bkk','krung thep maha nakhon','กรุงเทพ','sukhumvit','khao san','silom','sathorn','siam','suvarnabhumi','don mueang']},
 {id:'phuket',en:'Phuket',th:'ภูเก็ต',covered:true,alias:['phuket','ภูเก็ต','patong','karon','kata','rawai','ป่าตอง']},
 {id:'cm',en:'Chiang Mai',th:'เชียงใหม่',covered:true,alias:['chiang mai','chiangmai','เชียงใหม่','nimman','nimmanhaemin','old city','doi suthep']},
 {id:'chon',en:'Chonburi (Pattaya)',th:'ชลบุรี (พัทยา)',covered:true,alias:['pattaya','chonburi','chon buri','พัทยา','ชลบุรี','jomtien','walking street','naklua','bang saen','บางแสน','sriracha']},
 {id:'krabi',en:'Krabi',th:'กระบี่',covered:true,alias:['krabi','ao nang','กระบี่','railay','koh lanta','ko lanta']},
 {id:'surat',en:'Surat Thani (Samui)',th:'สุราษฎร์ธานี (สมุย)',covered:true,alias:['samui','surat thani','สมุย','สุราษฎร์','koh samui','ko samui','chaweng','lamai','koh phangan','ko phangan','koh tao','ko tao','เกาะสมุย','เกาะพะงัน','เกาะเต่า']},
 {id:'cr',en:'Chiang Rai',th:'เชียงราย',covered:false,alias:['chiang rai','chiangrai','เชียงราย']},
 {id:'ayut',en:'Ayutthaya',th:'พระนครศรีอยุธยา',covered:false,alias:['ayutthaya','อยุธยา']},
 {id:'nan',en:'Nan',th:'น่าน',covered:false,alias:['nan','น่าน']},
 {id:'loei',en:'Loei',th:'เลย',covered:false,alias:['loei','เลย']}
];
// FR-1 sample coordinates per province (fallback only when there is no real GPS fix)
var COORD={bangkok:[13.7563,100.5018],phuket:[7.8804,98.3923],cm:[18.7883,98.9853],chon:[12.9236,100.8825],krabi:[8.0863,98.9063],surat:[9.5120,100.0136],cr:[19.9072,99.8310],ayut:[14.3532,100.5689],nan:[18.7756,100.7730],loei:[17.4860,101.7223]};
// FR-2 / FR-3 hotline numbers per category, main number first (sample data, NFR-8: verify against official sources)
var NUMBERS={
 medical:[['1669','Ambulance · emergency medical service'],['191','Police · if there was a crash or crime']],
 police:[['191','Police · national emergency line'],['1155','Tourist Police · English-speaking help']],
 tourist:[['1155','Tourist Police · English-speaking help'],['191','Police · national emergency line']],
 passport:[['1155','Tourist Police · ask for a police report'],['1178','Immigration Bureau hotline']],
 theft:[['1155','Tourist Police · ask for a police report'],['191','Police · national emergency line']],
 fire:[['199','Fire and rescue service'],['1669','Ambulance · if anyone is hurt'],['191','Police · national emergency line']],
 disaster:[['1784','Disaster Prevention and Mitigation hotline'],['191','Police · national emergency line'],['1669','Ambulance · if anyone is hurt'],['199','Fire and rescue service']],
 water:[['1669','Ambulance · emergency medical service'],['1196','Water accident reporting'],['191','Police · national emergency line']],
 animal:[['1669','Ambulance · emergency medical service'],['199','Fire and rescue · will remove a snake or wild animal']]
};
// FR-2 general hotline list (when no filter is active)
var GENERAL=[['191','Police · national emergency line'],['1669','Ambulance · emergency medical service'],['199','Fire and rescue service'],['1155','Tourist Police · English-speaking help']];
// FR-3 high urgency: Thai sentence + English meaning shown to a local person
var THAI_CARD={
 medical:['ช่วยด้วย ฉันเป็นชาวต่างชาติ ต้องการรถพยาบาลด่วน','Help. I am a foreigner and I need an ambulance now.'],
 police:['ฉันตกอยู่ในอันตราย ช่วยโทรเรียกตำรวจให้หน่อย','I am in danger. Please call the police.'],
 tourist:['ฉันเป็นนักท่องเที่ยว ต้องการความช่วยเหลือจากตำรวจท่องเที่ยว','I am a tourist and I need help from the Tourist Police.'],
 fire:['ไฟไหม้ ช่วยโทรเรียกรถดับเพลิงให้หน่อย','There is a fire. Please call the fire service.'],
 disaster:['เกิดภัยพิบัติ ฉันเป็นชาวต่างชาติ ช่วยบอกทางไปที่หลบภัยที่ปลอดภัยหน่อย','There is a disaster. I am a foreigner. Please show me the way to a safe shelter.'],
 water:['มีคนตกน้ำหรือจมน้ำ ช่วยโทรเรียกรถพยาบาลและหน่วยกู้ภัยด่วน','Someone is in the water and may be drowning. Please call an ambulance and rescue now.'],
 animal:['ฉันถูกสัตว์กัดหรือต่อย ต้องไปโรงพยาบาลด่วน','I was bitten or stung by an animal. I need to go to a hospital now.']
};
// FR-5 concept demo only: name of the responding unit
var UNIT={medical:'Ambulance',police:'Police unit',tourist:'Tourist Police unit',fire:'Fire engine',disaster:'Rescue team',water:'Water rescue unit',animal:'Ambulance'};
// FR-5 selectable trusted contacts
var CONTACTS=[{id:'alex',name:'Alex',sub:'Friend'},{id:'nok',name:'Nok',sub:'Hotel front desk'}];
// FR-3 low urgency: items the user can mark as missing (EN, Thai, sentence word)
var ITEMS=[['passport','Passport','หนังสือเดินทาง','passport'],['phone','Phone','โทรศัพท์มือถือ','phone'],['wallet','Wallet and bank cards','กระเป๋าสตางค์และบัตรธนาคาร','wallet and bank cards'],['bag','Bag','กระเป๋าถือ','bag'],['cash','Cash','เงินสด','cash']];
// FR-3 low urgency: when it happened
var WHENS=[['now','Just now','เมื่อสักครู่นี้','just now'],['today','Earlier today','เมื่อวันนี้','earlier today'],['yest','Yesterday','เมื่อวานนี้','yesterday'],['days','A few days ago','เมื่อไม่กี่วันที่ผ่านมา','a few days ago']];
// FR-3 Thai month names for the generated Thai statement
var TH_MON=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
var EN_MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DOW={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
var DOW_NAME=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
// FR-3 sample office opening hours used in the action plan (sample data)
var EMB={days:[1,2,3,4,5],open:[8,30],close:[16,30]};
// FR-5 demo clock starts at 14:30:00
var BASE=14*3600+30*60;


/* ############################################################
   SECTION 2 · HELPERS · small utilities: DOM, escaping, icons, Bangkok time, dates, opening hours, copy-to-clipboard
   ############################################################ */
function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function two(n){return (n<10?'0':'')+n}
function prov(id){return PROVS.filter(function(p){return p.id===id})[0]}
function toast(m){var t=$('toast');t.textContent=(typeof S!=='undefined'&&S.lang==='th')?trSeg(m):m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},3200)}
// Icon set (inline SVG, colour from currentColor so it follows the tokens)
var I={
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg>',
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
};
function clk(t){var s=Math.floor(BASE+t);return two(Math.floor(s/3600)%24)+':'+two(Math.floor(s/60)%60)}
function dur(sec){sec=Math.max(0,Math.ceil(sec));var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h>0?h+':'+two(m)+':'+two(s):m+':'+two(s)}
// Bangkok-time helper (opening hours, case pack)
function bkk(ms){
  var f=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',weekday:'short',day:'numeric',month:'numeric',year:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23'});
  var o={};f.formatToParts(new Date(ms)).forEach(function(x){o[x.type]=x.value});
  return {wd:o.weekday,dow:DOW[o.weekday],d:+o.day,m:+o.month,y:+o.year,h:+o.hour,mi:+o.minute};
}
function enDate(t){return t.wd+' '+t.d+' '+EN_MON[t.m-1]}
function enDateTime(t){return enDate(t)+', '+two(t.h)+':'+two(t.mi)}
function thDate(t){return t.d+' '+TH_MON[t.m-1]+' พ.ศ. '+(t.y+543)}
function listEn(a){return a.length<2?a[0]:a.slice(0,-1).join(', ')+' and '+a[a.length-1]}
function listTh(a){return a.length<2?a[0]:a.slice(0,-1).join(', ')+' และ'+a[a.length-1]}
// FR-3 "open now / closes at" text for the action plan
function hoursStatus(h){
  var t=bkk(Date.now()),mins=t.h*60+t.mi;
  if(h.h24)return {open:true,text:'Open 24 hours'};
  var o=h.open[0]*60+h.open[1],c=h.close[0]*60+h.close[1];
  if(h.days.indexOf(t.dow)>-1&&mins>=o&&mins<c)return {open:true,text:'Open now, closes '+two(h.close[0])+':'+two(h.close[1])};
  for(var i=0;i<8;i++){var d=(t.dow+i)%7;
    if(h.days.indexOf(d)>-1&&(i>0||mins<o)){return {open:false,text:'Closed now, opens '+(i===0?'today':i===1?'tomorrow':DOW_NAME[d])+' '+two(h.open[0])+':'+two(h.open[1])}}}
  return {open:false,text:'Closed'};
}
// FR-3 copy the Thai/English statement to the clipboard
function copyText(txt){
  function fb(){var ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('Copied')}catch(e){toast('Could not copy. Select the text and copy it.')}document.body.removeChild(ta)}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){toast('Copied')},fb)}else fb();
}


/* ############################################################
   SECTION 3 · FR-4 · RULE-BASED incident parser (English/Thai keywords, typo tolerance, danger-first rule). No LLM. The result is only a suggestion the user can correct
   ############################################################ */
function ascii(s){return /^[a-z0-9\- ]+$/.test(s)}
function rx(s,full){return new RegExp('\\b'+s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+(full?'\\b':''),'i')}
function find(text,term,full){
  if(ascii(term)){var m=rx(term,full).exec(text);return m?[m.index,m.index+m[0].length]:null}
  var i=text.toLowerCase().indexOf(term);return i<0?null:[i,i+term.length];
}
/* ---- Wider reader: many words, phrases, typos, Thai, and a danger-first rule ---- */
// FR-4 keyword lists per category (English + Thai). "=word" means whole word only
var KW={
 medical:['accident','crash','collision','hit by a car','hit by car','hit and run','hit-and-run','run over','ran over','knocked down','fell off','fell down','fall off','fell from','broke my','broken leg','broken arm','broken bone','broken ankle','broken rib','broken wrist','broken nose','fracture','dislocat','sprain','twisted ankle','swollen','injur','hurt','=pain','bleed','=blood','nosebleed','wound','gash','deep cut','cut my','cut myself','stitches','=burn','scald','electrocut','unconscious','unresponsive','not responding','passed out','fainted','faint','lightheaded','blacked out','black out','knocked out','collapse','head injury','concussion','not breathing','cannot breathe',"can't breathe",'cant breathe','choking','choked','heart attack','chest pain','stroke','seizure','epilep','asthma','inhaler','diabet','insulin','allerg','anaphyla','overdos','too many pills','poison','food poisoning','alcohol poisoning','diarrh','dehydrat','heat stroke','heatstroke','sunstroke','dizzy','vomit','fever','feel sick','feeling sick','got sick','infection','=rash','=bite','bitten','stung','jellyfish','sea urchin','scorpion','centipede','=snake','monkey bit','dog bit','drown','riptide','rip current','struggling in the water','diving accident','decompression','pregnan','labour pains','labor pains','contractions','miscarriage','first aid','=cpr','paramedic','ambulance','need a doctor','need medical','medical help','medical emergency','hospital','emergency room','clinic','dying','อุบัติเหตุ','รถชน','ชนกัน','ชนแล้วหนี','เจ็บ','ปวด','เลือด','เลือดออก','เลือดกำเดา','แผล','แผลลึก','มีดบาด','ข้อเท้าพลิก','ข้อเท้าแพลง','บวม','ติดเชื้อ','ผื่น','สุนัขกัด','หมากัด','ลิงกัด','แมงป่อง','ตะขาบ','แมงกะพรุน','งูกัด','ถูกกัด','ต่อย','อาหารเป็นพิษ','ท้องเสีย','ลมแดด','หอบหืด','เบาหวาน','ลมชัก','ชัก','แพ้','หัวใจ','หัวใจวาย','อัมพาต','อัมพฤกษ์','หมดสติ','สลบ','เป็นลม','หน้ามืด','ไม่ตอบสนอง','หายใจไม่ออก','ไม่หายใจ','หัวแตก','ศีรษะกระแทก','กระดูกหัก','กระดูกร้าว','ข้อหลุด','ไฟดูด','ไฟช็อต','จมน้ำ','น้ำร้อนลวก','ไฟลวก','พลัดตก','ตกจาก','ล้ม','ท้องแก่','เจ็บท้องคลอด','แท้ง','กินยาเกินขนาด','ยาเกินขนาด','เมาหนัก','ไข้','อาเจียน','ป่วย','ปฐมพยาบาล','เรียกรถพยาบาล','รถพยาบาล','โรงพยาบาล','หาหมอ','ต้องการหมอ','คลินิก','hospital','accident'],
 police:['assault','attack','beaten','beat me','beaten up','punched','hit me','robbed','robbery','mugged','mugging','held up','gunpoint','knifepoint','weapon','knife','stabbed','=gun','gunshot','shots fired','shooting','shot at','threat','being followed','followed me','following me','chased','chasing me','stalk','harass','sexual','=rape','raped','molest','grope','touched me','inappropriate','flasher','peeping','hidden camera','spy cam','kidnap','abduct','human trafficking','traffick','missing child','lost child','lost my kid','lost my daughter','lost my son','missing person','missing friend','break-in','break in','broke into my room','broke into my house','intruder','burglar','someone in my room','drugged','spiked','roofied','blackmail','extort','shakedown','ransom','hostage','bomb','explosion','riot','brawl','bar fight','fight','violen','domestic','abuse','arrest','detained','detention','=jail','=bribe','corrupt','fake police','fake cop','impersonat','police report','report a crime','traffic accident','vehicle accident','fender bender','minor accident','damaged my car','vandal','trespass','murder','dead body','suspicious','drunk driver','drunk man','drunk guy','โดนทำร้าย','ทำร้าย','ถูกทุบตี','ทุบตี','ปล้น','จี้','วิ่งราว','มีด','ปืน','เสียงปืน','ยิง','แทง','อาวุธ','ข่มขู่','ขู่','ตามติด','ตามผม','ตามฉัน','ถูกตาม','ไล่ตาม','คุกคาม','ล่วงละเมิด','ลวนลาม','ข่มขืน','แอบถ่าย','กล้องแอบถ่าย','วางยา','ยาเสพติด','ลักพา','เด็กหาย','ลูกหาย','คนหาย','ค้ามนุษย์','ตำรวจปลอม','แบล็กเมล์','ระเบิด','จลาจล','ทะเลาะวิวาท','ทะเลาะ','ชกต่อย','เมาแล้วขับ','บุกรุก','ย่องเบา','งัดบ้าน','ผู้บุกรุก','ความรุนแรงในครอบครัว','ถูกจับ','ตามมา','ถูกคนตาม','โดนตาม','จับกุม','สินบน','รีดไถ','ฆ่า','ศพ','ตำรวจ'],
 passport:['passport','visa','overstay','immigration','extend my visa','visa run','=tm30','90 day','90-day','work permit','entry stamp','exit stamp','arrival card','departure card','embassy','consulate','travel document','residence permit','พาสปอร์ต','หนังสือเดินทาง','วีซ่า','ต่อวีซ่า','เกินวีซ่า','โอเวอร์สเตย์','สถานทูต','สถานกงสุล','ใบอนุญาตทำงาน'],
 theft:['stolen','stole','steal','stealing','thief','thieves','theft','pickpocket','snatch','grabbed my','took my','slashed my bag','car broken into','broke into my car','motorbike stolen','scooter stolen','bike stolen','hotel room theft','safe broken','lost wallet','lost phone','lost bag','lost luggage','lost baggage','luggage missing','missing bag','missing wallet','missing phone','missing cash','left in the taxi','left in a taxi','left on the bus','left at the airport','forgot my bag','atm ate','atm swallowed','card swallowed','card stolen','unauthori','credit card fraud','skimm','ขโมย','โดนขโมย','ล้วงกระเป๋า','ล้วง','ฉกกระเป๋า','ฉกชิง','ฉก','ตัดกระเป๋า','กรีดกระเป๋า','งัดรถ','รถถูกงัด','รถหาย','มอเตอร์ไซค์หาย','มอไซค์หาย','ห้องโดนขโมย','ตู้เซฟ','กระเป๋าหาย','กระเป๋าสตางค์หาย','กระเป๋าตังค์หาย','มือถือหาย','โทรศัพท์หาย','กระเป๋าเดินทางหาย','สัมภาระหาย','ลืมไว้บนรถ','ลืมไว้ในแท็กซี่','ลืมของ','ลืมกระเป๋า','ลืมมือถือ','บัตรหาย','บัตรถูกขโมย','ตู้เอทีเอ็มกลืนบัตร','บัตรโดนกลืน','ของหาย','ทรัพย์สินหาย','สูญหาย','ตกหาย'],
 tourist:['scam','overcharg','ripped off','rip off','rip-off','cheated','=cheat','fraud','fake','counterfeit','=tout','tuk-tuk','tuk tuk','tuktuk','taxi','=cab','grab driver','grab car','bolt driver','motorbike taxi','songthaew','=meter','=fare','tour guide','tour agency','tour company','=tour','island hopping','boat trip','jet ski','jetski','jet-ski','scooter rental','motorbike rental','car rental','rental shop','rental damage','damage deposit','kept my deposit','kept my passport','held my passport','refused to return','refund','overpriced','double charged','charged twice','charged me','charged more','forced me to pay','bar tab','menu price','fake ticket','ticket scam','gem scam','tailor','touts','tourist police','travel agent','visa agent','ถูกหลอก','หลอก','หลอกลวง','โกง','โกงเงิน','ราคาแพงเกิน','ขูดรีด','เอาเปรียบ','แท็กซี่','ตุ๊กตุ๊ก','มอเตอร์ไซค์รับจ้าง','สองแถว','แกร็บ','โบลท์','มิเตอร์','ค่าโดยสาร','ไกด์','ทัวร์','บริษัททัวร์','เจ็ตสกี','เช่ารถ','เช่ามอเตอร์ไซค์','ร้านเช่า','มัดจำ','ยึดพาสปอร์ต','ไม่คืนเงิน','คิดเงินแพง','เก็บเงินซ้ำ','ตั๋วปลอม','ของปลอม','ตำรวจท่องเที่ยว','นักท่องเที่ยว']
};
(function(){
 var drop={medical:['cut my'],police:['police report','วิ่งราว']};
 Object.keys(drop).forEach(function(c){KW[c]=KW[c].filter(function(t){return drop[c].indexOf(t)<0})});
 var add={
  medical:['labour','labor','in labor','giving birth','give birth','water broke','baby is coming','burned','burnt','got burn','scald','twisted my','twist my','headache','migraine','stomach ache','stomachache','stomach pain','belly pain','cramp','nausea','nauseous','short of breath','shortness of breath','wheez','convuls','paralys','numb','swelling','sunburn','blackout','acident','accidant','acsident','ambulence','ambulanse','hospitel','bleading','bleeeding','injuried','injurd','unconcious','unconscius','hurts','ตกบันได','ตกเตียง','ตกจากที่สูง','ตกจากรถ','ตกน้ำ','ตกหลุม','ไม่รู้สึกตัว','ไม่ได้สติ','เวียนหัว','มึนหัว','ปวดหัว','ขาหัก','แขนหัก','มือหัก','เท้าหัก','นิ้วหัก','ซี่โครงหัก','คอหัก','จมูกหัก','แน่นหน้าอก','น้ำคร่ำแตก','คลอด','เจ็บท้อง','ชักกระตุก','บาดเจ็บ','เลือดไหล','มีเลือด','หายใจลำบาก','ช็อก','หัวใจหยุด'],
  police:['broken into','got broken into','was broken into','forced the door','door was forced','someone entered my room','thief in my room','missing since','went missing','=police','โดนทำร้าย','ถูกคนร้าย','คนร้าย','ถูกงัด','โดนงัด','ห้องถูกงัด','มีคนบุกเข้า','บุกเข้า','หายตัวไป','เพื่อนหาย','สามีหาย','ภรรยาหาย','แฟนหาย','พ่อหาย','แม่หาย','ขอแจ้งตำรวจ','เรียกตำรวจ','แจ้งตำรวจ','ตามมาตั้งแต่','ถูกตามมา'],
  passport:['pasport','pasaport','passprot','passpord','travel visa','tourist visa','extend visa','visa extension','90 days report','พาสพอร์ต','พาสปอต','พาสสปอร์ต','พาสปอท','พาสปอร์ท','พาสปอรต','เอกสารเดินทาง','ต่อพาสปอร์ต','ทำพาสปอร์ต'],
  theft:['stollen','stoln','stolled','theif','theives','thiefs','robery','snached','pickpocet','วิ่งราว','ฉกชิง','ลักขโมย','ลักทรัพย์','ขโมยของ','ของหายไป','กระเป๋าถูกกรีด','กระเป๋าโดน','โทรศัพท์โดน','มือถือโดน','เงินหาย','ไอโฟนหาย'],
  tourist:['=tourist','travel scam','scammed','scamed','scammd','ripoff','overpriced','too expensive','hidden fee','hidden charge','extra charge','agreed price','price changed','blaming me','blame me','accused me','false claim','damaged the car','damage the car','=rental','rental company','=rented','wants me to pay','demanding','tour company','taxi meter','not using the meter','forced to pay','ต้มตุ๋น','ถูกต้ม','ฉ้อโกง','ไม่ยอมคืน','คืนเงิน','ขอเงินคืน','ค่าเสียหาย','เก็บเงินเพิ่ม','เรียกเงินเพิ่ม','คิดเงินเพิ่ม','โก่งราคา','แพงเกิน','ราคาแพง','ไม่ตรงปก','หลงทาง','ไม่รู้ทาง','ไม่รู้ว่าอยู่ที่ไหน','โดนหลอก','โดนโกง','เอาเปรียบ']
 };
 var more={
  medical:['slipped','slip and fall','tripped and fell','hit his head','hit her head','hit my head','hit the head','trapped','overturned','rolled over','capsized','swallowed','vomiting blood','coughing blood','dengue','weak and','sprained','cardiac','เฉี่ยว','สำลัก','หน้าเขียว','ตัวเขียว','ล้มลง','ลื่นล้ม','ลื่น','ลุกไม่ได้','เดินไม่ได้','ขยับไม่ได้','รถคว่ำ','รถพลิก','ติดอยู่ในรถ','อาเจียนเป็นเลือด','ไอเป็นเลือด','ไข้เลือดออก','หัวใจจะวาย'],
  police:['trying to open my door','knocking on my door','trying to enter','tried to enter','grabbed me','grabbed my arm','grabbed my hand','wont let go',"won't let go",'dragged me','pulled me','forced me','pushed me','shoved me','slapped','kicked','protection money','something in my drink','something in her drink','something in his drink','พยายามเปิดประตู','แอบมองเข้ามา','คนแปลกหน้า','พลัดหลง','หลงกับพ่อแม่','เด็กหลง','ลูกหลง','เด็กเดินหลง','รุมทำร้าย','ขู่จะฆ่า','เรียกเก็บค่าคุ้มครอง','ค่าคุ้มครอง'],
  passport:['leave the country','exit the country','cross the border','border run','exit permit','ออกนอกประเทศ','ข้ามแดน','ด่านชายแดน'],
  theft:['swiped','nicked','made off with','took off with','ran off with','แอบเอา','แอบหยิบ','แอบไป','หยิบไป'],
  tourist:['service charge','surcharge','added a fee','added a charge','not on the menu','not on the bill','no reservation','temple is closed','temple was closed','gem shop','gem store','jewelry shop','jewellery shop','cheap tour','free tour','special price','government office','instead of the temple','ร้านอัญมณี','ร้านเพชร','ร้านพลอย','ร้านของฝาก','บังคับให้ซื้อ','บังคับซื้อ','ค่าบริการ','ไม่ได้บอกไว้','บวกค่า','รถรับจ้าง','คนขับรถรับจ้าง','พาไปร้าน']
 };
 Object.keys(more).forEach(function(c){add[c]=add[c].concat(more[c])});
 var more2={
  medical:['turning blue','blue lips','lips are blue','blue face','droop','slurred','trouble speaking','cant speak','cannot speak','face drooping','electrocuted','electric shock','exposed to gas','อ่อนแรงครึ่งซีก','พูดไม่ชัด','ปากเบี้ยว','ริมฝีปากเขียว'],
  police:['exposing himself','exposed himself','flashing','pervert','=perv','indecent','naked man','masturbat','not let me out','locked me','locked the door','locked the doors','trapped me','held me','blocked my','blocked the road','surrounded','watching me','staring at me','spying on','selling drugs','sell drugs','drug dealer','=dealer','=drugs','=drug','cocaine','methamphetamine','ยาบ้า','ยาเสพติด','โชว์อวัยวะ','โรคจิต','ขังผม','ขังฉัน','ไม่ยอมให้ออก','ล็อกประตู','ล้อมเรา'],
  theft:['emptied','safe was opened','safe opened','hotel safe','lifted','pinched','ตู้เซฟโดน','ตู้เซฟถูก'],
  tourist:['long route','longer route','took a detour','wrong way','charge more','charge extra','charging more','timeshare','pressured me to buy','pressured to buy','forced to buy','hard sell','pushy','money exchange','currency exchange','exchange rate','gave me less','short changed','shortchanged','less than the rate','private boat','ferry is full','dive center','dive shop','ร้านแลกเงิน','แลกเงิน','เรท','น้อยกว่าเรท','ตัดบัตร']
 };
 Object.keys(more2).forEach(function(c){add[c]=add[c].concat(more2[c])});
 var more3={
  medical:['chest tight','tightness','sweating heavily','pass out','feel like fainting','gasping','gasp','purple','pale and sweating','sudden weakness','heavy sweating','เหงื่อแตก','ตัวเย็น','ปากม่วง'],
  police:['camera in my room','installed a camera','pull me into','pulled me into','into a van','into a car','dragged into','tried to grab','tried to take me','tried to kidnap','จับแขน','ไม่ปล่อย','จับมือฉัน','ลากตัว','ฉุด','บังคับขึ้นรถ'],
  passport:['ตรวจคนเข้าเมือง','สำนักงานตรวจคนเข้าเมือง','ตม.','ที่ตม'],
  theft:['cut the lock','broke the lock','bike lock'],
  tourist:['plastic','not real','not genuine','imitation','replica','knock off','knockoff','said it was real','palace is closed','palace was closed','closed today','took me elsewhere','took me to another','took me to a shop','never happened','never showed','never came','no one came','nobody came',"didn't show",'did not show','trip that never']
 };
 Object.keys(more3).forEach(function(c){add[c]=add[c].concat(more3[c])});
 Object.keys(add).forEach(function(c){KW[c]=KW[c].concat(add[c])});
})();
Object.keys(KW).forEach(function(c){var seen={};KW[c]=KW[c].filter(function(t){if(seen[t])return false;seen[t]=1;return true})});
/* ---- New categories (fire, disaster, water, animal). Words that used to sit under Medical are MOVED here so these categories can win ---- */
KW.fire=['=fire','on fire','caught fire','catch fire','set fire','burning down','burning building','building is burning','house is burning','room is burning','flames','=flame','=smoke','smell smoke','smoke from','gas leak','gas smell','smell gas','smells like gas','explosion','exploded','=blast','fire alarm','fire extinguisher','short circuit','sparks','electrical fire','car fire','wildfire','forest fire','ไฟไหม้','เพลิงไหม้','ไฟลุก','ไฟช็อต','ไฟฟ้าลัดวงจร','ควันไฟ','มีควัน','แก๊สรั่ว','ระเบิด','ดับเพลิง','ไฟไหม้ป่า','เกิดไฟ'];
KW.disaster=['earthquake','quake','tremor','aftershock','ground is shaking','ground shook','ground was shaking','building is shaking','building shook','everything is shaking','tsunami','tidal wave','flood','flooded','flooding','flash flood','water is rising','water rising','landslide','mudslide','mud slide','sinkhole','storm','typhoon','cyclone','hurricane','tornado','severe weather','natural disaster','=disaster','evacuat','แผ่นดินไหว','สั่นสะเทือน','ตึกสั่น','สึนามิ','คลื่นยักษ์','น้ำท่วม','น้ำป่า','ดินสไลด์','ดินถล่ม','โคลนถล่ม','พายุ','ภัยพิบัติ','อพยพ','ศูนย์พักพิง'];
KW.water=['drown','riptide','rip current','struggling in the water','diving accident','strong current','swept away','swept out to sea','undertow','capsized','boat sank','boat is sinking','sinking boat','boat accident','speedboat accident','jet ski accident','jetski accident','overboard','fell into the sea','fell in the sea','fell into the river','fell into the water','fell in the water','cant swim',"can't swim",'lost at sea','stranded at sea','scuba accident','snorkelling accident','snorkeling accident','จมน้ำ','ตกน้ำ','ตกทะเล','คลื่นดูด','กระแสน้ำ','เรือล่ม','เรือจม','เรือชน','พลัดตกน้ำ'];
KW.animal=['bitten','stung','jellyfish','sea urchin','scorpion','centipede','=snake','snake bite','snakebite','monkey bit','monkey bite','dog bit','dog bite','bit me','=sting','stingray','spider bite','bee sting','=wasp','hornet','rabies','rabid','cobra','viper','venom','box jellyfish','animal attack','สุนัขกัด','หมากัด','ลิงกัด','งูกัด','ถูกกัด','แมงกะพรุน','แมงป่อง','ตะขาบ','ผึ้งต่อย','แตนต่อย','พิษสุนัขบ้า'];
(function(){var gone={medical:['bitten','stung','jellyfish','sea urchin','scorpion','centipede','=snake','monkey bit','dog bit','drown','riptide','rip current','struggling in the water','diving accident','สุนัขกัด','หมากัด','ลิงกัด','งูกัด','ถูกกัด','ต่อย','แมงกะพรุน','จมน้ำ','ตกน้ำ']};
  Object.keys(gone).forEach(function(c){KW[c]=KW[c].filter(function(t){return gone[c].indexOf(t)<0})})})();
var ITEM_RX='wallet|purse|bag|handbag|backpack|luggage|baggage|suitcase|phone|iphone|samsung|android|mobile|cell ?phone|laptop|macbook|notebook|tablet|ipad|charger|power ?bank|earbuds|earphones|airpods|headphones|camera|gopro|drone|keys?|cards?|credit card|debit card|atm card|bank card|cash|money|baht|watch|jewel\\w*|ring|necklace|bracelet|sunglasses|glasses|jacket|shoes|bicycle|motorbike|motorcycle|scooter|bike|licen[cs]e|id card|documents?|helmet|stuff|things|belongings';
var TH_ITEM='กระเป๋า|มือถือ|โทรศัพท์|ไอโฟน|ซัมซุง|เงิน|บัตร|นาฬิกา|กุญแจ|กล้อง|แล็ปท็อป|โน้ตบุ๊ก|แท็บเล็ต|หูฟัง|แว่น|ใบขับขี่|เอกสาร|ของ|จักรยาน|รองเท้า|เสื้อ';
// FR-4 sentence patterns with a weight (e.g. "lost ... passport")
var PATS=[
 {cat:'theft',w:2,re:new RegExp('\\b(lost|losing|lose|losed|missing|left|forgot|forgotten|dropped|misplaced|cant find|cannot find|cant locate)\\b[^.!?]{0,40}\\b('+ITEM_RX+')\\b','i')},
 {cat:'theft',w:2,re:new RegExp('\\b('+ITEM_RX+')\\b[^.!?]{0,60}\\b(gone|missing|lost|stolen|taken|disappeared|vanished)\\b','i')},
 {cat:'theft',w:2,re:/\b(someone|somebody|he|she|they|guy|man|woman|boy|girl|thief|kid)\b[^.!?]{0,25}\b(took|grabbed|snatched|stole|steals?|ran off with|ran away with)\b/i},
 {cat:'theft',w:2,re:new RegExp('(หาย)[^.\\n]{0,15}('+TH_ITEM+')|('+TH_ITEM+')[^.\\n]{0,15}(หาย|โดนขโมย|ถูกขโมย)')},
 {cat:'passport',w:2,re:/\bpassport\b|พาสปอร์ต|หนังสือเดินทาง/i},
 {cat:'medical',w:2,re:/\b(can'?t|cannot|unable to) (breathe|move|wake|feel)\b|\bnot (responding|breathing|moving|waking)\b/i},
 {cat:'medical',w:2,re:/\b(need|call|get|send|find|want|require|bring)\b[^.!?]{0,20}\b(ambulance|doctor|hospital|paramedic|medic|nurse|medical)\b/i},
 {cat:'medical',w:2,re:/\b(my|our|his|her|a|the)\b[^.!?]{0,15}\b(friend|husband|wife|child|kid|baby|mother|father|mom|dad|son|daughter|girlfriend|boyfriend|partner|brother|sister|colleague)\b[^.!?]{0,30}\b(is|was|has|got|are)\b[^.!?]{0,20}\b(hurt|injured|bleeding|unconscious|collapsed|sick|choking|not breathing|passed out|fainted|having a seizure|having a heart attack|in pain)\b/i},
 {cat:'police',w:2,re:/\b(need|call|get|send|find|want)\b[^.!?]{0,20}\b(police|cops?|officers?)\b/i},
 {cat:'police',w:2,re:/\b(someone|somebody|man|guy|men|group|they|he)\b[^.!?]{0,30}\b(following|chasing|threatening|attacking|hitting|beating|grabbing me|touching me|harassing|stalking)\b/i},
 {cat:'police',w:2,re:/\b(being|got|was|am|were)\b[^.!?]{0,10}\b(followed|chased|attacked|assaulted|threatened|mugged|robbed|beaten|harassed|stabbed|shot|drugged|kidnapped|blackmailed)\b/i},
 {cat:'tourist',w:5,re:/\b(kept|keeps|keep|held|holding|keeping|took|taking|refus\w+ to (return|give)|won'?t (return|give)|wouldn'?t (return|give))\b[^.!?]{0,30}\bpassport\b|ยึด[^.\n]{0,10}พาสปอร์ต|ไม่คืน[^.\n]{0,10}พาสปอร์ต/i},
 {cat:'tourist',w:3,re:/tourist[- ]police|ตำรวจท่องเที่ยว|\b1155\b/i},
 {cat:'tourist',w:2,re:/\b(overcharged|charged|asked for|demanded|wants?|wanted)\b[^.!?]{0,25}(\d{3,}|\bbaht\b|\bthb\b|฿|\bextra\b|\bmore\b|\bdouble\b|\btriple\b)/i},
 {cat:'tourist',w:2,re:/\b(refus\w+|won'?t|wouldn'?t|will not|would not)\b[^.!?]{0,25}\b(refund|return|give back|use the meter|turn on the meter|let me go|let me leave|take me)\b/i},
 {cat:'tourist',w:2,re:/\b(taxi|tuk ?tuk|driver|guide|shop|tailor|agent|hotel|rental|jet ?ski|scooter|vendor|seller)\b[^.!?]{0,40}\b(scam|cheat|rip|overcharg|fake|refus|lied|lying|forced|demand)\w*/i}
];
// FR-4 words that make Medical win outright
var STRONG_MED=/\b(bleeding|bleed|unconscious|not breathing|cannot breathe|can'?t breathe|heart attack|chest pain|seizure|overdos\w*|stroke|collapsed|choking|anaphyla\w*)\b|หมดสติ|หายใจไม่ออก|ไม่หายใจ|ชัก|หัวใจวาย|กินยาเกินขนาด|เลือดออก/i;
// FR-4 words that make Police win outright
var STRONG_POL=/\b(gunpoint|knifepoint|kidnap\w*|raped?|sexually assault\w*|assaulted|stabbed|being attacked|threatened me with)\b|ข่มขืน|ลักพา|จี้|แทง/i;
PATS.push(
 {cat:'police',w:5,re:/\brobbed (me|us|him|her|them)\b/i},
 {cat:'medical',w:3,re:/\b(car|motorbike|motorcycle|scooter|bike|bicycle|truck|bus|tuk tuk|taxi|van|vehicle|jet ?ski|boat|speedboat|elephant|horse)\b[^.!?]{0,20}\b(hit|hits|ran into|crashed into|bumped|knocked|ran over)\b[^.!?]{0,10}\b(me|him|her|us|them|my|a (man|woman|child|kid|boy|girl|person))\b/i},
 {cat:'police',w:3,re:/\b(photos?|pictures?|video|filming|filmed|recorded|recording)\b[^.!?]{0,30}\b(secretly|without (my )?(permission|consent)|hidden|bathroom|toilet|shower)\b|\bsecretly\b[^.!?]{0,20}\b(photo|film|record)\w*/i},
 {cat:'police',w:3,re:/\b(drink|drinks)\b[^.!?]{0,40}\b(passed out|unconscious|dizzy|strange|woozy|sleepy)\b/i},
 {cat:'police',w:5,re:/\b(protection money|extortion|shakedown)\b/i},
 {cat:'passport',w:3,re:/\b(document|papers?|permit|stamp)\b[^.!?]{0,30}\b(leave|exit|enter|travel|border)\b/i},
 {cat:'theft',w:3,re:new RegExp('ลืม[^\\n]{0,6}('+TH_ITEM+')')},
 {cat:'theft',w:2,re:new RegExp('(แอบเอา|แอบหยิบ|หยิบ|เอา)[^\\n]{0,8}('+TH_ITEM+')[^\\n]{0,10}ไป')},
 {cat:'tourist',w:3,re:/\b(service charge|surcharge|added (a )?(fee|charge)|charged (me )?(extra|more|double)|extra (fee|charge)|not on the (menu|bill))\b/i},
 {cat:'tourist',w:3,re:/\b(booked|booking|reservation|reserved)\b[^.!?]{0,40}\b(no (record|reservation|booking)|doesn'?t exist|not found|cancel\w*|refus\w+|wont|won't)\b|\bno reservation\b/i},
 {cat:'tourist',w:3,re:/(จองโรงแรม|จองห้อง)[^\n]{0,20}(ไม่มี|ไม่พบ|ยกเลิก)/},
 {cat:'tourist',w:3,re:/พาไปร้าน/},
 {cat:'theft',w:3,re:new RegExp('\\b(robbed|got robbed|was robbed)\\b[^.!?]{0,30}\\b('+ITEM_RX+')\\b','i')},
 {cat:'theft',w:5,re:new RegExp('\\b('+ITEM_RX+')\\b[^.!?]{0,30}\\b(robbed|got robbed|was robbed)\\b','i')},
 {cat:'theft',w:2,re:new RegExp('\\b(cut|slashed|opened|unzipped)\\b[^.!?]{0,15}\\b(bag|pocket|backpack)\\b','i')},
 {cat:'theft',w:2,re:/(วิ่งราว|ฉก|ล้วง|ขโมย)/},
 {cat:'medical',w:2,re:/\b(leg|arm|ankle|wrist|rib|ribs|bone|nose|collarbone|finger|hand|foot|jaw|knee|shoulder|neck|head|hip|toe|skull|tooth)\b[^.!?]{0,12}\b(broken|fractured|dislocated|swollen|bleeding|numb|twisted|sprained|burned|burnt|injured|aching|paralyzed|hurts?)\b/i},
 {cat:'medical',w:2,re:/\bcut (my|his|her|our|the) (hand|finger|foot|leg|arm|head|face|knee|lip|toe|thumb|ankle)\b/i},
 {cat:'medical',w:2,re:/\b1669\b/},
 {cat:'police',w:2,re:/\b191\b/},
 {cat:'passport',w:2,re:/\b1178\b/},
 {cat:'passport',w:2,re:/พาสปอร์ต|พาสพอร์ต|พาสปอต|พาสสปอร์ต|หนังสือเดินทาง/},
 {cat:'police',w:2,re:/\b(room|house|apartment|villa|bungalow|hotel room|door|window)\b[^.!?]{0,30}\b(broken into|break-in|burgled|forced open|forced)\b/i},
 {cat:'police',w:2,re:/\b(child|kid|son|daughter|baby|girl|boy|friend|husband|wife|brother|sister|mother|father|mom|dad|girlfriend|boyfriend|person|someone)\b[^.!?]{0,25}\b(missing|disappeared|vanished)\b|\b(cant|cannot|can't) find (my )?(child|kid|son|daughter|baby|friend|husband|wife|brother|sister|mother|father|girlfriend|boyfriend)\b/i},
 {cat:'tourist',w:2,re:/\b(i am|i'm|im|we are|we're|were) lost\b|\blost my way\b|\bgot lost\b|\b(cant|cannot|can't) find (my )?(hotel|way|house|room|guesthouse|hostel)\b|\bdont know where (i am|we are)\b/i},
 {cat:'tourist',w:2,re:/\b(demand\w*|insist\w*|forc\w+)\b[^.!?]{0,25}\b(pay|money|cash|baht|fee|charge)\b|\b(pay|paid)\b[^.!?]{0,15}\b(again|twice|extra|more)\b/i},
 {cat:'tourist',w:2,re:/(โรงแรม|ร้าน|คนขับ|ไกด์|แท็กซี่|ทัวร์|แกร็บ|โบลท์)[^\n]{0,20}(ไม่ยอม|ไม่คืน|เรียกเงิน|เก็บเงิน|โกง|หลอก|คิดเงิน)/},
 {cat:'police',w:2,re:/(หายตัวไป|หายไปตั้งแต่|ไม่เจอตั้งแต่)/},
 {cat:'medical',w:2,re:/(ไม่รู้สึกตัว|ไม่ได้สติ|เจ็บหน้าอก|แน่นหน้าอก|หายใจไม่ออก|ชักกระตุก)/}
);
PATS.push(
 {cat:'medical',w:3,re:/\b(wont|won't|cant|can't|cannot|not|unable to|doesn'?t|isn'?t)\b[^.!?]{0,6}\bwak(e|ing)\b/i},
 {cat:'medical',w:2,re:/\bfell (on|onto) (his|her|my|their|the )?(head|face|foot|leg|arm|back|neck)\b/i},
 {cat:'police',w:3,re:/\b(won'?t|wont|refus\w+ to|not) let (me|us|her|him) (out|leave|go|escape|exit|get out|walk out|run)\b/i},
 {cat:'police',w:3,re:/\b(gang|group|men|guys|people)\b[^.!?]{0,30}\b(blocked|surrounded|cornered|demanded|asked for money)\b/i},
 {cat:'police',w:3,re:/\b(outside|under|near|at)\b[^.!?]{0,10}\b(my )?(window|door|room|tent)\b[^.!?]{0,15}\b(night|watching|staring|looking)\b|\b(watching|staring at|spying on) me\b/i},
 {cat:'theft',w:3,re:/\b(motorbike|motorcycle|scooter|bike|bicycle|car|helmet)\b[^.!?]{0,30}\b(disappeared|gone|missing|vanished|not there)\b/i},
 {cat:'theft',w:3,re:/(มอเตอร์ไซค์|มอไซค์|จักรยาน|รถ)[^\\n]{0,12}หาย/},
 {cat:'tourist',w:3,re:/\b(guide|driver|agent|seller|vendor|tour operator|owner|shopkeeper|shop)\b[^.!?]{0,25}\b(disappeared|vanished|ran away|ran off|left)\b/i},
 {cat:'tourist',w:3,re:/\b(charged|billed|deducted)\b[^.!?]{0,20}\b(card|account)\b[^.!?]{0,15}\b(twice|double|two times|again)\b|\b(card|account)\b[^.!?]{0,20}\b(charged|billed)\b[^.!?]{0,10}\b(twice|double)/i},
 {cat:'tourist',w:3,re:/\b(won'?t|wont|refus\w+ to|not|doesn'?t|isn'?t)\b[^.!?]{0,10}\b(take back|refund|exchange|return|replace|giving back|give back)\b/i},
 {cat:'tourist',w:3,re:/(ไกด์|คนขับ|เจ้าของร้าน|ร้าน)[^\\n]{0,12}หาย(ไป|ตัว)/},
 {cat:'tourist',w:3,re:/(ตัดบัตร|ตัดเงิน|เก็บเงิน|หักเงิน)[^\\n]{0,10}(สองครั้ง|ซ้ำ|สองรอบ)/},
 {cat:'tourist',w:2,re:/ขับอ้อม|วนรถ|พาไปทางไกล/}
);
PATS.push(
 {cat:'passport',w:3,re:/\b(board|boarding|flight|airline|airport)\b[^.!?]{0,40}\b(visa|passport|expired|overstay)\b|\b(visa|passport|expired|overstay)\b[^.!?]{0,40}\b(board|boarding|flight|airline)\b/i},
 {cat:'theft',w:3,re:/\b(broke|cut|forced|removed|opened)\b[^.!?]{0,12}\b(lock|chain)\b[^.!?]{0,30}\b(took|stole|gone|missing)\b/i}
);
PATS.push(
 {cat:'fire',w:3,re:/\b(building|house|kitchen|room|hotel|car|bus|boat|shop|market|restaurant|forest|hill|mountain|bin|trash|stove)\b[^.!?]{0,20}\b(is |was )?(on fire|burning|burnt down|caught fire)/i},
 {cat:'fire',w:3,re:/\b(smell|smells|smelling)\b[^.!?]{0,12}\b(gas|smoke|burning)\b/i},
 {cat:'disaster',w:3,re:/\b(ground|floor|building|house|room|bed)\b[^.!?]{0,15}\b(is |was )?(shaking|shook|trembling|moving)\b/i},
 {cat:'water',w:3,re:/\b(someone|somebody|my (friend|wife|husband|son|daughter|child|kid|partner)|a (man|woman|child|kid|tourist))\b[^.!?]{0,20}\b(is |was )?(in|under|swept|pulled)\b[^.!?]{0,15}\b(water|sea|ocean|river|current|waves?)\b/i},
 {cat:'animal',w:3,re:/\b(bit|bitten|stung|scratched|attacked)\b[^.!?]{0,15}\b(by|me|my)\b[^.!?]{0,25}\b(snake|dog|monkey|jellyfish|spider|scorpion|bee|wasp|animal|cat|centipede)/i}
);
var STRONG_FIRE=/\b(on fire|caught fire|house fire|building (is )?(on fire|burning)|gas leak|smell(s)? (like )?gas|explosion)\b|ไฟไหม้|เพลิงไหม้|แก๊สรั่ว|ระเบิด/i;
var STRONG_DIS=/\b(earthquake|tsunami|flash flood|landslide|mudslide|typhoon)\b|แผ่นดินไหว|สึนามิ|ดินสไลด์|ดินถล่ม/i;
var STRONG_WATER=/\b(drowning|drowned|rip current|riptide|swept away|capsized|boat (sank|is sinking))\b|จมน้ำ|เรือล่ม|ตกทะเล/i;
var STRONG_ANIMAL=/\b(snake ?bite|bitten by (a |an )?(snake|dog|monkey)|cobra|viper|rabies|rabid|box jellyfish)\b|งูกัด|พิษสุนัขบ้า/i;
// FR-4 "no one was hurt" turns a medical call into a police report
var NEG_MED=/\b(no ?one|nobody|none|no)\b[^.!?]{0,15}\b(hurt|injur\w*|wounded|casualt\w*)\b|\bnot (hurt|injured)\b|\bno injur\w*|\bwithout injur\w*|\bnobody (is|was) hurt\b|ไม่มีใคร(บาดเจ็บ|เจ็บ)|ไม่(เจ็บ|บาดเจ็บ)/i;
// FR-4 accident words (used with NEG_MED)
var ACCIDENT_RX=/accident|crash|collision|fender|อุบัติเหตุ|รถชน|ชนกัน/i;
var SPECIAL=[];
// FR-4 typo tolerance: edit distance between two words
function lev(a,b){
  if(Math.abs(a.length-b.length)>2)return 9;
  var m=[],i,j;for(i=0;i<=a.length;i++)m[i]=[i];for(j=1;j<=b.length;j++)m[0][j]=j;
  for(i=1;i<=a.length;i++)for(j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return m[a.length][b.length];
}
function tokens(text){var r=[],re=/[a-z']+/gi,m;while((m=re.exec(text)))r.push({w:m[0].toLowerCase(),s:m.index,e:m.index+m[0].length});return r}
// FR-4 finds a keyword even with a spelling mistake
function fuzzy(text,toks,term){
  if(!ascii(term)||term.indexOf(' ')>-1||term.length<6)return null;
  var tol=term.length>=9?2:1;
  for(var i=0;i<toks.length;i++){var w=toks[i].w;if(w.length>=5&&lev(w,term)<=tol)return [toks[i].s,toks[i].e]}
  return null;
}
// FR-4 merges overlapping highlighted ranges
function mergeSpans(a){
  a=a.slice().sort(function(x,y){return x[0]-y[0]});var o=[];
  a.forEach(function(sp){var l=o[o.length-1];if(l&&sp[0]<=l[1])l[1]=Math.max(l[1],sp[1]);else o.push([sp[0],sp[1]])});
  return o;
}
// FR-4 weak clue words, used only when no strong keyword matched
var WEAK={
 medical:['blue','pale','weak','droopy','speaking','speech','wake','conscious','face','head','swelling','swollen','pain','painful','sore','blood','faint','dizzy','sick','coconut','fell','fall','hurt','hospital','doctor','pills','sting','bite','burn','wound','vomit','breath','heart','อ่อนแรง','ซีด','หน้าบวม','สลบ'],
 police:['man','men','guy','stranger','outside','window','door','night','scared','afraid','frightened','threat','violent','drunk','gang','blocked','knife','forced','pressure','pressuring','drugs','dealer','screaming','locked','following','naked','unsafe','dangerous','suspicious','touch','kiss','กลัว','อันตราย','แปลกหน้า'],
 theft:['missing','gone','disappeared','taken','dropped','empty','pocket','bag','wallet','phone','purse','money','cash','safe','parking','parked','laptop','camera','bike','motorbike','หาย','หล่น','ตก'],
 passport:['visa','immigration','embassy','stamp','airport','border','expired','extend','วีซ่า','สถานทูต','หมดอายุ'],
 tourist:['charge','charged','pay','paid','price','prices','fee','fees','deposit','refund','shop','store','hotel','guide','driver','tour','boat','ferry','exchange','rate','booking','ticket','offered','offer','fake','expensive','cheap','bill','twice','route','broken','item','extra','agent','dive','rental','ราคา','ค่า','จ่าย','เงินคืน','ร้าน']
};
WEAK.fire=['smoke','smell','burning','burnt','flames','alarm','sparks','gas','ไฟ','ควัน'];
WEAK.disaster=['shaking','shook','tremor','flood','water','rising','storm','rain','wind','evacuate','shelter','landslide','น้ำ','พายุ'];
WEAK.water=['sea','ocean','river','current','swim','swimming','wave','waves','boat','sinking','drift','beach','ทะเล','เรือ','ว่ายน้ำ'];
WEAK.animal=['bite','bit','sting','snake','dog','monkey','jelly','spider','insect','swollen','venom','กัด','ต่อย','งู'];
// FR-4 main parser: scores every category, applies danger-first, returns best + alternatives + highlighted spans
function parse2(text){
  var low=text.toLowerCase(),toks=tokens(text),sc={},spans={};
  /* "tourist police" should not also count as plain "police" */
  var textNoTP=text.replace(/tourist[- ]police|ตำรวจท่องเที่ยว/gi,function(m){return new Array(m.length+1).join(' ')}),lowNoTP=textNoTP.toLowerCase();
  CAT_ORDER.forEach(function(c){sc[c]=0;spans[c]=[]});
  CAT_ORDER.forEach(function(c){
    var src=c==='police'?textNoTP:text,tk=c==='police'?tokens(textNoTP):toks;
    KW[c].forEach(function(t){
      var full=false;if(t.charAt(0)==='='){t=t.slice(1);full=true}
      var hit=find(src,t,full),w=1;if(!hit){hit=fuzzy(src,tk,t);w=0.5}
      if(hit){sc[c]+=w;spans[c].push(hit)}
    });
  });
  PATS.forEach(function(p){var m=p.re.exec(p.cat==='police'?lowNoTP:low);if(m){sc[p.cat]+=p.w;spans[p.cat].push([m.index,m.index+m[0].length])}});
  /* "no one was hurt" turns a medical call into a police report */
  if(NEG_MED.test(low)){
    var acc=ACCIDENT_RX.exec(low);
    sc.medical=Math.max(0,sc.medical-4);spans.medical=[];
    if(acc){sc.police+=2;spans.police.push([acc.index,acc.index+acc[0].length])}
  }
  var gp=/\b(police|cops?|officers?)\b/i.exec(lowNoTP);
  var sm=STRONG_MED.exec(low);if(sm){sc.medical+=5;spans.medical.push([sm.index,sm.index+sm[0].length])}
  var sp2=STRONG_POL.exec(lowNoTP);if(sp2){sc.police+=4;spans.police.push([sp2.index,sp2.index+sp2[0].length])}
  [['fire',STRONG_FIRE,5],['disaster',STRONG_DIS,4],['water',STRONG_WATER,5],['animal',STRONG_ANIMAL,4]].forEach(function(x){var mm=x[1].exec(low);if(mm){sc[x[0]]+=x[2];spans[x[0]].push([mm.index,mm.index+mm[0].length])}});
  var best=null;CAT_ORDER.forEach(function(c){if(sc[c]>0&&(best===null||sc[c]>sc[best]))best=c});
  if(!best&&gp){best='police';sc.police=0.5;spans.police.push([gp.index,gp.index+gp[0].length])}
  if(!best||sc[best]<1){
    var wb=null,wn=0;
    CAT_ORDER.forEach(function(c){var n=0,sp=[];WEAK[c].forEach(function(t){var h=find(text,t,true);if(h){n++;sp.push(h)}});if(n>=2&&n>wn){wb=c;wn=n;spans[c]=spans[c].concat(sp)}});
    if(wb){best=wb;sc[wb]=Math.max(sc[wb],0.5)}
  }
  /* danger first: a close call between a high-urgency and a low-urgency category goes to the high one */
  if(best&&CATS[best].urgency==='low'){
    [['medical',2],['police',1],['fire',2],['disaster',2],['water',2],['animal',2]].forEach(function(x){var c=x[0];if(sc[c]>=1&&CATS[best].urgency==='low'&&sc[best]-sc[c]<=x[1])best=c});
  }
  var special=[];SPECIAL.forEach(function(x){if(x.re.test(low))special.push(x.id)});
  var alts=CAT_ORDER.filter(function(c){return c!==best&&sc[c]>0}).sort(function(a,b){return sc[b]-sc[a]}).slice(0,3).map(function(c){return {cat:c,score:sc[c]}});
  var pv=parse(text),sp=best?mergeSpans(spans[best]):[];
  return {cat:best,score:best?sc[best]:0,catSpan:sp[0]||null,spans:sp,alts:alts,special:special,prov:pv.prov,provSpan:pv.provSpan};
}
// FR-4 "Could it also be" card + "Not sure" call buttons (AC2 unrecognised)
function altsHTML(){
  var h='';
  if(S.cat&&S.alts&&S.alts.length)h+='<div class="card"><h3>Could it also be</h3><div class="chips" style="margin-top:8px">'+S.alts.map(function(a){return '<button class="chip" data-act="setCat" data-v="'+a.cat+'">'+esc(CATS[a.cat].label)+' · '+(CATS[a.cat].urgency==='high'?'High':'Low')+' urgency</button>'}).join('')+'</div></div>';
  if(!S.cat)h+='<div class="card"><h3>Not sure what happened?</h3><p>If anyone is in danger or hurt, call now.</p><div class="under" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-act="dial" data-v="1669">Call 1669</button><button class="btn btn-primary btn-sm" data-act="dial" data-v="191">Call 191</button></div></div>';
  return h;
}
// FR-4 finds the province named in the sentence
function parse(text){
  var out={cat:null,catSpan:null,prov:null,provSpan:null};
  for(var c=0;c<CAT_ORDER.length&&!out.cat;c++){var kws=CATS[CAT_ORDER[c]].kw;
    for(var k=0;k<kws.length;k++){var hit=find(text,kws[k],false);if(hit){out.cat=CAT_ORDER[c];out.catSpan=hit;break}}}
  for(var p=0;p<PROVS.length&&!out.prov;p++){
    for(var a=0;a<PROVS[p].alias.length;a++){var h=find(text,PROVS[p].alias[a],true);if(h){out.prov=PROVS[p].id;out.provSpan=h;break}}}
  return out;
}


/* ############################################################
   SECTION 4 · STATE · one shared state object S + FR-5 link state + SVG map builder
   ############################################################ */
var S;
// FR-5 state of one sharing session (phase, contact, duration, expiry, ETA)
function freshLink(){return {phase:'idle',contact:null,dur:7200,startT:0,expireAt:0,x:200,y:150,lastUpd:0,updates:0,msg:false,cview:'messages',opened:false,eta:null,etaEdit:false,calledAt:null,reason:null}}
// Global state factory (screen, province, GPS, category, link)
function fresh(){return {lang:'en',fcat:null,nb:'police',nbSel:0,t:0,view:'sam',screen:'locpick',loc:'unknown',det:{st:'idle'},from:'cats',prov:'cm',provFrom:'location',gps:null,provSpan:null,text:'',cat:null,catSpan:null,ms:0,editing:null,lc:null,sh:null,trk:null,link:freshLink(),ping:false}}
S=fresh();
// FR-5 name of the selected trusted contact
function cname(){var c=CONTACTS.filter(function(x){return x.id===S.link.contact})[0];return c?c.name:'Alex'}
// FR-1 / FR-5 coordinates text for the share view
function coord(){var b=S.gps?[S.gps.lat,S.gps.lng]:COORD[S.prov];return (b[0]+(150-S.link.y)*0.00001).toFixed(5)+'° N, '+(b[1]+(S.link.x-200)*0.00001).toFixed(5)+'° E'}
// FR-5 AC3 time left until the link expires
function leftTxt(){return S.link.expireAt===Infinity?'Until you stop':'Ends in '+dur(S.link.expireAt-S.t)}
// FR-2 / FR-3 urgency label (High / Low)
function tag(u){return '<span class="tag tag-'+u+'">'+(u==='high'?'High urgency':'Low urgency')+'</span>'}

// FR-1 / FR-5 builds the simulated map (position dot, optional route + responder)
function mapSVG(o){
  o=o||{};var L=S.link,px=o.route?260:L.x,py=o.route?190:L.y;
  return '<svg class="map" viewBox="0 0 320 240" role="img" aria-label="Map showing '+(o.route?'your location and the unit coming to you':'Sam\'s live location')+'">'+
   '<rect class="map-bg" width="320" height="240"/><path class="map-river" d="M-10 205C60 175 120 220 190 195S300 220 335 200"/>'+
   '<path class="map-road" d="M0 40H110V120H220V190H320M110 0V240M0 160H250M220 0V120M60 240V160M0 100H60"/>'+
   (o.route?'<path id="route" class="map-route" d="M20 40H110V120H220V190H260"/>':'')+
   '<g'+(o.route?'':' class="pinG"')+' transform="translate('+px+','+py+')"><circle r="16" class="pulse"/><circle r="7" class="me"/>'+
   (o.label?'<g transform="translate(0,-26)"><rect x="-22" y="-12" width="44" height="22" rx="11" class="lbl"/><text y="4" text-anchor="middle" class="lbl-t">Sam</text></g>':'')+'</g>'+
   (o.route?'<g id="unit" transform="translate(20,40)"><circle r="13" class="unit-bg"/><path d="M-6 0H6M0-6V6" class="unit-x"/></g>':'')+'</svg>';
}


/* ############################################################
   SECTION 5 · LANGUAGE · Thai/English toggle: dictionary DICT (exact UI text -> Thai) and patterns PAT_TH (text with numbers/names)
   ############################################################ */
// Thai text for every English UI string (key = exact English text)
var DICT={
 'Medical emergency':'เหตุฉุกเฉินทางการแพทย์','Police / crime':'ตำรวจ / อาชญากรรม','Lost passport':'พาสปอร์ตหาย','Theft (non-violent)':'ถูกขโมย (ไม่รุนแรง)','Tourist Police':'ตำรวจท่องเที่ยว',
 'Ambulance':'รถพยาบาล','emergency medical service':'บริการการแพทย์ฉุกเฉิน','Police':'ตำรวจ','if there was a crash or crime':'กรณีเกิดอุบัติเหตุหรืออาชญากรรม','national emergency line':'สายด่วนฉุกเฉินแห่งชาติ','English-speaking help':'มีเจ้าหน้าที่พูดภาษาอังกฤษ','ask for a police report':'ขอใบแจ้งความ','Immigration Bureau hotline':'สายด่วนสำนักงานตรวจคนเข้าเมือง',
 'Police unit':'หน่วยตำรวจ','Tourist Police unit':'หน่วยตำรวจท่องเที่ยว','Responder':'หน่วยช่วยเหลือ','Friend':'เพื่อน','Hotel front desk':'พนักงานต้อนรับโรงแรม',
 'Passport':'พาสปอร์ต','Phone':'โทรศัพท์','Wallet and bank cards':'กระเป๋าสตางค์และบัตรธนาคาร','Bag':'กระเป๋า','Cash':'เงินสด',
 'Just now':'เมื่อสักครู่','Earlier today':'เมื่อวันนี้','Yesterday':'เมื่อวาน','A few days ago':'เมื่อไม่กี่วันก่อน',
 'Open 24 hours':'เปิด 24 ชั่วโมง','Closed':'ปิด','Copied':'คัดลอกแล้ว','Could not copy. Select the text and copy it':'คัดลอกไม่ได้ กรุณาเลือกข้อความแล้วคัดลอกเอง',
 'Could it also be':'อาจเป็นเรื่องนี้ด้วย','Not sure what happened?':'ไม่แน่ใจว่าเกิดอะไรขึ้น?','If anyone is in danger or hurt, call now':'ถ้ามีใครตกอยู่ในอันตรายหรือบาดเจ็บ โทรทันที',
 'Until you stop':'จนกว่าคุณจะหยุด','Until I stop':'จนกว่าฉันจะหยุด','Should be there now':'ควรถึงแล้ว','High urgency':'เร่งด่วนสูง','Low urgency':'เร่งด่วนต่ำ',
 'Police station':'สถานีตำรวจ','Hospital (ER)':'โรงพยาบาล (ER)','Immigration office':'สำนักงานตรวจคนเข้าเมือง','Central Police Station':'สถานีตำรวจกลาง','Municipal Police Station':'สถานีตำรวจเทศบาล','Provincial Hospital':'โรงพยาบาลประจำจังหวัด','Community Hospital':'โรงพยาบาลชุมชน','Regional Medical Centre':'ศูนย์การแพทย์ภูมิภาค','Tourist Police Station':'สถานีตำรวจท่องเที่ยว','Tourist Assistance Centre':'ศูนย์ช่วยเหลือนักท่องเที่ยว','Immigration Office':'ที่ทำการตรวจคนเข้าเมือง','Immigration Check Point':'ด่านตรวจคนเข้าเมือง','Immigration Service Desk':'จุดบริการตรวจคนเข้าเมือง',
 '&larr; Back':'&larr; กลับ','Nearby':'ใกล้เคียง','Location is off':'ปิดตำแหน่งอยู่','Turn on location to see what is near you':'เปิดตำแหน่งเพื่อดูสิ่งที่อยู่ใกล้คุณ','Turn on location':'เปิดตำแหน่ง','Map unavailable offline':'ไม่มีแผนที่เมื่อออฟไลน์','The saved list below still works':'รายการที่บันทึกไว้ด้านล่างยังใช้ได้','Route':'นำทาง',
 'Listed by distance only':'เรียงตามระยะทางเท่านั้น','No ads or paid placement':'ไม่มีโฆษณาหรือการจ่ายเงินเพื่อจัดอันดับ','Sample entries':'เป็นข้อมูลตัวอย่าง','Distances are straight-line, worked out on your phone':'ระยะทางเป็นเส้นตรง คำนวณบนโทรศัพท์ของคุณ',
 'Province picked from saved data':'เลือกจังหวัดจากข้อมูลที่บันทึกไว้','Place names need internet':'ชื่อสถานที่ต้องใช้อินเทอร์เน็ต','Your position stays on your phone':'ตำแหน่งของคุณอยู่บนโทรศัพท์ของคุณเท่านั้น',
 'You are offline':'คุณออฟไลน์อยู่',"Your phone's GPS still works without internet":'GPS ของโทรศัพท์ยังใช้ได้โดยไม่ต้องมีอินเทอร์เน็ต','Allow location and we pick your province from saved data':'อนุญาตตำแหน่ง แล้วเราจะเลือกจังหวัดจากข้อมูลที่บันทึกไว้','Or choose your province yourself':'หรือเลือกจังหวัดเอง',
 'Help near you, fast':'ความช่วยเหลือใกล้ตัวคุณ อย่างรวดเร็ว','ResQTh shows the right emergency contacts for where you are':'ResQTh แสดงเบอร์ฉุกเฉินที่ถูกต้องตามสถานที่ที่คุณอยู่','Allow location so we can pick your province':'อนุญาตตำแหน่งเพื่อให้เราเลือกจังหวัดให้คุณ','Allow location':'อนุญาตตำแหน่ง','Choose my province':'เลือกจังหวัดเอง','Not now':'ไม่ใช่ตอนนี้','Your location stays on your phone unless you choose to share it':'ตำแหน่งของคุณอยู่บนโทรศัพท์ จนกว่าคุณจะเลือกแชร์',
 'Choose your province':'เลือกจังหวัดของคุณ','Location is off.':'ปิดตำแหน่งอยู่','Pick your province so we can show local numbers':'เลือกจังหวัดเพื่อให้เราแสดงเบอร์ในพื้นที่','We use this to show local numbers':'เราใช้ข้อมูลนี้แสดงเบอร์ในพื้นที่','Province':'จังหวัด','Select a province':'เลือกจังหวัด','Continue':'ต่อไป',
 'What happened?':'เกิดอะไรขึ้น?','Type it the way you would tell a friend':'พิมพ์เล่าเหมือนเล่าให้เพื่อนฟัง','English or Thai':'ภาษาอังกฤษหรือไทย','Find help':'ค้นหาความช่วยเหลือ','Find nearby':'ค้นหาใกล้ฉัน','Browse hotlines by category':'ดูเบอร์ฉุกเฉินตามหมวด','e.g. I lost my passport in Phuket':'เช่น พาสปอร์ตหายที่ภูเก็ต','Describe your emergency':'อธิบายเหตุฉุกเฉินของคุณ',
 'Saved hotlines':'เบอร์ที่บันทึกไว้','All general hotlines':'เบอร์ฉุกเฉินทั่วไปทั้งหมด','Tap a category to filter':'แตะหมวดเพื่อกรอง','All':'ทั้งหมด','One-tap call screen, a Thai help card and location sharing':'หน้าจอโทรทันที การ์ดขอความช่วยเหลือภาษาไทย และการแชร์ตำแหน่ง','A step-by-step plan, a report for the police and where to go':'แผนทีละขั้น รายงานสำหรับตำรวจ และสถานที่ที่ต้องไป','Open the guide':'เปิดคู่มือ','Clear filter':'ล้างตัวกรอง','Matching numbers':'เบอร์ที่ตรงกัน','General hotlines':'เบอร์ฉุกเฉินทั่วไป',
 'Reading your message':'กำลังอ่านข้อความของคุณ','&larr; Edit message':'&larr; แก้ข้อความ','What happened':'เกิดอะไรขึ้น','Where':'ที่ไหน','Not sure yet':'ยังไม่แน่ใจ','Done':'เสร็จ','Change':'เปลี่ยน','I could not tell from your message':'ฉันดูจากข้อความของคุณไม่ออก','Pick the closest one':'เลือกข้อที่ใกล้เคียงที่สุด','How urgent':'เร่งด่วนแค่ไหน','Set after you pick a category':'ระบบกำหนดหลังจากคุณเลือกหมวด','The AI only picks the category, place and urgency':'AI เลือกเพียงหมวด สถานที่ และความเร่งด่วน','Phone numbers come from the verified directory, never from the AI':'เบอร์โทรมาจากฐานข้อมูลที่ตรวจสอบแล้ว ไม่ใช่จาก AI','Show help':'แสดงความช่วยเหลือ','from your message':'จากข้อความของคุณ','chosen by you':'คุณเลือกเอง','from your location':'จากตำแหน่งของคุณ','set by the category':'กำหนดโดยหมวด',
 'Note when and where you last had it':'จดว่าคุณมีพาสปอร์ตครั้งสุดท้ายเมื่อไหร่และที่ไหน','Check your hotel and any taxi or shop you used':'ตรวจที่โรงแรมและแท็กซี่หรือร้านที่คุณใช้บริการ','Report it to the police (Tourist Police if one is near)':'แจ้งตำรวจ (ตำรวจท่องเที่ยวถ้าอยู่ใกล้)','Ask for a police report: ใบแจ้งความ':'ขอใบแจ้งความจากตำรวจ','Contact your embassy or consulate about an emergency or replacement passport':'ติดต่อสถานทูตหรือสถานกงสุลเรื่องพาสปอร์ตฉุกเฉินหรือเล่มใหม่','Bring the police report, a photo ID or a copy of your passport, and passport photos':'นำใบแจ้งความ บัตรที่มีรูปถ่ายหรือสำเนาพาสปอร์ต และรูปถ่ายติดพาสปอร์ตไปด้วย','After the new passport, visit Immigration to update your visa and stay record':'หลังได้พาสปอร์ตเล่มใหม่ ไปที่ตรวจคนเข้าเมืองเพื่อปรับปรุงข้อมูลวีซ่าและการพำนัก',
 'Move somewhere safe':'ไปอยู่ในที่ปลอดภัย','Write down what was taken and roughly when':'จดว่าอะไรหายและประมาณเมื่อไหร่','Block your bank cards and SIM through your bank or phone provider':'อายัดบัตรธนาคารและซิมผ่านธนาคารหรือผู้ให้บริการโทรศัพท์','Report it to the police and ask for a copy of the report':'แจ้งตำรวจและขอสำเนาใบแจ้งความ','Insurers usually need it':'บริษัทประกันมักต้องใช้','Tell your travel insurer':'แจ้งบริษัทประกันการเดินทาง','Many have a deadline for claims':'หลายบริษัทมีกำหนดเวลาเคลมประกัน','If your passport was in the bag, follow the lost passport checklist':'ถ้าพาสปอร์ตอยู่ในกระเป๋า ให้ทำตามคู่มือพาสปอร์ตหาย',
 'It works without internet':'ใช้ได้โดยไม่ต้องมีอินเทอร์เน็ต','Do this, in order':'ทำตามลำดับนี้','Say this at the police station':'พูดประโยคนี้ที่สถานีตำรวจ','Where to go':'ไปที่ไหน','Ask for the nearest Tourist Police station':'ขอไปสถานีตำรวจท่องเที่ยวที่ใกล้ที่สุด','Call 1155 and they will direct you':'โทร 1155 แล้วเจ้าหน้าที่จะบอกทาง','Need to talk to someone?':'ต้องการคุยกับใครสักคนไหม?','Go online for the full report builder, a dated plan and maps':'เมื่อออนไลน์ ใช้ตัวสร้างรายงานเต็มรูปแบบ แผนตามวันที่ และแผนที่ได้',
 'Nearest hospital (ER)':'โรงพยาบาลใกล้ที่สุด (ER)','Nearest police station':'สถานีตำรวจใกล้ที่สุด','Nearest Tourist Police':'ตำรวจท่องเที่ยวใกล้ที่สุด','More nearby':'ดูที่อื่นใกล้เคียง',
 '&larr; Change what I entered':'&larr; แก้สิ่งที่ฉันกรอก','&larr; Categories':'&larr; หมวดหมู่','Showing the national hotlines instead':'แสดงเบอร์สายด่วนระดับประเทศแทน','Call':'โทร','Show this to someone nearby':'แสดงข้อความนี้ให้คนที่อยู่ใกล้ดู','Read my location to the operator':'อ่านตำแหน่งของฉันให้เจ้าหน้าที่ฟัง','Live sharing needs internet':'การแชร์สดต้องใช้อินเทอร์เน็ต','Your phone can still tell where you are':'โทรศัพท์ยังบอกได้ว่าคุณอยู่ที่ไหน','Share my location':'แชร์ตำแหน่งของฉัน','Other numbers':'เบอร์อื่น','Prototype with sample data':'ต้นแบบที่ใช้ข้อมูลตัวอย่าง','Check numbers before real use':'ตรวจสอบเบอร์ก่อนใช้งานจริง','Clear category':'ล้างหมวด','Search again':'ค้นหาใหม่',
 'Answer a few taps':'ตอบไม่กี่ข้อ','We build your report and your plan':'เราสร้างรายงานและแผนให้คุณ',
 'Tell us the basics':'บอกข้อมูลพื้นฐานกับเรา','Was it lost or stolen?':'หายหรือถูกขโมย?','Lost':'หาย','Stolen':'ถูกขโมย','When?':'เมื่อไหร่?','What is missing? Pick all that apply':'อะไรหายไป? เลือกได้หลายข้อ','Do you have a photo or copy of your passport?':'คุณมีรูปถ่ายหรือสำเนาพาสปอร์ตไหม?','Yes':'มี','No':'ไม่มี','Where? (optional)':'ที่ไหน? (ไม่บังคับ)','Notes (optional)':'บันทึก (ไม่บังคับ)','Place name, as on a sign or map':'ชื่อสถานที่ตามป้ายหรือแผนที่','Report number, officer name, what happened':'เลขที่รับแจ้ง ชื่อเจ้าหน้าที่ สิ่งที่เกิดขึ้น','Everything stays on this screen':'ข้อมูลทั้งหมดอยู่บนหน้าจอนี้','Nothing is saved or sent':'ไม่มีการบันทึกหรือส่งออก','Pick at least one missing item':'เลือกสิ่งที่หายอย่างน้อยหนึ่งอย่าง','Your report and plan appear here':'รายงานและแผนของคุณจะแสดงที่นี่',
 'Statement for the officer':'ข้อความถึงเจ้าหน้าที่','Show full screen':'แสดงเต็มจอ','Copy everything':'คัดลอกทั้งหมด','Bring with you':'สิ่งที่ต้องนำไป',
 'Your passport photo or scan':'รูปถ่ายหรือสแกนพาสปอร์ตของคุณ','This speeds up the embassy a lot':'ช่วยให้สถานทูตดำเนินการได้เร็วขึ้นมาก','No passport copy?':'ไม่มีสำเนาพาสปอร์ต?','Ask your embassy which ID they accept':'สอบถามสถานทูตว่ารับเอกสารยืนยันตัวตนอะไรได้บ้าง','A photo saved in email or cloud storage may help':'รูปที่เก็บไว้ในอีเมลหรือคลาวด์อาจช่วยได้','A photo or scan of your passport, if you have one':'รูปถ่ายหรือสแกนพาสปอร์ต ถ้ามี','Passport photos for the replacement':'รูปถ่ายติดพาสปอร์ตสำหรับทำเล่มใหม่','Flight or hotel booking showing your travel dates':'หลักฐานจองตั๋วเครื่องบินหรือโรงแรมที่แสดงวันเดินทาง','The police report, once you have it':'ใบแจ้งความ เมื่อได้รับแล้ว','Phone number, SIM provider, and phone model':'เบอร์โทร ผู้ให้บริการซิม และรุ่นโทรศัพท์','Bank name and last 4 digits of each card':'ชื่อธนาคารและเลข 4 ตัวท้ายของแต่ละบัตร','Travel insurance policy number':'เลขกรมธรรม์ประกันการเดินทาง',
 'Your plan, from now':'แผนของคุณ นับจากตอนนี้','Now':'ตอนนี้','Call your bank 24-hour line and block each card':'โทรสายด่วนธนาคารตลอด 24 ชั่วโมงเพื่ออายัดบัตรทุกใบ','Lock or locate the phone with its find-my tool':'ล็อกหรือค้นหาโทรศัพท์ด้วยฟีเจอร์ตามหาเครื่อง','Ask your provider to block the SIM':'ให้ผู้ให้บริการระงับซิม','Get the police report at the nearest station':'ไปขอใบแจ้งความที่สถานีตำรวจที่ใกล้ที่สุด','Everything else needs it':'ขั้นตอนอื่นต้องใช้เอกสารนี้','Within 24 to 72 h':'ภายใน 24 ถึง 72 ชม.','Tell your insurer':'แจ้งบริษัทประกัน','Check your policy for the exact deadline':'ตรวจสอบกำหนดเวลาที่แน่นอนในกรมธรรม์','Visit your embassy or consulate with the report':'ไปสถานทูตหรือสถานกงสุลพร้อมใบแจ้งความ','After the new passport':'หลังได้พาสปอร์ตเล่มใหม่','Go to Immigration to update your visa and stay record':'ไปที่ตรวจคนเข้าเมืองเพื่อปรับปรุงข้อมูลวีซ่าและการพำนัก',
 'Sample entry':'ข้อมูลตัวอย่าง','Call the national line and they will direct you':'โทรสายด่วนแห่งชาติแล้วเจ้าหน้าที่จะแนะนำทาง','Your embassy or consulate':'สถานทูตหรือสถานกงสุลของคุณ','Sample hours, no public holidays':'เวลาตัวอย่าง ไม่รวมวันหยุดนักขัตฤกษ์','Find':'ค้นหา','Close':'ปิด',
 'Share your location':'แชร์ตำแหน่งของคุณ','Sharing needs your position':'การแชร์ต้องใช้ตำแหน่งของคุณ','Turn on location to continue':'เปิดตำแหน่งเพื่อดำเนินการต่อ','Who do you want to share it with?':'ต้องการแชร์ให้ใคร?','You can still read your location out to the operator':'คุณยังอ่านตำแหน่งให้เจ้าหน้าที่ฟังได้','Someone I trust, live':'คนที่ฉันไว้ใจ แบบสด','They get a link and see you on a map':'เขาจะได้ลิงก์และเห็นคุณบนแผนที่','Works now, in this version':'ใช้ได้ในเวอร์ชันนี้','The operator, by reading it out':'เจ้าหน้าที่ โดยการอ่านให้ฟัง','Big Thai and English text saying where you are':'ข้อความไทยและอังกฤษตัวใหญ่บอกว่าคุณอยู่ที่ไหน','Read it out on the call':'อ่านให้ฟังระหว่างโทร','Emergency services, live':'หน่วยบริการฉุกเฉิน แบบสด','Future':'อนาคต','Police or ambulance see your location':'ตำรวจหรือรถพยาบาลเห็นตำแหน่งของคุณ','Needs a partnership':'ต้องมีความร่วมมือกับหน่วยงาน','Concept demo':'เป็นการสาธิตแนวคิด','Your location is shared only when you tap':'ตำแหน่งของคุณจะถูกแชร์เมื่อคุณกดเท่านั้น','It ends when you stop or time runs out, then it is deleted':'จะสิ้นสุดเมื่อคุณหยุดหรือหมดเวลา แล้วจะถูกลบ',
 'Send a live link':'ส่งลิงก์สด','Who gets the link?':'ใครจะได้รับลิงก์?','For how long?':'นานเท่าไหร่?','30 minutes':'30 นาที','2 hours':'2 ชั่วโมง','Only the person you pick can open the link':'เฉพาะคนที่คุณเลือกเท่านั้นที่เปิดลิงก์ได้','They need no app or login':'ไม่ต้องติดตั้งแอปหรือล็อกอิน','Your location is deleted when sharing ends':'ตำแหน่งของคุณจะถูกลบเมื่อการแชร์สิ้นสุด','Start sharing':'เริ่มแชร์','&larr; Back to help':'&larr; กลับไปหน้าช่วยเหลือ','Sent just now':'ส่งเมื่อสักครู่','Updated just now':'อัปเดตเมื่อสักครู่','Keep the line open':'อยู่ในสายต่อไป','Stop sharing':'หยุดแชร์','You stopped sharing':'คุณหยุดแชร์แล้ว','Sharing ended after the time you set':'การแชร์สิ้นสุดตามเวลาที่ตั้งไว้','Your location was deleted':'ตำแหน่งของคุณถูกลบแล้ว','Share again':'แชร์อีกครั้ง',
 '&larr; Stop sharing':'&larr; หยุดแชร์','Concept demo, not in the current MVP':'การสาธิตแนวคิด ไม่อยู่ใน MVP ปัจจุบัน','The SRS says ResQTh does not auto-dispatch':'SRS ระบุว่า ResQTh ไม่ส่งหน่วยช่วยเหลือโดยอัตโนมัติ','Live tracking needs a partnership with the dispatch centre':'การติดตามสดต้องมีความร่วมมือกับศูนย์สั่งการ','The ETA here is simulated':'เวลาที่แสดงเป็นการจำลอง','Assigning a unit':'กำลังจัดหน่วย','Here now':'มาถึงแล้ว','Call received':'รับเรื่องแล้ว','Unit assigned':'จัดหน่วยแล้ว','On the way':'กำลังเดินทาง','Arrived':'มาถึงแล้ว',
 'Messages':'ข้อความ','No new messages':'ไม่มีข้อความใหม่','&larr; Messages':'&larr; ข้อความ','Sam needs help':'Sam ต้องการความช่วยเหลือ','Emergency':'เหตุฉุกเฉิน','What you can do':'สิ่งที่คุณทำได้','Call Sam, or go to the spot on the map':'โทรหา Sam หรือไปที่จุดบนแผนที่','Open in Maps':'เปิดในแผนที่','Sam stopped sharing':'Sam หยุดแชร์แล้ว','This link has expired':'ลิงก์นี้หมดอายุแล้ว','The location was deleted':'ตำแหน่งถูกลบแล้ว',
 'Sharing stopped. Location deleted':'หยุดแชร์แล้ว ตำแหน่งถูกลบ','Time is up. Link expired and location deleted':'หมดเวลา ลิงก์หมดอายุและตำแหน่งถูกลบแล้ว','AI search needs internet. Pick a category instead':'การค้นหาด้วย AI ต้องใช้อินเทอร์เน็ต เลือกหมวดแทน','Type what happened first':'พิมพ์สิ่งที่เกิดขึ้นก่อน','Nearby places need internet':'สถานที่ใกล้เคียงต้องใช้อินเทอร์เน็ต','Offline: showing saved hotlines and checklists':'ออฟไลน์: แสดงเบอร์และคู่มือที่บันทึกไว้','Back online':'กลับมาออนไลน์แล้ว','Showing general hotlines':'แสดงเบอร์ทั่วไป','Turn on location first':'เปิดตำแหน่งก่อน',
 'Category filter':'ตัวกรองหมวด','Change province':'เปลี่ยนจังหวัด','Language':'ภาษา','Map of nearby places':'แผนที่สถานที่ใกล้เคียง',"Map showing Sam's live location":'แผนที่แสดงตำแหน่งสดของ Sam','Map showing your location and the unit coming to you':'แผนที่แสดงตำแหน่งของคุณและหน่วยที่กำลังมาหา','Category':'หมวด',
 'Offline. Saved hotlines and guides only':'ออฟไลน์ มีเฉพาะเบอร์และคู่มือที่บันทึกไว้',
 'Speed':'ความเร็ว','Network':'เครือข่าย','Online':'ออนไลน์','Offline':'ออฟไลน์','Reset':'รีเซ็ต','Demo time':'เวลาเดโม','· position is simulated and follows the province you pick':'· ตำแหน่งเป็นข้อมูลจำลองและเปลี่ยนตามจังหวัดที่คุณเลือก','What this prototype covers':'ต้นแบบนี้ครอบคลุมอะไรบ้าง',
 'FR-1: allow location (your coordinates stay on the phone and find the nearest station), or choose a province when you say no':'FR-1: อนุญาตตำแหน่ง (พิกัดอยู่บนโทรศัพท์และใช้หาสถานีใกล้ที่สุด) หรือเลือกจังหวัดเองเมื่อไม่อนุญาต','FR-2: browse categories, see the urgency tag, clear the filter':'FR-2: เลือกดูตามหมวด ดูป้ายความเร่งด่วน และล้างตัวกรอง','FR-3: high-urgency call screen, or low-urgency case pack':'FR-3: หน้าจอโทรสำหรับเหตุเร่งด่วนสูง หรือชุดเอกสารเคสสำหรับเหตุเร่งด่วนต่ำ','FR-4: type a sentence, check the guess, change it':'FR-4: พิมพ์ประโยค ตรวจสิ่งที่ระบบเดา และแก้ไขได้','FR-5 (new): live link to a trusted contact, auto-delete':'FR-5 (ใหม่): ลิงก์ตำแหน่งสดถึงผู้ติดต่อที่ไว้ใจ และลบข้อมูลอัตโนมัติ','Language: tap the language button at the top to switch between English and Thai':'ภาษา: แตะปุ่มภาษาด้านบนเพื่อสลับระหว่างอังกฤษและไทย','Concept only: "Emergency services see it" needs a partnership and is outside the current SRS':'เป็นแนวคิดเท่านั้น: "หน่วยบริการฉุกเฉินเห็นตำแหน่ง" ต้องมีความร่วมมือกับหน่วยงาน และอยู่นอก SRS ปัจจุบัน','All data is sample data':'ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่าง'
};
/* ---- Thai text for the new picker, categories and hotlines ---- */
var DICT_NEW={
 "Fire or gas leak": "ไฟไหม้หรือแก๊สรั่ว",
 "Earthquake or natural disaster": "แผ่นดินไหวหรือภัยพิบัติ",
 "Water rescue": "ช่วยเหลือทางน้ำ",
 "Animal bite or sting": "ถูกสัตว์กัดหรือต่อย",
 "Medical": "การแพทย์",
 "Fire": "ไฟไหม้",
 "Disaster": "ภัยพิบัติ",
 "Animal bite": "สัตว์กัดต่อย",
 "Theft": "ถูกขโมย",
 "Emergency categories": "หมวดเหตุฉุกเฉิน",
 "Back": "กลับ",
 "Fire and rescue service": "หน่วยดับเพลิงและกู้ภัย",
 "Disaster Prevention and Mitigation hotline": "สายด่วนกรมป้องกันและบรรเทาสาธารณภัย",
 "Water accident reporting": "แจ้งอุบัติเหตุทางน้ำ",
 "Ambulance · if anyone is hurt": "รถพยาบาล · ถ้ามีคนบาดเจ็บ",
 "Fire and rescue · will remove a snake or wild animal": "ดับเพลิงและกู้ภัย · มาจับงูหรือสัตว์ป่าให้",
 "Fire engine": "รถดับเพลิง",
 "Rescue team": "ทีมกู้ภัย",
 "Water rescue unit": "หน่วยกู้ภัยทางน้ำ",
 "Select your province or detect your current location": "เลือกจังหวัดของคุณ หรือให้ตรวจหาตำแหน่งปัจจุบัน",
 "Detect your location": "ตรวจหาตำแหน่งของคุณ",
 "Detect location": "ตรวจหาตำแหน่ง",
 "Detecting…": "กำลังตรวจหา…",
 "Use your device’s GPS to identify your province automatically": "ใช้ GPS ของอุปกรณ์เพื่อระบุจังหวัดของคุณโดยอัตโนมัติ",
 "With your permission, your browser will access your location": "เบราว์เซอร์จะเข้าถึงตำแหน่งของคุณเมื่อคุณอนุญาต",
 "For province lookup, coordinates are sent to OpenStreetMap Nominatim": "การค้นหาจังหวัดจะส่งพิกัดไปยัง OpenStreetMap Nominatim",
 "You can always choose manually instead": "คุณเลือกจังหวัดเองได้เสมอ",
 "Location permission was denied": "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง",
 "Finding your position took too long": "ใช้เวลาหาตำแหน่งนานเกินไป",
 "Your position is not available right now": "ตอนนี้ยังหาตำแหน่งของคุณไม่ได้",
 "This browser cannot share its location": "เบราว์เซอร์นี้แชร์ตำแหน่งไม่ได้",
 "Please choose your province from the list": "กรุณาเลือกจังหวัดจากรายการ",
 "Your position was found, but it is not in a province this prototype supports": "พบตำแหน่งของคุณแล้ว แต่ไม่อยู่ในจังหวัดที่ต้นแบบนี้รองรับ",
 "Your position was found, but the province lookup failed (no connection, or the service is busy)": "พบตำแหน่งของคุณแล้ว แต่ค้นหาจังหวัดไม่สำเร็จ (ไม่มีอินเทอร์เน็ต หรือบริการไม่ว่าง)",
 "Finding your position…": "กำลังหาตำแหน่งของคุณ…",
 "Location is on": "เปิดตำแหน่งอยู่",
 "It is only shared if you choose to": "จะแชร์ก็ต่อเมื่อคุณเลือกเท่านั้น",
 "FR-1: detect your province with GPS (coordinates go to OpenStreetMap Nominatim only when you tap Detect location), or choose it manually": "FR-1: ตรวจหาจังหวัดด้วย GPS (พิกัดจะถูกส่งไป OpenStreetMap Nominatim เมื่อคุณกด “ตรวจหาตำแหน่ง” เท่านั้น) หรือเลือกจังหวัดเอง",
 "FR-2: pick one of 9 emergency categories on the home screen, or browse hotlines by category. See the urgency tag, clear the filter": "FR-2: เลือกหมวดเหตุฉุกเฉินจาก 9 หมวดที่หน้าแรก หรือดูเบอร์ตามหมวด ดูป้ายความเร่งด่วน และล้างตัวกรองได้"
};
Object.keys(DICT_NEW).forEach(function(k){DICT[k]=DICT_NEW[k]});
var DICTL={};
Object.keys(DICT).forEach(function(k){DICTL[k.toLowerCase()]=DICT[k]});
var DAYS_TH={Sunday:'วันอาทิตย์',Monday:'วันจันทร์',Tuesday:'วันอังคาร',Wednesday:'วันพุธ',Thursday:'วันพฤหัสบดี',Friday:'วันศุกร์',Saturday:'วันเสาร์',today:'วันนี้',tomorrow:'พรุ่งนี้'};
var WD_TH={Mon:'จ.',Tue:'อ.',Wed:'พ.',Thu:'พฤ.',Fri:'ศ.',Sat:'ส.',Sun:'อา.'};
var MO_TH={Jan:'ม.ค.',Feb:'ก.พ.',Mar:'มี.ค.',Apr:'เม.ย.',May:'พ.ค.',Jun:'มิ.ย.',Jul:'ก.ค.',Aug:'ส.ค.',Sep:'ก.ย.',Oct:'ต.ค.',Nov:'พ.ย.',Dec:'ธ.ค.'};
function dateTh(x){return x.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/g,function(m){return WD_TH[m]}).replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g,function(m){return MO_TH[m]})}
var STRENGTH_TH={strong:'สูง',medium:'ปานกลาง',weak:'ต่ำ'};
var UNTIL_TH={'until I stop':'จนกว่าฉันจะหยุด','ends in 30 min':'สิ้นสุดใน 30 นาที','ends in 2 h':'สิ้นสุดใน 2 ชม.'};
// Thai text for strings that contain numbers or names
var PAT_TH=[
 [/^Understood in ([\d.]+) s · target under 4 s(?: · match: (strong|medium|weak))?$/,function(m){return 'ประมวลผลใน '+m[1]+' วินาที · เป้าหมายไม่เกิน 4 วินาที'+(m[2]?' · ความตรง: '+STRENGTH_TH[m[2]]:'')}],
 [/^Hotlines in (.+)$/,function(m){return 'เบอร์ฉุกเฉินใน '+trCore(m[1])}],
 [/^Showing numbers for (.+?)\.?$/,function(m){return 'แสดงเบอร์สำหรับ'+trCore(m[1])}],
 [/^(.+) · (High|Low) urgency$/,function(m){return trCore(m[1])+' · เร่งด่วน'+(m[2]==='High'?'สูง':'ต่ำ')}],
 [/^(.+) \(detected\)$/,function(m){return trCore(m[1])+' (ตรวจพบ)'}],
 [/^Sharing live with (.+) ·$/,function(m){return 'กำลังแชร์สดกับ '+m[1]+' ·'}],
 [/^Sharing with (.+)$/,function(m){return 'กำลังแชร์กับ '+m[1]}],
 [/^Ends in (.+)$/,function(m){return 'สิ้นสุดใน '+m[1]}],
 [/^Near (.+)$/,function(m){return 'ใกล้'+trCore(m[1])}],
 [/^Live, near (.+)$/,function(m){return 'สด, ใกล้'+trCore(m[1])}],
 [/^You are near (.+?)\.?$/,function(m){return 'คุณอยู่ใกล้'+trCore(m[1])}],
 [/^([\d.]+) km · about (\d+) min by car(\.)?( Sample entry, worked out on your phone\.)?$/,function(m){return m[1]+' กม. · ประมาณ '+m[2]+' นาทีโดยรถ'+(m[4]?' ข้อมูลตัวอย่าง คำนวณบนโทรศัพท์ของคุณ':'')}],
 [/^([\d.]+) km away · arrives about (.+)$/,function(m){return m[1]+' กม. · จะถึงประมาณ '+m[2]}],
 [/^Open now, closes (\d+:\d+)$/,function(m){return 'เปิดอยู่ ปิดเวลา '+m[1]}],
 [/^Closed now, opens (\w+) (\d+:\d+)$/,function(m){return 'ปิดอยู่ เปิด'+(DAYS_TH[m[1]]||m[1])+' เวลา '+m[2]}],
 [/^Saved guide for (.+)$/,function(m){return 'คู่มือที่บันทึกไว้สำหรับ'+trCore(m[1])}],
 [/^(\d+) of (\d+) done$/,function(m){return m[1]+' จาก '+m[2]+' ขั้นเสร็จแล้ว'}],
 [/^Step (\d+)$/,function(m){return 'ขั้นที่ '+m[1]}],
 [/^Call (\d+) for (.+)$/,function(m){return 'โทร '+m[1]+' แทน '+m[2]}],
 [/^Call (\d+)$/,function(m){return 'โทร '+m[1]}],
 [/^Call ([A-Z][a-z]+)$/,function(m){return 'โทรหา '+m[1]}],
 [/^Prototype: would dial (\d+)$/,function(m){return 'ต้นแบบ: จะโทร '+m[1]}],
 [/^Prototype: would call (.+)$/,function(m){return 'ต้นแบบ: จะโทรหา '+m[1]}],
 [/^Prototype: would open maps/,function(){return 'ต้นแบบ: จะเปิดแผนที่'}],
 [/^([A-Z][a-z]+) got the link$/,function(m){return m[1]+' ได้รับลิงก์แล้ว'}],
 [/^([A-Z][a-z]+)'s phone is on the right$/,function(m){return 'มือถือของ '+m[1]+' อยู่ทางขวา'}],
 [/^Switch to ([A-Z][a-z]+)'s phone to see it$/,function(m){return 'สลับไปที่มือถือของ '+m[1]+' เพื่อดู'}],
 [/^([A-Z][a-z]+)'s phone, (trusted contact|in an emergency)$/,function(m){return 'มือถือของ '+m[1]+(m[2]==='trusted contact'?' (ผู้ติดต่อที่ไว้ใจ)':' (ผู้ประสบเหตุ)')}],
 [/^([A-Z][a-z]+)'s phone$/,function(m){return 'มือถือของ '+m[1]}],
 [/^Stay on the call with the (\d+) operator$/,function(m){return 'อยู่ในสายกับเจ้าหน้าที่ '+m[1]}],
 [/^([A-Z][a-z]+) can see where you are and can meet you or call you$/,function(m){return m[1]+' เห็นว่าคุณอยู่ที่ไหน และมาหาหรือโทรหาคุณได้'}],
 [/^([A-Z][a-z]+) can no longer see it$/,function(m){return m[1]+' ไม่เห็นตำแหน่งนี้อีกต่อไป'}],
 [/^If you cannot reach ([A-Z][a-z]+), call (\d+)$/,function(m){return 'ถ้าติดต่อ '+m[1]+' ไม่ได้ ให้โทร '+m[2]}],
 [/^([A-Z][a-z]+) chose to share this with you$/,function(m){return m[1]+' เลือกแชร์สิ่งนี้ให้คุณ'}],
 [/^When ([A-Z][a-z]+) shares a link, it shows up here$/,function(m){return 'เมื่อ '+m[1]+' แชร์ลิงก์ จะแสดงที่นี่'}],
 [/^I need help\. Live location \((.+)\):$/,function(m){return 'ฉันต้องการความช่วยเหลือ ตำแหน่งสด ('+(UNTIL_TH[m[1]]||m[1])+'):'}],
 [/^No local contact on file for (.+) in (.+?)\.?$/,function(m){return 'ไม่มีเบอร์ในพื้นที่สำหรับ'+trCore(m[1])+'ใน'+trCore(m[2])}],
 [/^No station on file for (.+?)\.?$/,function(m){return 'ไม่มีสถานีในระบบสำหรับ'+trCore(m[1])}],
 [/^Within 24 h, by (.+)$/,function(m){return 'ภายใน 24 ชม. ก่อน '+dateTh(m[1])}],
 [/^Aim for (.+)$/,function(m){return 'เป้าหมาย '+dateTh(m[1])}],
 [/^Tourist Police Booth, (.+)$/,function(m){return 'ป้อมตำรวจท่องเที่ยว, '+trCore(m[1])}],
 [/^(.+) Police Box$/,function(m){return 'ป้อมตำรวจ'+trCore(m[1])}],
 [/^(.+) · accuracy about (\d+) m · map movement is a demo$/,function(m){return trCore(m[1])+' · แม่นยำประมาณ '+m[2]+' ม. · การเคลื่อนที่บนแผนที่เป็นการสาธิต'}],
 [/^If the operator asks for coordinates: (.+)$/,function(m){return 'ถ้าเจ้าหน้าที่ขอพิกัด: '+m[1]}],
 [/^(Sent|Updated) (\d+) s ago$/,function(m){return (m[1]==='Sent'?'ส่งเมื่อ ':'อัปเดตเมื่อ ')+m[2]+' วินาทีที่แล้ว'}],
 [/^([\d.]+) km from you$/,function(m){return m[1]+' กม. จากคุณ'}],
 [/^(\d+) min$/,function(m){return m[1]+' นาที'}],
 [/^(.+) is on the way$/,function(m){return trCore(m[1])+'กำลังมา'}],
 [/^(.+) has arrived$/,function(m){return trCore(m[1])+'มาถึงแล้ว'}]
];
/* ---- Thai patterns for the new accuracy / detected messages ---- */
PAT_TH.push([/^accuracy about (\d+) m$/i,function(m){return 'ความแม่นยำประมาณ '+m[1]+' ม.'}]);
PAT_TH.push([/^Detected (.+?) · accuracy about (\d+) m\. Tap Continue to use it$/,function(m){return 'ตรวจพบ '+trCore(m[1])+' · ความแม่นยำประมาณ '+m[2]+' ม. แตะ “ต่อไป” เพื่อใช้งาน'}]);
// Translate one text piece: exact match, pattern, " · " parts, then sentences
function trCore(s){
  var k=s.toLowerCase();
  if(DICTL[k]!==undefined)return DICTL[k];
  var i,m;
  for(i=0;i<PAT_TH.length;i++){m=PAT_TH[i][0].exec(s);if(m)return PAT_TH[i][1](m)}
  if(s.indexOf(' · ')>-1)return s.split(' · ').map(trCore).join(' · ');
  var pm=/^([\s\S]*?)([.!?:]+)$/.exec(s);
  if(pm){var c=trCore(pm[1]);if(c!==pm[1])return c}
  var parts=s.match(/[^.!?]+[.!?]*\s*/g);
  if(parts&&parts.length>1){
    return parts.map(function(p){var l=/^\s*/.exec(p)[0],t=/\s*$/.exec(p)[0],core=p.trim();return core?l+trCore(core)+t:p}).join('');
  }
  return s;
}
function trSeg(t){var lead=/^\s*/.exec(t)[0],trail=/\s*$/.exec(t)[0],core=t.trim();if(!core)return t;return lead+trCore(core)+trail}
// Translate a whole HTML string when the language is Thai (user text and Thai cards are protected)
function tr(h){
  if(typeof S==='undefined'||S.lang!=='th')return h;
  var prot=[];
  h=h.replace(/(<textarea[^>]*>)([\s\S]*?)(<\/textarea>)/g,function(m,a,b,c){prot.push(b);return a+'\u0001'+(prot.length-1)+'\u0001'+c});
  h=h.replace(/<(p|span) class="(?:stmt-en|thai-en|full-en)"[^>]*>[\s\S]*?<\/\1>|<div class="said">[\s\S]*?<\/div>/g,function(m){prot.push(m);return '\u0001'+(prot.length-1)+'\u0001'});
  h=h.replace(/>([^<>]+)</g,function(m,t){return '>'+trSeg(t)+'<'});
  h=h.replace(/(placeholder|aria-label|title)="([^"]*)"/g,function(m,a,v){return a+'="'+trSeg(v)+'"'});
  return h.replace(/\u0001(\d+)\u0001/g,function(m,i){return prot[+i]});
}
// Translate the static HTML (details list, phone labels) when the language changes
function applyStatic(){
  var th=S.lang==='th';
  [].forEach.call(document.querySelectorAll('.demo,details,.pk,#v-sam'),function(root){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n;
    while((n=w.nextNode())){
      if(n.parentNode&&(n.parentNode.id==='pk-alex'||n.parentNode.id==='v-alex'))continue;
      if(n.__en===undefined){var raw=n.nodeValue;if(!raw.trim())continue;n.__en=raw}
      var lead=/^\s*/.exec(n.__en)[0],trail=/\s*$/.exec(n.__en)[0],core=n.__en.trim();
      n.nodeValue=lead+(th?trCore(core):core)+trail;
    }
  });
}
// Language button (EN / ไทย)
function langBtn(){return '<button class="loc" data-act="lang" aria-label="Language">'+(S.lang==='th'?'EN':'ไทย')+'</button>'}


/* ############################################################
   SECTION 6 · SAM'S PHONE · FR-1 location picker + real GPS, FR-2 categories, FR-4 describe/review, FR-3 result routing, nearby finder
   ############################################################ */
// Province name shown as "Near ..." (landmarks were removed: they were only true for the old fake GPS)
function nearEn(){return S.gps?prov(S.gps.prov).en:''}
// FR-3 Thai sentence saying which province the user is in (Thai card)
function whereTh(p){return 'ตอนนี้ฉันอยู่ที่จังหวัด'+p.th}
// FR-3 English sentence saying which province the user is in
function whereEn(p){return 'I am in '+p.en+'.'}
I.police='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M12 8l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/></svg>';
I.hosp='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
I.tour='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-4 3-6.2 7-6.2s7 2.2 7 6.2"/><path d="M10.5 15.5h3"/></svg>';
I.imm='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><circle cx="13" cy="14" r="2.5"/></svg>';
I.fire='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5.5C10 9 11 9.5 12 11c.5-3 0-6 0-9z"/></svg>';
I.quake='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 13h4l2-6 3 11 3-8 2 3h6"/></svg>';
I.wave='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>';
I.paw='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.5" cy="10" r="1.8"/><circle cx="10.5" cy="6.5" r="1.8"/><circle cx="15" cy="6.5" r="1.8"/><circle cx="18.5" cy="10" r="1.8"/><path d="M8 18c0-3 2-5.5 5-5.5s4.5 2.5 4.5 5.5c0 1.6-1.6 2-4.5 2S8 19.6 8 18z"/></svg>';
I.bag='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l1 12H5z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>';
// NEARBY FINDER (no FR in SRS v2): types of places and their sample names
var NB={
 police:{label:'Police station',icon:'police',num:'191',names:['Central Police Station','{L} Police Box','Municipal Police Station'],h24:true},
 hospital:{label:'Hospital (ER)',icon:'hosp',num:'1669',names:['Provincial Hospital','Community Hospital','Regional Medical Centre'],h24:true},
 tourist:{label:'Tourist Police',icon:'tour',num:'1155',names:['Tourist Police Station','Tourist Police Booth, {L}','Tourist Assistance Centre'],h24:true},
 imm:{label:'Immigration office',icon:'imm',num:'1178',names:['Immigration Office','Immigration Check Point','Immigration Service Desk'],h24:false}
};
// NEARBY FINDER: fixed offsets that generate sample place positions
var NB_OFF=[[0.004,0.006],[-0.007,0.003],[0.010,-0.009]];
// FR-2 hotline directory rows with the categories each number matches (filter AC1-AC3)
var DIR=[
 {n:'191',name:'Police · national emergency line',cats:['police','theft','tourist','fire','disaster','water'],u:'high'},
 {n:'1669',name:'Ambulance · emergency medical service',cats:['medical','fire','disaster','water','animal'],u:'high'},
 {n:'199',name:'Fire and rescue service',cats:['fire','animal','disaster'],u:'high'},
 {n:'1784',name:'Disaster Prevention and Mitigation hotline',cats:['disaster'],u:'high'},
 {n:'1196',name:'Water accident reporting',cats:['water'],u:'high'},
 {n:'1155',name:'Tourist Police · English-speaking help',cats:['tourist','police','theft','passport'],u:'high'},
 {n:'1178',name:'Immigration Bureau hotline',cats:['passport'],u:'low'}
];
// NEARBY FINDER: type buttons
function nbGrid(){return '<div class="nbgrid">'+Object.keys(NB).map(function(k){return '<button class="nbbtn" data-act="nb" data-v="'+k+'"><span class="nbic">'+I[NB[k].icon]+'</span><span>'+NB[k].label+'</span></button>'}).join('')+'</div>'}
// NEARBY FINDER: generates SAMPLE places near the real position
function nbPlaces(type){
  var t=NB[type],ti=Object.keys(NB).indexOf(type),g=S.gps,L=prov(g.prov).en,out=[];
  for(var i=0;i<3;i++){var o=NB_OFF[(i+ti)%3],lat=g.lat+o[0],lng=g.lng+o[1];
    out.push({name:t.names[i].replace('{L}',L),dl:o[0],dg:o[1],km:distKm(g.lat,g.lng,lat,lng),open:t.h24?{open:true,text:'Open 24 hours'}:hoursStatus(EMB)})}
  out.sort(function(a,b){return a.km-b.km});return out;
}
// NEARBY FINDER: map with numbered pins
function nbMap(pl){
  var K=9000,m='';
  pl.forEach(function(x,i){var cx=160+x.dg*K,cy=120-x.dl*K,sel=i===S.nbSel;
    m+='<g data-act="nbSel" data-v="'+i+'" style="cursor:pointer"><circle cx="'+cx+'" cy="'+cy+'" r="'+(sel?15:12)+'" class="'+(sel?'nb-sel':'nb-pin')+'"/><text x="'+cx+'" y="'+(cy+4)+'" text-anchor="middle" class="lbl-t">'+(i+1)+'</text></g>'});
  return '<svg class="map" viewBox="0 0 320 240" role="img" aria-label="Map of nearby places"><rect class="map-bg" width="320" height="240"/><path class="map-river" d="M-10 205C60 175 120 220 190 195S300 220 335 200"/><path class="map-road" d="M0 120H320M160 0V240M60 0V240M0 50H320M260 0V240M0 190H320"/><g transform="translate(160,120)"><circle r="16" class="pulse"/><circle r="7" class="me"/></g>'+m+'</svg>';
}
// NEARBY FINDER screen (no FR in SRS v2)
function sNearby(){
  var t=NB[S.nb],h=head()+bannerHTML()+'<button class="back" data-act="home">&larr; Back</button><h1>Nearby</h1><div class="nbgrid">'+Object.keys(NB).map(function(k){return '<button class="nbbtn" data-act="nbType" data-v="'+k+'" aria-pressed="'+(k===S.nb)+'"><span class="nbic">'+I[NB[k].icon]+'</span><span>'+NB[k].label+'</span></button>'}).join('')+'</div>';
  if(!S.gps)return h+'<div class="card" style="margin-top:14px"><h3>Location is off</h3><p>Turn on location to see what is near you.</p><button class="btn btn-primary" data-act="gpsOn">Turn on location</button></div>';
  var pl=nbPlaces(S.nb),sel=pl[S.nbSel]||pl[0];
  h+='<div class="card" style="padding:0;overflow:hidden;margin-top:14px">'+nbMap(pl)+'</div>';
  h+=pl.map(function(x,i){var on=i===S.nbSel;
    return '<div class="nbi'+(on?' sel':'')+'"><button class="nbrow" data-act="nbSel" data-v="'+i+'"><span class="nbn">'+(i+1)+'</span><span><b>'+esc(x.name)+'</b><span class="num-d">'+x.km.toFixed(1)+' km · about '+Math.max(1,Math.round(x.km/30*60))+' min by car</span></span></button>'+
     (on?'<div class="nbx"><span class="pill '+(x.open.open?'pill-on':'pill-off')+'">'+x.open.text+'</span><div class="under"><button class="btn btn-primary btn-sm" data-act="route">Route</button><button class="btn btn-ghost btn-sm" data-act="dial" data-v="'+t.num+'">Call '+t.num+'</button></div></div>':'')+'</div>'}).join('');
  h+='<p class="hint">'+(S.nb==='hospital'?'Listed by distance only. No ads or paid placement. Sample entries. ':'Sample entries. ')+'Distances are straight-line, worked out on your phone.</p>';
  return h;
}
// FR-2 renders hotline rows
function dirRows(list){return list.map(function(d){return '<div class="dirrow"><div><div class="num-n">'+d.n+tag(d.u)+'</div><div class="num-d">'+esc(d.name)+'</div></div><button class="btn btn-ghost btn-sm" data-act="dial" data-v="'+d.n+'">Call</button></div>'}).join('')}
// FR-1 AC3 set the province (manual choice or from the message)
function setProv(id){S.prov=id}
// FR-3 the main emergency number for the current category
function mainNum(){return S.link.num||(NUMBERS[S.cat]?NUMBERS[S.cat][0][0]:'1669')}
// LAYOUT desktop vs mobile check
function wide(){return window.matchMedia('(min-width:861px)').matches}
// NEARBY / FR-3 straight-line distance in km
function distKm(a,b,c,d){var r=Math.PI/180,dl=(c-a)*r,dg=(d-b)*r,x=Math.pow(Math.sin(dl/2),2)+Math.cos(a*r)*Math.cos(c*r)*Math.pow(Math.sin(dg/2),2);return 12742*Math.asin(Math.sqrt(x))}
// FR-3 AC4 nearest Tourist Police text
function nearestTxt(p){
  if(!S.gps||!p.covered)return '';
  var c=COORD[p.id],k=distKm(S.gps.lat,S.gps.lng,c[0]+0.012,c[1]+0.008);
  return k>50?'':k.toFixed(1)+' km from you';
}
// SHARED header: brand + language + province chip (FR-1) + location status
function head(){
  var p=prov(S.prov);
  var g=S.gps?'<p class="ms" style="margin:-6px 0 12px">Location is on. Accuracy about '+Math.round(S.gps.acc||0)+' m. It is only shared if you choose to.</p>':'';
  return '<div class="top"><div class="brand">ResQ<span>Th</span></div><div class="topr">'+langBtn()+'<button class="loc" data-act="chgLoc" aria-label="Change province">'+I.pin+esc(p.en)+(S.provFrom==='location'?' (detected)':'')+'</button></div></div>'+g;
}
// FR-5 "sharing live" banner
function bannerHTML(){
  var L=S.link;
  return L.phase==='active'?'<button class="banner" data-act="openActive"><span class="live" style="background:var(--on-primary)"></span><span>Sharing live with '+esc(cname())+' · <span id="b-left">'+leftTxt()+'</span></span></button>':'';
}
// FR-2 / FR-3 hotline number rows with call buttons
function numRows(list){return list.map(function(n){return '<div class="num"><div><div class="num-n">'+n[0]+'</div><div class="num-d">'+esc(n[1])+'</div></div><button class="btn btn-ghost btn-sm" data-act="dial" data-v="'+n[0]+'">Call</button></div>'}).join('')}

// FR-1 AC1-AC3 / NFR-4 / NFR-7 first screen: choose a province manually OR detect it. Detect errors keep the manual list open.
function sLocpick(){
  var d=S.det||{st:'idle'},pre=(S.loc==='chosen'||S.loc==='granted');
  return '<div class="top"><div class="brand">ResQ<span>Th</span></div><div class="topr">'+langBtn()+'</div></div>'+
  '<h1>Choose your province</h1><p class="sub">Select your province or detect your current location.</p>'+
  '<label class="q-k" for="lp">Province</label><select id="lp"><option value="">Select a province</option>'+PROVS.map(function(x){return '<option value="'+x.id+'"'+(pre&&x.id===S.prov?' selected':'')+'>'+esc(x.en)+'</option>'}).join('')+'</select>'+
  '<button class="btn btn-primary" data-act="lpGo" id="lpGo" disabled>Continue</button>'+
  (d.st==='err'?'<div class="fallback" role="alert" style="margin-top:12px">'+esc(d.msg)+'</div>':'')+
  (d.st==='ok'?'<div class="ok-note" role="status">'+esc(d.msg)+'</div>':'')+
  '<div class="card" style="margin-top:14px"><h3>Detect your location</h3><p>Use your device\u2019s GPS to identify your province automatically.</p>'+
  '<p style="margin-top:8px">With your permission, your browser will access your location. For province lookup, coordinates are sent to OpenStreetMap Nominatim. You can always choose manually instead.</p>'+
  '<button class="btn btn-ghost" data-act="detect"'+(d.st==='busy'?' disabled':'')+'>'+(d.st==='busy'?'Detecting\u2026':'Detect location')+'</button></div>';
}

// ------------------------------------------------------------
// FR-1 · REAL GPS + province lookup (replaces the old simulated GPS)
// Privacy (NFR-5): GPS is requested only after the user taps a button. Coordinates are sent to OpenStreetMap Nominatim
// ONLY when the user taps "Detect location" (disclosed on that screen). "Turn on location" uses GPS only, no lookup.
// ------------------------------------------------------------
// FR-1 AC3 / NFR-7 readable message for each GPS failure
function geoErrorText(code){
  if(code===1)return 'Location permission was denied.';
  if(code===3)return 'Finding your position took too long.';
  return 'Your position is not available right now.';
}
// FR-1 AC1 ask the browser for the device position (coords include accuracy in metres)
function getPosition(ok,fail){
  if(!navigator.geolocation){fail('This browser cannot share its location.',0);return}
  navigator.geolocation.getCurrentPosition(function(pos){ok(pos.coords)},function(err){fail(geoErrorText(err.code),err.code)},{enableHighAccuracy:true,timeout:10000,maximumAge:0});
}
// FR-1 AC2 turn the lookup answer into one of our supported provinces (exact name match, null if none)
function provFromAddress(a){
  var names=[a.state,a.province,a.city,a.county,a.region].filter(Boolean).map(function(s){return String(s).toLowerCase().replace(/ province$/,'').trim()});
  for(var p=0;p<PROVS.length;p++)for(var k=0;k<PROVS[p].alias.length;k++)if(names.indexOf(PROVS[p].alias[k])>-1)return PROVS[p].id;
  return null;
}
// FR-1 AC2 ask OpenStreetMap Nominatim which province these coordinates are in (8 s timeout)
function lookupProvince(lat,lng,ok,fail){
  var ctl=window.AbortController?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},8000);
  fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=5&accept-language=en&lat='+lat+'&lon='+lng,ctl?{signal:ctl.signal}:{})
    .then(function(r){if(!r.ok)throw new Error('http');return r.json()})
    .then(function(j){clearTimeout(to);ok(provFromAddress(j.address||{}))})
    .catch(function(){clearTimeout(to);fail()});
}
// FR-1 "Detect location" button: GPS -> province lookup -> preselect it. Every failure leaves the manual list usable (NFR-4).
function detectLocation(){
  S.det={st:'busy',msg:''};all();
  getPosition(function(c){
    lookupProvince(c.latitude,c.longitude,function(id){
      if(!id){S.det={st:'err',msg:'Your position was found, but it is not in a province this prototype supports. Please choose your province from the list.'};all();return}
      S.prov=id;S.provFrom='location';S.loc='granted';S.gps={lat:c.latitude,lng:c.longitude,acc:c.accuracy,prov:id};
      S.det={st:'ok',msg:'Detected '+prov(id).en+' \u00b7 accuracy about '+Math.round(c.accuracy)+' m. Tap Continue to use it.'};all();
    },function(){S.det={st:'err',msg:'Your position was found, but the province lookup failed (no connection, or the service is busy). Please choose your province from the list.'};all()});
  },function(msg,code){if(code===1)S.loc='denied';S.det={st:'err',msg:msg+' Please choose your province from the list.'};all()});
}
// FR-5 / nearby "Turn on location": GPS only (no lookup); the province stays as the user chose it
function turnOnLocation(){
  toast('Finding your position\u2026');
  getPosition(function(c){S.gps={lat:c.latitude,lng:c.longitude,acc:c.accuracy,prov:S.prov};S.loc='granted';all();toast('Location is on \u00b7 accuracy about '+Math.round(c.accuracy)+' m')},function(msg){toast(msg)});
}
// FR-2 / FR-4 home: type what happened (FR-4) or tap one of the emergency categories (FR-2)
function sHome(){
  return head()+bannerHTML()+'<h1>What happened?</h1><p class="sub">Type it the way you would tell a friend. English or Thai.</p>'+
  '<div class="box"><label for="q" style="position:absolute;left:-9999px">Describe your emergency</label><textarea id="q" placeholder="e.g. I lost my passport in Phuket" maxlength="300">'+esc(S.text)+'</textarea></div>'+
  '<button class="btn btn-primary" data-act="find">Find help</button>'+
  '<p class="hint" style="margin-top:16px">Emergency categories</p>'+catGrid()+
  '<p class="hint" style="margin-top:18px">Find nearby</p>'+nbGrid()+'<button class="btn btn-ghost" data-act="cats" style="margin-top:14px">Browse hotlines by category</button>';
}
// FR-2 one button per category (icon + short name). Red icon = high urgency, navy icon = low urgency
function catGrid(){return '<div class="cgrid">'+CAT_LIST.map(function(k){var c=CATS[k];return '<button class="cbtn'+(c.urgency==='low'?' low':'')+'" data-act="pickCat" data-v="'+k+'" aria-label="'+esc(c.label)+'"><span class="nbic">'+I[c.icon]+'</span><span>'+esc(c.short)+'</span></button>'}).join('')+'</div>'}
// FR-2 hotline directory + category filter (AC1-AC3)
function sCats(){
  var p=prov(S.prov),f=S.fcat,list=DIR.filter(function(d){return !f||d.cats.indexOf(f)>-1});
  var h=head()+bannerHTML()+'<button class="back" data-act="home">&larr; Back</button>'+'<h1>'+'Hotlines in '+esc(p.en)+'</h1><p class="sub">'+(f?'Showing numbers for '+esc(CATS[f].label.toLowerCase())+'.':'All general hotlines. Tap a category to filter.')+'</p>'+
   '<div class="chips" style="margin-top:0" role="group" aria-label="Category filter"><button class="chip" data-act="clearFilt" aria-pressed="'+(!f)+'">All</button>'+CAT_LIST.map(function(k){return '<button class="chip" data-act="filt" data-v="'+k+'" aria-pressed="'+(f===k)+'">'+esc(CATS[k].label)+'</button>'}).join('')+'</div>';
  if(f){var c=CATS[f];h+='<div class="card" style="margin-top:14px"><h3>'+esc(c.label)+tag(c.urgency)+'</h3><p>'+(c.urgency==='high'?'One-tap call screen, a Thai help card and location sharing.':'A step-by-step plan, a report for the police and where to go.')+'</p><button class="btn btn-primary" data-act="openGuide">Open the guide</button><button class="link" data-act="clearFilt">Clear filter</button></div>'}
  return h+'<div class="card" style="margin-top:14px"><h3>'+(f?'Matching numbers':'General hotlines')+'</h3>'+dirRows(list)+'</div>';
}
// FR-4 review screen: AI-assisted interpretation is simulated in this prototype; the user can review and override category and province
function annotated(){
  var t=S.text,marks=[];
  if(S.catSpan&&S.cat)(S.catSpans||[S.catSpan]).forEach(function(sp){marks.push({s:sp[0],e:sp[1],c:'m-cat'})});
  if(S.provSpan&&S.provFrom==='message')marks.push({s:S.provSpan[0],e:S.provSpan[1],c:'m-prov'});
  marks.sort(function(a,b){return a.s-b.s});
  var o='',i=0;marks.forEach(function(m){if(m.s<i)return;o+=esc(t.slice(i,m.s))+'<mark class="'+m.c+'">'+esc(t.slice(m.s,m.e))+'</mark>';i=m.e});
  return o+esc(t.slice(i));
}
// FR-4 loading state while the sentence is read
function sReading(){return head()+'<div class="reading" aria-live="polite"><p>AI-assisted interpretation</p><p class="hint">Checking the situation, province and urgency…</p><div class="bar"><i></i></div></div>'}
// FR-4 AC1-AC3 review screen: suggested category/province, user can change them (unhappy path: AC2 unrecognised)
function sDraft(){
  var c=S.cat?CATS[S.cat]:null,p=prov(S.prov);
  var h=head()+bannerHTML()+'<button class="back" data-act="home">&larr; Edit message</button><div class="card" style="margin:8px 0 12px"><h3>AI-assisted interpretation</h3><p>Review the suggested details before continuing. You can correct the category or province.</p></div><p class="ms">Interpreted in '+S.ms.toFixed(1)+' s · target under 4 s'+(S.cat&&S.score?' · match: '+(S.score>=3?'strong':S.score===2?'medium':'weak'):'')+'</p>'+
   '<div class="said">'+annotated()+'</div><div class="legend"><span><b style="background:var(--mk-cat)"></b>What happened</span><span><b style="background:var(--mk-prov)"></b>Where</span></div><div class="fields">';
  h+='<div class="field"><div class="field-head"><div><div class="field-k">What happened</div><div class="field-v">'+(c?esc(c.label)+tag(c.urgency):'Not sure yet')+'</div></div><button class="edit" data-act="editCat">'+(S.editing==='cat'?'Done':'Change')+'</button></div>';
  if(S.editing==='cat'){h+='<div class="chips editor" role="group" aria-label="Category">'+CAT_LIST.map(function(k){return '<button class="chip" data-act="setCat" data-v="'+k+'" aria-pressed="'+(S.cat===k)+'">'+esc(CATS[k].label)+'</button>'}).join('')+'</div>';if(!c)h+='<p class="hint">I could not tell from your message. Pick the closest one.</p>'}
  h+='</div><div class="field"><div class="field-head"><div><div class="field-k">Where</div><div class="field-v">'+esc(p.en)+'<span class="field-src">'+(S.provFrom==='message'?'from your message':S.provFrom==='manual'?'chosen by you':'from your location')+'</span></div></div><button class="edit" data-act="editProv">'+(S.editing==='prov'?'Done':'Change')+'</button></div>';
  if(S.editing==='prov')h+='<div class="editor"><label class="field-k" for="sel">Province</label><select id="sel">'+PROVS.map(function(x){return '<option value="'+x.id+'"'+(x.id===S.prov?' selected':'')+'>'+esc(x.en)+'</option>'}).join('')+'</select></div>';
  h+='</div><div class="field"><div class="field-k">How urgent</div><div class="field-v">'+(c?(c.urgency==='high'?'High urgency':'Low urgency')+'<span class="field-src">set by the category</span>':'Set after you pick a category')+'</div></div></div>'+
   altsHTML()+
   '<button class="btn btn-primary" data-act="show"'+(c?'':' disabled')+'>Show help</button>';
  return h;
}
// FR-3 which nearby type matches a category (nearest hospital / police / tourist police)
var CAT_NB={medical:'hospital',police:'police',tourist:'tourist'};
// FR-3 label for the nearest-place card
var NEAREST_LABEL={hospital:'Nearest hospital (ER)',police:'Nearest police station',tourist:'Nearest Tourist Police'};
// FR-3 "nearest hospital / police" card (needs a location fix)
function nearestCard(p){
  var k=CAT_NB[S.cat];
  if(!S.gps||!k||!p.covered)return '';
  var x=nbPlaces(k)[0];
  return '<div class="card"><h3>'+NEAREST_LABEL[k]+'</h3><p><b style="color:var(--ink)">'+esc(x.name)+'</b><br>'+x.km.toFixed(1)+' km · about '+Math.max(1,Math.round(x.km/30*60))+' min by car. Sample entry, worked out on your phone.</p><div class="under" style="margin-top:10px"><button class="btn btn-ghost btn-sm" data-act="route">Route</button><button class="btn btn-ghost btn-sm" data-act="nb" data-v="'+k+'">More nearby</button></div></div>';
}
// FR-3 chooses the high-urgency screen or the low-urgency case pack from the category
function sResult(){
  var c=CATS[S.cat],p=prov(S.prov),high=c.urgency==='high';
  var h=head()+bannerHTML()+'<button class="back" data-act="resBack">&larr; '+(S.text?'Change what I entered':(S.from==='home'?'Back':'Categories'))+'</button>';
  if(!p.covered)h+='<div class="fallback"><b>No local contact on file for '+esc(c.label.toLowerCase())+' in '+esc(p.en)+'.</b> Showing the national hotlines instead.</div>';
  if(high){
    var main=NUMBERS[S.cat][0],th=THAI_CARD[S.cat];
    h+='<div class="band band-high"><h2>'+esc(c.label)+'</h2><p>'+esc(p.en)+'</p><button class="call" data-act="dial" data-v="'+main[0]+'">'+I.phone+'<span><b>Call '+main[0]+'</b><small>'+esc(main[1])+'</small></span></button></div>'+
     '<div class="thai"><p class="thai-k">Show this to someone nearby</p><p class="thai-th" lang="th">'+th[0]+'<br>'+esc(whereTh(p))+'</p><p class="thai-en">'+esc(th[1])+' '+esc(whereEn(p))+'</p></div>'+
     nearestCard(p)+(S.gps?'<div class="card"><h3>Nearby</h3>'+nbGrid()+'</div>':'')+'<button class="btn btn-primary" data-act="share" style="margin:0 0 12px">'+I.pin+' Share my location</button>'+
     '<div class="card"><h3>Other numbers</h3>'+numRows(NUMBERS[S.cat].slice(1))+'</div>';
  }else{
    h+='<div class="band band-low"><h2>'+esc(c.label)+'</h2><p>'+esc(p.en)+'. Answer a few taps. We build your report and your plan.</p></div><div class="card" id="lcform"></div><div id="lcout"></div><div class="card"><h3>Need to talk to someone?</h3>'+numRows(NUMBERS[S.cat])+'</div>';
  }
  h+='<p class="sample">Prototype with sample data. Check numbers before real use.</p><div class="under"><button class="link" data-act="clearCat">Clear category</button><button class="link" data-act="home">Search again</button></div>';
  return h;
}
// Renders Sam's phone (screen router)
function rSam(){
  var m={locpick:sLocpick,home:sHome,cats:sCats,nearby:sNearby,reading:sReading,draft:sDraft,result:sResult};
  $('scr-sam').innerHTML=tr(m[S.screen]());
  if(S.screen==='locpick'){var sel=$('lp');sel.onchange=function(){$('lpGo').disabled=!sel.value};$('lpGo').disabled=!sel.value}
  var sl=$('sel');if(sl)sl.onchange=function(){act('selProv',{})};
  if(S.screen==='result'&&CATS[S.cat].urgency==='low')initLow(prov(S.prov));
  rSheet();
}


/* ############################################################
   SECTION 7 · FR-3 · LOW-urgency case pack (bilingual statement, bring-list, action plan) and full-screen Thai card
   ############################################################ */
// FR-3 AC2-AC3 case pack logic: chips -> Thai/English statement, bring-list, action plan; empty state when nothing is picked
function initLow(p){
  if(!S.lc||S.lc.cat!==S.cat){S.lc={cat:S.cat,kind:S.cat==='passport'?'lost':'stolen',when:'today',items:S.cat==='passport'?{passport:1}:{},place:'',notes:'',copy:null}}
  var L=S.lc,form=$('lcform'),out=$('lcout');
  function chip(g,k,label,on){return '<button class="chip" data-g="'+g+'" data-k="'+k+'" aria-pressed="'+(!!on)+'">'+esc(label)+'</button>'}
  function drawForm(){
    var h='<h3>Tell us the basics</h3>';
    h+='<div class="q"><div class="q-k">Was it lost or stolen?</div><div class="chips" style="margin:0">'+chip('kind','lost','Lost',L.kind==='lost')+chip('kind','stolen','Stolen',L.kind==='stolen')+'</div></div>';
    h+='<div class="q"><div class="q-k">When?</div><div class="chips" style="margin:0">'+WHENS.map(function(w){return chip('when',w[0],w[1],L.when===w[0])}).join('')+'</div></div>';
    h+='<div class="q"><div class="q-k">What is missing? Pick all that apply.</div><div class="chips" style="margin:0">'+ITEMS.map(function(i){return chip('item',i[0],i[1],L.items[i[0]])}).join('')+'</div></div>';
    if(L.items.passport)h+='<div class="q"><div class="q-k">Do you have a photo or copy of your passport?</div><div class="chips" style="margin:0">'+chip('copy','yes','Yes',L.copy===true)+chip('copy','no','No',L.copy===false)+'</div></div>';
    h+='<div class="q"><label class="q-k" for="place">Where? (optional)</label><input id="place" class="txt" type="text" maxlength="80" placeholder="Place name, as on a sign or map" value="'+esc(L.place)+'"></div><div class="q"><label class="q-k" for="notes">Notes (optional)</label><textarea id="notes" class="txt" style="min-height:84px;padding:10px;font-size:16px" placeholder="Report number, officer name, what happened">'+esc(L.notes)+'</textarea></div><p class="hint">Everything stays on this screen. Nothing is saved or sent.</p>';
    form.innerHTML=tr(h);
    [].forEach.call(form.querySelectorAll('.chip'),function(b){b.onclick=function(){
      var g=b.dataset.g,k=b.dataset.k;
      if(g==='kind')L.kind=k;else if(g==='when')L.when=k;
      else if(g==='item'){if(L.items[k])delete L.items[k];else L.items[k]=1;if(k==='passport'&&!L.items.passport)L.copy=null}
      else if(g==='copy')L.copy=(k==='yes');
      drawForm();drawOut();}});
    $('place').oninput=function(){L.place=this.value;drawOut()};
    $('notes').oninput=function(){L.notes=this.value;drawOut()};
  }
  function drawOut(){
    var picked=ITEMS.filter(function(i){return L.items[i[0]]});
    if(!picked.length){out.innerHTML=tr('<div class="card"><p>Pick at least one missing item. Your report and plan appear here.</p></div>');return}
    var now=Date.now(),tNow=bkk(now),w=WHENS.filter(function(x){return x[0]===L.when})[0];
    var evt=L.when==='yest'?bkk(now-864e5):tNow,whenTh=w[2],whenEn=w[3];
    if(L.when==='now')whenTh+=' เวลาประมาณ '+two(tNow.h)+'.'+two(tNow.mi)+' น.';
    if(L.when!=='days'){whenTh+=' (วันที่ '+thDate(evt)+')';whenEn+=' ('+enDate(evt)+')'}
    var verbTh=L.kind==='lost'?'สูญหาย':'ถูกขโมย',verbEn=(picked.length>1?'were ':'was ')+(L.kind==='lost'?'lost':'stolen'),place=L.place.trim();
    var th='ข้าพเจ้าเป็นชาวต่างชาติ ขอแจ้งความว่า'+listTh(picked.map(function(i){return i[2]}))+'ของข้าพเจ้า'+verbTh+' '+whenTh+' '+(place?'บริเวณ '+place+' ':'')+'จังหวัด'+p.th+' ขอใบแจ้งความเพื่อนำไปติดต่อสถานทูตและบริษัทประกันภัย';
    var en='I am a foreigner. I want to report that my '+listEn(picked.map(function(i){return i[3]}))+' '+verbEn+' '+whenEn+(place?' near '+place:'')+', in '+p.en+'. I need a police report for my embassy and my insurance.';
    var bring=[];
    if(L.items.passport){
      if(L.copy===true)bring.push('Your passport photo or scan. This speeds up the embassy a lot.');
      else if(L.copy===false)bring.push('No passport copy? Ask your embassy which ID they accept. A photo saved in email or cloud storage may help.');
      else bring.push('A photo or scan of your passport, if you have one');
      bring.push('Passport photos for the replacement');bring.push('Flight or hotel booking showing your travel dates');
    }
    bring.push('The police report, once you have it');
    if(L.items.phone)bring.push('Phone number, SIM provider, and phone model');
    if(L.items.wallet)bring.push('Bank name and last 4 digits of each card');
    bring.push('Travel insurance policy number');
    var plan=[];
    if(L.items.wallet)plan.push(['Now','Call your bank 24-hour line and block each card.']);
    if(L.items.phone)plan.push(['Now','Lock or locate the phone with its find-my tool. Ask your provider to block the SIM.']);
    plan.push(['Within 24 h, by '+enDateTime(bkk(now+864e5)),'Get the police report at the nearest station. Everything else needs it.']);
    plan.push(['Within 24 to 72 h','Tell your insurer. Check your policy for the exact deadline.']);
    if(L.items.passport){plan.push(['Aim for '+enDate(bkk(now+3*864e5)),'Visit your embassy or consulate with the report. '+hoursStatus(EMB).text+'.']);plan.push(['After the new passport','Go to Immigration to update your visa and stay record.'])}
    var tp=hoursStatus({h24:true}),eb=hoursStatus(EMB);
    var h='<div class="card"><h3>Statement for the officer</h3><p lang="th" class="stmt-th">'+esc(th)+'</p><p class="stmt-en">'+esc(en)+'</p><div class="under" style="margin-top:12px"><button class="btn btn-primary btn-sm" id="full">Show full screen</button><button class="btn btn-ghost btn-sm" id="cp">Copy everything</button></div></div>';
    h+='<div class="card"><h3>Bring with you</h3><ul class="bring">'+bring.map(function(b){return '<li>'+esc(b)+'</li>'}).join('')+'</ul></div>';
    h+='<div class="card"><h3>Your plan, from now</h3><ol class="tl">'+plan.map(function(x){return '<li><span class="tl-t">'+esc(x[0])+'</span><span>'+esc(x[1])+'</span></li>'}).join('')+'</ol></div>';
    h+='<div class="card"><h3>Where to go</h3>';
    if(p.covered)h+='<div class="num"><div><div class="num-n" style="font-size:17px">Tourist Police · '+esc(p.en)+'</div><div class="num-d"><span class="pill pill-on">'+tp.text+'</span> '+(nearestTxt(p)?nearestTxt(p)+' · ':'')+'Sample entry</div></div><button class="btn btn-ghost btn-sm" data-act="route">Route</button></div>';
    else h+='<p>No station on file for '+esc(p.en)+'. Call the national line and they will direct you.</p>';
    if(L.items.passport)h+='<div class="num"><div><div class="num-n" style="font-size:17px">Your embassy or consulate</div><div class="num-d"><span class="pill '+(eb.open?'pill-on':'pill-off')+'">'+eb.text+'</span> Sample hours, no public holidays</div></div><button class="btn btn-ghost btn-sm" data-act="route">Find</button></div>';
    h+='</div>';
    out.innerHTML=tr(h);
    $('full').onclick=function(){showFull(th,en)};
    $('cp').onclick=function(){copyText(th+'\n\n'+en+(L.notes.trim()?'\n\nNotes:\n'+L.notes.trim():'')+'\n\nBring:\n- '+bring.join('\n- ')+'\n\nPlan:\n'+plan.map(function(x){return x[0]+': '+x[1]}).join('\n'))};
  }
  drawForm();drawOut();
}
// FR-3 full-screen Thai card to show a local person
function showFull(th,en,sm){
  var d=document.createElement('div');d.className='full';
  d.innerHTML=tr('<div class="full-in"><p class="full-th" lang="th">'+esc(th)+'</p><p class="full-en">'+esc(en)+'</p>'+(sm?'<p class="full-sm">'+esc(sm)+'</p>':'')+'</div><button class="btn btn-primary" data-act="fullClose">Close</button>');
  $('L-sam').appendChild(d);d.querySelector('button').focus();
}


/* ############################################################
   SECTION 8 · FR-5 · share sheet: choose contact + duration, active view, stop sharing (+ concept demo for emergency services)
   ############################################################ */
// FR-5 AC1-AC3 share sheet: choose contact + duration, active view, stop sharing, ETA input
function sheetHTML(){
  var L=S.link,p=prov(S.prov),b=S.gps?[S.gps.lat,S.gps.lng]:null,mode=S.sh,h='';
  if(mode==='menu'){
    h='<button class="back" data-act="shClose">&larr; Back</button><h2 class="sh-h">Share your location</h2>'+
     (b?'<div class="card" style="padding:0;overflow:hidden">'+mapSVG({})+'<div style="padding:10px 14px"><b>Near '+esc(nearEn())+'</b><div class="num-d">'+esc(prov(S.gps.prov).en)+' · accuracy about '+Math.round(S.gps.acc||0)+' m · map movement is a demo</div></div></div>':'<div class="card"><h3>Location is off</h3><p>Sharing needs your position. Turn on location to continue.</p><button class="btn btn-primary" data-act="gpsOn">Turn on location</button></div>')+
     '<div class="q-k">Who do you want to share it with?</div>'+
     '<button class="opt" data-act="optFriend"><b>Someone I trust, live</b><span>They get a link and see you on a map. Works now, in this version.</span></button>'+
     '<button class="opt" data-act="optOp"><b>The operator, by reading it out</b><span>Big Thai and English text saying where you are. Read it out on the call.</span></button>'+
     '<button class="opt" data-act="optSvc"><b>Emergency services, live <span class="tag tag-future">Future</span></b><span>Police or ambulance see your location. Needs a partnership. Concept demo.</span></button>'+
     '<p class="hint">Your location is shared only when you tap. It ends when you stop or time runs out, then it is deleted.</p>';
  }else if(mode==='setup'){
    h='<button class="back" data-act="shMenu">&larr; Back</button><h2 class="sh-h">Send a live link</h2><div class="q-k" style="margin-top:0">Who gets the link?</div>'+
     CONTACTS.map(function(c){return '<button class="opt" data-act="pick" data-v="'+c.id+'" aria-pressed="'+(L.contact===c.id)+'"><b>'+c.name+'</b><span>'+c.sub+'</span></button>'}).join('')+
     '<div class="q-k">For how long?</div><div class="chips" style="margin-top:0">'+[[1800,'30 minutes'],[7200,'2 hours'],[0,'Until I stop']].map(function(d){return '<button class="chip" data-act="dur" data-v="'+d[0]+'" aria-pressed="'+(L.dur===d[0])+'">'+d[1]+'</button>'}).join('')+'</div>'+
     '<p class="hint">Only the person you pick can open the link. They need no app or login. Your location is deleted when sharing ends.</p><button class="btn btn-primary" data-act="start"'+(L.contact?'':' disabled')+'>Start sharing</button>';
  }else if(mode==='active'){
    h='<button class="back" data-act="shClose">&larr; Back to help</button><div class="band band-low"><h2>Sharing with '+esc(cname())+'</h2><p id="u-left">'+leftTxt()+'</p></div>'+
     '<div class="card" style="padding:0;overflow:hidden">'+mapSVG({})+'<div style="padding:10px 14px"><b>Near '+esc(nearEn())+'</b><div class="hint" style="margin:2px 0 0"><span id="u-sent">Sent just now</span> · <span id="u-coord">'+coord()+'</span></div></div></div>';
    h+='<div class="card"><h3>Keep the line open</h3><p>Stay on the call with the '+mainNum()+' operator. '+esc(cname())+' can see where you are and can meet you or call you.</p>'+(L.calledAt===null?'<button class="btn btn-ghost" data-act="dial" data-v="'+mainNum()+'" style="margin-top:12px">Call '+mainNum()+'</button>':'')+'</div>';
    h+='<button class="btn btn-danger" data-act="stop">Stop sharing</button>';
  }else if(mode==='ended'){
    h='<button class="back" data-act="shClose">&larr; Back to help</button><div class="card"><h3>'+(L.reason==='stopped'?'You stopped sharing':'Sharing ended after the time you set')+'</h3><p>Your location was deleted. '+esc(cname())+' can no longer see it.</p></div><button class="btn btn-primary" data-act="optFriend">Share again</button>';
  }else if(mode==='track'){
    var u=UNIT[S.cat]||'Responder';
    h='<button class="back" data-act="shMenu">&larr; Stop sharing</button><div class="concept"><b>Concept demo, not in the current MVP.</b> The SRS says ResQTh does not auto-dispatch. Live tracking needs a partnership with the dispatch centre. The ETA here is simulated.</div>'+
     '<h2 class="sh-h" id="st"></h2><p class="num-d" style="margin:-6px 0 10px"><b id="eta" style="display:block;font-size:40px;line-height:1.05;color:var(--ink);letter-spacing:-.02em"></b><span id="eta2"></span></p>'+
     '<div class="card" style="padding:0;overflow:hidden">'+mapSVG({route:true})+'</div><div class="card"><ol class="stg" id="stg"></ol></div>';
  }
  return h;
}
// FR-5 renders the share sheet
function rSheet(){
  var ex=$('sheet-el');
  if(!S.sh){if(ex)ex.parentNode.removeChild(ex);return}
  if(!ex){ex=document.createElement('div');ex.id='sheet-el';ex.className='sheet';$('L-sam').appendChild(ex)}
  ex.innerHTML=tr(sheetHTML());
  var f=ex.querySelector('[data-act]');if(f&&!ex.dataset.f){ex.dataset.f='1'}
}


/* ############################################################
   SECTION 9 · FR-5 · ALEX'S PHONE (trusted contact): message, live link, stopped/expired state
   ############################################################ */
// FR-5 AC1-AC3 trusted contact's phone: link, ETA, stopped/expired state
function rAlex(){
  var L=S.link,n=cname(),h='';
  var th2=S.lang==='th';$('v-alex').textContent=th2?trSeg(n+"'s phone"):n+"'s phone";$('pk-alex').textContent=th2?trSeg(n+"'s phone, trusted contact"):n+"'s phone, trusted contact";
  if(L.cview==='messages'){
    h+='<div class="top"><b style="font-size:19px">Messages</b></div>';
    if(!L.msg)h+='<div class="empty">No new messages.<br>When Sam shares a link, it shows up here.</div>';
    else h+='<p class="who">Sam</p><button class="bubble" data-act="openMsg">I need help. Live location ('+(L.dur===0?'until I stop':'ends in '+(L.dur===1800?'30 min':'2 h'))+'): <u>resqth.link/x7K2</u></button><div class="time">'+clk(L.startT)+'</div>';
  }else{
    h+='<button class="back" data-act="backMsg">&larr; Messages</button><div class="urlbar">'+I.lock+'<span>resqth.link/x7K2</span></div>';
    if(L.phase==='active'){
      var cat=L.catLabel||(CATS[S.cat]?CATS[S.cat].label:'Emergency');
      h+='<div class="band band-high"><h2>Sam needs help</h2><p>'+esc(cat)+' · '+esc(prov(S.gps?S.gps.prov:S.prov).en)+'</p></div>'+
       '<div class="card" style="padding:0;overflow:hidden">'+mapSVG({label:true})+'<div style="padding:10px 14px"><span class="live"></span><b>Live, near '+esc(nearEn())+'</b> <span class="hint" id="c-upd" style="margin:0">Updated just now</span><div class="hint" style="margin:2px 0 0" id="c-coord">'+coord()+'</div></div></div>';
      h+='<div class="card"><h3>What you can do</h3><p>Call Sam, or go to the spot on the map. If you cannot reach Sam, call '+mainNum()+'.</p></div>';
      h+='<button class="btn btn-primary" data-act="callSam">Call Sam</button><button class="btn btn-ghost" data-act="mapOpen">Open in Maps</button><button class="btn btn-ghost" data-act="dial" data-v="'+mainNum()+'">Call '+mainNum()+' for Sam</button><p class="hint">Sam chose to share this with you. <span id="c-left">'+leftTxt()+'.</span></p>';
    }else{
      h+='<div class="card"><h3>'+(L.reason==='stopped'?'Sam stopped sharing':'This link has expired')+'</h3><p>The location was deleted. If you cannot reach Sam, call '+mainNum()+'.</p></div><button class="btn btn-primary" data-act="callSam">Call Sam</button>';
    }
  }
  $('scr-alex').innerHTML=tr(h);
}
// Phone switcher state + page language
function chrome(){
  document.documentElement.lang=S.lang==='th'?'th':'en';applyStatic();
  $('phones').dataset.view=S.view;
  $('v-sam').setAttribute('aria-pressed',S.view==='sam');$('v-alex').setAttribute('aria-pressed',S.view==='alex');
  $('v-alex').classList.toggle('ping',S.ping&&S.view!=='alex');
}
// Re-render both phones
function all(){rSam();rAlex();chrome()}


/* ############################################################
   SECTION 10 · ACTIONS · one switch for every button (data-act) + the read() loading step
   ############################################################ */
// FR-5 AC3 sharing stops (user pressed stop, or time ran out) and the location is deleted
function endShare(reason){S.link.phase='ended';S.link.reason=reason;if(S.sh==='active')S.sh='ended';all();toast(reason==='stopped'?'Sharing stopped. Location deleted.':'Time is up. Link expired and location deleted.')}
// FR-4 runs the parser with a short loading state, then opens the review screen
function read(){
  S.screen='reading';all();
  var t0=performance.now();
  setTimeout(function(){
    var r=parse2(S.text);S.cat=r.cat;S.catSpan=r.catSpan;S.catSpans=r.spans;S.alts=r.alts;S.special=r.special;S.score=r.score;
    if(r.prov){setProv(r.prov);S.provSpan=r.provSpan;S.provFrom='message'}else{S.provSpan=null;if(S.provFrom==='message')S.provFrom=S.loc==='granted'?'location':'manual'}
    S.ms=(performance.now()-t0)/1000;S.editing=r.cat?null:'cat';S.screen='draft';all();
  },700+Math.random()*700);
}
// USER ACTIONS: one switch for every button (data-act). FR-1 detect/lpGo, FR-2 pickCat/filt, FR-4 find, FR-5 share/stop/ETA
function act(a,d){
  var L=S.link;
  switch(a){
  case 'lang':S.lang=S.lang==='th'?'en':'th';all();return;
  case 'view':S.view=d.v;if(d.v==='alex')S.ping=false;chrome();return;
  case 'gpsOn':turnOnLocation();return;
  case 'detect':detectLocation();return;
  case 'selProv':var sv=$('sel').value;setProv(sv);S.provFrom='manual';S.provSpan=null;all();return;
  case 'chgLoc':S.det={st:'idle'};S.screen='locpick';all();return;
  case 'lpGo':var v=$('lp').value;if(!v)return;var kept=!!(S.gps&&S.gps.prov===v);setProv(v);S.loc=kept?'granted':'chosen';S.provFrom=kept?'location':'manual';S.screen='home';all();return;
  case 'home':S.screen='home';S.editing=null;all();return;
  case 'find':var q=$('q').value.trim();if(!q){toast('Type what happened first');return}S.text=q;read();return;
  case 'cats':S.text='';S.catSpan=null;S.provSpan=null;S.fcat=null;S.screen='cats';all();return;
  case 'filt':S.fcat=d.v;all();return;
  case 'clearFilt':S.fcat=null;all();return;
  case 'openGuide':S.cat=S.fcat;S.catSpan=null;S.text='';S.from='cats';S.screen='result';all();$('scr-sam').scrollTop=0;return;
  case 'nb':S.nb=d.v;S.nbSel=0;S.screen='nearby';all();return;
  case 'nbType':S.nb=d.v;S.nbSel=0;all();return;
  case 'nbSel':S.nbSel=+d.v;all();return;
  case 'pickCat':S.cat=d.v;S.catSpan=null;S.text='';S.from='home';S.screen='result';all();$('scr-sam').scrollTop=0;return;
  case 'clearCat':S.fcat=null;S.cat=null;S.catSpan=null;S.text='';S.screen='cats';all();toast('Showing general hotlines');return;
  case 'editCat':S.editing=S.editing==='cat'?null:'cat';all();return;
  case 'editProv':S.editing=S.editing==='prov'?null:'prov';all();return;
  case 'setCat':S.cat=d.v;S.catSpan=null;S.editing=null;all();return;
  case 'show':S.editing=null;S.screen='result';all();$('scr-sam').scrollTop=0;return;
  case 'resBack':S.screen=S.text?'draft':(S.from==='home'?'home':'cats');all();return;
  case 'dial':if(L.calledAt===null&&d.v===mainNum()&&S.view==='sam')L.calledAt=S.t;toast('Prototype: would dial '+d.v);if(S.sh==='active')rSheet();return;
  case 'route':toast('Prototype: would open maps');return;
  case 'fullClose':var f=document.querySelector('#L-sam .full');if(f)f.parentNode.removeChild(f);return;
  case 'share':S.sh=L.phase==='active'?'active':'menu';rSheet();return;
  case 'openActive':S.sh='active';rSheet();return;
  case 'shClose':S.sh=null;S.trk=null;rSheet();rSam();return;
  case 'shMenu':S.sh='menu';S.trk=null;rSheet();return;
  case 'optFriend':if(!S.gps){toast('Turn on location first');return}S.sh=L.phase==='active'?'active':'setup';if(L.phase==='ended'){S.link=freshLink();S.link.calledAt=L.calledAt;S.sh='setup'}rSheet();return;
  case 'optOp':if(!S.gps){toast('Turn on location first');return}var b=[S.gps.lat,S.gps.lng],p=prov(S.gps.prov);showFull(whereTh(p),whereEn(p),'If the operator asks for coordinates: '+b[0].toFixed(4)+' N, '+b[1].toFixed(4)+' E');return;
  case 'optSvc':if(!S.gps){toast('Turn on location first');return}S.sh='track';S.trk={t0:Date.now()};rSheet();return;
  case 'pick':L.contact=d.v;rSheet();return;
  case 'dur':L.dur=+d.v;rSheet();return;
  case 'start':
    L.cat=S.cat;L.num=mainNum();L.catLabel=CATS[S.cat]?CATS[S.cat].label:'Emergency';L.phase='active';L.startT=S.t;L.expireAt=L.dur===0?Infinity:S.t+L.dur;L.lastUpd=S.t;L.updates=1;L.msg=true;L.cview='messages';L.opened=false;S.ping=true;S.sh='active';
    all();toast(cname()+' got the link. '+(wide()?cname()+"'s phone is on the right.":'Switch to '+cname()+"'s phone to see it."));return;
  case 'stop':endShare('stopped');return;
  case 'openMsg':L.cview='link';L.opened=true;rAlex();return;
  case 'backMsg':L.cview='messages';rAlex();return;
  case 'callSam':toast('Prototype: would call Sam');return;
  case 'mapOpen':toast("Prototype: would open maps at Sam's position");return;
  }
}
document.addEventListener('click',function(e){
  var g=e.target.closest('.chip[data-g]');if(g)return;
  var b=e.target.closest('[data-act]');if(!b||b.disabled)return;act(b.dataset.act,b.dataset);
});
document.addEventListener('keydown',function(e){
  if(e.target&&e.target.id==='q'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();act('find',{})}
});


/* ############################################################
   SECTION 11 · TIMERS · demo clock tick, link expiry, simulated position drift, concept responder movement
   ############################################################ */
// FR-5 timer: simulated movement of the live position on the map
function drift(){
  var L=S.link;L.x=Math.max(150,Math.min(250,L.x+(Math.random()-.5)*7));L.y=Math.max(110,Math.min(190,L.y+(Math.random()-.5)*7));
  [].forEach.call(document.querySelectorAll('.pinG'),function(g){g.setAttribute('transform','translate('+L.x+','+L.y+')')});
}
// FR-5 timer helper: update text only if it changed
function setT(id,v){var el=$(id);if(S.lang==='th')v=trSeg(v);if(el&&el.textContent!==v)el.textContent=v}
// FR-5 concept demo only: responder moves toward the user
function trackTick(){
  var route=$('route'),unit=$('unit');if(!route||!unit||!S.trk)return;
  var pr=Math.min(1,(Date.now()-S.trk.t0)/24000),len=route.getTotalLength(),pt=route.getPointAtLength(len*pr);
  unit.setAttribute('transform','translate('+pt.x+','+pt.y+')');
  var mins=Math.max(0,Math.ceil((1-pr)*8)),stage=pr>=1?3:pr<0.06?1:2,u=UNIT[S.cat]||'Responder',tt=bkk(Date.now()+mins*60000);
  setT('st',stage===1?'Assigning a unit':stage===2?u+' is on the way':u+' has arrived');
  setT('eta',stage===3?'Here now':mins+' min');
  setT('eta2',stage===3?'':((1-pr)*2.1).toFixed(1)+' km away · arrives about '+two(tt.h)+':'+two(tt.mi));
  var names=['Call received','Unit assigned','On the way','Arrived'],st=$('stg');
  if(st&&st.dataset.s!==String(stage)){st.dataset.s=stage;st.innerHTML=names.map(function(n,i){return '<li class="'+(i<stage?'done':i===stage?'cur':'')+'"><i></i>'+n+'</li>'}).join('')}
}
setInterval(function(){
  S.t+=0.25;
  if(S.sh==='track')trackTick();
  var L=S.link;if(L.phase!=='active')return;
  if(S.t>=L.expireAt){endShare('expired');return}
  var due=false;while(S.t-L.lastUpd>=10){L.lastUpd+=10;due=true;L.updates++}
  if(due){drift();setT('u-coord',coord());setT('c-coord',coord())}
  var ago=Math.floor(S.t-L.lastUpd);
  setT('u-sent',ago<2?'Sent just now':'Sent '+ago+' s ago');setT('c-upd',ago<2?'Updated just now':'Updated '+ago+' s ago');
  setT('u-left',leftTxt());setT('b-left',leftTxt());setT('c-left',leftTxt()+'.');
},250);

PROVS.forEach(function(p){DICTL[p.en.toLowerCase()]=p.th});
all();
