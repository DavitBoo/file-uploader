exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {          // al configurar password en el app (index en este caso), puedo usarlo desde el req.
      return next();
    }
    res.status(401).json({ message: "Please log in to upload files" });
  };
