const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createFolder = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        userId,
      },
    });
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