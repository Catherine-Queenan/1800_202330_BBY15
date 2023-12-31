// Function to cover a variety of uses, including getting name and favourites.
function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            insertNameFromFirestore(user);
            getFavorites(user)
        } else {
            console.log("No user is signed in");
        }
    });
}
doAll();

//----------------------------------------------------------
// Wouldn't it be nice to see the User's Name on this page?
// Let's do it!  (Thinking ahead:  This function can be carved out, 
// and put into script.js for other pages to use as well).
//----------------------------------------------------------//----------------------------------------------------------
function insertNameFromFirestore(user) {
            db.collection("users").doc(user.uid).get().then(userDoc => {
                console.log(userDoc.data().name)
                userName = userDoc.data().name;
                console.log(userName)
            })

}

//----------------------------------------------------------
// This function takes input param User's Firestore document pointer
// and retrieves the "saved" array (of favorites) 
// and dynamically displays them in the gallery
//----------------------------------------------------------
function getFavorites(user) {
    db.collection("users").doc(user.uid).get()
        .then(userDoc => {

					  // Get the Array of favorites
            var favorites = userDoc.data().favorites;
            console.log(favorites);
						
						// Get pointer the new card template
            let newcardTemplate = document.getElementById("savedCardTemplate");

						// Iterate through the ARRAY of favoriteed hikes (document ID's)
            favorites.forEach(thisParkID => {
                console.log(thisParkID);
                db.collection("parks").doc(thisParkID).get().then(doc => {
                    var title = doc.data().name; // get value of the "name" key
                    var parkCode = doc.data().code; //get unique ID to each hike to be used for fetching right image
                    var docID = doc.id;  //this is the autogenerated ID of the document
                    var parkCity = doc.data().city; //gets the length field
                    var details = doc.data().details;  // get value of the "details" key
                    
                    //clone the new card
                    let newcard = newcardTemplate.content.cloneNode(true);

                    //update title and some pertinant information
                    newcard.querySelector('.card-title').innerHTML = title;
                    newcard.querySelector('.card-city').innerHTML = parkCity;
                    newcard.querySelector('.card-text').innerHTML = details;
                    newcard.querySelector('.card-image').src = `./images/${parkCode}.jpg`; //Example: NV01.jpg
                    newcard.querySelector('a').href = "eachPark.html?docID=" + docID;
                    

										//Finally, attach this new card to the gallery
                    parkCardGroup.appendChild(newcard);
                })
            });
        })
}