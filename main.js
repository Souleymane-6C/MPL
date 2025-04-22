const express = require("express");
const layouts = require("express-ejs-layouts"); 
const session = require("express-session");
const flash = require("connect-flash");
//const passport = require("passport");
const passport = require('./config/passport'); 
const cookieParser = require("cookie-parser");

const methodOverride = require("method-override");


const { userValidationRules, validate } = require('./middlewares/userValidation');
const { isAdmin, isTeacherOrAdmin } = require('./middlewares/authorization');

// Ajoutez les contrôleurs 
const usersController = require("./controllers/usersController");
 const coursesController = require("./controllers/coursesController"); 
const { body, validationResult } = require('express-validator');
const subscribersController = require("./controllers/subscribersController"); 
const mongoose = require("mongoose"); // Ajout de Mongoose 
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");

const authController = require("./controllers/authController"); 

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




// Configuration de l'application 
app.set("port", process.env.PORT || 3000); app.set("view engine", "ejs"); app.use(express.static("public")); app.use(layouts); 
app.use(express.urlencoded({ extended: false }));
 app.use(express.json()); app.use(methodOverride("_method", {   methods: ["POST", "GET"] 
})); 
 
// Configuration des cookies et des sessions
 app.use(cookieParser("secret_passcode")); 
 app.use(session({   secret: "secret_passcode", 
  cookie: {     maxAge: 4000000 
  }, 
  resave: false,   saveUninitialized: false 
})); 
 
// Configuration de flash messages 
app.use(flash()); 
 
// Configuration de Passport 
app.use(passport.initialize()); 
app.use(passport.session()); 
 
// Configuration du User model pour Passport
 const User = require("./models/user");
 passport.use(User.createStrategy()); passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 
 
// Middleware pour rendre les variables locales disponibles dans toutes les vues
 app.use((req, res, next) => {   res.locals.flashMessages = req.flash();   res.locals.loggedIn = req.isAuthenticated();   res.locals.currentUser = req.user; 
  next(); 
}); 
 


app.use((req, res, next) => {
  res.locals.pageTitle = 'AI Academy'; 
  next();
});


// Routes pour l'authentification Google
app.get("/auth/google", passport.authenticate("google", { scope: ['profile', 'email'] }));
app.get("/auth/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: "/login",
    failureFlash: true,
    successRedirect: "/",
    successFlash: "Vous êtes maintenant connecté avec Google!"
  })
);


// Routes protégées - accessibles uniquement aux utilisateurs connectés 
//app.use("/users", authController.ensureLoggedIn);
// app.use("/courses/new", authController.ensureLoggedIn);
 //app.use("/courses/:id/edit", authController.ensureLoggedIn); 


// Routes pour les cours (création et modification accessibles uniquement par les enseignants et admins)
app.get("/courses", coursesController.index, coursesController.indexView); // Accessible à tous
app.get("/courses/new", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.new);
app.get("/courses/search", coursesController.search, coursesController.searchView); // Accessible à tous
app.post("/courses/create", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.create, coursesController.redirectView);
app.get("/courses/:id", coursesController.show, coursesController.showView); // Accessible à tous
app.get("/courses/:id/edit", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.edit);
app.put("/courses/:id/update", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.update, coursesController.redirectView);
app.delete("/courses/:id/delete", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.delete, coursesController.redirectView);
app.post("/courses/:id/enroll", authController.ensureLoggedIn, coursesController.enroll, coursesController.redirectView); // Accessible aux utilisateurs connectés


// Routes pour les utilisateurs (accessibles uniquement par les admins)
app.get("/users", authController.ensureLoggedIn, isAdmin, usersController.index, usersController.indexView);
app.get("/users/new", authController.ensureLoggedIn, isAdmin, usersController.new);
app.post("/users/create", authController.ensureLoggedIn, isAdmin, usersController.create, usersController.redirectView);
app.get("/users/:id", authController.ensureLoggedIn, usersController.show, usersController.showView); // Permettre à l'utilisateur de voir son propre profil
app.get("/users/:id/edit", authController.ensureLoggedIn, isAdmin, usersController.edit);
app.put("/users/:id/update", authController.ensureLoggedIn, isAdmin, usersController.update, usersController.redirectView);
app.delete("/users/:id/delete", authController.ensureLoggedIn, isAdmin, usersController.delete, usersController.redirectView);
 


// Routes d'authentification
 app.get("/login", authController.login); 
 app.post("/login", authController.authenticate); 
app.get("/logout", authController.logout, usersController.redirectView); 
app.get("/signup", authController.signup); 
app.post("/signup", userValidationRules(), validate, authController.register, usersController.redirectView);
 

// Routes pour la récupération de mot de passe
app.get("/forgot-password", authController.forgotPassword);
app.post("/forgot-password", authController.requestPasswordReset);
app.get("/reset-password/:token", authController.resetPasswordForm);
app.post("/reset-password/:token", authController.resetPassword);





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
  
  
