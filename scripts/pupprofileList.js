$(document).ready(function () {
    $("#sortable").sortable();
    $("#sortable").disableSelection();
});

const createbtn = document.getElementById("btn-createPupprofile");
createbtn.addEventListener("click", () => {
    window.location.href = 'pupprofile.html';
});