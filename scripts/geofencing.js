document.addEventListener("DOMContentLoaded", function () {

    let prevIsNearAnyPark = false;

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

    const proximityCheckInterval = 30000; // Check every 30 seconds
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }, proximityCheckInterval);

    let parks = [];

    function fetchParkInformation() {
        // Use Firebase SDK to get park information
        // For example, you might use Firebase Firestore
        // This is a simplified example, adjust it based on your Firebase setup
        return db.collection('parks').get()
            .then(snapshot => {
                parks = [];
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

        fetchParkInformation().then(() => {
            // Assume userLocation is obtained through geolocation
            const proximityRadius = 15; // in kilometers

            checkProximityToParks(userLocation, proximityRadius);
        });
    }
    function errorCallback(error) {
        // Handle location retrieval errors here.
    }

    function checkProximityToParks(userLocation, radius) {
        const currentUser = getCurrentUser();

        if (currentUser) {
            const userId = currentUser.uid;
            let isNearAnyPark = false;

            parks.forEach(park => {
                const distance = calculateDistance(userLocation, park.location);
                if (distance <= radius) {
                    isNearAnyPark = true;
                    parkName = park.name;
                    parkCode = park.id;

                    // Open modal only if user has just entered proximity
                    if (!prevIsNearAnyPark) {
                        openModal(parkName);

                    }
                    return;
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
                        removeUserDogIdsFromParks(userId);
                    }
                })
                .catch(error => {
                    console.error("Error updating user document:", error);
                });
            prevIsNearAnyPark = isNearAnyPark;
        }
    }

    // Add a new function to remove the user's dog IDs from pupsPlaying arrays
    function removeUserDogIdsFromParks(userId) {
        // Fetch the user document to get their dog IDs
        db.collection('users').doc(userId).get()
            .then(userDoc => {
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const userDogIds = userData.dogs || [];

                    // Loop through the parks and remove the user's dog IDs from pupsPlaying
                    parks.forEach(park => {
                        db.collection('parks').doc(park.id).update({
                            pupsPlaying: firebase.firestore.FieldValue.arrayRemove(...userDogIds)
                        })
                            .then(() => {
                                console.log(`User's dog IDs removed from pupsPlaying in park ${park.id}`);
                            })
                            .catch(error => {
                                console.error(`Error removing user's dog IDs from pupsPlaying in park ${park.id}:`, error);
                            });
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching user document:", error);
            });
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

    function openModal(parkName) {
        document.getElementById('parkName').innerText = parkName + "!";
        document.getElementById('modal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
        fetchUserDataAndPopulateCheckboxes();
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

        const checkedDogIds = [];

        // Iterate over checkboxes to find checked ones
        for (let i = 1; i <= 4; i++) {
            const checkboxId = 'dogCheckbox' + i;
            const checkboxElement = document.getElementById(checkboxId);

            if (checkboxElement && checkboxElement.checked) {
                checkedDogIds.push(checkboxElement.dataset.dogId);
            }
        }

        console.log(parkCode);

        // Update the Firebase document for the current park with the checked dog IDs
        db.collection('parks').doc(parkCode).update({
            pupsPlaying: firebase.firestore.FieldValue.arrayUnion(...checkedDogIds)
        })
            .then(() => {
                console.log("Park document successfully updated with pupsPlaying!");

                showMap();
            })
            .catch((error) => {
                console.error("Error updating park document with pupsPlaying: ", error);
            });

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

    function fetchUserDataAndPopulateCheckboxes() {
        const currentUser = getCurrentUser();

        if (currentUser) {
            const userId = currentUser.uid;
            let dogIdsArray;

            // Fetch user document from Firebase
            db.collection('users').doc(userId).get()
                .then(userDoc => {
                    if (userDoc.exists) {
                        const userData = userDoc.data();

                        // Assuming dogs is an array of dog IDs in the user document
                        dogIdsArray = userData.dogs || [];

                        console.log(dogIdsArray);

                        // Array to store promises for fetching dog names
                        const fetchDogNamePromises = [];

                        // Loop through the dog IDs and create promises to fetch dog names
                        dogIdsArray.forEach(dogId => {
                            const fetchDogNamePromise = db.collection('dog-profiles').doc(dogId).get()
                                .then(dogProfileDoc => {
                                    if (dogProfileDoc.exists) {
                                        // Assuming the dog profile document has a field 'name'
                                        return dogProfileDoc.data().name;

                                    } else {
                                        return null; // Handle the case where the dog profile document doesn't exist
                                    }
                                })
                                .catch(error => {
                                    console.error("Error fetching dog profile document:", error);
                                    return null;
                                });

                            fetchDogNamePromises.push(fetchDogNamePromise);
                        });

                        // Resolve all promises
                        return Promise.all(fetchDogNamePromises);
                    } else {
                        console.log("User document not found");
                        return [];
                    }
                })
                .then(dogNamesArray => {
                    // Loop through the fetched dog names and populate the checkboxes
                    for (let i = 0; i < dogNamesArray.length; i++) {
                        const checkboxId = 'dogCheckbox' + (i + 1);
                        const labelId = 'dogLabel' + (i + 1);
                        const checkboxElement = document.getElementById(checkboxId);
                        const labelElement = document.getElementById(labelId);

                        if (checkboxElement && labelElement) {
                            checkboxElement.value = dogNamesArray[i];
                            checkboxElement.dataset.dogId = dogIdsArray[i];
                            checkboxElement.disabled = false; // Enable the checkbox
                            labelElement.innerText = dogNamesArray[i];
                        }
                    }
                    console.log(dogNamesArray);
                })
                .catch(error => {
                    console.error("Error fetching user document:", error);
                });
        }
    }


    function getCurrentUser() {
        return firebase.auth().currentUser;
    }

});


