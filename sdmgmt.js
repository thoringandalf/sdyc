let fbConfig={apiKey: 'AIzaSyBBX2ENxIX4LkpJUAJPyFXjbHTl9Orm1vc',authDomain:'sdyc-192f7.firebaseapp.com',projectId:'sdyc-192f7',storageBucket:'sdyc-192f7.appspot.com',messagingSenderId:'301361682532',appId:'1:301361682532:web:7c63df90592c36c9bfe771'};
	firebase.initializeApp(fbConfig);let db=firebase.firestore();
  db.collection("booked").get().then((docs)=>{
  	let ids=[]
    docs.forEach((doc)=>{		
      db.collection("accepted").doc(doc.id).delete().then(()=>{

      })
      .catch(()=>{null})
    })
  })
const e=(el)=>{return document.getElementById(el)}
const add=(el,cn)=>{el.classList.add(cn)}
const rem=(el,cn)=>{el.classList.remove(cn)}
const months=['January','February','March','April','May','June','July','August','September','October','November','December']
const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const eventTypes=['pending','accepted','booked'] 

let today = new Date();
let currentDay=today.getDate();let curMon=today.getMonth();let currentYear=today.getFullYear();
let numberOfDays=0;let firstDay=0;let switchesConfig=[true, true, true];
let selectedEventID=null;let selectedEventType=null;let edit=false;

const updatePrices=()=>{
  	db.collection("operatingHrs").doc("prices").update({
  		two:e('pr0').value,
      three:e('pr1').value,
      four:e('pr2').value,
      sun:e('pr3').value
  	})
		.then(()=>{
    	closePrices()
    })
}

const openPrices=()=>{
	for(let i=0; i<4; i++){
  	e(`pr${i}`).disabled=false;
  }
  e('edPr').innerHTML='Done';
  e('edPr').onclick=()=>{updatePrices()}
}

