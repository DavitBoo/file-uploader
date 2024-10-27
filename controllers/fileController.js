const path = require("path");
const fs = require("fs");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.uploadFileToFolder = async(req, res) => {
    const {folderId} = req.body;
    const userId = req.user.id

    try {
        const folder = await prisma.folder.findUnique({
            where: {id: parseInt(folderId), userId},
        });

        if(!folder) {
            return res.status(404).json({ message: "Folder not found or not authorized" });
        }

        const file = await prisma.file.create({
            data: {
              filename: req.file.filename,
              path: req.file.path,
              folderId: folder.id,
            },
          });
          res.status(200).json({ message: "File uploaded successfully", file });    
    } catch (error) {
        res.status(500).json({ message: "Error uploading file", error });
    }
}

exports.uploadForm = (req, res) => {
    res.send(`
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <label for="file">Choose a file to upload:</label>
        <input type="file" name="file" id="file" required>
        <button type="submit">Upload File</button>
      </form>
    `);
  };
  
  exports.uploadFile = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({ message: "File uploaded successfully", file: req.file });
  };
  