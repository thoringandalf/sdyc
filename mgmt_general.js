/*** *** INITIALIZE DATABASE *** ***/

let fbConfig = {
    apiKey: "AIzaSyCKglbCZu9tlbuuTDII5K5BbMC1j1cYC_I",
    authDomain: "sdyc-v2.firebaseapp.com",
    projectId: "sdyc-v2",
    storageBucket: "sdyc-v2.appspot.com",
    messagingSenderId: "468655640557",
    appId: "1:468655640557:web:1ba009d1429f3a722121e4",
    measurementId: "G-DWNFXV7GPY"
}
firebase.initializeApp(fbConfig);
let db = firebase.firestore();
const boats = db.collection("Boats");

/*** *** GLOBAL CONSTANTS *** ***/

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const monthsOfYear = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"]

/*** *** GLOBAL VARIABLES *** ***/

let today = new Date();

let todaysMonth = 0;
let todaysDate = 0;
let todaysYear = 0;

let displayedMonth = 3;
let displayedYear = 2022;

let numberOfCards = 0;

let togglesConfig = [true, true, true, true]

/*** *** CLIENT-SIDE UTILITY FUNCTIONS *** ***/

const initializeDateVars = () => {
    todaysMonth = today.getMonth();
    todaysDate = today.getDate();
    todaysYear = today.getFullYear();
    displayedMonth = todaysMonth;
    displayedYear = todaysYear;
}

const isLeapYear = () => {
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

const e = (idName) => { return document.getElementById(idName) }

const getFirstDay = () => {
    let date = new Date(`${monthsOfYear[displayedMonth]} 01, ${displayedYear}`);
    return date.getDay();
}

const beautify = (when) => {
    if (when.length > 5) {
        let month = monthsOfYear[parseInt(when.substring(5, 7)) - 1];
        let date = when.substring(8);
        let year = when.substring(0, 4);
        return (`${month} ${date}, ${year}`)
    } else {
        let hour = parseInt(when.substring(0, 2));
        let minute = when.substring(3);
        let mode = 'AM';
        if (hour == 0) {
            hour = 12
        }
        if (hour >= 12) {
            mode = 'PM'
        }
        if (hour > 12) {
            hour = hour - 12
        }
        return (`${hour}:${minute} ${mode}`)
    }
}

const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
}

const calcNumberOfCards = () => {
    let numberOfDays = daysInMonth(displayedMonth, displayedYear);
    let firstDay = getFirstDay();
    let numberOfRows = Math.ceil((numberOfDays - (7 - firstDay)) / 7) + 1;
    numberOfCards = numberOfRows * 7;
}

/*** *** DATABASE DEPENDENT RENDERERS *** ***/

const addVesselSelections = () => {
    while (e("vessel").childElementCount > 3) {
        e("vessel").removeChild(e("vessel").lastChild)
    }
    boats.where("Available", "==", true).get().then((documents) => {
        documents.forEach((doc) => {
            if (doc.id != "Dragonfly" && doc.id != "Sundancer") {
                let option = document.createElement("option");
                option.innerHTML = doc.id;
                option.value = doc.id;
                e("vessel").appendChild(option);
            }
        })
    })
}

const changeCapacitySelections = () => {
    while (e("groupSize").childElementCount > 1) {
        e("groupSize").removeChild(e("groupSize").lastChild)
    }
    boats.doc(e("vessel").options[e("vessel").selectedIndex].text).get().then((doc) => {
        let boat = doc.data();
        for (let i = 0; i < boat["Max Capacity"]; i++) {
            let option = document.createElement("option");
            option.innerHTML = i + 1;
            option.value = i + 1;
            e("groupSize").appendChild(option)
        }
    })
}

const clearSlats = () => {
    let slats = document.querySelectorAll(".div-block-175");
    slats.forEach((slat) => {
        slat.remove()
    })
}

