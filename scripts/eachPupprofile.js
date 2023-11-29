// Retrieve user id
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    const userId = user.uid;

    // Retrieve dogs array for the user
    const userRef = db.collection("users").doc(userId);
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
                    $('#pupWeight').text(data.weight);
                    $('#pupGender').text(data.gender);
                    $('#pupStatus').text(data.status);
                    $('#pupAbout').text(data.about);
                    // $('#pupImg').attr('src', data.ppimgUrl);

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

    const urlParams = new URLSearchParams(window.location.search);
    const pupprofileId = urlParams.get('id');

    // Retrieve and display user's image
    const storageRef = firebase.storage().ref();
    const imagesRef = storageRef.child('images/' + pupprofileId + '_*');

    imagesRef.listAll().then((result) => {
      if (result.items.length > 0) {
        result.items[0].getDownloadURL().then((downloadURL) => {
          document.getElementById('output').src = downloadURL;
        });
      }
    }).catch((error) => {
      console.error('Error checking user images: ', error);
    });


  } else {
    console.log("User is not signed in.");
  }
});


// ======== Upload pup profile image ========
window.onload = function () {
  // get the pupprofileId from current URL 
  const urlParams = new URLSearchParams(window.location.search);
  const pupprofileId = urlParams.get('id');

  if (pupprofileId) {
    // get the corresponding dog-profile data from Firebase Database 
    const userImageRef = db.collection("dog-profiles").doc(pupprofileId);

    // check if the ppimgUrl exists
    userImageRef.get().then((doc) => {
      if (doc.exists) {
        // check if there is existing URL
        const existingUrl = doc.data()['ppimgUrl'];

        if (existingUrl) {
          console.log("URL already exists:", existingUrl);

          const profilePicImg = document.getElementById('profilePic').getElementsByTagName('img')[0];
          profilePicImg.src = existingUrl;
        } else {
          // update URL
          userImageRef.update({
            'ppimgUrl': downloadURL
          }).then(() => {
            console.log("Document successfully updated!");

            // Set the upload image's URL into the id=profilePic element
            const profilePicImg = document.getElementById('profilePic').getElementsByTagName('img')[0];
            profilePicImg.src = downloadURL;
          }).catch((error) => {
            console.error("Error updating document: ", error);
          });
        }
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document:", error);
    });
  } else {
    console.error('No pupprofileId found in the URL.');
  }
}

// Function to add an image to the pup profile and the database.
function uploadImage() {
  // Check if there is a user authenticated
  const user = firebase.auth().currentUser;

  if (user) {
    const userId = user.uid;

    // Get the pupprofileId from the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const pupprofileId = urlParams.get('id');

    // Change the image name to use the current user's UID
    const imageName = userId + '_' + new Date().getTime();

    // Get the file input element
    const fileInput = document.getElementById('file');

    // Check if a file is selected
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const storageRef = firebase.storage().ref();

      // Upload the image to Firebase Storage
      const uploadTask = storageRef.child('images/' + imageName).put(file);

      // Listen for state changes, errors, and completion of the upload
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Handle progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Handle error
          console.error('Error uploading image: ', error);
        },
        () => {
          // Handle successful upload
          console.log('Image uploaded successfully');

          // Get the download URL for the image
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            // Display the image on the webpage
            document.getElementById('pupImg').src = downloadURL;

            // Update the pup profile in the database with the new image URL
            const userImageRef = db.collection("dog-profiles").doc(pupprofileId);

            userImageRef.update({
              'ppimgUrl': downloadURL
            }).then(() => {
              console.log("Document successfully updated!");

              // Set the uploaded image's URL into the id=profilePic element
              const profilePicImg = document.getElementById('profilePic').getElementsByTagName('img')[0];
              profilePicImg.src = downloadURL;
            }).catch((updateError) => {
              console.error("Error updating document: ", updateError);
            });
          });
        }
      );
    } else {
      console.error('No file selected.');
    }
  } else {
    console.log("User is not signed in.");
  }
}


// ======Starts editing and save mode======
let isEditMode = false;
// Declare the object to store edited values
let editedValues = {};

