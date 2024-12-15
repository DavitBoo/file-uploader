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
    alert("Copied to clipboard!");
}
