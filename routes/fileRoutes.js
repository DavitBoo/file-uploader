const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");

router.get("/upload-form", isAuthenticated, fileController.uploadForm);
router.post("/upload", isAuthenticated, upload.single("file"), fileController.uploadFile);

module.exports = router;
