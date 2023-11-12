
// saving user's pup
// var currentPup;               //points to the document of the user who is logged in
// function populatePupInfo() {
//             firebase.auth().onAuthStateChanged(user => {
//                 // Check if user is signed in:
//                 if (user) {

//                     //go to the correct user document by referencing to the user uid
//                     currentPup = db.collection("pup-profiles").doc(user.uid)
//                     //get the document for current user.
//                     currentPup.get()
//                         .then(userDoc => {
//                             //get the data fields of the user
//                             var pupName = userDoc.data().name;
//                             var pupBreed = userDoc.data().breed;                           

//                             //if the data fields are not empty, then write them in to the form.
//                             if (pupName != null) {
//                                 document.getElementById("nameInput").value = pupNameName;
//                             }
//                             if (pupBreed != null) {
//                                 document.getElementById("breedInput").value = pupBreed;
//                             }
//                         })
//                 } else {
//                     // No user is signed in.
//                     console.log ("No user is signed in");
//                 }
//             });
//         }

// //call the function to run it 
// populatePupInfo();

function editPupInfo() {
    //Enable the form fields
    document.getElementById('pupInfoFields').disabled = false;
}

function savePupInfo() {
    //enter code here
    //a) get user entered values
    pupName = document.getElementById('nameInput').value;       //get the value of the field with id="nameInput"
    pupBreed = document.getElementById('breedInput').value;     //get the value of the field with id="breedInput"
    //b) update pup's document in Firestore
    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Get the document for the current user.
        db.collection("pup-profiles").add({
            name: pupName,
            breed: pupBreed
        })
    .then(() => {
        console.log("Document successfully updated!");
    })
    //c) disable edit 
    document.getElementById('pupInfoFields').disabled = true;
}
}
