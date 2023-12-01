// Event listener to gather data for the park.
document.addEventListener("DOMContentLoaded", function () {
    // Get docID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const docID = urlParams.get('docID');

    // Fetch park data using docID
    fetch('/scripts/parksData.json')
        .then(response => response.json())
        .then(parksData => {
            const park = parksData.find(park => park.code === docID);
            if (park) {
                // Populate the HTML elements with park data
                displayParkFeatures(park.features);
                // Populate other elements as needed
            } else {
                console.error('Park not found');
            }
        })
        .catch(error => {
            console.error('Error fetching park data', error);
        });
});

// Function to display park features
function displayParkFeatures(features) {
    const featuresContainer = document.getElementById("park-features-container");

    // Clear previous content
    featuresContainer.innerHTML = "<h5>Features:</h5>";

    // Loop through features and display them
    for (const feature in features) {
        if (features[feature]) {
            const featureElement = document.createElement("div");
            featureElement.textContent = feature;
            // featureElement.textContent = feature + ': ' + features[feature]; // Add feature description
            featureElement.classList.add("park-features-style");
            featuresContainer.appendChild(featureElement);
        }
    }
}

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

// Function to show the information for the park itself.
function displayParkInfo() {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "id"
    console.log(ID);

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection("parks")
        .doc(ID)
        .get()
        .then(doc => {
            thisPark = doc.data();
            parkCode = thisPark.code;
            parkName = doc.data().name;

            // only populate title, and image
            document.getElementById("park_Name").innerHTML = parkName;
            let imgEvent = document.querySelector(".park-img");
            imgEvent.src = "../images/" + parkCode + ".jpg";
        });
}
displayParkInfo();

// Function to save the parkID and redirect to the review page to write a review.
function saveParkDocumentIDAndRedirect() {
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("docID");
    localStorage.setItem('parkDocID', ID);
    window.location.href = 'review.html';
}

// Function to report a review.
function reportReview() {
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("reviewID");
    localStorage.setItem('reviewID', ID);
    window.location.href = 'report.html';
}

// Function to input an image to a post.
var ImageFile;
function listenFileSelect() {
    // listen for file selection
    var fileInput = document.getElementById("mypic-input"); // pointer #1
    const image = document.getElementById("mypic-goes-here"); // pointer #2

    // When a change happens to the File Chooser Input
    fileInput.addEventListener('change', function (e) {
        ImageFile = e.target.files[0];   //Global variable
        var blob = URL.createObjectURL(ImageFile);
        image.src = blob; // Display this image
    })
}
listenFileSelect();

// Function to save the post to the database.
// function savePost() {
//     firebase.auth().onAuthStateChanged(function (user) {
//         if (user) {
//             // User is signed in.
//             // Do something for the user here. 
//             var desc = document.getElementById("description").value;

//             db.collection("posts").add({
//                 owner: user.uid,
//                 name: user.displayName,
//                 description: desc,
//                 parkID: parkName,
//                 last_updated: firebase.firestore.FieldValue.serverTimestamp() //current system time
//             }).then(doc => {
//                 console.log("1. Post document added!");
//                 console.log(doc.id);
//                 uploadPic(doc.id);
//             });
//         } else {
//             // No user is signed in.
//             console.log("Error, no user signed in");
//         }
//     });
// }

function savePost() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            // Do something for the user here. 
            var description = document.getElementById("description").value;
            var imageFile = document.getElementById("mypic-input").files[0];

            if (imageFile) {
                // Create a storage reference with a unique filename
                var storageRef = storage.ref().child("images/" + user.uid + "_" + Date.now() + "_" + imageFile.name);

                // Upload the image to Cloud Storage
                storageRef.put(imageFile)
                    .then(function (snapshot) {
                        // Get the download URL of the uploaded image
                        return snapshot.ref.getDownloadURL();
                    })
                    .then(function (imageUrl) {
                        // Save the post with the image URL
                        return db.collection("posts").add({
                            owner: user.uid,
                            name: user.displayName,
                            description: description,
                            image: imageUrl,
                            parkID: parkName,
                            last_updated: firebase.firestore.FieldValue.serverTimestamp() //current system time
                        });
                    })
                    .then(function (docRef) {
                        console.log("Post document added with ID: ", docRef.id);
                        savePostIDforUser(docRef.id);
                    })
                    .catch(function (error) {
                        console.error("Error uploading image: ", error);
                    });
            } else {
                // Save the post without an image URL
                db.collection("posts").add({
                    owner: user.uid,
                    name: user.displayName,
                    description: description,
                    parkID: parkName,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp() //current system time
                })
                    .then(function (docRef) {
                        console.log("Post document added with ID: ", docRef.id);
                        savePostIDforUser(docRef.id);
                    })
                    .catch(function (error) {
                        console.error("Error saving post: ", error);
                    });
            }
        } else {
            // No user is signed in.
            console.log("Error, no user signed in");
        }
    });
}




