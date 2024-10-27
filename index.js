const express = require("express");
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const PrismaSessionStore = require('prisma-session-store')(session);

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Sin este middleware, req.body sería undefined
app.use(express.urlencoded({ extended: false })); // middleware esencial para procesar datos enviados desde formularios HTML tradicionales



// Set up express-session with PrismaSessionStore
app.use(
  session({
    secret: 'mi_clave',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, 
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Session expiry time in milliseconds (1 day)
    },
  }),
)


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());  

// Passport Local Strategy
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

// Se serializa para seleccionar solo el ID del usuario para guardarlo en la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);    
});

// Al tener el id guardado en la sesión buscamos los datos del usuario en la bbdd con ese id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


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

app.post("/login", passport.authenticate("local", { failureRedirect: '/login-fail' }), (req, res) => {
  res.status(200).json({ message: "Logged in successfully" });
});

app.get('/login-fail', (req, res) => {
  res.status(401).json({ message: 'Login failed' });
});

app.get('/logout', (req, res) => {
  req.logout((err) => {             // logout existe el passport
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
