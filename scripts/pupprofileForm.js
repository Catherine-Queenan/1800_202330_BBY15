function addDogProfiles() {
    var name = document.getElementById("name").value;
    var breed = document.getElementById("breed").value;
    var gender = document.getElementById("gender").value;
    var age = document.getElementById("age").value;
    var status = document.getElementById("status").value;
    var about = document.getElementById("about").value;
    var birthday = document.getElementById("birthday").value;
    var userId = firebase.auth().currentUser.uid;

    // Get a reference to the dog-profiles collection
    const dogProfilesCollection = db.collection("dog-profiles");

    // Check if the dog-profiles collection exists
    dogProfilesCollection.get()
        .then(function (querySnapshot) {
            if (querySnapshot.empty) {
                // Create the dog-profiles collection if it doesn't exist
                db.collection("dog-profiles").add({}); // Use 'set' to create the collection
            }

            // Add user details to the database
            dogProfilesCollection.add({
                name: name,
                breed: breed,
                gender: gender,
                age: age,
                status: status,
                about: about,
                birthday: birthday,
                ownerId: userId
            }).then(function (docRef) {
                console.log("Dogs details saved successfully with ID: ", docRef.id);

                // Add dog profile ID to the user's document
                db.collection("users").doc(userId).update({
                    dogs: firebase.firestore.FieldValue.arrayUnion(docRef.id)
                }).then(function () {
                    console.log("Dog profile ID added to user's document successfully");

                    // Clear form input fields
                    document.getElementById("name").value = "";
                    document.getElementById("breed").value = "";
                    document.getElementById("gender").value = "";
                    document.getElementById("age").value = "";
                    document.getElementById("status").value = "";
                    document.getElementById("about").value = "";
                    document.getElementById("birthday").value = "";

                    // Create unique pupprofile URL
                    var pupprofileUrl = 'eachPupprofile.html?id=' + docRef.id;

                    // Redirect to eachPupprofile.html
                    window.location.href = pupprofileUrl;
                }).catch(function (error) {
                    console.error("Error updating user document with dog profile ID: ", error);
                    alert("Error updating user document with dog profile ID!");
                });
            }).catch(function (error) {
                console.error("Error saving dog profiles: ", error);
                alert("Error saving dog profile!");
            });
        }).catch(function (error) {
            console.error("Error checking dog-profiles collection: ", error);
            alert("Error checking dog-profiles collection!");
        });
}

document.querySelector('.pupprofile-img .file input').addEventListener('change', function () {
    var img = document.querySelector('.pupprofile-img img');
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = function () {
        URL.revokeObjectURL(this.src);
        updateImageDimensions(img);
    };
});

function updateImageDimensions(img) {
    var container = img.parentNode;
    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight;

    var imageRatio = img.naturalWidth / img.naturalHeight;
    var containerRatio = containerWidth / containerHeight;

    if (imageRatio > containerRatio) {
        img.style.width = '100%';
        img.style.height = 'auto';
    } else {
        img.style.width = 'auto';
        img.style.height = '100%';
    }
}

window.addEventListener('resize', function () {
    var img = document.querySelector('.pupprofile-img img');
    if (img.src) {
        updateImageDimensions(img);
    }
});