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