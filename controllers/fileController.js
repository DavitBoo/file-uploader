  const path = require("path");
  const fs = require("fs");

  const supabase = require("../supabase");

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads"); // we get the uploads path

  // Without supabase. Using localhost
  // exports.uploadFileToFolder = async (req, res) => {

  //   const { folderId } = req.body;
  //   const userId = req.user.id;

  //   try {
  //     const folder = await prisma.folder.findUnique({
  //       where: { id: parseInt(folderId), userId },
  //     });

  //     if (!folder) {
  //       return res.status(404).json({ message: "Folder not found or not authorized" });
  //     }

  //     const folderPath = path.join(BASE_UPLOAD_PATH, folderId.toString());

  //     // Ensure the file is saved in the correct folder
  //     const newFilePath = path.join(folderPath, req.file.filename);
  //     fs.renameSync(req.file.path, newFilePath);

  //     // Create a file entry in the database
  //     const file = await prisma.file.create({
  //       data: {
  //         filename: req.file.filename,
  //         path: newFilePath,
  //         folderId: folder.id,
  //       },
  //     });

  //     res.redirect('/');
  //   } catch (error) {
  //     res.status(500).json({ message: "Error uploading file", error });
  //   }
  // };

  exports.uploadFileToFolder = async (req, res) => {
    const { folderId } = req.body;
    const userId = req.user.id;
    const file = req.file;

    try {
      const folder = await prisma.folder.findUnique({
        where: { id: parseInt(folderId), userId },
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found or not authorized" });
      }

      const { data, error } = await supabase.storage
        .from("file_upload_app") // The name of your storage bucket
        .upload(`${folderId}/${file.originalname}`, file.buffer, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.log(error);
        throw new Error("File upload to Supabase failed");
      }

      console.log(`${folderId}/${file.originalname}`);

      // Generate the public URL for the file
      // const { publicURL, error: publicURLError } = supabase
      // .storage
      // .from('file_upload_app')
      // .getPublicUrl(`${folderId}/${file.originalname}`);
      const publicURL = `https://xsxdgtteyslgqtctyuqj.supabase.co/storage/v1/object/public/file_upload_app/${folderId}/${file.originalname}`

      // if (publicURLError) {
      //   throw new Error('Failed to retrieve public URL for the file');
      // }

    const savedFile = await prisma.file.create({
      data: {
        filename: file.originalname,
        url: publicURL,
        folderId: folder.id
      }
    })

    console.log(savedFile);

    res.status(200).render('uploadSuccess', { 
      file: savedFile, 
      folderId 
    });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
  };

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