// Function to gather the existing data from the database to view.
async function getExistingDataFromFirebase(pupId) {
  try {
    const db = firebase.firestore();
    const pupRef = db.collection("dog-profiles").doc(pupId);
    const doc = await pupRef.get();

    if (doc.exists) {
      return doc.data();
    } else {
      console.log("No such document!");
      return {};
    }
  } catch (error) {
    console.error("Error getting existing data from Firebase:", error);
    throw error;
  }
}

// Function that is async to save any changes made to the database.
async function saveChangesToFirebase() {
  return new Promise(async (resolve, reject) => {
    // Get the dog profile ID from the URL
    const pupId = getDogProfileIdFromURL();

    // Create an object to store the updated data
    let updatedData = {};

    // Define the elements to edit
    const elementsToEdit = [
      { id: "pupNameId", type: "text", field: "name" },
      { id: "pupWeight", type: "number", field: "weight" },
      { id: "pupBreed", type: "text", field: "breed" },
      { id: "pupAbout", type: "textarea", field: "about" },
      { id: "pupBday", type: "date", field: "birthday" },
      { id: "pupGender", type: "radio", field: "gender" },
      { id: "pupStatus", type: "select", field: "status" }
    ];

    // Fetch existing data from Firebase using pupId
    const existingData = await getExistingDataFromFirebase(pupId);

    // Iterate through elements and update the data object
    elementsToEdit.forEach((elementInfo) => {
      const element = document.getElementById(elementInfo.id);
      let newValue;

      if (elementInfo.type === "radio") {
        // Handle radio buttons
        const checkedRadio = element.querySelector('input[name="gender"]:checked');
        newValue = checkedRadio ? checkedRadio.value : "";
      } else if (elementInfo.type === "select") {
        // Handle select element
        const selectElement = element.querySelector("select");
        newValue = selectElement ? selectElement.value : "";
      } else {
        // Handle other input types
        const inputElement = element.querySelector(elementInfo.type === "textarea" ? "textarea" : "input");
        newValue = inputElement ? inputElement.value : "";
      }


      // Check if the value has changed
      if (editedValues[elementInfo.id] !== newValue) {
        updatedData[elementInfo.field] = newValue;
      }
    });

    // Check if there's no updated data
    if (Object.keys(updatedData).length === 0) {
      // No changes, resolve the promise without updating
      resolve();
      return;
    }

    // Update the page with the new data
    updatePageWithNewData(updatedData);

    if (pupId && Object.keys(updatedData).length > 0) {
      const db = firebase.firestore();
      const pupRef = db.collection("dog-profiles").doc(pupId);

      // Log for debugging
      console.log("Updating document in Firebase:", pupId, updatedData);

      try {
        // Update the document with the new data
        await pupRef.update(updatedData);
        console.log("Document successfully updated in Firebase!");
        resolve();  // Resolve the promise
      } catch (error) {
        console.error("Error updating document in Firebase: ", error);
        reject(error);  // Reject the promise with the error
      } finally {
        // Reload the page after Firebase update
        location.reload();
      }
    } else {
      console.error("Invalid pupId or updatedData", { pupId, updatedData });
      reject(new Error("Invalid pupId or updatedData"));
    }
  });
}

// Function to update firebase with the new data.
function updateFirebaseData(updatedData) {
  // Get the dog profile ID from the URL
  const pupId = getDogProfileIdFromURL();

  console.log("pupId in updateFirebaseData:", pupId);
  console.log("updatedData in updateFirebaseData:", updatedData);

  return new Promise((resolve, reject) => {
    if (pupId && Object.keys(updatedData).length > 0) {
      const db = firebase.firestore();
      const pupRef = db.collection("dog-profiles").doc(pupId);

      // Log for debugging
      console.log("Updating document in Firebase:", pupId, updatedData);

      // Update the document with the new data
      pupRef.update(updatedData)
        .then(() => {
          console.log("Document successfully updated in Firebase!");
          resolve();  // Resolve the promise
        })
        .catch((error) => {
          console.error("Error updating document in Firebase: ", error);
          reject(error);  // Reject the promise with the error
        });
    } else {
      console.log("Invalid pupId or updatedData. Cannot update Firebase.");
      reject(new Error("Invalid pupId or updatedData"));  // Reject the promise with an error
    }
  });
}