const renderMainRequests = () => {
    clearSlats();
    let reqCats = ["Pending Requests", "Accepted Requests", "Booked Charters"];
    let styleCats = ["pending", "accepted", "booked"]
    for (let i = 0; i < 3; i++) {
        if (togglesConfig[i]) {
            boats.doc("Dragonfly").collection(reqCats[i]).where("monthInt", "==", displayedMonth).where("yearInt", "==", displayedYear).orderBy("time").get().then((reqsBatch) => {
                reqsBatch.docs.map((req) => {
                    let d = req.data();
                    let slat = document.createElement("div");
                    slat.classList.add("div-block-175", `${styleCats[i]}Slat`);
                    slat.innerHTML = `${beautify(d.time)} ?? ${d.vessel}`;
                    slat.setAttribute("id", req.id)
                    slat.setAttribute("vessel", d.vessel)
                    slat.setAttribute("reqType", reqCats[i])
                    e(`ds${getFirstDay() + d.dateInt - 1}`).classList.add("div-block-165")
                    e(`ds${getFirstDay() + d.dateInt - 1}`).appendChild(slat)
                    slat.addEventListener("click", () => { populateReqCard(req.id, reqCats[i], d.vessel, i) })
                })
            })
        }
    }
}

const renderExternalRequests = () => {
    if (togglesConfig[3]) {
        boats.get().then((boatsBatch) => {
            for (let i = 0; i < boatsBatch.docs.length; i++) {
                let boat = boatsBatch.docs[i];
                if (boat.id !== "Dragonfly" && boat.id !== "Sundancer") {
                    boats.doc(boat.id).collection("Pending Requests").where("monthInt", "==", displayedMonth).where("yearInt", "==", displayedYear).orderBy("time").get().then((reqsBatch) => {
                        reqsBatch.docs.map((req) => {
                            let d = req.data();
                            let slat = document.createElement("div");
                            slat.classList.add("div-block-175", 'externalSlat');
                            slat.innerHTML = `${beautify(d.time)} ?? ${d.vessel.substring(0, 13)}`;
                            slat.setAttribute("id", req.id)
                            slat.setAttribute("vessel", d.vessel)
                            slat.setAttribute("reqType", "Pending Requests")
                            e(`ds${getFirstDay() + d.dateInt - 1}`).classList.add("div-block-165")
                            e(`ds${getFirstDay() + d.dateInt - 1}`).appendChild(slat)
                            slat.addEventListener("click", () => { populateReqCard(req.id, "Pending Requests", d.vessel, 3) })
                        })
                    })
                }
            }
        })
    }
}

const populateReqCard = (id, reqType, vessel, styleCat) => {
    boats.doc(vessel).collection(reqType).doc(id).get().then((doc) => {
        openReqCard();
        let catColors = ["#f58310", "#0f9d58", "#4285f4", "#555"];
        let req = doc.data();
        e("vesselReqCard").innerHTML = req.vessel;
        e("charterTypeReqCard").innerHTML = req.charterType;
        e("dateReqCard").innerHTML = beautify(req.date);
        e("timeReqCard").innerHTML = beautify(req.time);
        e("nameReqCard").innerHTML = `${req.firstName} ${req.lastName}`;
        e("groupSizeReqCard").innerHTML = `${req.groupSize} Total People`;
        e("phoneReqCard").innerHTML = req.phone;
        e("emailReqCard").innerHTML = req.email;
        e("notesReqCard").innerHTML = req.notes;
        e("indicatorReqCard").style.backgroundColor = catColors[styleCat];
        e("indicatorReqCard").style.color = catColors[styleCat];
        ///					///					///					///					///					///
        if (vessel !== "Dragonfly") {
            e("acceptButton").style.display = "none";
            e("bookButton").style.display = "none";
            e("cancelButton").style.display = "none"
        } else {
            if (reqType === "Pending Requests" || reqType === "Booked Charters") {
                e("bookButton").style.display = "none";
                e("acceptButton").addEventListener("click", () => {
                    moveRequest(req, vessel, doc.id, "Pending Requests", "Accepted Requests")
                })
            }
            if (reqType === "Accepted Requests" || reqType === "Booked Charters") {
                e("acceptButton").style.display = "none";
                e("bookButton").addEventListener("click", () => {
                    moveRequest(req, vessel, doc.id, "Accepted Requests", "Booked Charters")
                })
            }
            e("cancelButton").addEventListener("click", () => {
                moveRequest(req, vessel, doc.id, reqType, "Cancelled")
            })
        }
        e("deleteButton").addEventListener("click", () => {
            moveRequest(req, vessel, doc.id, reqType, "Deleted")
        })
        positionReqCard(id);
    })
}

