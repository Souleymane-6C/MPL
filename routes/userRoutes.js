const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");

// Routes d'authentification (pas besoin d'être connecté pour y accéder)
router.get("/login", authController.login);
router.post("/login", authController.authenticate);
router.get("/logout", authController.logout);

router.get("/signup", authController.signup);
router.post("/signup", authController.register, usersController.redirectView);

// Réinitialisation de mot de passe
router.get("/forgot-password", authController.forgotPassword);
router.post("/forgot-password", authController.requestPasswordReset);
router.get("/reset-password/:token", authController.resetPasswordForm);
router.post("/reset-password/:token", authController.resetPassword);

// Middleware de protection des routes
router.use(authController.ensureLoggedIn);

// Routes CRUD utilisateurs (protégées par l'auth)
router.get("/", usersController.index, usersController.indexView);
router.get("/api-token", usersController.getApiToken); 
router.get("/new", usersController.new);
router.post("/create", usersController.create, usersController.redirectView);
router.get("/:id", usersController.show, usersController.showView);
router.get("/:id/edit", usersController.edit);
router.put("/:id/update", usersController.update, usersController.redirectView);
router.delete("/:id/delete", usersController.delete, usersController.redirectView);

module.exports = router;
