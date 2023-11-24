//-------------------------------------------------
// this function shows finds out who is logged in,
// reads the "myposts" field (an array) for that user, 
// reads the details for each item in the array
// and displays a card for each item. 
//------------------------------------------------
function showMyPosts() {
    firebase.auth().onAuthStateChanged(user => {
          console.log("user is: " + user.uid);
          db.collection("users").doc(user.uid)
                  .get()
                  .then(doc => {
                      myposts = doc.data().myposts; //get array of my posts
                      console.log(myposts);
                      myposts.forEach(item => {
                          db.collection("posts")
                              .doc(item)
                              .get()
                              .then(doc => {
                                  displayMyPostCard(doc);
                              })
                      })
                  })
    })
}
showMyPosts();

//------------------------------------------------------------
// this function displays ONE card, with information
// from the post document extracted (name, description, image)
//------------------------------------------------------------
function displayMyPostCard(doc) {
          var desc = doc.data().description; //gets the length field
          var image = doc.data().image; //the field that contains the URL 
          var parkID = doc.data().parkID; 

          //clone the new card
          let newcard = document.getElementById("postCardTemplate").content.cloneNode(true);
          //populate with image and caption
          newcard.querySelector('.card-image').src = image;
          newcard.querySelector('.card-description').innerHTML = desc;
          newcard.querySelector('.parkID').innerHTML = parkID;
          newcard.querySelector('#delete-icon').onclick = () => deletePost(doc.id);
          //append to the posts
          document.getElementById("myposts-go-here").append(newcard);
}

function deletePost(postid) {
    var result = confirm("Want to delete?");
    if (result) {
        //Logic to delete the item
        db.collection("posts").doc(postid)
                        .delete()
        .then(() => {
            console.log("1. Document deleted from Posts collection");
            deleteFromMyPosts(postid);
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }
}


function deleteFromMyPosts(postid) {
    firebase.auth().onAuthStateChanged(user => {
        db.collection("users").doc(user.uid).update({
                myposts: firebase.firestore.FieldValue.arrayRemove(postid)
            })
            .then(() => {
                console.log("2. post deleted from user doc");
                deleteFromStorage(postid);
            })
    })
}


function deleteFromStorage(postid) {
    // Create a reference to the file to delete
    var imageRef = storageRef.child('images/' + postid + '.jpg');

    // Delete the file
    imageRef.delete().then(() => {
        // File deleted successfully
        console.log("3. image deleted from storage");
        Swal.fire({
            title: "Post deleted!",
            icon: "success"
          });
        location.reload();
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}

//-------------------------------------------------
// this function shows finds out who is logged in,
// reads the "myposts" field (an array) for that user, 
// reads the details for each item in the array
// and displays a card for each item. 
//------------------------------------------------
function showMyReviews() {
    firebase.auth().onAuthStateChanged(user => {
          console.log("user is: " + user.uid);
          db.collection("users").doc(user.uid)
                  .get()
                  .then(doc => {
                      myreviews = doc.data().myreviews; //get array of my posts
                      console.log(myreviews);
                      myreviews.forEach(item => {
                          db.collection("reviews")
                              .doc(item)
                              .get()
                              .then(doc => {
                                  displayMyReviewCard(doc);
                              })
                      })
                  })
    })
}
showMyReviews();

//------------------------------------------------------------
// this function displays ONE card, with information
// from the post document extracted (name, description, image)
//------------------------------------------------------------
function displayMyReviewCard(doc) {
    var title = doc.data().title;
    var image = doc.data().image; //the field that contains the URL
    var desc = doc.data().description;
    var time = doc.data().timestamp.toDate();
    var rating = doc.data().rating;
    console.log(rating);
    console.log(time);

    let reviewCard = document.getElementById("reviewCardTemplate").content.cloneNode(true);
    reviewCard.querySelector(".title").innerHTML = title;
    reviewCard.querySelector(".card-image").src = image;    
    reviewCard.querySelector( ".description").innerHTML = desc;
    reviewCard.querySelector(".time").innerHTML = new Date(
        time
    ).toLocaleString();
    reviewCard.querySelector('#delete-icon').onclick = () => deleteReview(doc.id);

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
    document.getElementById("myreviews-go-here").append(reviewCard);
}

function deleteReview(reviewID) {
    var result = confirm("Want to delete?");
    if (result) {
        //Logic to delete the item
        db.collection("reviews").doc(reviewID)
                        .delete()
        .then(() => {
            console.log("1. Document deleted from Posts collection");
            deleteFromMyReviews(reviewID);
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }
}

function deleteFromMyReviews(reviewID) {
    firebase.auth().onAuthStateChanged(user => {
        db.collection("users").doc(user.uid).update({
                myreviews: firebase.firestore.FieldValue.arrayRemove(reviewID)
            })
            .then(() => {
                console.log("2. post deleted from user doc");
                deleteFromStorage(reviewID);
            })
    })
}

function deleteFromReviewStorage(reviewID) {
    // Create a reference to the file to delete
    var reviewImageRef = storageRef.child('images/' + reviewID + '.jpg');

    // Delete the file
    reviewImageRef.delete().then(() => {
        // File deleted successfully
        console.log("3. image deleted from storage");
        Swal.fire({
            title: "Review deleted!",
            icon: "success"
          });
        location.reload();
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}
