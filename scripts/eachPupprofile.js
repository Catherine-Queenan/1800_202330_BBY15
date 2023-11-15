// Retrieve user id
firebase.auth().onAuthStateChanged(function (user) {
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
              var urlParams = new URLSearchParams(window.location.search);
              var pupprofileId = urlParams.get('id');
              // Use the pupprofileId to fetch the specific dog profile data from the Firebase database
              // and display it on the profile page
              db.collection("dog-profiles").doc(pupprofileId).get()
                .then(function (doc) {
                  if (doc.exists) {
                    // here get the specific dog-profile and assign it to data
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
            } else {
              console.log("No such document!");
            }
          }).catch((error) => {
            console.log("Error getting document:", error);
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