// Function to update the page when data is changed by the user.
function updatePageWithNewData(updatedData) {
  // Loop through all properties in updatedData
  for (const field in updatedData) {
    if (updatedData.hasOwnProperty(field)) {
      const element = document.getElementById(field);

      // Check if the element exists on the page
      if (element) {
        // Update the element content with the new data
        element.textContent = updatedData[field];
      }
    }
  }
}


// Function to extract dog profile ID from the URL
function getDogProfileIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}


// Function to control the edit mode and what users are able to change.
function toggleEditModeElements() {
  // Define the elements to edit
  const elementsToEdit = [
    { id: "pupNameId", type: "text" },
    { id: "pupWeight", type: "number" },
    { id: "pupBreed", type: "text" },
    { id: "pupAbout", type: "textarea" },
    { id: "pupBday", type: "date" },
    { id: "pupGender", type: "radio" },
    { id: "pupStatus", type: "select" }
  ];

  elementsToEdit.forEach((elementInfo) => {
    const element = document.getElementById(elementInfo.id);
    const existingContent = element.textContent.trim();

    // Save the original value before entering edit mode
    if (!editedValues[elementInfo.id]) {
      editedValues[elementInfo.id] = existingContent;
    }

    if (elementInfo.type === "radio") {
      // Create radio buttons
      const radioContainer = document.createElement("div");

      // Create the male radio button
      const maleLabel = document.createElement("label");
      const maleRadio = document.createElement("input");
      maleRadio.type = "radio";
      maleRadio.name = "gender";
      maleRadio.value = "male";
      maleRadio.required = true;
      maleLabel.innerHTML = "Male";
      maleLabel.appendChild(maleRadio);
      radioContainer.appendChild(maleLabel);

      // Create the female radio button
      const femaleLabel = document.createElement("label");
      const femaleRadio = document.createElement("input");
      femaleRadio.type = "radio";
      femaleRadio.name = "gender";
      femaleRadio.value = "female";
      femaleRadio.required = true;
      femaleLabel.innerHTML = "Female";
      femaleLabel.appendChild(femaleRadio);
      radioContainer.appendChild(femaleLabel);

      // Replace the existing content with the radio buttons
      element.innerHTML = "";
      element.appendChild(radioContainer);

      // Set the selected radio button based on existing content
      const existingValue = existingContent.toLowerCase();
      if (existingValue === "male") {
        maleRadio.checked = true;
      } else if (existingValue === "female") {
        femaleRadio.checked = true;
      }
    } else if (elementInfo.type === "select") {
      // Create the select element
      const selectElement = document.createElement("select");
      selectElement.id = elementInfo.id;
      selectElement.required = true;

      // Create the options for the select element
      const options = [
        { value: "", label: "Choose Option" },
        { value: "Intact", label: "Intact" },
        { value: "Spayed", label: "Spayed" },
        { value: "Neutered", label: "Neutered" }
      ];

      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.text = option.label;
        if (existingContent === option.value) {
          optionElement.selected = true;
        }
        selectElement.appendChild(optionElement);
      });

      // Replace the existing content with the select element
      element.innerHTML = "";
      element.appendChild(selectElement);
    } else {
      // Create an input element or textarea
      const inputElement = document.createElement(elementInfo.type === "textarea" ? "textarea" : "input");
      inputElement.type = elementInfo.type;
      inputElement.value = existingContent;

      // Replace the existing content with the input field
      element.innerHTML = "";
      element.appendChild(inputElement);

      // Set focus on the input field
      inputElement.focus();
    }
  });

  const deleteButton = document.getElementById("delete-pupprofile-btn");
  const cancelButton = document.getElementById("cancel-pupprofile-btn");

  if (isEditMode) {
    // Show delete and cancel buttons in edit mode
    deleteButton.style.display = "block";
    cancelButton.style.display = "block";
  } else {
    // Hide delete and cancel buttons when not in edit mode
    deleteButton.style.display = "none";
    cancelButton.style.display = "none";
  }
}

