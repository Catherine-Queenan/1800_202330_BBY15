// Function to gather user input for the pup profile, and add the data to firebase.
function addDogProfiles() {
    var form = $(".form");
    var isValid = true;

    form.find("input[required]").each(function () {
        if ($(this).val() === "") {
            isValid = false;
            $(this).addClass("is-invalid");
        } else {
            $(this).removeClass("is-invalid");
        }
    });

    form.find("select[required]").each(function () {
        if (!$(this).val()) {
            var errorMessage = $("<div class='invalid-feedback'>Please choose a status option.</div>");
            $(this).addClass("is-invalid");
            $(this).after(errorMessage);
            isValid = false;
        } else {
            $(this).removeClass("is-invalid");
            $(this).next(".invalid-feedback").remove();
        }
    });

    form.find("input[type=radio][required]").each(function () {
        var name = $(this).attr("name");
        var container = $(this).closest(".d-flex");
        if ($("input[name=" + name + "]:checked").length === 0) {
            container.addClass("is-invalid");
            if (!container.next(".invalid-feedback").length) {
                var errorMessage = $("<div class='invalid-feedback'>Please choose a gender option.</div>");
                container.after(errorMessage);
            }
            isValid = false;
        } else {
            container.removeClass("is-invalid");
            container.next(".invalid-feedback").remove();
        }
    });

    if (isValid) {


        var name = document.getElementById("name").value;
        var breed = document.getElementById("breed").value;
        var birthday = document.getElementById("birthday").value;
        var gender = document.querySelector('input[name="gender"]:checked').value;
        var weight = document.getElementById("weight").value;
        var status = document.getElementById("status").value;
        var about = document.getElementById("about").value;
        var userId = firebase.auth().currentUser.uid;

        // Get a reference to the dog-profiles collection
        const dogProfilesCollection = db.collection("dog-profiles");

        // Get the download URL of the uploaded image
        var img = document.querySelector('.pupprofile-img img');
        var downloadURL = img.src || ''; // Use an empty string if no image is uploaded

        var docRef; // Declare docRef at a higher scope

        // Add user details to the database
        dogProfilesCollection.add({
            name: name,
            breed: breed,
            gender: gender,
            status: status,
            about: about,
            birthday: birthday,
            weight: weight,
            ownerId: userId,
            ppimgUrl: downloadURL // Store ppimgUrl in the same document
        })
            .then(function (doc) {
                docRef = doc; // Assign the document reference to docRef
                console.log("Dogs details saved successfully with ID: ", docRef.id);

                // Add dog profile ID to the user's document
                return db.collection("users").doc(userId).update({
                    dogs: firebase.firestore.FieldValue.arrayUnion(docRef.id)
                });
            })
            .then(function () {
                // Clear form input fields
                document.getElementById("name").value = "";
                document.getElementById("breed").value = "";
                document.getElementById("gender").value = "";
                document.getElementById("weight").value = "";
                document.getElementById("status").value = "";
                document.getElementById("about").value = "";
                document.getElementById("birthday").value = "";

                // Create unique pupprofile URL
                var pupprofileUrl = 'eachPupprofile.html?id=' + docRef.id;

                // Redirect to eachPupprofile.html
                window.location.href = pupprofileUrl;
            })
            .catch(function (error) {
                console.error("Error during the process: ", error);
                alert("Error during the process!");
            });
    } else {
        console.log("Please fill in all required fields");
    }

}

// Function and querySelector to add an image to the pup profile.
document.querySelector('.pupprofile-img .file input').addEventListener('change', function () {
    var img = document.querySelector('.pupprofile-img img');
    var file = this.files[0]; // Get the selected image file
    var storageRef = firebase.storage().ref(); // Get a reference to the Firebase Storage root

    // Generate a unique filename for the image using the current timestamp
    var timestamp = new Date().getTime();
    var filename;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in
            filename = user.uid + '_' + timestamp;

            var uploadTask = storageRef.child('images/' + filename).put(file);
            uploadTask.on('state_changed',
                function (snapshot) {
                    // Update progress bar or display a message indicating the upload progress
                },
                function (error) {
                    // Handle possible errors during the upload
                },
                function () {
                    // Upload is complete, get the download URL of the uploaded image
                    uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                        // Update the image src attribute with the download URL
                        console.log("Download URL:", downloadURL);
                        img.src = downloadURL;
                        updateImageDimensions(img);
                    }).catch(function (error) {
                        console.error("Error getting download URL: ", error);
                        // Handle the error appropriately, e.g., display an error message to the user
                    });
                }
            );
        } else {
            console.log("User is signed out.");
        }
    });
});

// Function to change the dimensions of images to the appropriate size
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

// Event listener to implement the function for updating dimensions.
window.addEventListener('resize', function () {
    var img = document.querySelector('.pupprofile-img img');
    if (img.src) {
        updateImageDimensions(img);
    }
});