const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const path = require("path");   

// Serve registration form
router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/register.html"));
  });

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/login.html"));
  });

router.post("/register", authController.register);
router.post("/login", passport.authenticate("local", { failureRedirect: "/login-fail" }), authController.login);
router.get("/login-fail", (req, res) => res.status(401).json({ message: "Login failed" }));
router.get("/logout", authController.logout);
router.get("/profile", authController.profile);

module.exports = router;
