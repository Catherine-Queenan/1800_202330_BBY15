function addPark(code, name, city, province, busyness, details, lat, lng) {
    var parksRef = db.collection("parks");
    parksRef.doc(code).get()
        .then((doc) => {
            if (doc.exists) {
                console.log("Park with code " + code + " already exists.");
            } else {
                parksRef.doc(code).set({
                    code: code,
                    name: name,
                    city: city,
                    province: province,
                    busyness: busyness,
                    details: details,
                    lat: lat,
                    lng: lng,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log("Park with code " + code + " added.");
            }
        })
        .catch((error) => {
            console.error("Error adding park:", error);
        });
}

function addMultipleParks() {
    // Example parks, you can add more or modify as needed
    const parksToAdd = [
        { code: "BBY01", name: "Burnaby Lake Park Trail", city: "Burnaby", province: "BC", busyness: "low", details: "A lovely place for small pups", lat: 49.2467097082573, lng: -122.9187029619698 },
        { code: "AM01", name: "Buntzen Lake Trail", city: "Anmore", province: "BC", busyness: "moderate", details: "Close to town, and relaxing", lat: 49.3399431028579, lng: -122.85908496766939 },
        { code: "NV01", name: "Mount Seymour Trail", city: "North Vancouver", province: "BC", busyness: "crowd", details: "Amazing ski slope views", lat: 49.38847101455571, lng: -122.94092543551031 }
    ];

    parksToAdd.forEach((park) => {
        addPark(park.code, park.name, park.city, park.province, park.busyness, park.details, park.lat, park.lng);
    });
}

addMultipleParks();

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("parkCardTemplate"); // Retrieve the HTML element with the ID "parkCardTemplate" and store it in the cardTemplate variable. 

    db.collection(collection).get()   //the collection called "parks"
        .then(allParks => {
            //var i = 1;  //Optional: if you want to have a unique ID for each park
            allParks.forEach(doc => { //iterate thru each doc
                var title = doc.data().name;       // get value of the "name" key
                var details = doc.data().details;  // get value of the "details" key
                var parkCode = doc.data().code;    //get unique ID to each park to be used for fetching right image
                var docID = doc.id;
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                //update title and text and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-text').innerHTML = details;
                newcard.querySelector('.card-image').src = `./images/${parkCode}.jpg`; //Example: NV01.jpg
                newcard.querySelector('a').href = "eachPark.html?docID="+docID;
                
                //Optional: give unique ids to all elements for future use
                // newcard.querySelector('.card-title').setAttribute("id", "ctitle" + i);
                // newcard.querySelector('.card-text').setAttribute("id", "ctext" + i);
                // newcard.querySelector('.card-image').setAttribute("id", "cimage" + i);

                //attach to gallery, Example: "parks-go-here"
                document.getElementById(collection + "-go-here").appendChild(newcard);

                //i++;   //Optional: iterate variable to serve as unique ID
            })
        })
}

displayCardsDynamically("parks");  //input param is the name of the collection