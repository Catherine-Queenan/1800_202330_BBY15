//Global variable pointing to the current user's Firestore document
var currentUser;  

// Global variable for parks collection 
var parksRef;

// Global variable for the parks.
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

// Function to sort the parks based off of distance from the user that is logged in and their geolocation.
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

// Function to update and sort the parks based off of their distance that is calculated.
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

// Function to add parks to the list.
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

// Function to allow the adding of multiple parks.
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

// Function to display the park list, including the favourite tag (selected or not)
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









