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
            document.getElementById("parkName").innerHTML = parkName;
            let imgEvent = document.querySelector(".park-img");
            imgEvent.src = "../images/" + parkCode + ".jpg";
        });
}
displayParkInfo();

// function saveParkDocumentIDAndRedirect() {
//     let params = new URL(window.location.href) //get the url from the search bar
//     let ID = params.searchParams.get("docID");
//     localStorage.setItem('parkDocID', ID);
//     window.location.href = 'review.html';
// }

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

function savePost() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            // Do something for the user here. 
            var desc = document.getElementById("description").value;
            db.collection("posts").add({
                owner: user.uid,
                name: user.displayName,
                description: desc,
                parkID: parkName,
                last_updated: firebase.firestore.FieldValue.serverTimestamp() //current system time
            }).then(doc => {
                console.log("1. Post document added!");
                console.log(doc.id);
                uploadPic(doc.id);
            }).then(() => {
                window.location.href = "thanks.html"; // Redirect to the thanks page
          });
        } else {
            // No user is signed in.
            console.log("Error, no user signed in");
        }
    });
}

