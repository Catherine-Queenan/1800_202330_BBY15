
// Function to retrieve and print the name from the user, if they are signed in.
function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here: 
            console.log(user.uid); //print the uid in the browser console
            console.log(user.displayName);  //print the user name in the browser console
            userName = user.displayName;

            
            //method #3:  insert using querySelector
            document.querySelector("#name-goes-here").innerText = userName;

        } else {
            console.log('No such document!');
        }
    });
}
getNameFromAuth(); //run the function