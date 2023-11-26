//Global variable pointing to the current user's Firestore document
var currentUser;  

// Global variable for parks collection 
var parksRef;

var parks = [];

// Geolocation API
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;

            // Call a function to sort and display parks based on distance
            getAndSortParksByDistance(userLatitude, userLongitude);
        },
        function (error) {
            console.error("Error getting location: " + error.message);
        }
    );
} else {
    console.error("Geolocation is not supported by this browser");
}

function getAndSortParksByDistance(userLat, userLng) {
    const parksRef = db.collection('parks');

    parksRef.get()
        .then(querySnapshot => {
            parks = [];

            querySnapshot.forEach(doc => {
                const parkData = doc.data();
                const distance = calculateDistance(userLat, userLng, parkData.lat, parkData.lng);

                parks.push({
                    key: doc.id,
                    name: parkData.name,
                    city: parkData.city,
                    details: parkData.details,
                    distance: distance
                });
            });

            // Sort the parks by distance
            parks.sort((park1, park2) => park1.distance - park2.distance);

            // Update your UI with the sorted parks
            updateParksList(parks);
        })
        .catch(error => {
            console.error("Error fetching parks from Firestore: ", error);
        });
}


// Haversine formula to calculate distance between user and a park
function calculateDistance(userLat, userLng, parkLat, parkLng) {
    const earthRadius = 6371; // Radius of the Earth in kilometers

    const dLat = toRadians(parkLat - userLat);
    const dLng = toRadians(parkLng - userLng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(userLat)) * Math.cos(toRadians(parkLat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c; // Distance in kilometers

    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function sortParksByDistance(userLat, userLng) {
    // Assuming parks is an array of objects with latitude and longitude properties
    parks.sort((park1, park2) => {
        const distance1 = calculateDistance(userLat, userLng, park1.latitude, park1.longitude);
        const distance2 = calculateDistance(userLat, userLng, park2.latitude, park2.longitude);

        return distance1 - distance2;
    });

    // Now, you can use the sorted parks list to update your page
    updateParksList(parks);
}

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
    parksRef = db.collection("parks"); // Global
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
    console.log(data);
    // Call addMultipleParks inside the then block
    addMultipleParks(data);
    console.log(parks);



    // displayCardsDynamically("parks");  //input param is the name of the collection
  })
  .catch(error => console.error('Error fetching or parsing data:', error));



//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
// function displayCardsDynamically(collection) {
//     let cardTemplate = document.getElementById("parkCardTemplate"); // Retrieve the HTML element with the ID "parkCardTemplate" and store it in the cardTemplate variable. 

//     db.collection(collection).get()   //the collection called "parks"
//         .then(allParks => {
//             //var i = 1;  //Optional: if you want to have a unique ID for each park
//             allParks.forEach(doc => { //iterate thru each doc
//                 var title = doc.data().name;       // get value of the "name" key
//                 var details = doc.data().details;  // get value of the "details" key
//                 var parkCode = doc.data().code;    //get unique ID to each park to be used for fetching right image
//                 var parkCity = doc.data().city; //gets the length field
//                 var docID = doc.id;
//                 let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

//                 //update title and text and image
//                 newcard.querySelector('.card-title').innerHTML = title;
//                 newcard.querySelector('.card-city').innerHTML = parkCity;
//                 newcard.querySelector('.card-text').innerHTML = details;
//                 newcard.querySelector('.card-image').src = `./images/${parkCode}.jpg`; //Example: NV01.jpg
//                 newcard.querySelector('a').href = "eachPark.html?docID="+docID;
//                 newcard.querySelector('i').id = 'save-' + docID;   //guaranteed to be unique
//                 newcard.querySelector('i').onclick = () => updateFavorite(docID);
                
//                 currentUser.get().then(userDoc => {
//                     //get the user name
//                     let favorites = userDoc.data().favorites || [];
//                     if (favorites.includes(docID)) {
//                        document.getElementById('save-' + docID).innerText = 'favorite';
//                     } else {
//                         document.getElementById('save-' + docID).innerText = 'favorite_border';
//                     }
//                 })

//                 //attach to gallery, Example: "parks-go-here"
//                 document.getElementById(collection + "-go-here").appendChild(newcard);

//             })
//         })
// }



//-----------------------------------------------------------------------------
// This function is called whenever the user clicks on the "favorite" icon.
// It adds the park to the "favorites" array
// Then it will change the favorite icon from the hollow to the solid version. 
//-----------------------------------------------------------------------------
function updateFavorite(parkDocID) {
    currentUser.get().then(userDoc => {
        let favorites = userDoc.data().favorites || [];
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

function updateParksList(parks) {
    // Assuming "parks-go-here" is the ID of the element where you want to display the parks
    const container = document.getElementById("parks-go-here");

    // Clear the existing content in the container
    container.innerHTML = '';

    // Iterate through the sorted parks and create cards dynamically
    parks.forEach(park => {
        const cardTemplate = document.getElementById("parkCardTemplate");
        const newCard = cardTemplate.content.cloneNode(true);

        // Fill in the card content with park data
        newCard.querySelector('.card-title').innerHTML = park.name;
        newCard.querySelector('.card-city').innerHTML = park.city;
        // newCard.querySelector('.card-text').innerHTML = `Distance: ${park.distance.toFixed(2)} km`;
        newCard.querySelector('.card-text').innerHTML = park.details;
        newCard.querySelector('.card-image').src = `./images/${park.key}.jpg`;
        newCard.querySelector('a').href = "eachPark.html?docID=" + park.key;
        newCard.querySelector('i').id = 'save-' + park.key;
        newCard.querySelector('i').onclick = () => updateFavorite(park.key);

        currentUser.get().then(userDoc => {
            // Get the user's favorites
            const favorites = userDoc.data().favorites || [];
            
            // Check if the current park is in the user's favorites
            if (favorites.includes(park.key)) {
                document.getElementById('save-' + park.key).innerText = 'favorite';
            } else {
                document.getElementById('save-' + park.key).innerText = 'favorite_border';
            }
        });

        // Attach the new card to the container
        container.appendChild(newCard);
    });
}









