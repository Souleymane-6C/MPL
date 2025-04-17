// Fonction pour valider le formulaire d'utilisateur
function validateUserForm() {
    const firstNameInput = document.getElementById("inputFirstName");
    const lastNameInput = document.getElementById("inputLastName");
    const emailInput = document.getElementById("inputEmail");
    const passwordInput = document.getElementById("inputPassword");
    const zipCodeInput = document.getElementById("inputZipCode");
    let isValid = true;
  
    // Validation du prénom
    if (firstNameInput.value.trim() === "") {
      showError(firstNameInput, "Le prénom est requis");
      isValid = false;
    } else {
      removeError(firstNameInput);
    }
  
    // Validation du nom
    if (lastNameInput.value.trim() === "") {
      showError(lastNameInput, "Le nom est requis");
      isValid = false;
    } else {
      removeError(lastNameInput);
    }
  
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      showError(emailInput, "Format d'email invalide");
      isValid = false;
    } else {
      removeError(emailInput);
    }
  
    // Validation du mot de passe
    if (passwordInput.value.length < 8) {
      showError(passwordInput, "Le mot de passe doit contenir au moins 8 caractères");
      isValid = false;
    } else {
      removeError(passwordInput);
    }
  
    // Validation du code postal
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCodeInput.value)) {
      showError(zipCodeInput, "Le code postal doit contenir 5 chiffres");
      isValid = false;
    } else {
      removeError(zipCodeInput);
    }
  
    return isValid;
  }
  
  // Fonction pour valider le formulaire de cours
  function validateCourseForm() {
    const titleInput = document.getElementById("inputTitle");
    const descriptionInput = document.getElementById("inputDescription");
    const maxStudentsInput = document.getElementById("inputMaxStudents");
    const costInput = document.getElementById("inputCost");
    let isValid = true;
  
    // Validation du titre
    if (titleInput.value.trim() === "") {
      showError(titleInput, "Le titre est requis");
      isValid = false;
    } else {
      removeError(titleInput);
    }
  
    // Validation de la description
    if (descriptionInput.value.trim() === "") {
      showError(descriptionInput, "La description est requise");
      isValid = false;
    } else {
      removeError(descriptionInput);
    }
  
    // Validation du nombre maximum d'étudiants
    if (maxStudentsInput.value < 0) {
      showError(maxStudentsInput, "Le nombre d'étudiants ne peut pas être négatif");
      isValid = false;
    } else {
      removeError(maxStudentsInput);
    }
  
    // Validation du coût
    if (costInput.value < 0) {
      showError(costInput, "Le coût ne peut pas être négatif");
      isValid = false;
    } else {
      removeError(costInput);
    }
  
    return isValid;
  }
  
  // Fonction pour afficher une erreur
  function showError(input, message) {
    const formGroup = input.closest(".form-group");
    const errorDiv = formGroup.querySelector(".error-message") || document.createElement("div");
    
    if (!formGroup.querySelector(".error-message")) {
      errorDiv.className = "error-message text-danger";
      formGroup.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    input.classList.add("is-invalid");
  }
  
  // Fonction pour supprimer une erreur
  function removeError(input) {
    const formGroup = input.closest(".form-group");
    const errorDiv = formGroup.querySelector(".error-message");
    
    if (errorDiv) {
      errorDiv.remove();
    }
    
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }
  
  // Attacher les validations aux formulaires lorsque le DOM est chargé
  document.addEventListener("DOMContentLoaded", function() {
    // Formulaire d'utilisateur
    const userForm = document.querySelector("form[action^='/users']");
    if (userForm) {
      userForm.addEventListener("submit", function(event) {
        if (!validateUserForm()) {
          event.preventDefault();
        }
      });
    }
    
    // Formulaire de cours
    const courseForm = document.querySelector("form[action^='/courses']");
    if (courseForm) {
      courseForm.addEventListener("submit", function(event) {
        if (!validateCourseForm()) {
          event.preventDefault();
        }
      });
    }
  });