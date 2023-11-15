firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var userId = user.uid;

        // Retrieve dogs array for the user
        var userRef = db.collection("users").doc(userId);
        userRef.get().then((doc) => {
            if (doc.exists) {
                var dogsArray = doc.data().dogs;
                var cardContainer = document.getElementById('card-container');

                dogsArray.forEach((dogId) => {
                    // Retrieve data for each dog profile
                    var dogRef = db.collection("dog-profiles").doc(dogId);
                    dogRef.get().then((doc) => {
                        if (doc.exists) {
                            var data = doc.data();

                            // Create card template using jQuery UI draggable
                            var cardTemplate = `
                                <div class="col-md-3" pup-card" onclick="viewProfile('${dogId}')">
                                    <div class="card-sub" style="cursor: pointer";>
                                        <img class="card-img-top img-fluid" src="${data.imageURL}" alt="Pup profile img">
                                        <div class="card-block">
                                            <h4 class="card-title">${data.name}</h4>
                                            <!-- Add other relevant dog profile information to the card template -->
                                        </div>
                                    </div>
                                </div>
                            `;

                            // Append the card template to the card container
                            cardContainer.innerHTML += cardTemplate;
                        }
                    });
                });
            }
        }).catch((error) => {
            console.log("Error getting user document:", error);
        });
    }
});

function viewProfile(dogId) {
     // Redirect to the specific pupprofile.html page with the corresponding dog ID
  window.location.href = `eachPupprofile.html?id=${dogId}`;
}

$(document).ready(function () {
    $(".pup-card").draggable();
    $("#card-container").sortable();
    $("#card-container").disableSelection();
});

const createbtn = document.getElementById("btn-createPupprofile");
createbtn.addEventListener("click", () => {
    window.location.href = 'pupprofileForm.html';
});