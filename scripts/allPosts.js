//-------------------------------------------------
// this function shows ALL the posts from the 
// stand alone posts collection
//------------------------------------------------
function showPosts() {
    // let params = new URL(window.location.href); // Attempt to link to specific park.
    // let parkID = params.searchParams.get("name");
    // let timestamp = params.searchParams.get("last_updated");
    db.collection("posts")
            // .where("name", "==", parkID) Attempt to link to specific park.
            .get()
            .then(snap => {
               snap.forEach(doc => {
                console.log(doc.data());
                   displayPostCard(doc);
               })
           })
}
showPosts();

//------------------------------------------------------------
// this function displays ONE card, with information
// from the post document extracted (name, description, image)
//------------------------------------------------------------
function displayPostCard(doc) {
       var desc = doc.data().description; //gets the length field
       var image = doc.data().image; //the field that contains the URL
       var user = doc.data().name; // display name


       //clone the new card
       let newcard = document.getElementById("postCardTemplate").content.cloneNode(true);
       //populate with image and caption
       newcard.querySelector('.card-image').src = image;
       newcard.querySelector('.card-description').innerHTML = desc;
       newcard.querySelector('.card-user').innerHTML = user;
       //append to the posts
       document.getElementById("posts-go-here").append(newcard);
}