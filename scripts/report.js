// Function to write and save a report for the user, associated with a post or review, and save that information to firebase.
function writeReport() {
    var user = firebase.auth().currentUser;
    var postid = localStorage.getItem('postid');
    var reportedPost = JSON.parse(localStorage.getItem('reportedPost'));
  
    if (user && postid && reportedPost) {
      var currentUser = db.collection("users").doc(user.uid);
  
      db.collection("reports").add({
        user: currentUser,
        postid: postid,
        reportedPost: reportedPost, // Include the reported post data
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(doc => {
        console.log("1. Report document added!");
        console.log(doc.id);
      }).then(() => {
        localStorage.removeItem('postid');
        localStorage.removeItem('reportedPost');
        console.log(Test);
        window.location.href = "thanks.html";
      });
    } else {
      console.log("No user is signed in or postid or reportedPost is missing");
      window.location.href = 'thanks.html';
    }
  }