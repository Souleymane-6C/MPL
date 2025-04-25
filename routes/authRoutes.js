const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// Route de login (affiche le formulaire de connexion)
router.get("/login", (req, res) => {
  res.render("users/login");
});

// Route d'inscription (affiche le formulaire d'inscription)
router.get("/register", usersController.new);

// Route pour créer un utilisateur
router.post("/register", usersController.create, usersController.redirectView);

module.exports = router;