// Function to turn on or off the editing mode for the pup profile.
function toggleEditMode() {
  console.log("Entering toggleEditMode");

  var editIcon = document.getElementById("editIcon");
  var editButton = document.getElementById("edit-pupprofile-btn");

  // Toggle the edit mode state
  isEditMode = !isEditMode;

  // Check the edit mode state
  console.log("Edit mode:", isEditMode);

  if (isEditMode) {
    console.log("Entering edit mode.");
    editIcon.classList.remove("fa-edit");
    editIcon.classList.add("fa-check");

    // Enable the edit button
    editButton.disabled = false;

    // Toggle edit mode elements
    toggleEditModeElements();
  } else {
    console.log("Exiting edit mode");

    editIcon.classList.remove("fa-check");
    editIcon.classList.add("fa-edit");

    // Disable the edit button
    editButton.disabled = true;

    // Save changes to Firebase when exiting edit mode
    saveChangesToFirebase()
      .then(() => {
        // Reload the page after Firebase update
        location.reload();
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
        // Handle the error, such as displaying an error message to the user
      });
  }
}

// Variable for the editing button.
var editButton = document.getElementById("edit-pupprofile-btn");

// Add event listener to the button
editButton.addEventListener("click", function () {
  // Toggle edit mode
  toggleEditMode();
});

// Cancel editing pup profile
function cancelEditMode() {
  // Reload the page to display the original data from before entering edit mode
  location.reload();
}
var cancelButton = document.getElementById("cancel-pupprofile-btn");
cancelButton.addEventListener("click", function () {
  // Call the cancelEditMode function when the cancel button is clicked
  cancelEditMode();
});


// ======== Delete confirmation pop up =========
function getCurrentPupId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Function to gather the user ID.
function getUserId() {
  // Get the current user from Firebase Authentication
  const user = firebase.auth().currentUser;

  if (user) {
    // If a user is authenticated, return the user's UID
    return user.uid;
  } else {
    console.error("No authenticated user found");
  }
}

// Function to remove pup profiles from the database.
function deletePupProfileFromFirebase(pupId, userId) {
  const pupProfilesRef = db.collection("dog-profiles");
  const usersRef = db.collection("users");

  // Fetch the user document
  return usersRef
    .doc(userId)
    .get()
    .then((userDoc) => {
      // Check if the user document exists
      if (userDoc.exists) {
        // Get the current dogs array
        const dogsArray = userDoc.data().dogs || [];

        // Remove the pupId from the array
        const updatedDogsArray = dogsArray.filter((dogId) => dogId !== pupId);

        // Update the user document with the new dogs array
        return usersRef.doc(userId).update({ dogs: updatedDogsArray });
      } else {
        // Handle the case where the user document does not exist
        console.error("User document not found");
        throw new Error("User document not found");
      }
    })
    .then(() => {
      // After updating the user document, delete the pup profile
      return pupProfilesRef.doc(pupId).delete();
    });
}

// Gets the confirmation button for deleting a pup profile, and deletes the profile if clicked.
document.getElementById("confirm-delete-btn").addEventListener("click", function () {
  const currentPupId = getCurrentPupId();
  const userId = getUserId();

  deletePupProfileFromFirebase(currentPupId, userId)
    .then(() => {
      // hide the delete confirmation modal
      const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
      if (deleteConfirmationModal) {
        deleteConfirmationModal.style.display = 'none';
      } else {
        console.error("Delete confirmation modal not found");
      }

      showSuccessConfirmationModal();
    })
    .catch((error) => {
      console.error("Error deleting document: ", error);
    });
});

// Function to pop-up a modal.
function showSuccessConfirmationModal() {
  const confirmationModal = new bootstrap.Modal(document.getElementById('success-delete-confirmation'));
  confirmationModal.show();
}

// Gets the okay button for the user on the modal.
document.getElementById("confirm-ok-btn").addEventListener("click", function () {
  navigateToPage();
});

// Back button function
function navigateToPage() {
  // Navigate to pupprofileList.html when click the back button.
  window.location.href = 'pupprofileList.html';
}