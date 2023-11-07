function displayParkInfo() {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "id"
    console.log(ID);

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection("parks")
        .doc(ID)
        .get()
        .then(doc => {
            thisPark = doc.data();
            parkCode = thisPark.code;
            parkName = doc.data().name;

            // only populate title, and image
            document.getElementById("parkName").innerHTML = parkName;
            let imgEvent = document.querySelector(".park-img");
            imgEvent.src = "../images/" + parkCode + ".jpg";
        });
}
displayParkInfo();

function saveParkDocumentIDAndRedirect() {
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("docID");
    localStorage.setItem('parkDocID', ID);
    window.location.href = 'review.html';
}

function populateReviews() {
    console.log("test");
    let parkCardTemplate = document.getElementById("reviewCardTemplate");
    let parkCardGroup = document.getElementById("reviewCardGroup");

    let params = new URL(window.location.href); // Get the URL from the search bar
    let parkID = params.searchParams.get("docID");

    // Double-check: is your collection called "Reviews" or "reviews"?
    db.collection("reviews")
        .where("parkDocID", "==", parkID)
        .get()
        .then((allReviews) => {
            reviews = allReviews.docs;
            console.log(reviews);
            reviews.forEach((doc) => {
                var title = doc.data().title;
                // var level = doc.data().level;
                // var season = doc.data().season;
                var description = doc.data().description;
                // var flooded = doc.data().flooded;
                // var scrambled = doc.data().scrambled;
                var time = doc.data().timestamp.toDate();
                var rating = doc.data().rating; // Get the rating value
                console.log(rating)

                console.log(time);

                let reviewCard = parkCardTemplate.content.cloneNode(true);
                reviewCard.querySelector(".title").innerHTML = title;
                reviewCard.querySelector(".time").innerHTML = new Date(
                    time
                ).toLocaleString();
                // reviewCard.querySelector(".level").innerHTML = `Level: ${level}`;
                // reviewCard.querySelector(".season").innerHTML = `Season: ${season}`;
                // reviewCard.querySelector(".scrambled").innerHTML = `Scrambled: ${scrambled}`;
                // reviewCard.querySelector(".flooded").innerHTML = `Flooded: ${flooded}`;
                reviewCard.querySelector(".description").innerHTML = `Description: ${description}`;

                // Populate the star rating based on the rating value

                // Initialize an empty string to store the star rating HTML
                let starRating = "";
                // This loop runs from i=0 to i<rating, where 'rating' is a variable holding the rating value.
                for (let i = 0; i < rating; i++) {
                    starRating += '<span class="material-icons">star</span>';
                }
                // After the first loop, this second loop runs from i=rating to i<5.
                for (let i = rating; i < 5; i++) {
                    starRating += '<span class="material-icons">star_outline</span>';
                }
                reviewCard.querySelector(".star-rating").innerHTML = starRating;

                parkCardGroup.appendChild(reviewCard);
            });
        });
}

populateReviews();