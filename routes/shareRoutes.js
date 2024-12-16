const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");

// Show the share folder form
router.get("/share", (req, res) => {
  res.render("shareFolderForm");
});

// Handle share folder request
router.post("/share", shareController.shareFolder);

// Access a shared folder
router.get("/share/:token", shareController.accessSharedFolder);

module.exports = router;  
