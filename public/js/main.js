// Filtrage des cours
function filterCourses() {
  const levelFilter = document.getElementById('level-filter').value;
  const priceFilter = document.getElementById('price-filter').value;
  const courseCards = document.querySelectorAll('.course-card');
  let visibleCount = 0;
  
  courseCards.forEach(card => {
    const level = card.getAttribute('data-level');
    const price = parseInt(card.getAttribute('data-price'));
    
    // Vérifier le niveau
    const levelMatch = levelFilter === 'all' || level === levelFilter;
    
    // Vérifier le prix
    let priceMatch = true;
    if (priceFilter === '0-200') {
      priceMatch = price < 200;
    } else if (priceFilter === '200-300') {
      priceMatch = price >= 200 && price <= 300;
    } else if (priceFilter === '300+') {
      priceMatch = price > 300;
    }
    
    // Afficher ou masquer la carte selon les filtres
    if (levelMatch && priceMatch) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Afficher un message si aucun cours ne correspond
  const noCoursesMessage = document.getElementById('no-courses-message');
  if (visibleCount === 0) {
    noCoursesMessage.style.display = 'block';
  } else {
    noCoursesMessage.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', () => {   // Mettre en évidence le lien de navigation actif  
 const currentPath = window.location.pathname; 
    const navLinks = document.querySelectorAll('nav ul li a'); 
     
    navLinks.forEach(link => { 
      if (link.getAttribute('href') === currentPath) {       link.style.fontWeight = 'bold'; 
        link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; 
      } 
      
        // Ajout des écouteurs d'événements pour les filtres de cours
  const levelFilter = document.getElementById('level-filter');
  const priceFilter = document.getElementById('price-filter');
  
  if (levelFilter && priceFilter) {
    levelFilter.addEventListener('change', filterCourses);
    priceFilter.addEventListener('change', filterCourses);
  }
      
    }); 
     
    // Animation simple pour les messages de succès 
    const thanksMessage = document.querySelector('.thanks-message');   if (thanksMessage) { 
      thanksMessage.style.animation = 'fadeIn 1s ease-in'; 
    } 
  }); 
   
  // Fonction de validation du formulaire de contact 
  const contactForm = document.querySelector('form[action="/contact"]'); if (contactForm) { 
    contactForm.addEventListener('submit', (e) => {     const emailInput = contactForm.querySelector('#email'); 
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
       
      if (!emailPattern.test(emailInput.value)) {       e.preventDefault(); 
        alert('Veuillez entrer une adresse email valide.'); 
      } 
    }); 
  } 
  