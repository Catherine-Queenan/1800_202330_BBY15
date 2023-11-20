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
    var imageRef = storage.ref.child('images/' + postid + '.jpg');

    // Delete the file
    imageRef.delete().then(() => {
        // File deleted successfully
        console.log("3. image deleted from storage");
        alert("DELETE is completed!");
        location.reload();
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}
