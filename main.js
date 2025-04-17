const express = require("express");
 const layouts = require("express-ejs-layouts"); 
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const session = require("express-session");
const flash = require("connect-flash");

// Ajoutez les contrôleurs 
const usersController = require("./controllers/usersController");
 const coursesController = require("./controllers/coursesController"); 

const { body, validationResult } = require('express-validator');

const subscribersController = require("./controllers/subscribersController"); 

const mongoose = require("mongoose"); // Ajout de Mongoose 
 
// Configuration de la connexion à MongoDB 
mongoose.connect( 
  "mongodb://localhost:27017/ai_academy", 
  { useNewUrlParser: true } 
); 
 
const db = mongoose.connection; 
db.once("open", () => { 
  console.log("Connexion réussie à MongoDB en utilisant Mongoose!"); 
}); 

const app = express(); 



// Définir le port 
app.set("port", process.env.PORT || 3000); 
 
// Configuration d'EJS comme moteur de template 
app.set("view engine", "ejs");
 app.use(layouts); 
 
// Middleware pour traiter les données des formulaires 
app.use(express.urlencoded({ 
    extended: false 
  }) 
); 
app.use(express.json()); 
 
// Servir les fichiers statiques 
app.use(express.static("public")); 

// Configuration des sessions et des messages flash
app.use(
  session({
    secret: "ai_academy_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.pageTitle = "Bienvenue";
  next();
});
// Middleware pour rendre les messages flash disponibles dans toutes les vues
app.use((req, res, next) => {
  res.locals.flashMessages = {
    success: req.flash("success"),
    error: req.flash("error"),
    info: req.flash("info")
  };
  next();
});

// Ajouter le middleware method-override 
const methodOverride = require("method-override"); app.use(methodOverride("_method", {   methods: ["POST", "GET"] 
})); 
 
// Routes pour les utilisateurs 
app.get("/users", usersController.index, usersController.indexView); app.get("/users/new", usersController.new); 
app.post("/users/create", usersController.create, usersController.redirectView); app.get("/users/:id", usersController.show, usersController.showView); 
app.get("/users/:id/edit", usersController.edit); 
app.put("/users/:id/update", usersController.update, usersController.redirectView); app.delete("/users/:id/delete", usersController.delete, usersController.redirectView); 
 
// Routes pour les cours 
app.get("/courses", coursesController.index, coursesController.indexView); app.get("/courses/new", coursesController.new); 
app.get("/courses/search", coursesController.search, coursesController.searchView);

app.post("/courses/create", coursesController.create, coursesController.redirectView); app.get("/courses/:id", coursesController.show, coursesController.showView); app.get("/courses/:id/edit", coursesController.edit); 
app.put("/courses/:id/update", coursesController.update, coursesController.redirectView); app.delete("/courses/:id/delete", coursesController.delete, coursesController.redirectView); 
app.post("/courses/:id/enroll", coursesController.enroll, coursesController.redirectView);




// Routes pour les abonnés 
app.get("/subscribers", subscribersController.getAllSubscribers); 
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", [
  // Validations
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('zipCode').isLength({ min: 5, max: 5 }).isNumeric().withMessage('Code postal doit contenir 5 chiffres')
], (req, res, next) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Renvoyer au formulaire avec les erreurs
    return res.render('subscribers/new', { 
      errors: errors.array(),
      subscriber: req.body 
    });
  }
  
  // Si pas d'erreurs, passer au contrôleur
  subscribersController.saveSubscriber(req, res, next);
});
exports.saveSubscriber = (req, res, next) => {
  let newSubscriber = new Subscriber({
    name: req.body.name,
    email: req.body.email,
    zipCode: req.body.zipCode
  });
  
  newSubscriber.save()
    .then(result => {
      req.flash("success", "Abonné ajouté avec succès");
      res.redirect("/subscribers");
    })
    .catch(error => {
      if (error.code === 11000) { // Code d'erreur pour duplicate key
        res.render("subscribers/new", {
          error: "Cet email est déjà utilisé",
          subscriber: req.body
        });
      } else {
        console.log(`Erreur: ${error.message}`);
        next(error);
      }
    });
};



 app.get("/subscribers/:id/edit", subscribersController.edit);
app.post("/subscribers/:id/update", subscribersController.update);
app.get("/subscribers/search", subscribersController.search);
app.get("/subscribers/thanks", (req, res) => res.render("subscribers/thanks", { pageTitle: "Merci" }));

app.get("/subscribers/:id", subscribersController.show); 
app.post("/subscribers/:id/delete", subscribersController.deleteSubscriber);

// Définir les routes 
app.get("/", homeController.index);
 app.get("/about", homeController.about);
 app.get("/courses", homeController.courses); 
 app.get("/contact", homeController.contact); 
app.post("/contact", homeController.processContact);
app.get("/faq", homeController.faq);



// Gestion des erreurs 
app.use(errorController.pageNotFoundError); 
app.use(errorController.internalServerError); 
 
// Démarrer le serveur 
app.listen(app.get("port"), () => { 
  console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`); 
    console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`); 
}); 

app.use((req, res, next) => {
    res.locals.notification = req.session.notification || null;
    delete req.session.notification;
    next();
  });
  
  
