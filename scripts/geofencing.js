document.addEventListener("DOMContentLoaded", function () {

    let prevIsNearAnyPark = false;

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

    const proximityCheckInterval = 30000; // Check every 30 seconds
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }, proximityCheckInterval);

    function fetchParkInformation() {
        // Use Firebase SDK to get park information
        // For example, you might use Firebase Firestore
        // This is a simplified example, adjust it based on your Firebase setup
        return db.collection('parks').get()
            .then(snapshot => {
                const parks = [];
                snapshot.forEach(doc => {
                    const parkData = doc.data();
                    parks.push({
                        id: doc.id,
                        name: parkData.name,
                        location: {
                            latitude: parkData.lat,
                            longitude: parkData.lng
                        }
                    });
                });
                return parks;
            })
            .catch(error => {
                console.error('Error fetching park information:', error);
                return [];
            });
    }

    function successCallback(position) {
        const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        // Now, you have the user's location.

        fetchParkInformation().then(parks => {
            // Assume userLocation is obtained through geolocation
            const proximityRadius = 1; // in kilometers

            checkProximityToParks(userLocation, parks, proximityRadius);
        });
    }
    function errorCallback(error) {
        // Handle location retrieval errors here.
    }

    function checkProximityToParks(userLocation, parks, radius) {
        const currentUser = getCurrentUser();
    
        if (currentUser) {
            const userId = currentUser.uid;
            let isNearAnyPark = false;
    
            parks.forEach(park => {
                const distance = calculateDistance(userLocation, park.location);
                if (distance <= radius) {
                    isNearAnyPark = true;
                    
                    // Open modal only if user has just entered proximity
                    if (!prevIsNearAnyPark) {
                        openModal();
                    }
                }
            });
    
            console.log("isNearAnyPark:", isNearAnyPark);
    
            // Update the user document based on proximity to parks
            db.collection('users').doc(userId).update({
                isAtPark: isNearAnyPark
            })
                .then(() => {
                    if (isNearAnyPark) {
                        console.log("User is near a park. Modal may have been opened.");
                    } else {
                        console.log("User is not near any park. isAtPark set to false.");
                    }
                })
                .catch(error => {
                    console.error("Error updating user document:", error);
                });
            prevIsNearAnyPark = isNearAnyPark;    
        }
    }

    function calculateDistance(location1, location2) {
        // Implement a distance calculation function (e.g., Haversine formula).
        // Return the distance in meters.
        const R = 6371; // Radius of the Earth in kilometers

        // Convert latitude and longitude from degrees to radians
        const dLat = (location2.latitude - location1.latitude) * (Math.PI / 180);
        const dLon = (location2.longitude - location1.longitude) * (Math.PI / 180);

        // Calculate Haversine formula
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(location1.latitude * (Math.PI / 180)) * Math.cos(location2.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Calculate distance
        const distance = R * c;

        return distance;
    }

    function showMessage(message, parkName) {
        // Implement code to display a message to the user.
        alert(message + ' ' + parkName); // Or use a more customized message display method.
    }

    function promptUserAction() {
        //Implement your action or notification to prompt the user.
        alert("You are near the park! Would you like to ....?")
    }

    function openModal() {
        document.getElementById('modal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('modal').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }

    document.getElementById('closeModal').addEventListener("click", function () {
        closeModal();
    });

    document.getElementById('playButton').addEventListener("click", function (event) {
        event.preventDefault();

        console.log("Play button clicked!");
        // Update the Firebase document for the current user
        updateFirebaseDocumentForCurrentUser();
        // Close the modal after updating the document
        closeModal();
    });

    function updateFirebaseDocumentForCurrentUser() {

        var currentUser = getCurrentUser();

        console.log(currentUser);

        if (currentUser) {
            var userId = currentUser.uid;
            // Use the Firebase SDK to update the document
            db.collection('users').doc(userId).update({
                isAtPark: true
            })
                .then(() => {
                    console.log("Document successfully updated!");
                })
                .catch((error) => {
                    console.error("Error updating document: ", error);
                });
        }
    }

    function getCurrentUser() {
        return firebase.auth().currentUser;
    }


});


