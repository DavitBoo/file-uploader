function openShareModal(folderId, folderName) {
  document.getElementById("modalFolderId").value = folderId;
  document.getElementById("modalFolderName").textContent = folderName;
  document.getElementById("shareModal").style.display = "block";
}

function closeShareModal() {
  document.getElementById("shareModal").style.display = "none";
  document.getElementById("shareForm").reset();
  document.getElementById("shareResult").style.display = "none";
}

document.getElementById("shareForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const folderId = document.getElementById("modalFolderId").value;
  const duration = document.getElementById("duration").value;

  try {
    const response = await fetch("/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folderId, duration }),
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById("shareResult").style.display = "block";
      document.getElementById("shareUrl").value = result.shareUrl;
    } else {
      alert("Error sharing folder: " + result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An unexpected error occurred.");
  }
});

function copyToClipboard() {
  const shareUrl = document.getElementById("shareUrl");
  shareUrl.select();
  shareUrl.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(shareUrl.value);
}

/* upload modal */
function openUploadModal(folderId, folderName) {
  const modal = document.getElementById("uploadModal");
  document.getElementById("uploadFolderId").value = folderId;
  document.getElementById("uploadFolderName").innerText = folderName;
  modal.style.display = "block";
}

function closeUploadModal() {
  const modal = document.getElementById("uploadModal");
  modal.style.display = "none";
}

// Cerrar el modal si el usuario hace clic fuera de él
window.onclick = function (event) {
  const modal = document.getElementById("uploadModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function toggleDropdown(element) {
  const dropdown = element.nextElementSibling;
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}

function openRenameModal(folderId, folderName) {
  const modal = document.getElementById("renameModal");
  document.getElementById("renameFolderId").value = folderId;
  document.getElementById("renameFolderName").innerText = folderName;
  modal.style.display = "block";
}

function closeRenameModal() {
  const modal = document.getElementById("renameModal");
  modal.style.display = "none";
}

async function submitRename(event) {
  event.preventDefault();
  const folderId = document.getElementById("renameFolderId").value;
  const newFolderName = document.getElementById("newFolderName").value;

  try {
    const response = await fetch(`/folders/${folderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newFolderName }),
    });

    if (response.ok) {
      location.reload(); // Refresh the page to reflect the new name
    } else {
      const errorData = await response.json();
      alert(`Error renaming folder: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error renaming folder:", error);
  } finally {
    closeRenameModal();
  }
}

// Cerrar modales al hacer clic fuera
window.onclick = function (event) {
  const uploadModal = document.getElementById("uploadModal");
  const renameModal = document.getElementById("renameModal");

  if (event.target == uploadModal) {
    uploadModal.style.display = "none";
  }
  if (event.target == renameModal) {
    renameModal.style.display = "none";
  }
};
