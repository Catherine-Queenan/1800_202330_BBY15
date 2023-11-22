function writeReport() {
    console.log("inside write review");
    let docID = document.getElementById("reviewID");
    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);

        // Get the document for the current user.
        db.collection("reports").add({
            user: currentUser,
            documentID: docID,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()

        }).then(doc => {
          console.log("1. Report document added!");
          console.log(doc.id);
        }).then(() => {
          window.location.href = "thanks.html"; // Redirect to the thanks page
      })
    } else {
        console.log("No user is signed in");
        window.location.href = 'report.html';
    }
}