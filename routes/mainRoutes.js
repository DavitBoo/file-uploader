const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const userId = req.user ? req.user.id : null; 
  
  try {
    const folders = await prisma.folder.findMany({
      where: { userId },
      include: { files: true }, 
    });

    res.render('main', { folders });
  } catch (error) {
    console.error("Error fetching folders and files:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
