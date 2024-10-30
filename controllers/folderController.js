const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads");  // we get the uploads path

// checks if it exists
if (!fs.existsSync(BASE_UPLOAD_PATH)) {
  fs.mkdirSync(BASE_UPLOAD_PATH);
}

// Inside it creates a new folder (both in DB and in the filesystem)
exports.createFolder = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
     // Create folder in the database 
    const folder = await prisma.folder.create({
      data: {
        name,
        userId,
      },
    });

    // Create corresponding folder in the filesystem
    const folderPath = path.join(BASE_UPLOAD_PATH, folder.id.toString());   // here I write the new folders route and its name
    fs.mkdirSync(folderPath, { recursive: true });  // recursive allows to create the parent dirctories

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Error creating folder", error });
  }
};

exports.getFolders = async (req, res) => {
  const userId = req.user.id;

  try {
    const folders = await prisma.folder.findMany({
      where: { userId },
      include: { files: true },
    });
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching folders", error });
  }
};


// updates folder's name
exports.updateFolder = async(req, res) => {
    const {id} = req.params;
    const {name} = req.body;
    const userId = req.user.id;

    try {
        const folder = await prisma.folder.updateMany({
            where: {id: parseInt(id), userId},
            data: {name},
        })

        if(folder.count === 0){
            return res.status(404).json({ message: "Folder not found or not authorized" });
        }

        res.status(200).json({ message: "Folder updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating folder", error });
    }

}


exports.deleteFolder = async(req, res) => {
    const {id}  = req.params;
    const userId = req.user.id;

    try {
        const folder = await prisma.folder.deleteMany({
            where: {id: parseInt(id), userId}
        })

        if( folder.count === 0) {
            return res.status(404).json({ message: "Folder not found or not authorized" });
        }
        res.status(200).json({ message: "Folder deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting folder", error });
    }
}