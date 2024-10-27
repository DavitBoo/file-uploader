const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Sin este middleware, req.body sería undefined
app.use(express.urlencoded({ extended: false })); // middleware esencial para procesar datos enviados desde formularios HTML tradicionales

// Initialize Passport
app.use(passport.initialize());

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return done(null, false, { message: "No user found" });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (error) {
      return done(err);
    }
  })
);

// routes
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
  res.status(200).json({ message: "Logged in successfully" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
