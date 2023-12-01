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

// Function to create a report for a post.
function makeReport(postid, post) {
  // Pass both postid and post data to the report page
  localStorage.setItem('postid', postid);
  localStorage.setItem('reportedPost', JSON.stringify(post));
  window.location.href = 'report.html';
}

//-------------------------------------------------
// this function shows ALL the posts from the 
// stand alone posts collection
//------------------------------------------------
function showPosts() {
  // let params = new URL(window.location.href); // Attempt to link to specific park.
  // let parkID = params.searchParams.get("name");
  // let timestamp = params.searchParams.get("last_updated");
  db.collection("posts")
    // .where("name", "==", parkID) Attempt to link to specific park.
    .orderBy("last_updated", "desc") // Orders by the timestamp in firestore
    .get()
    .then(snap => {
      snap.forEach(doc => {
        console.log(doc.data());
        displayPostCard(doc);
      })
    })
}
showPosts();

//------------------------------------------------------------
// this function displays ONE card, with information
// from the post document extracted (name, description, image)
//------------------------------------------------------------
function displayPostCard(doc) {
  var desc = doc.data().description;
  var image = doc.data().image;
  var user = doc.data().name;
  var postid = doc.id;

  let newcard = document.getElementById("postCardTemplate").content.cloneNode(true);

  let cardImage = newcard.querySelector('.card-image');
  if (image) {
    cardImage.src = image;
  } else {
    cardImage.style.display = "none";
  }

  // newcard.querySelector('.card-image').src = image;
  newcard.querySelector('.card-description').innerHTML = desc;
  newcard.querySelector('.card-user').innerHTML = user;
  newcard.querySelector('#report-icon').onclick = () => makeReport(postid, doc.data()); // Pass both postid and post data

  document.getElementById("posts-go-here").append(newcard);
}
