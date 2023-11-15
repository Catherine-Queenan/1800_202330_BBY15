// Retrieve user id
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var userId = user.uid;
    
    // Retrieve dogs array for the user
    var userRef = db.collection("users").doc(userId);
    userRef.get().then((doc) => {
      if (doc.exists) {
        var dogsArray = doc.data().dogs;
        dogsArray.forEach((dogId) => {
          // Retrieve data for each dog profile
          var dogRef = db.collection("dog-profiles").doc(dogId);
          dogRef.get().then((doc) => {
            if (doc.exists) {
              var data = doc.data();
              
              // Update HTML elements with the retrieved data
              $('.pupName').text(data.name);
              $('#pupBreed').text(data.breed);
              $('#pupBday').text(data.birthday);
              $('#pupAge').text(data.age);
              $('#pupGender').text(data.gender);
              $('#pupStatus').text(data.status);
              $('#pupAbout').text(data.about);
              // $('#imgProfile').attr('src', data.profilePicture);
            } else {
              console.log("No such document!");
            }
        });
        });
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document:", error);
    });
  } else {
    console.log("User is not signed in.");
  }
});
