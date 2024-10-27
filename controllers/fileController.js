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
  