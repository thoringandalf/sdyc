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
  let db=firebase.firestore();
  const boats = db.collection("Boats");


  /*** *** DATABASE DEPENDENT RENDERERS *** ***/
  
  const addVesselSelections = () => {
    while(e("vessel").childElementCount > 3) {
      e("vessel").removeChild(e("vessel").lastChild)
    }
    boats.where("Available","==",true).get().then((documents) => {
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
    while(e("groupSize").childElementCount > 1) {
      e("groupSize").removeChild(e("groupSize").lastChild)
    }
    boats.doc(e("vessel").options[e("vessel").selectedIndex].text).get().then((doc) => {
      let boat = doc.data();
      for(let i=0; i < boat["Max Capacity"]; i++) {
        let option = document.createElement("option");
        option.innerHTML = i+1;
        option.value = i+1;
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
    for(let i=0; i < 3; i++) {
      if(togglesConfig[i]) {
          boats.doc("Dragonfly").collection(reqCats[i]).where("monthInt","==",displayedMonth).where("yearInt","==",displayedYear).orderBy("time").get().then((reqsBatch) => {
            reqsBatch.docs.map((req) => {
              let d = req.data();
          let slat = document.createElement("div");
          slat.classList.add("div-block-175", `${styleCats[i]}Slat`);
          slat.innerHTML = `${beautify(d.time)} · ${d.vessel}`;
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
          for(let i=0; i < boatsBatch.docs.length; i++) {
            let boat = boatsBatch.docs[i];
            if(boat.id !== "Dragonfly" && boat.id !== "Sundancer") {
              boats.doc(boat.id).collection("Pending Requests").where("monthInt","==",displayedMonth).where("yearInt","==",displayedYear).orderBy("time").get().then((reqsBatch) => {
              reqsBatch.docs.map((req) => {
                let d = req.data();
                let slat = document.createElement("div");
                slat.classList.add("div-block-175", 'externalSlat');
                slat.innerHTML = `${beautify(d.time)} · ${d.vessel.substring(0,13)}`;
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
         if(vessel !== "Dragonfly") {
          e("acceptButton").style.display = "none";
        e("bookButton").style.display = "none";
        e("cancelButton").style.display = "none"
      } else {
          if(reqType === "Pending Requests" || reqType === "Booked Charters") {
            e("bookButton").style.display = "none";
          e("acceptButton").addEventListener("click", () => {
              moveRequest(req, vessel, doc.id, "Pending Requests", "Accepted Requests")
          })
        }
        if(reqType === "Accepted Requests" || reqType === "Booked Charters") {
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
          if(boat.data().Available) {
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
        for(key in days) {
          if(days[key]) {
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
      for(key in pricesMap) {
          e(key).value = pricesMap[key]
      }
    })
  }


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
