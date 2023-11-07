function displayParkInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "docID" ); //get value for key "id"
    console.log( ID );

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection( "parks" )
        .doc( ID )
        .get()
        .then( doc => {
            thisPark = doc.data();
            parkCode = thisPark.code;
            parkName = doc.data().name;
            
            // only populate title, and image
            document.getElementById( "parkName" ).innerHTML =  parkName;
            let imgEvent = document.querySelector( ".park-img" );
            imgEvent.src = "../images/" + parkCode + ".jpg";
        } );
}
displayParkInfo();