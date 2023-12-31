
var currentUser;               //points to the document of the user who is logged in

// Function to show all of the user data that is saved and viewable.
function populateUserInfo() {
            firebase.auth().onAuthStateChanged(user => {
                // Check if user is signed in:
                if (user) {

                    //go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    //get the document for current user.
                    currentUser.get()
                        .then(userDoc => {
                            //get the data fields of the user
                            var userName = userDoc.data().name;
                            var userCity = userDoc.data().city;

                            //if the data fields are not empty, then write them in to the form.
                            if (userName != null) {
                                document.getElementById("nameInput").value = userName;
                            }
                            if (userCity != null) {
                                document.getElementById("cityInput").value = userCity;
                            }
                        })
                } else {
                    // No user is signed in.
                    console.log ("No user is signed in");
                }
            });
        }

//call the function to run it 
populateUserInfo();

// Function to enable the edit mode.
function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
 }

// Function to save the new data and update it.
function saveUserInfo() {
    //enter code here

    //a) get user entered values
    userName = document.getElementById('nameInput').value;
    userCity = document.getElementById('cityInput').value; 
    //b) update user's document in Firestore
    currentUser.update({
        name: userName,
        city: userCity
    })
    .then(() => {
        console.log("Document successfully updated!");
        Swal.fire({
            title: "Information Updated!",
            icon: "success"
          });
    })
    //c) disable edit
    document.getElementById('personalInfoFields').disabled = true;
}

// Function to pull the name from the database and display it.
function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here: 
            console.log(user.uid); //print the uid in the browser console
            console.log(user.displayName);  //print the user name in the browser console
            userName = user.displayName;

            //method #1:  insert with JS
            // document.getElementById("name-goes-here").innerText = userName;
            //method #3:  insert using querySelector
            document.querySelector("#name-goes-here").innerText = userName;

        } else {
            // No user is signed in.
        }
    });
}
getNameFromAuth(); //run the function

// Function to get the email from the database and display it.
function getEmailFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here: 
            console.log(user.uid); //print the uid in the browser console
            console.log(user.email);  //print the user name in the browser console
            email = user.email;

            //method #1:  insert with JS
            // document.getElementById("name-goes-here").innerText = userName;
            //method #3:  insert using querySelector
            document.querySelector("#email-goes-here").innerText = email;

        } else {
            // No user is signed in.
        }
    });
}
getEmailFromAuth(); //run the function