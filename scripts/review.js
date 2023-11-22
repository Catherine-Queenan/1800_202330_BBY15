var parkDocID = localStorage.getItem("parkDocID");    //visible to all functions on this page

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

function writeReview() {
    console.log("inside write review");
    let parkTitle = document.getElementById("title").value;
    let parkDescription = document.getElementById("description").value;

    // Get the star rating
		// Get all the elements with the class "star" and store them in the 'stars' variable
    const stars = document.querySelectorAll('.star');
		// Initialize a variable 'parkRating' to keep track of the rating count
    let parkRating = 0;
		// Iterate through each element in the 'stars' NodeList using the forEach method
    stars.forEach((star) => {
				// Check if the text content of the current 'star' element is equal to the string 'star'
        if (star.textContent === 'star') {
						// If the condition is met, increment the 'parkRating' by 1
            parkRating++;
        }
    });

    // console.log(parkTitle, parkRating);
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
// So, a new post document has just been added
// and it contains a bunch of fields.
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


function saveReviewIDforUser(reviewDocID) {
  firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("reviewdoc id is: " + reviewDocID);
        db.collection("users").doc(user.uid).update({
              myreviews: firebase.firestore.FieldValue.arrayUnion(reviewDocID)
        })
        .then(() =>{
              console.log("5. Saved to user's document!");
                              alert ("Review is complete!");
              //window.location.href = "showposts.html";
         }).then(() => {
          window.location.href = "thanks.html"; // Redirect to the thanks page
      });
  })
}