const closePrices=()=>{
	e('edPr').onclick=()=>{openPrices()};
  e('edPr').innerHTML='Edit';
	for(let i=0; i<4; i++){
  	e(`pr${i}`).disabled=true;
  }
  db.collection("operatingHrs").doc("prices").get().then((doc)=>{
  	let d=doc.data();
    e('pr0').value=d.two;
    e('pr1').value=d.three;
    e('pr2').value=d.four;
    e('pr3').value=d.sun
  })
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const side=[e('hs'),e('as'),e('ps')]
const b=[e('hb'),e('ab'),e('pb')]
const rca=e('ra')
const lca=e('la')
const cmy=e('cmy')
const pPopup=e('popup')
const scn=e('scn')
const pop={description:e('popDescription'),date:e('popDate'),name:e('popName'),numPassengers:e('popNumPassengers'),email:e('popEmail'),phone:e('popPhone'),notes:e('popNotes'),indicator:e('popIndicator'),accB:e('popAccept'),canB:e('popCancel'),bookB:e('popBook')}
const pendS=e('pendS');const acceptS=e('acceptS');const bookS=e('bookS');const boxes=[e('pendingBox'),e('acceptedBox'),e('bookedBox')]
const editB=e('editButton')
rca.onclick=()=>{rfsCal(true)}
lca.onclick=()=>{rfsCal(false)}
scn.onclick=()=>{closePopup()}
pendS.onclick=()=>{flipSwitch(0)}
acceptS.onclick=()=>{flipSwitch(1)}
bookS.onclick=()=>{ flipSwitch(2)}
pop.accB.onclick=()=>{transferEvent('pending','accepted',false)}
pop.bookB.onclick=()=>{transferEvent('accepted','booked',false)}
pop.canB.onclick=()=>{transferEvent(`${eventTypes[selectedEventType]}`,`${eventTypes[selectedEventType]}Canceled`,true)}
editB.onclick=()=>{if(edit){updateAvail()}else if(!edit){enableSettings()}}
e('nb').onclick=()=>{e('sb').style.left='0px'}
e('xb').onclick=()=>{e('sb').style.left='-275px'}
e('hb').onclick=()=>{switchSlide(0)}
e('ab').onclick=()=>{switchSlide(1)}
e('pb').onclick=()=>{switchSlide(2)}
const switchSlide=(to)=>{rem(side[to],'h');add(b[to],'s');add(side[(to+1)%3],'h');rem(b[(to+1)%3],'s');add(side[(to+2)%3],'h');rem(b[(to+2)%3],'s')}
const changeSwitchStyling=(num,el)=>{if(switchesConfig[num]){add(el,`selected_${num}`)}else{rem(el,`selected_${num}`)}}
const setNumberOfDays=()=>{if(curMon<7&&curMon%2==0||curMon>6&&curMon% 2==1){numberOfDays=31}else if(curMon!=1&&(curMon<6&&curMon%2==1||curMon>7&&curMon%2==0)){numberOfDays=30}
else if(curMon==1){if(currentYear%4==0){numberOfDays=29}else{numberOfDays=28}}}
const rfsCal=(goingUp)=>{if(goingUp){if(curMon==11){curMon=0;currentYear+=1}
else{curMon+=1}}else{if(curMon==0){curMon=11;currentYear-=1}else{curMon-=1}}cmy.innerHTML=months[curMon]+' '+currentYear;refreshDateSlots()}
const calculateFirstDay=()=>{let firstDate=new Date(currentYear,curMon,1);firstDay=firstDate.getDay()}
const refreshDateSlots=()=>{
	calculateFirstDay();
	setNumberOfDays();
	let td=new Date();
	let t={	day:td.getDate(), month:td.getMonth(), yr:td.getFullYear() }
	for(let i=0;i<42;i++){
		let slot=e(`slot_${i+1}`);slot.innerHTML='';
		slot.onclick=null
	}
	for(let i=1; i<numberOfDays+1;i++){
		let slot=e(`slot_${i+firstDay}`);
		slot.innerHTML=i;
		if(curMon==t.month&&currentYear==t.yr&&i==t.day){add(slot,'td')}
		else{rem(slot,'td')}}
		if(firstDay==5&&numberOfDays>30||firstDay==6&&numberOfDays>29){
			for(let i=36;i<43;i++){rem(e(`dateSlot_${i}`),'h')}}
		else{
			for(let i=36;i<43;i++){add(e(`dateSlot_${i}`),'h')}}refreshEvents()}
const clearEvents=()=>{for(let i=0;i<3;i++){let nodesToRemove=document.getElementsByClassName(`${eventTypes[i]}Event`);let nodesToRemoveArr=[];
for(node of nodesToRemove){nodesToRemoveArr.push(node)}nodesToRemoveArr.map((node) => {node.parentNode.removeChild(node)})}}
const fillPopup=(data,type)=>{let eventDate=new Date(data.year,data.month,data.day);let dayOfWeek=days[eventDate.getDay()];
pop.description.innerHTML=`${data.charterType}`;pop.name.innerHTML=`${data.firstName} ${data.lastName}`;let passengersText='';if(data.numPassengers==2){passengersText=' + 1 additional passenger'}
else if(data.numPassengers>2){passengersText=` + ${data.numPassengers-1} additional passengers` } 
pop.numPassengers.innerHTML=passengersText;pop.date.innerHTML=`${dayOfWeek}, ${months[data.month]} ${data.day}`
pop.email.innerHTML=data.email;pop.phone.innerHTML=data.phone;if(data.notes==''){pop.notes.classList.add('h')}
else{pop.notes.innerHTML=`Notes: ${data.notes}`; rem( pop.notes,'h')}for(let i=0;i<3;i++){pop.indicator.classList.remove(`border_${i}`,`selected_${i}`)}
pop.indicator.classList.add(`border_${type}`,`selected_${type}`);if(type==0){rem(pop.accB,'h');rem(pop.canB,'h');
pop.canB.innerHTML='DECLINE';add(pop.bookB,'h')}else if(type==1){add(pop.accB,'h');rem(pop.canB,'h');
pop.canB.innerHTML='CANCEL';rem( pop.bookB,'h')}else if(type==2){add(pop.accB,'h');rem(pop.canB,'h');pop.canB.innerHTML='CANCEL';add(pop.bookB,'h')}}
const showPopup=(el,data,type)=>{selectedEventID=data.id;selectedEventType=type;fillPopup(data,type);
if(window.innerWidth>990){let sm=el.getBoundingClientRect();let topOffset=sm.top+5;let leftOffset=sm.right+5;if(sm.top+300>=window.innerHeight){topOffset=sm.top-255}
if(sm.right+500>=window.innerWidth){leftOffset=sm.left-455}if(sm.left<=500){leftOffset=sm.left-(250)}
if(sm.left<=475){leftOffset=sm.left+5}popup.style.top=`${topOffset}px`;
popup.style.left=`${leftOffset}px`}popup.classList.remove('h');scn.classList.remove('h')}
const closePopup=()=>{add(scn,'h');add(popup,'h')}
const refreshEvents=()=>{clearEvents();switchesConfig.map((on, index)=>{if(on){getEvents(index)}})} 
const flipSwitch=(num)=>{if(switchesConfig[num]){ switchesConfig[num]=false
let nodesToRemove=document.getElementsByClassName(`${eventTypes[num]}Event`);
let nodesToRemoveArr=[];for(node of nodesToRemove){nodesToRemoveArr.push(node)}
nodesToRemoveArr.map((node)=>{node.parentNode.removeChild(node)})}
else{switchesConfig[num]=true;getEvents(num)}changeSwitchStyling(num,boxes[num])}
const getEvents=(num)=>{db.collection(eventTypes[num]).where('year','==',currentYear).where('month','==',curMon).where('yachtType','==','Sundancer').orderBy('startHr').get().then((requests)=>{requests.forEach((req)=>{let node=document.createElement('DIV');let t=`${req.data().startHr>11?'pm':'am'}`
let hr=`${req.data().startHr>12?req.data().startHr-12:req.data().startHr}`
let min=`${req.data().startMin==0?'00':req.data().startMin}`
node.innerHTML=`${hr}:${min}${t} ${req.data().charterType}`;node.classList.add(`${eventTypes[num]}Event`,'event');node.onclick=()=>{showPopup(node,req.data(),num)};
e(`events_slot_${firstDay+req.data().day}`).appendChild(node)})})}
const transferEvent=(from,to,cancel)=>{db.collection(from).doc(selectedEventID).get().then((event)=>{let tempData=event.data();db.collection(to).doc(selectedEventID).set(tempData).then(()=>{
db.collection(from).doc(selectedEventID).delete().then(()=>{closePopup();if(!cancel&&!switchesConfig[selectedEventType+1]){switchesConfig[selectedEventType+1]=true;}refreshEvents()})})})}
const disableSettings = () => {
    e('editButton').innerHTML = 'Edit'; edit = false; for (let i = 0; i < 7; i++) {
        e(`s${i}`).disabled = true; 
        db.collection('operatingHrsB').doc(days[i].toLowerCase()).get().then((doc) => {
            let d = doc.data(); 
            if (d.am == -1 && d.pm == -1) { e(`tb${i}`).innerHTML = 'Closed'; e(`s${i}`).checked = false }
            else {
                e(`s${i}`).checked = true
            }
        })
    }
    edit = false;
}
const enableSettings = () => {
    for (let i = 0; i < 7; i++) {
        e(`s${i}`).disabled = false; 
            db.collection('operatingHrsB').doc(days[i].toLowerCase()).get().then((doc) => {
                let d = doc.data(); 
                if (d.am == -1 && d.pm == -1) {
                    e(`s${i}`).checked = false
                } else {
                    e(`s${i}`).checked = true
                }
               editB.innerHTML = 'Done'
        })
    }
    edit = true;
}
const sif=(el,i)=>{el.oninput=()=>{if(e(`oh${i}`).value!=''&&e(`om${i}`).value!=''&&e(`ch${i}`).value!=''&&e(`cm${i}`).value!=''){e(`s${i}`).checked=true}else{e(`s${i}`).checked=false}}}
const updateAvail = () => {
    for (let i = 0; i < 7; i++) {
        let am = -1;
        let pm = -1; 
        if (e(`s${i}`).checked) {
            am = 281474976706560;
            pm = 255;
        } 
        db.collection('operatingHrsB').doc(days[i].toLowerCase()).update({
            am: am,
            pm: pm
        }).then(()=>{
        	disableSettings();
        })
    }
    
}
for(let i=0;i<3;i++){add(boxes[i],`border_${i}`);add(boxes[i],`selected_${i}`)};add(e('se'),'h');
add(popup,'h');add(scn,'h');cmy.innerHTML=months[curMon]+' '+currentYear;calculateFirstDay();setNumberOfDays();refreshDateSlots();disableSettings();  
add(e('as'),'h');add(e('ps'),'h');add(b[0],'s');closePrices()