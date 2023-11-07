const form = document.querySelector('add-pup-profile');

// saving user's pup
form.addEventListener('submit', (event) => {
    event.preventDefault();
    db.collection('pup-profiles').add({
        name: form.name.value,
        breed: form.breed.value
    })
})