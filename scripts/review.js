
function saveParkDocumentID() {
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("docID");
    localStorage.setItem('parkDocID', ID);
}


let focusedElementBeforeModal;
const modal = document.getElementById('modal');
const modalOverlay = document.querySelector('.modal-overlay');

document.addEventListener('DOMContentLoaded', () => {
    const addReviewBtn = document.getElementById('review-add-btn');
    addReviewBtn.addEventListener('click', openModal);
    addReviewBtn.addEventListener('click', saveParkDocumentID);
});



const openModal = () => {
    // Save current focus
    focusedElementBeforeModal = document.activeElement;

    // Get the eachPark's name
    var parkDocID = localStorage.getItem("parkDocID");
    console.log(parkDocID);

    // Wait for getParkName to complete
    getParkName(parkDocID).then((parkName) => {

        // Listen for and trap the keyboard
        modal.addEventListener('keydown', trapTabKey);

        // Listen for indicators to close the modal
        modalOverlay.addEventListener('click', closeModal);
        // Close btn
        const closeBtn = document.querySelector('.close-btn');
        closeBtn.addEventListener('click', closeModal);

        // submit form
        const form = document.getElementById('review-form');
        form.addEventListener('submit', submitAddReview, false);

        // Find all focusable children
        var focusableElementsString =
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
        var focusableElements = modal.querySelectorAll(focusableElementsString);
        // Convert NodeList to Array
        focusableElements = Array.prototype.slice.call(focusableElements);

        var firstTabStop = focusableElements[0];
        var lastTabStop = focusableElements[focusableElements.length - 1];

        // Show the modal and overlay
        modal.classList.add('show');
        modalOverlay.classList.add('show');

        // Focus first child
        const reviewName = document.getElementById('reviewName');
        if (reviewName) {
            reviewName.focus();
        } else {
            console.error("Element with id 'reviewName' not found!");
        }

        // Display the parkName in the modal
        document.getElementById("parkName-review").innerHTML = parkName;

    }).catch((error) => {
        console.log(error);
    });
};


// Define trapTabKey outside of openModal
function trapTabKey(e) {
    // Check for TAB key press
    if (e.keyCode === 9) {
        // SHIFT + TAB
        if (e.shiftKey) {
            if (document.activeElement === firstTabStop) {
                e.preventDefault();
                lastTabStop.focus();
            }
        } else {
            if (document.activeElement === lastTabStop) {
                e.preventDefault();
                firstTabStop.focus();
            }
        }
    }

    // ESCAPE
    if (e.keyCode === 27) {
        closeModal();
    }
}


var parkDocID = localStorage.getItem("parkDocID"); 

function getParkName(id) {
    return db.collection("parks")
        .doc(id)
        .get()
        .then((thisPark) => {
            var parkName = thisPark.data().name;
            return parkName;
        });
}

const submitAddReview = (e) => {
    // console.log(e);
    console.log('Form submitted!');
    e.preventDefault();
    closeModal();
};

const closeModal = () => {
    // Hide the modal and overlay
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');

    const form = document.getElementById('review-form');
    form.reset();
    // Set focus back to element that had it before the modal was opened
    focusedElementBeforeModal.focus();
};





// Add this JavaScript code to make stars clickable

// Select all elements with the class name "star" and store them in the "stars" variable
const stars = document.querySelectorAll('.star');

// Iterate through each star element
stars.forEach((star, index) => {
    // Add a click event listener to the current star
    star.addEventListener('click', () => {
        // Fill in clicked star and stars before it
        for (let i = 0; i <= index; i++) {
            // Change the text content of stars to 'star' (filled)
            document.getElementById(`star${i + 1}`).textContent = 'star';
        }
    });
});

function writeReview() {
    console.log("inside write review");
    let parkTitle = document.getElementById("reviewName").value;
    let parkDescription = document.getElementById("reviewComments").value;

    // Get the selected rating
    const selectedRatingElement = document.querySelector('.rate input[type="radio"]:checked');
    let parkRating = 0;

    if (selectedRatingElement) {
        parkRating = parseInt(selectedRatingElement.value);
    }

    console.log(parkTitle, parkDescription, parkRating);

    // console.log(parkTitle, parkLevel, parkSeason, parkDescription, parkFlooded, parkScrambled, parkRating);


    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Get the document for the current user.
        db.collection("reviews").add({
            parkDocID: parkDocID,
            user: currentUser,
            userID: userID,
            title: parkTitle,
            description: parkDescription,
            rating: parkRating, // Include the rating in the review
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            window.location.href = "thanks.html"; // Redirect to the thanks page
        });
    } else {
        console.log("No user is signed in");
        // window.location.href = 'review.html';
    }
}

function saveReviewIDforUser(reviewDocID) {
    firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("postdoc id is: " + reviewDocID);
        db.collection("users").doc(user.uid).update({
            myposts: firebase.firestore.FieldValue.arrayUnion(reviewDocID)
        })
            .then(() => {
                console.log("5. Saved to user's document!");
                alert("Review is complete!");
                //window.location.href = "showposts.html";
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    })
}


//------------------------------------------------
// So, a new post document has just been added
// and it contains a bunch of fields.
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

                 // AFTER .getDownloadURL is done
                .then(function (url) { // Get URL of the uploaded file
                    console.log("3. Got the download URL.");

                    // Now that the image is on Storage, we can go back to the
                    // post document, and update it with an "image" field
                    // that contains the url of where the picture is stored.
                    db.collection("posts").doc(postDocID).update({
                            "image": url // Save the URL into users collection
                        })
                         // AFTER .update is done
                        .then(function () {
                            console.log('4. Added pic URL to Firestore.');
                            // One last thing to do:
                            // save this postID into an array for the OWNER
                            // so we can show "my posts" in the future
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
          .then(() =>{
                console.log("5. Saved to user's document!");
                                alert ("Post is complete!");
                //window.location.href = "showposts.html";
           })
           .catch((error) => {
                console.error("Error writing document: ", error);
           });
    })
}

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
                var description = doc.data().description;
                var time = doc.data().timestamp.toDate();
                var rating = doc.data().rating; // Get the rating value
                console.log(rating)

                console.log(time);

                let reviewCard = parkCardTemplate.content.cloneNode(true);
                reviewCard.querySelector(".title").innerHTML = title;
                reviewCard.querySelector(".time").innerHTML = new Date(
                    time
                ).toLocaleString();
                reviewCard.querySelector(".description").innerHTML = description;

                // Populate the star rating based on the rating value

                // Initialize an empty string to store the star rating HTML
                let starRating = "";
                // This loop runs from i=0 to i<rating, where 'rating' is a variable holding the rating value.
                for (let i = 0; i < rating; i++) {
                    starRating += '<span class="material-icons">star</span>';
                }
                // After the first loop, this second loop runs from i=rating to i<5.
                for (let i = rating; i < 5; i++) {
                    starRating += '<span class="material-icons">star_outline</span>';
                }
                reviewCard.querySelector(".star-rating").innerHTML = starRating;

                parkCardGroup.appendChild(reviewCard);
            });
        });
}

populateReviews();


function toggleDropdown(event) {
    const dropdownContent = event.target.nextElementSibling;
    dropdownContent.classList.toggle("show");
  }
  
  window.onclick = function(event) {
    if (!event.target.classList.contains('dropbtn'))  {
      const dropdowns = document.getElementsByClassName("dropdown-content");
      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }


  