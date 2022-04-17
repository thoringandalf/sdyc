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
      time: e('time').value.padStart(5,"0"),
      monthInt: parseInt(e('date').value.substring(5,7))-1,
      dateInt: parseInt(e('date').value.substring(8)),
      yearInt: parseInt(e('date').value.substring(0,4)),
      vessel: e('vessel').value,
      charterType: e('charterType').options[e('charterType').selectedIndex].text,
      groupSize: parseInt(e('groupSize').options[e('groupSize').selectedIndex].text),
      notes: e('notes').value
    }).then((docRef) => {
        let docRefID = docRef.id;
      e('sectionAddCharter').style.opacity = 0;
      docRef.update({
        invoiceNumber: `${todaysYear.toString().substring(2,4)}${(todaysMonth+1).toString().padStart(2,"0")}${todaysDate.toString().padStart(2,"0")}${docRefID.substring(0,4)}`
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
            if(i!=0) {
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
