const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const supabase = require("../supabase");

exports.shareFolder = async (req, res) => {
  const { folderId, duration } = req.body; // Duration in days, e.g., "1d", "10d"
  const userId = req.user.id;

  try {
    // Validate folder ownership
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(folderId), userId },
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found or unauthorized" });
    }

    // Calculate expiration time
    const durationDays = parseInt(duration.replace('d', '')); // Convert "10d" -> 10
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    console.log(expiresAt);

    // Create a share token
    const sharedLink = await prisma.sharedLink.create({
      data: {
        folderId: folder.id,
        expiresAt: expiresAt,
      },
    });

    // Generate shareable link
    const shareUrl = `${req.protocol}://${req.get('host')}/share/${sharedLink.token}`;

    res.status(201).json({ message: "Folder shared successfully", shareUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sharing folder", error: error.message });
  }
};



exports.accessSharedFolder = async (req, res) => {
  const { token } = req.params;

  try {
    // Find the shared link and validate expiration
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token },
      include: { folder: { include: { files: true } } }, // Include folder and files
    });

    console.log(sharedLink);

    if (!sharedLink) {
      return res.status(404).send("Invalid or expired share link.");
    }

    if (new Date() > sharedLink.expiresAt) {
      return res.status(403).send("This share link has expired.");
    }

    // Use Supabase to generate public URLs for all files in the folder
    const filesWithUrls = await Promise.all(
      sharedLink.folder.files.map(async (file) => {
        const { publicURL } = supabase.storage
          .from('file_upload_app')
          .getPublicUrl(`${sharedLink.folderId}/${file.filename}`);
        return { ...file, publicURL };
      })
    );

    // Render a view displaying the files in the shared folder
    res.render("sharedFolderView", { folder: sharedLink.folder, files: filesWithUrls });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error accessing shared folder.");
  }
};
