//-------------------------------------------------
// this function shows ALL the posts from the 
// stand alone posts collection
//------------------------------------------------
function showPosts() {
    db.collection("posts")
           //.orderBy(...)       //optional ordering
           //.limit(3)           //optional limit
           .get()
           .then(snap => {
               snap.forEach(doc => {
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
       var title = doc.data().name; // get value of the "name" key
       var desc = doc.data().description; //gets the length field
       var image = doc.data().image; //the field that contains the URL 

       //clone the new card
       let newcard = document.getElementById("postCardTemplate").content.cloneNode(true);
       //populate with title, image
       newcard.querySelector('.card-title').innerHTML = title;
       newcard.querySelector('.card-image').src = image;
       newcard.querySelector('.card-description').innerHTML = desc;
       //append to the posts
       document.getElementById("posts-go-here").append(newcard);
}