const initializeBoatBoxes = () => {
    boats.get().then((boatsBatch) => {
        boatsBatch.forEach((boat) => {
            if (boat.data().Available) {
                e(`${boat.id.replace(/\s/g, '')}Box`).checked = true;
            } else {
                e(`${boat.id.replace(/\s/g, '')}Box`).checked = false;
            }
        })
    })
}

const initializeDayBoxes = () => {
    boats.doc("Dragonfly").get().then((boat) => {
        let days = boat.data()["Available Days"];
        for (key in days) {
            if (days[key]) {
                e(key).checked = true
            } else {
                e(key).checked = false
            }
        }
    })
}

const initializePrices = () => {
    boats.doc("Dragonfly").get().then((doc) => {
        let pricesMap = doc.data()["Charter Types"];
        for (key in pricesMap) {
            e(key).value = pricesMap[key]
        }
    })
}

/*** *** DATABASE MANAGEMENT *** ***/

const initializeRequests = () => {
    let sampleRequest = {
        firstName: "Donald",
        lastName: "Duck",
        email: "donaldDuck@gmail.com",
        phone: "3333333333",
        date: null,
        time: "8:00",
        charterType: "Charter Type",
        vessel: null,
        groupSize: 5,
        notes: "This is a test request. Please ignore.",
        invoiceNumber: `220327MS6K`,
        monthInt: 3,
        dateInt: null,
        yearInt: 2022
    }
    boats.get().then((batchBoats) => {
        batchBoats.docs.map((boat, index) => {
            sampleRequest.date = `2022-04-0${index}`;
            sampleRequest.dateInt = index;
            sampleRequest.vessel = boat.id;
            boats.doc(boat.id).collection("Booked Charters").add(sampleRequest)
        })
    })
}

const addCharter = () => {
    boats.doc(e("vessel").options[e("vessel").selectedIndex].text).collection("Pending Requests").add({
        firstName: e('firstName').value,
        lastName: e('lastName').value,
        phone: e('phone').value,
        email: e('email').value,
        date: e('date').value,
        time: e('time').value.padStart(5, "0"),
        monthInt: parseInt(e('date').value.substring(5, 7)) - 1,
        dateInt: parseInt(e('date').value.substring(8)),
        yearInt: parseInt(e('date').value.substring(0, 4)),
        vessel: e('vessel').value,
        charterType: e('charterType').options[e('charterType').selectedIndex].text,
        groupSize: parseInt(e('groupSize').options[e('groupSize').selectedIndex].text),
        notes: e('notes').value
    }).then((docRef) => {
        let docRefID = docRef.id;
        e('sectionAddCharter').style.opacity = 0;
        docRef.update({
            invoiceNumber: `${todaysYear.toString().substring(2, 4)}${(todaysMonth + 1).toString().padStart(2, "0")}${todaysDate.toString().padStart(2, "0")}${docRefID.substring(0, 4)}`
        }).then(() => {
            closeAddCharterForm();
            renderMainRequests();
            renderExternalRequests();
        })
    })
}

const cleanupDB = () => {
    boats.get().then((boatsBatch) => {
        boatsBatch.docs.map((boat) => {
            boats.doc(boat.id).collection("Accepted Requests").get().then((req, i) => {
                if (i != 0) {
                    boats.doc(boat.id).collection("Accepted Requests").doc(req.id).delete()
                }
            })
        })

    })
}

const moveRequest = (req, vessel, docID, from, to) => {
    boats.doc(vessel).collection(to).doc(docID).set(req).then(() => {
        boats.doc(vessel).collection(from).doc(docID).delete()
    }).then(() => {
        location.reload();
    })
}

const updatePrices = () => {
    let data = {
        "2-hr": 0,
        "3-hr": 0,
        "4-hr": 0,
        "Sunset": 0
    }
    let prices = document.querySelectorAll('.priceinput');
    prices.forEach((input) => {
        data[input.id] = parseInt(input.value)
    })
    boats.doc("Dragonfly").update({
        "Charter Types": data
    }).then(() => { initializePrices() })
}

const updateDaysBoxes = () => {
    let data = {
        MON: null,
        TUE: null,
        WED: null,
        THU: null,
        FRI: null,
        SAT: null,
        SUN: null
    }
    let boxes = document.querySelectorAll(".daysbox");
    boxes.forEach((box) => {
        data[box.id] = box.checked
    })
    boats.doc("Dragonfly").update({ "Available Days": data }).then(() => {
        initializeDayBoxes()
    })
}

