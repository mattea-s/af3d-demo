document.addEventListener("DOMContentLoaded", function () {
  const moveBtn = document.querySelector(".demo-button.grey.folder");

  moveBtn.addEventListener("click", () => {
    const selectedFiles = getSelectedFilesData();
    const moveFilesModal = document.getElementById("move-files-modal");
    const moveFilesFolders = Array.from(document.querySelectorAll(".file-folder")).filter(el => {
  return el.offsetParent !== null;
});
    const container = moveFilesModal.querySelector(".folder-list-wrap");

    moveFilesModal.style.display = "flex";
    
    moveFilesFolders.forEach(folder => {
      const folderName = folder.querySelector(".folder-title").textContent;
      console.log(folderName);

      const folderElTemplate = document.getElementById("folder-option-template");
      console.log(folderElTemplate);
      const folderEl = folderElTemplate.cloneNode(true);

      folderEl.style.display = "flex";
      folderEl.removeAttribute("id");
      folderEl.setAttribute("id", folderName); // ⚠️ still risky, consider sanitizing

      folderEl.querySelector(".folder-option-name").textContent = folderName;

      folderEl.addEventListener("click", () => {
        folderEl.classList.toggle("clicked");
      });

      container.appendChild(folderEl);
    });
  });
});
