const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const supabase = require("../supabase");

const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads"); // we get the uploads path

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
    const folderPath = path.join(BASE_UPLOAD_PATH, folder.id.toString()); // here I write the new folders route and its name
    fs.mkdirSync(folderPath, { recursive: true }); // recursive allows to create the parent dirctories

    res.redirect("/");
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
exports.updateFolder = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const folder = await prisma.folder.updateMany({
      where: { id: parseInt(id), userId },
      data: { name },
    });

    if (folder.count === 0) {
      return res.status(404).json({ message: "Folder not found or not authorized" });
    }

    res.status(200).json({ message: "Folder updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating folder", error });
  }
};

exports.deleteFolder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // delete files related to the folder
    await prisma.file.deleteMany({
      where: { folderId: parseInt(id) },
    });

    // delete share links related to the folder
    await prisma.sharedLink.deleteMany({
      where: { folderId: parseInt(id) },
    });

    // remove the folder from the data base
    const folder = await prisma.folder.deleteMany({
      where: { id: parseInt(id), userId },
    });

    const { data: filesInFolder, error: listError } = await supabase.storage.from("file_upload_app").list(`${id}/`);

    if (listError) {
      console.error("Error listing files:", listError);
      return;
    }


    // Delete all files in the folder before remove the folder
    const filesToDelete = filesInFolder.map((file) => `${id}/${file.name}`);
    const { error: deleteError } = await supabase.storage.from("file_upload_app").remove(filesToDelete);

    if (deleteError) {
      console.error("Error deleting files:", deleteError);
      return;
    }

    const supabaseResponse = await supabase.storage.from("file_upload_app").remove([`${id}/`]);


    if (supabaseResponse.error) {
      console.error("Error deleting folder in Supabase:", supabaseResponse.error.message);
      return res.status(500).json({ message: "Error deleting folder in Supabase", error: supabaseResponse.error });
    }

    if (folder.count === 0) {
      return res.status(404).json({ message: "Folder not found or not authorized" });
    }

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting folder", error });
  }
};

// Ruta para ver los archivos dentro de una carpeta específica
exports.filesInside = async (req, res) => {
  const { folderId } = req.params;
  const userId = req.user.id; // Obtén el ID del usuario autenticado

  try {
    // Obtiene la carpeta específica con sus archivos
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(folderId), userId },
      include: {
        files: true, // Incluye los archivos asociados a la carpeta
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found or not authorized");
    }

    // Renderiza la vista y pasa la carpeta y los archivos
    res.render("folderView", { folder });
  } catch (error) {
    res.status(500).send("Error retrieving folder files");
  }
};