const updateBoatBoxes = () => {
    boats.get().then((boatsBatch) => {
        boatsBatch.forEach((boat) => {
            boats.doc(boat.id).update({
                Available: e(`${boat.id.replace(/\s/g, '')}Box`).checked
            }).then(() => { initializeBoatBoxes() })
        })
    })
}

/*** *** CLIENT-SIDE DATA-FILL FUNCTIONS *** ***/

const populateCalendarHeading = () => {
    e("monthLabelCal").innerHTML = monthsOfYear[displayedMonth];
    e("yearLabelCal").innerHTML = displayedYear;
}

const generateDateCards = () => {
    calcNumberOfCards();
    for (let i = 0; i < numberOfCards; i++) {
        let label = document.createElement("div");
        label.classList.add("labeldatesquare");
        label.setAttribute('id', `lds${i}`);
        let card = document.createElement("div");
        card.classList.add("datesquare");
        card.setAttribute('id', `ds${i}`);
        card.appendChild(label);
        e("gridCalendar").appendChild(card);
    }
}

const destroyDateCards = () => {
    for (let i = 0; i < numberOfCards; i++) {
        e("gridCalendar").removeChild(e(`ds${i}`))
    }
}

const populateDateCards = () => {
    destroyDateCards();
    generateDateCards();
    let firstDay = getFirstDay();
    for (let i = firstDay; i < firstDay + daysInMonth(displayedMonth, displayedYear); i++) {
        e(`lds${i}`).innerHTML = i - firstDay + 1
    }
    highlightToday();
}

const changeMonth = (direction) => {
    if (direction === "forward") {
        if (displayedMonth === 11) {
            displayedMonth = 0;
            displayedYear++;
        } else {
            displayedMonth++
        }
    } else if (direction === "backward") {
        if (displayedMonth == 0) {
            displayedMonth = 11;
            displayedYear--;
        } else {
            displayedMonth--
        }
    }
    populateCalendarHeading();
    populateDateCards();
    renderMainRequests();
    renderExternalRequests();
}

const switchToggles = (x) => {
    togglesConfig[x] = !togglesConfig[x];
    fillToggles();
    renderMainRequests();
    renderExternalRequests();
}

/*** *** DOM MANIPULATION *** ***/

const switchSidebarTabs = (x) => {
    console.log("this ran")
    for (let i = 0; i < 3; i++) {
        if (i === x) {
            e(`tab_${i}`).classList.add('tabselected');
            e(`menu_${i}`).style.display = "block";
        } else {
            e(`tab_${i}`).classList.remove('tabselected');
            e(`menu_${i}`).style.display = "none";
        }
    }
}

const fillToggles = () => {
    for (let i = 0; i < 4; i++) {
        if (togglesConfig[i] === false) {
            e(`toggleBox${i}`).classList.add("clearedToggle");
            e(`toggleBox${i}`).classList.remove(`toggleBox{i}`)
        } else {
            e(`toggleBox${i}`).classList.remove("clearedToggle");
            e(`toggleBox${i}`).classList.add(`toggleBox${i}`)
        }
    }
}

const highlightToday = () => {
    if (displayedMonth === todaysMonth && displayedYear === todaysYear) {
        e(`lds${getFirstDay() + todaysDate - 1}`).classList.add("todaysdate")
    }
}

e('date').type = 'date';
e('time').type = 'time';
e('time').setAttribute('step', '1800')

const closeAddCharterForm = () => {
    e('sectionAddCharter').style.display = "none"
    e('wf-form-Add-Charter-Form').reset();
}

const openAddCharterForm = () => {
    e('sectionAddCharter').style.opacity = 100;
    e('sectionAddCharter').style.display = "flex";
    addVesselSelections();
    e('groupSize').firstChild.setAttribute("disabled", "disabled")
    e('vessel').firstChild.setAttribute("disabled", "disabled")
    e('charterType').firstChild.setAttribute("disabled", "disabled")
    e('groupSize').firstChild.selected = false;
    e('vessel').firstChild.selected = false;
    e('charterType').firstChild.selected = false;
}

