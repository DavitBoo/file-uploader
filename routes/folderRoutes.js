const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");
const fileController = require("../controllers/fileController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");

router.post("/folders", isAuthenticated, folderController.createFolder);
router.get("/folders", isAuthenticated, folderController.getFolders);
router.put("/folders/:id", isAuthenticated, folderController.updateFolder);
router.delete("/folders/:id", isAuthenticated, folderController.deleteFolder);

router.get('/folders/:folderId', isAuthenticated, folderController.filesInside);

// router.post("/folders/:id/upload", isAuthenticated, upload.single("file"), fileController.uploadFileToFolder);
router.post('/folders/:folderId/upload', isAuthenticated, upload.single('file'), fileController.uploadFileToFolder);

module.exports = router;