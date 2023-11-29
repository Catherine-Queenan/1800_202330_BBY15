var parkDocID = localStorage.getItem("parkDocID");    //visible to all functions on this page

// Function to display each inidividual park name
function getParkName(id) {
    db.collection("parks")
      .doc(id)
      .get()
      .then((thisPark) => {
        var parkName = thisPark.data().name;
        document.getElementById("parkName").innerHTML = parkName;
          });
}

getParkName(parkDocID);


// Select all elements with the class name "star" and store them in the "stars" variable
const stars = document.querySelectorAll('.rate input[type="radio"]');

// Iterate through each star element
stars.forEach((star, index) => {
    // Add a click event listener to the current star
    star.addEventListener('click', () => {
        // Set the value of the clicked star (1 to 5) to the hidden input field
        document.getElementById('ratingInput').value = index + 1;

        // Fill in clicked star and stars before it
        for (let i = 0; i <= index; i++) {
            // Change the text content of labels to '★' (filled)
            const label = document.querySelector(`label[for="star${i + 1}"]`);
            label.textContent = '★';
        }

        // Uncheck and update labels for stars after the clicked star
        for (let i = index + 1; i < stars.length; i++) {
            const label = document.querySelector(`label[for="star${i + 1}"]`);
            label.textContent = '☆';
        }
    });
});



// Variable and function to allow users to input their own images.
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


// Function to take in the information from the user, and create the associated review in firebase.
function writeReview() {
  console.log("inside write review");
  let parkTitle = document.getElementById("title").value;
  let parkDescription = document.getElementById("description").value;
  
  // Get the selected rating from the hidden input field
  let parkRating = document.querySelector('.rate input[name="rate"]:checked').value;

  console.log(parkTitle, parkDescription, parkRating);

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
      }).then(doc => {
          console.log("1. Review document added!");
          console.log(doc.id);
          uploadReviewPic(doc.id);
      });
  } else {
      console.log("No user is signed in");
      window.location.href = 'review.html';
  }
}




//------------------------------------------------
// We want to store the image associated with this post,
// such that the image name is the postid (guaranteed unique).
// 
// This function is called AFTER the post has been created, 
// and we know the post's document id.
//------------------------------------------------
function uploadReviewPic(reviewDocID) {
  console.log("inside uploadPic " + reviewDocID);
  var storageRef = storage.ref("images/" + reviewDocID + ".jpg");

  storageRef.put(ImageFile)   //global variable ImageFile

      // AFTER .put() is done
      .then(function () {
          console.log('2. Uploaded to Cloud Storage.');
          storageRef.getDownloadURL()
              .then(function (url) { // Get URL of the uploaded file
                  console.log("3. Got the download URL.");
                  db.collection("reviews").doc(reviewDocID).update({
                      "image": url // Save the URL into users collection
                  })
                      // AFTER .update is done
                      .then(function () {
                          console.log('4. Added pic URL to Firestore.');
                          saveReviewIDforUser(reviewDocID);
                      })
              })
      })
      .catch((error) => {
          console.log("error uploading to cloud storage");
      })
}

// Function to save the review to each individual user ID.
function saveReviewIDforUser(reviewDocID) {
  firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("reviewdoc id is: " + reviewDocID);
        db.collection("users").doc(user.uid).update({
              myreviews: firebase.firestore.FieldValue.arrayUnion(reviewDocID)
        })
        .then(() =>{
              console.log("5. Saved to user's document!");
              //window.location.href = "showposts.html";
         }).then(() => {
          window.location.href = "thanks.html"; // Redirect to the thanks page
      });
  })
}