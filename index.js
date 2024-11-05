const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const PrismaSessionStore = require("@quixo3/prisma-session-store").PrismaSessionStore;
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const folderRoutes = require("./routes/folderRoutes");
const mainRoutes = require('./routes/mainRoutes');

const app = express();
const prisma = new PrismaClient();

app.use(express.static(path.join(__dirname, "public")));

// Serve static files (optional, depending on your app's setup)
// app.use(express.stati  c(path.join(__dirname, "views")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// Set up express-session with PrismaSessionStore
app.use(
  session({
    secret: "mi_clave",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
require("./middleware/passportConfig"); // Separate passport configuration for better modularity

// Route Handlers
app.use(mainRoutes);
app.use("/", authRoutes);
app.use("/", fileRoutes);
app.use("/", folderRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
