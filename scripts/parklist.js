//Global variable pointing to the current user's Firestore document
var currentUser;  


//Function that calls everything needed for the main page  
function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid); //global
            console.log(currentUser);
        } else {
            // No user is signed in.
            console.log("No user is signed in");
            window.location.href = "login.html";
        }
    });
}
doAll();


function addPark(code, name, city, details, lat, lng) {
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


function addMultipleParks(parksToAdd) {
    // Check if parksToAdd is defined and is an array
    if (Array.isArray(parksToAdd)) {
        parksToAdd.forEach((park) => {
            addPark(park.code, park.name, park.city, park.details, park.lat, park.lng);
        });
    } else {
        console.error('Invalid data format for parksToAdd');
    }
}

fetch('/scripts/parksData.json')
  .then(response => {
    // Check if the response is valid JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Call addMultipleParks inside the then block
    addMultipleParks(data);
  })
  .catch(error => console.error('Error fetching or parsing data:', error));

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
                var parkCity = doc.data().city; //gets the length field
                var docID = doc.id;
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                //update title and text and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-city').innerHTML = parkCity;
                newcard.querySelector('.card-text').innerHTML = details;
                newcard.querySelector('.card-image').src = `./images/${parkCode}.jpg`; //Example: NV01.jpg
                newcard.querySelector('a').href = "eachPark.html?docID="+docID;
                newcard.querySelector('i').id = 'save-' + docID;   //guaranteed to be unique
                newcard.querySelector('i').onclick = () => updateFavorite(docID);
                
                currentUser.get().then(userDoc => {
                    //get the user name
                    let favorites = userDoc.data().favorites;
                    if (favorites.includes(docID)) {
                       document.getElementById('save-' + docID).innerText = 'favorite';
                    } else {
                        document.getElementById('save-' + docID).innerText = 'favorite_border';
                    }
                })

                //attach to gallery, Example: "parks-go-here"
                document.getElementById(collection + "-go-here").appendChild(newcard);

            })
        })
}

displayCardsDynamically("parks");  //input param is the name of the collection

//-----------------------------------------------------------------------------
// This function is called whenever the user clicks on the "favorite" icon.
// It adds the park to the "favorites" array
// Then it will change the favorite icon from the hollow to the solid version. 
//-----------------------------------------------------------------------------
function updateFavorite(parkDocID) {
    currentUser.get().then(userDoc => {
        let favorites = userDoc.data().favorites;
        let iconID = 'save-' + parkDocID;
        let isFavorited = favorites.includes(parkDocID);

        if (isFavorited) {
            // Remove Favorite
            currentUser.update({
                favorites: firebase.firestore.FieldValue.arrayRemove(parkDocID)
            }).then(() => {
                console.log("Favorite removed for " + parkDocID);
                document.getElementById(iconID).innerText = 'favorite_border';
            });
        } else {
            // Add Favorite
            currentUser.update({
                favorites: firebase.firestore.FieldValue.arrayUnion(parkDocID)
            }).then(() => {
                console.log("Favorite added for " + parkDocID);
                document.getElementById(iconID).innerText = 'favorite';
            });
        }
    });
}