const openReqCard = (el) => {
    e('reqCard').style.display = "flex";
    e("acceptButton").style.display = "inline-block";
    e("bookButton").style.display = "inline-block";
    e("cancelButton").style.display = "inline-block"

}

const closeReqCard = () => {
    e('reqCard').style.display = "none"
}

const positionReqCard = (id) => {
    if (window.innerWidth > 800) {
        let slat = e(id).getBoundingClientRect();
        let topOffset = slat.top + 5;
        let leftOffset = slat.left - 270;
        if (slat.top + e('popup').offsetHeight >= window.innerHeight) {
            topOffset = slat.top - e('popup').offsetHeight + 5
        }
        if (slat.left + e('popup').offsetWidth >= window.innerWidth) {
            leftOffset = slat.left - e('popup').offsetWidth - 280
        }
        e('popup').style.top = `${topOffset}px`;
        e('popup').style.left = `${leftOffset}px`
    }
}

const toggleDays = (bool) => {
    let boxes = document.querySelectorAll(".daysbox");
    boxes.forEach((box) => {
        box.disabled = !bool
    })
    if (bool) {
        e('buttonEditDays').style.display = "none";
        e('buttonUpdateDays').style.display = "inline-block";
    } else {
        e('buttonUpdateDays').style.display = "none";
        e('buttonEditDays').style.display = "inline-block";
    }
}

const toggleBoats = (bool) => {
    let boxes = document.querySelectorAll(".boatbox");
    boxes.forEach((box) => {
        box.disabled = !bool
    })
    if (bool) {
        e('buttonEditBoats').style.display = "none";
        e('buttonUpdateBoats').style.display = "inline-block";
    } else {
        e('buttonUpdateBoats').style.display = "none";
        e('buttonEditBoats').style.display = "inline-block";
    }
}

const togglePrices = (bool) => {
    let inputs = document.querySelectorAll(".priceinput");
    inputs.forEach((input) => {
        input.disabled = !bool
    })
    if (bool) {
        e('buttonEditPrices').style.display = "none";
        e('buttonUpdatePrices').style.display = "inline-block";
    } else {
        e('buttonUpdatePrices').style.display = "none";
        e('buttonEditPrices').style.display = "inline-block";
    }
}

/*** *** EVENT LISTENERS *** ***/

e("monthArrowLeft").onclick = () => { changeMonth("backward") }
e("monthArrowRight").onclick = () => { changeMonth("forward") }

e("tab_0").onclick = () => { switchSidebarTabs(0) }
e("tab_1").onclick = () => { switchSidebarTabs(1) }
e("tab_2").onclick = () => { switchSidebarTabs(2) }

e("toggle0").onclick = () => { switchToggles(0) }
e("toggle1").onclick = () => { switchToggles(1) }
e("toggle2").onclick = () => { switchToggles(2) }
e("toggle3").onclick = () => { switchToggles(3) }

e('buttonNewCharter').onclick = () => { openAddCharterForm() }
e('buttonCloseCharter').onclick = () => { closeAddCharterForm() }
e('screenAddCharter').onclick = () => { closeAddCharterForm() }

e('wf-form-Add-Charter-Form').addEventListener("submit", (event) => {
    event.preventDefault();
    addCharter();
})

e("vessel").onchange = () => { changeCapacitySelections() }

e('reqCardScreen').addEventListener("click", () => { closeReqCard() })

e('xReqCard').addEventListener("click", () => { closeReqCard() })

e('buttonEditDays').addEventListener("click", () => { toggleDays(true) })
e('buttonEditBoats').addEventListener("click", () => { toggleBoats(true) })
e('buttonEditPrices').addEventListener("click", () => { togglePrices(true) })
e('buttonUpdateDays').addEventListener("click", () => { toggleDays(false); updateDaysBoxes() })
e('buttonUpdateBoats').addEventListener("click", () => { toggleBoats(false); updateBoatBoxes() })
e('buttonUpdatePrices').addEventListener("click", () => { togglePrices(false); updatePrices() })


/*** *** ON PAGE LOAD-UP *** ***/

initializeDateVars();
populateCalendarHeading();
populateDateCards();
switchSidebarTabs(0);
fillToggles();
renderMainRequests();
renderExternalRequests();
initializeDayBoxes();
initializeBoatBoxes();
initializePrices();
toggleDays(false);
toggleBoats(false);
togglePrices(false);
