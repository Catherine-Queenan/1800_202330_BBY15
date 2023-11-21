function saveParkDocumentID() {
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("docID");
    localStorage.setItem('parkDocID', ID);
}


let focusedElementBeforeModal;
const modal = document.getElementById('modal');
const modalOverlay = document.querySelector('.modal-overlay');

document.addEventListener('DOMContentLoaded', () => {
    saveParkDocumentID()
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
    writeReview();
    closeModal();
    // populateReviews(); // add this line
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

    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Get the document for the current user
        currentUser.get()
            .then((doc) => {
                // Check if the user document exists
                if (doc.exists) {
                    // Add the review to the reviews collection
                    db.collection("reviews").add({
                        parkDocID: parkDocID,
                        user: currentUser,
                        userID: userID,
                        title: parkTitle,
                        description: parkDescription,
                        rating: parkRating,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }).then((docRef) => {
                        console.log("Review added with ID: ", docRef.id);
                        // Save the review_id under the user's document
                        currentUser.update({
                            reviewsID: firebase.firestore.FieldValue.arrayUnion(docRef.id)
                        }).then(() => {
                            console.log("Review ID saved to user's document!");
                            // Call populateReviews() to display the updated list of reviews
                            populateReviews();
                            // window.location.href = "thanks.html"; // Redirect to the thanks page
                        });
                    }).catch((error) => {
                        console.error("Error adding review: ", error);
                    });
                } else {
                    console.log("User document not found");
                }
            }).catch((error) => {
                console.log("Error getting user document: ", error);
            });
    } else {
        console.log("No user is signed in");
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



// Function to create an "Edit" button for each review
function createEditButton(reviewId) {
    const editButton = document.createElement('button');
    editButton.classList.add('edit-review-btn');
    editButton.textContent = 'Edit Review';
    // Add an event listener to handle the edit button click
    editButton.addEventListener('click', () => handleEditButtonClick(reviewId));
    return editButton;
}



function populateReviews() {
    let parkCardTemplate = document.getElementById("reviewCardTemplate"); // Assuming reviewCardTemplate is a <template> element
    let parkCardGroup = document.getElementById("reviewCardGroup");
  
    let params = new URL(window.location.href); // Get the URL from the search bar
    let parkID = params.searchParams.get("docID");
  
    db.collection("reviews")
      .where("parkDocID", "==", parkID)
      .orderBy("timestamp", "desc") // Sort the reviews by timestamp in descending order
      .get()
      .then((allReviews) => {
        allReviews.forEach((doc) => {
          var title = doc.data().title;
          var description = doc.data().description;
          var time = doc.data().timestamp?.toDate();
          var rating = doc.data().rating;
  
          let reviewCard = document.createElement("div");
          reviewCard.innerHTML = parkCardTemplate.innerHTML;
  
          reviewCard.querySelector(".title").innerHTML = title;
  
          if (time) {
            reviewCard.querySelector(".time").innerHTML = new Date(time).toLocaleString();
          } else {
            reviewCard.querySelector(".time").innerHTML = "";
          }
  
          reviewCard.querySelector(".description").innerHTML = description;
  
          const editButton = createEditButton(doc.id);
          reviewCard.querySelector(".edit-review-btn").dataset.reviewId = doc.id;
  
          let starRating = "";
          for (let i = 0; i < rating; i++) {
            starRating += '<span class="material-icons">star</span>';
          }
          for (let i = rating; i < 5; i++) {
            starRating += '<span class="material-icons">star_outline</span>';
          }
          reviewCard.querySelector(".star-rating").innerHTML = starRating;
  
          parkCardGroup.appendChild(reviewCard);
        });
      })
      .catch((error) => {
        console.error("Error fetching reviews: ", error);
      });
  }

// function populateReviews() {
//     console.log("populate review starts");
//     let parkCardTemplate = document.getElementById("reviewCardTemplate");
//     let parkCardGroup = document.getElementById("reviewCardGroup");

//     let params = new URL(window.location.href); // Get the URL from the search bar
//     let parkID = params.searchParams.get("docID");

//     // Double-check: is your collection called "Reviews" or "reviews"?
//     db.collection("reviews")
//         .where("parkDocID", "==", parkID)
//         .get()
//         .then((allReviews) => {
//             reviews = allReviews.docs;
//             console.log(reviews);
//             reviews.forEach((doc) => {
//                 var title = doc.data().title;
//                 var description = doc.data().description;
//                 // var time = doc.data().timestamp.toDate();
//                 var time = doc.data().timestamp?.toDate(); // Check if time is not null
//                 var rating = doc.data().rating; // Get the rating value

//                 let reviewCard = parkCardTemplate.content.cloneNode(true);
//                 reviewCard.querySelector(".title").innerHTML = title;
//                 reviewCard.querySelector(".time").innerHTML = new Date(
//                     time
//                 ).toLocaleString();
//                 reviewCard.querySelector(".description").innerHTML = description;

//                 // !!!!!NEW THING FOR EDITING REVIEW!!!!!
//                 // Create and append the "Edit" button for each review
//                 const editButton = createEditButton(doc.id); // Assuming doc.id is the review ID
//                 reviewCard.querySelector(".edit-review-btn").dataset.reviewId = doc.id;

//                 // Populate the star rating based on the rating value

//                 // Initialize an empty string to store the star rating HTML
//                 let starRating = "";
//                 // This loop runs from i=0 to i<rating, where 'rating' is a variable holding the rating value.
//                 for (let i = 0; i < rating; i++) {
//                     starRating += '<span class="material-icons">star</span>';
//                 }
//                 // After the first loop, this second loop runs from i=rating to i<5.
//                 for (let i = rating; i < 5; i++) {
//                     starRating += '<span class="material-icons">star_outline</span>';
//                 }
//                 reviewCard.querySelector(".star-rating").innerHTML = starRating;

//                 parkCardGroup.appendChild(reviewCard);
//             });
//         });
// }

populateReviews();


function toggleDropdown(event) {
    const dropdownContent = event.target.nextElementSibling;
    dropdownContent.classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.classList.contains('dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}



// Edit submitted reviews part
async function getReviewData(reviewId) {
    try {
        const reviewDoc = await db.collection('reviews').doc(reviewId).get();
        if (reviewDoc.exists) {
            return reviewDoc.data();
        } else {
            throw new Error(`Review with ID ${reviewId} not found.`);
        }
    } catch (error) {
        throw new Error(`Error fetching review data: ${error.message}`);
    }
}

function updateReviewData(reviewId, newData) {
    newData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("reviews")
        .doc(reviewId)
        .update(newData)
        .then(() => {
            console.log(`Review ${reviewId} data updated successfully.`);
        })
        .catch((error) => {
            console.error(`Error updating review ${reviewId} data:`, error);
        });
}

let editMode = false;
let currentReviewId;
let originalReviewData;

async function editReview(event) {
    const reviewId = event.currentTarget.dataset.reviewId;

    try {
        // Get review data from Firebase
        originalReviewData = await getReviewData(reviewId);

        // Check if the current user is the author of the review
        const authorId = originalReviewData.userID; // Assuming the field is named 'userId'
        const currentUser = firebase.auth().currentUser;

        if (currentUser && currentUser.uid === authorId) {
            // Get edit form elements
            const titleElement = document.getElementById('edit-review-title');
            const ratingElement = document.getElementById('edit-review-rating');
            const descriptionElement = document.getElementById('edit-review-description');
            const saveButton = document.querySelector('#save-edited-review-btn');

            // Populate the edit form with the retrieved data
            titleElement.textContent = originalReviewData.title;
            ratingElement.textContent = originalReviewData.rating;
            descriptionElement.textContent = originalReviewData.description;

            // Record the current review ID
            currentReviewId = reviewId;

            // Enter edit mode
            editMode = true;

            // Show the edit form and save button
            titleElement.contentEditable = 'true';
            ratingElement.contentEditable = 'true';
            descriptionElement.contentEditable = 'true';
            saveButton.style.display = 'inline-block';
        } else {
            console.log("UserID didn't match. Cannot edit this review.");
        }
    } catch (error) {
        console.error('Error fetching review data:', error);
    }
}



async function saveEditedReview() {
    const titleElement = document.getElementById('edit-review-title');
    const ratingElement = document.getElementById('edit-review-rating');
    const descriptionElement = document.getElementById('edit-review-description');
    const timeElement = document.querySelector('.time');

    const newTitle = titleElement.textContent;
    const newRating = ratingElement.textContent;
    const newDescription = descriptionElement.textContent;

    try {
        // Update the review data on the server
        await updateReviewData(currentReviewId, {
            title: newTitle,
            rating: newRating,
            description: newDescription,
        });

        // Display the current time
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleString(); // Customize the formatting if needed

        timeElement.textContent = formattedTime; // Update the time element content

        // Reset the UI to its original state
        titleElement.textContent = newTitle;
        ratingElement.textContent = newRating;
        descriptionElement.textContent = newDescription;

        // Set contenteditable attribute to false
        titleElement.contentEditable = 'false';
        ratingElement.contentEditable = 'false';
        descriptionElement.contentEditable = 'false';

        // currentReviewId = null;
        editMode = false;

        // Hide the save button
        const saveButton = document.querySelector('#save-edited-review-btn');
        saveButton.style.display = 'none';
    } catch (error) {
        console.error('Error updating review data:', error);
    }
}