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

// display image from user's input
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
      $('#imagePreview').hide();
      $('#imagePreview').fadeIn(650);
    }
    reader.readAsDataURL(input.files[0]);
  }
}
$("#imageUpload").change(function () {
  readURL(this);
});


// starts editing and save mode
let isEditMode = false;

// Declare the object to store edited values
let editedValues = {};

function saveChangesToFirebase() {
  // Get the dog profile ID from the URL
  const pupId = getDogProfileIdFromURL();

  // Create an object to store the updated data
  let updatedData = {};

  // Define the elements to edit
  const elementsToEdit = [
    { id: "pupNameId", type: "text", field: "name" },
    { id: "pupAge", type: "number", field: "age" },
    { id: "pupBreed", type: "text", field: "breed" },
    { id: "pupAbout", type: "textarea", field: "about" },
    { id: "pupBday", type: "date", field: "birthday" },
    { id: "pupGender", type: "radio", field: "gender" },
    { id: "pupStatus", type: "select", field: "status" }
  ];

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

  // Update the page with the new data
  updatePageWithNewData(updatedData);

  return updatedData;
}




function toggleEditModeElements() {
  // Define the elements to edit
  const elementsToEdit = [
    { id: "pupNameId", type: "text" },
    { id: "pupAge", type: "number" },
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
}

// Function to extract dog profile ID from the URL
function getDogProfileIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Function to update the page with the new data
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


function updateFirebaseData(updatedData) {
  // Get the dog profile ID from the URL
  const pupId = getDogProfileIdFromURL();

  return new Promise((resolve, reject) => {
    if (pupId && Object.keys(updatedData).length > 0) {
      const db = firebase.firestore();
      const pupRef = db.collection("dog-profiles").doc(pupId);

      // Update the document with the new data
      pupRef.update(updatedData)
        .then(() => {
          console.log("Document successfully updated!");
          resolve();  // Resolve the promise
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
          reject(error);  // Reject the promise with the error
        });
    } else {
      reject(new Error("Invalid pupId or updatedData"));  // Reject the promise with an error
    }
  });
}

// Function to toggle the edit mode
function toggleEditMode() {
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
    const updatedData = saveChangesToFirebase();

    // Update Firebase data and then reload the page
    updateFirebaseData(updatedData)
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


document.getElementById("edit-pupprofile-btn").addEventListener("click", function () {
  // Toggle edit mode
  toggleEditMode();
});


