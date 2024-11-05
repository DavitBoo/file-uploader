const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

const fileController = require("../controllers/fileController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");

router.get("/upload-form", isAuthenticated, fileController.uploadForm);
router.post("/upload", isAuthenticated, upload.single("file"), fileController.uploadFile);

router.get("/files/:id", async (req, res) => {
  const fileId = parseInt(req.params.id);
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const stats = fs.statSync(file.path);
    const fileSizeInKB = stats.size / 1024;

    res.render("fileDetails", {
      file,
      fileSizeInKB,
    });
  } catch (error) {
    console.error("Error fetching file details:", error);
    res.status(500).send("Internal server error");
  }
});


router.get('/download/:id', async (req, res) => {
  const fileId = parseInt(req.params.id);
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send('File not found');
    }

    res.download(file.path, file.filename, (err) => {
      if (err) {
        console.error('Error during file download:', err);
      }
    });
  } catch (error) {
    console.error('Error handling file download:', error);
    res.status(500).send('Internal server error');
  }
})  

module.exports = router;