//------------------------------------------------
// We want to store the image associated with this post,
// such that the image name is the postid (guaranteed unique).
// 
// This function is called AFTER the post has been created, 
// and we know the post's document id.
//------------------------------------------------
function uploadPic(postDocID) {
    console.log("inside uploadPic " + postDocID);
    var storageRef = storage.ref("images/" + postDocID + ".jpg");

    storageRef.put(ImageFile)   //global variable ImageFile

        // AFTER .put() is done
        .then(function () {
            console.log('2. Uploaded to Cloud Storage.');
            storageRef.getDownloadURL()
                .then(function (url) { // Get URL of the uploaded file
                    console.log("3. Got the download URL.");
                    db.collection("posts").doc(postDocID).update({
                        "image": url // Save the URL into users collection
                    })
                        // AFTER .update is done
                        .then(function () {
                            console.log('4. Added pic URL to Firestore.');
                            savePostIDforUser(postDocID);
                        })
                })
        })
        .catch((error) => {
            console.log("error uploading to cloud storage");
        })
}

//--------------------------------------------
//saves the post ID for the user, in an array
//--------------------------------------------
function savePostIDforUser(postDocID) {
    firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("postdoc id is: " + postDocID);
        db.collection("users").doc(user.uid).update({
            myposts: firebase.firestore.FieldValue.arrayUnion(postDocID)
        })
            .then(() => {
                console.log("5. Saved to user's document!");
                //window.location.href = "showposts.html";
            }).then(() => {
                window.location.href = "thanks.html"; // Redirect to the thanks page
            });
    })
}

// Loads the reviews unique to this parkID.
function populateReviews() {
    console.log("test");
    let parkCardTemplate = document.getElementById("reviewCardTemplate");
    let parkCardGroup = document.getElementById("reviewCardGroup");

    let params = new URL(window.location.href); // Get the URL from the search bar
    let parkID = params.searchParams.get("docID");

    // Double-check: is your collection called "Reviews" or "reviews"?
    db.collection("reviews")
        .where("parkDocID", "==", parkID)
        .get()
        .then((allReviews) => {
            reviews = allReviews.docs;
            console.log(reviews);
            reviews.forEach((doc) => {
                var title = doc.data().title;
                var image = doc.data().image;
                var description = doc.data().description;
                var time = doc.data().timestamp.toDate();
                var rating = doc.data().rating; // Get the rating value
                console.log(rating)

                console.log(time);

                let reviewCard = parkCardTemplate.content.cloneNode(true);
                reviewCard.querySelector(".title").innerHTML = title;

                if (image) {
                    reviewCard.querySelector(".card-image").src = image;
                } else {
                    reviewCard.querySelector(".card-image").style.display = "none";
                }
                // reviewCard.querySelector(".card-image").src = image;

                reviewCard.querySelector(".time").innerHTML = new Date(
                    time
                ).toLocaleString();
                reviewCard.querySelector(".description").innerHTML = description;

                reviewCard.querySelector('#report-icon').onclick = () => reportReview(doc.id);

                // Populate the star rating based on the rating value

                // Initialize an empty string to store the star rating HTML
                let starRating = "";
                // This loop runs from i=0 to i<rating, where 'rating' is a variable holding the rating value.
                for (let i = 0; i < rating; i++) {
                    starRating += '<span class="material-icons filled-star">star</span>';
                }
                // After the first loop, this second loop runs from i=rating to i<5.
                for (let i = rating; i < 5; i++) {
                    starRating += '<span class="material-icons outline-star"">star_outline</span>';
                }
                reviewCard.querySelector(".star-rating").innerHTML = starRating;

                parkCardGroup.appendChild(reviewCard);
            });
        });
}

populateReviews();

// Shows the information for each individual park.
document.addEventListener('DOMContentLoaded', function () {

    var parkData;

    // Get the document ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('docID');

    if (docId) {
        // Fetch the specific park document
        const parkRef = db.collection('parks').doc(docId);

        parkRef.get().then((doc) => {
            if (doc.exists) {
                parkData = doc.data();

                const pupsPlaying = parkData.pupsPlaying || [];

                // Map each dog ID to a promise that fetches the dog's data
                const dogPromises = pupsPlaying.map(dogProfileId => {
                    return db.collection('dog-profiles').doc(dogProfileId).get();
                });

                // Fetch all dog data asynchronously
                Promise.all(dogPromises).then(dogSnapshots => {
                    const dogDataArray = dogSnapshots.map(dogProfileDoc => dogProfileDoc.data());

                    // Create HTML content for the Popup, including dog information
                    const pupsPlayingContent = `
                        <ul class="pups-playing-list">
                            ${dogDataArray.map(dogData => `<li><img class="pups-playing-img" src="${dogData.ppimgUrl}" alt="Dog Image"> ${dogData.name}</li>`).join('')}
                        </ul>
                    `;

                    // Set the innerHTML of the selected div to the pupsPlayingContent
                    const pupsPresentDiv = document.querySelector('.pupsPresent');
                    if (pupsPresentDiv) {
                        pupsPresentDiv.innerHTML = pupsPlayingContent;
                    } else {
                        console.error('Element with class name "pupsPresent" not found.');
                    }
                });
            } else {
                console.error('Park document not found with ID:', docId);
            }
        }).catch(error => {
            console.error('Error getting park document:', error);
        });
    } else {
        console.error('Document ID not found in the URL.');
    }
});

