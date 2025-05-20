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
      const safeID = folderName.replace(/\s+/g, "-").toLowerCase();
      folderEl.setAttribute("id", safeID);

      folderEl.querySelector(".folder-option-name").textContent = folderName;

      folderEl.addEventListener("click", () => {
        folderEl.classList.toggle("clicked");
      });

      container.appendChild(folderEl);
    });
  });

  const confirmFileMoveBtn = document.getElementById("move-files-btn");

  confirmFileMoveBtn.addEventListener("click", () => {
    const selectedFolders = Array.from(
      document.querySelectorAll(".folder-option.clicked")
    )
    .filter(el => el.offsetParent !== null)
    .map(el => el.getAttribute("id"))
    .filter(id => !!id); // filter out nulls just in case

    console.log("Selected folders:", selectedFolders);
    const selectedFiles = getSelectedFilesData();
    console.log("Selected files:", selectedFiles);

    selectedFolders.forEach(folderID => {
      const folderName = folderID.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      console.log("Name:", folderName);
      console.log("ID:", folderID);

      const folderTabPane = document.querySelector(`.w-tab-pane[data-w-tab="${folderName}"]`);
      console.log("Folder tab pane:", folderTabPane);
      const tabContainer = folderTabPane?.querySelector(".files-tabs-wrap");
      console.log("tabContainer:", tabContainer);
      const paneContainer = folderTabPane?.querySelector(".file-info-content");
      console.log("paneContainer:", paneContainer);
      const tabTemplate = document.getElementById("folder-file-tab-template");
      const paneTemplate = document.getElementById("folder-file-pane-template");
      if (!tabTemplate || !paneTemplate) {
        console.error("Missing tmemplates");
        return;
      }
        
      selectedFiles.forEach(fileObj => {
        const fileName = typeof fileObj === "string"
        ? fileObj
        : fileObj.fileName;

        if (!fileName) {
          console.warn("Missing file name in entry:", fileObj);
          return;
        }

        const fileData = fileDataMap.get(fileName);
        if (!fileData) {
          console.warn(`No entry in fileDataMap for ${fileName}`);
          return;
        }

        if (tabContainer.querySelector(`.file-tab[data-tab-id="${folderID}-${fileName}"]`)) return;
          
        const tab = tabTemplate.cloneNode(true);
        const pane = paneTemplate.cloneNode(true);
          
        tab.removeAttribute("id");
        tab.style.display = "flex";
        tab.classList.add("file-tab");
        tab.setAttribute("data-tab-id", `${folderID}-${fileName}`);
        tab.setAttribute("id", `${folderID}-${fileName}`);

        const fileTabNameText = tab.querySelector(".file-text.filename");
        if (fileTabNameText) fileTabNameText.textContent = fileName;
        const favIcon = tab.querySelector(".material-symbols-outlined");
        const favState = fileData.fileFav;
        if (favIcon && favState === true) {
          favIcon.classList.add("fav");
        }

        tabContainer.appendChild(tab);

        tab.querySelector(".material-symbols-outlined")?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const fileName = tab.getAttribute("data-tab-id")?.replace(`${folderID}`, "");
          const fileData = fileDataMap.get(fileName);
          if (!fileData) return;

          // Toggle and persist
          fileData.fileFav = !fileData.fileFav;
          fileDataMap.set(fileName, structuredClone(fileData));

          // Update icon state
          const favIcon = e.currentTarget;
          favIcon.classList.toggle("fav", fileData.fileFav);

          initializeFavoritesTab();
          updateAllInstancesOfFile(fileName);
      
          console.log(`⭐ ${fileName} fav set to:`, fileData.fileFav);
        });

        pane.removeAttribute("id");
        pane.style.display = "";
        pane.classList.add("file-info-tab");
        pane.setAttribute("data-tab-id", `${folderID}-${fileName}`);

        const wrap = pane.querySelector(".file-info-wrap");
        if (wrap) wrap.setAttribute("data-file-id", fileName);
        const nameEl = pane.querySelector(".file-text.sidebar.filename");
        if (nameEl) nameEl.textContent = fileName;

        const zHeightEl = pane.querySelector(".file-text.sidebar.zheight");
        if (zHeightEl) zHeightEl.textContent = fileData.zHeight ?? "";

        const weightInput = pane.querySelector("input.filament-weight");

        const tempInput = pane.querySelector("input.filament-weight.temp");

        const notesArea = pane.querySelector("textarea.production-notes");

        if (weightInput) {
          weightInput.setAttribute("value", fileData.filamentWeight);
          console.log(`${weightInput} set to ${fileData.filamentWeight}`);
          weightInput.addEventListener("input", () => {
            const newVal = parseFloat(weightInput.value);
            if (!isNaN(newVal)) {
              fileData.filamentWeight = newVal;
              fileDataMap.set(fileName, structuredClone(fileData));
              console.log(`🔧 ${fileName} filamentWeight updated to ${newVal}`);
            }
            updateAllInstancesOfFile(fileName);
          });
        }

        if (tempInput) {
          tempInput.setAttribute("value", fileData.defaultReleaseTemp);
          console.log(`${tempInput} set to ${fileData.defaultReleaseTemp}`);
          tempInput.addEventListener("input", () => {
            const newVal = parseInt(tempInput.value);
            if (!isNaN(newVal)) {
              fileData.defaultReleaseTemp = newVal;
              fileDataMap.set(fileName, structuredClone(fileData));
              console.log(`🌡️ ${fileName} releaseTemp updated to ${newVal}`);
            }
            updateAllInstancesOfFile(fileName);
          });
        }

        if (notesArea) {
          notesArea.value = fileData.productionNotes;
          console.log(`${notesArea} set to ${fileData.productionNotes}`);
          notesArea.addEventListener("input", () => {
            fileData.productionNotes = notesArea.value;
            fileDataMap.set(fileName, structuredClone(fileData));
            console.log(`📝 ${fileName} notes updated`);
            updateAllInstancesOfFile(fileName);
          });
        }


        const flagCheck = pane.querySelector("input.flag-check");
        if (flagCheck) flagCheck.checked = fileData.fileFlag ?? false;
        if (flagCheck.checked === true) {
          console.log("Flagged function", flagCheck.checked);
          tab.classList.add("flagged");
          console.log(tab.classList);
        }

        paneContainer.appendChild(pane);

        flagCheck.addEventListener("change", () => {
          fileData.fileFlag = flagCheck.checked;
          fileDataMap.set(fileName, structuredClone(fileData));
          console.log(`📌 File '${fileName}' flag updated to:`, fileData.fileFlag);

          const currentTab = tabContainer.querySelector(`.file-tab.div-block-430[data-tab-id="${folderID}-${fileName}"]`);
          console.log(currentTab);
          currentTab.remove();
          console.log("Tab removed");
      
          if (!paneContainer) return;
          const currentPane = paneContainer.querySelector(`.file-info-tab[data-tab-id="${folderID}-${fileName}"]`);
          console.log(currentPane);
          currentPane.remove();
          console.log("Pane removed");

          updateAllInstancesOfFile(fileName);
          console.log("updateAllInstancesOfFile(fileName);");
        });

        const tabPanes = document.querySelectorAll(".file-info-tab");
        tabPanes.forEach(pane => {
          if (pane.classList.contains("w-tab-pane")) {
            // console.log(pane, "- webflow");
            return;
          }
          pane.style.display = "none";
          // console.log(pane, "- hidden");
        });
      });
      initFileCheckboxListeners();
      countFilesInTabs();
    });
    
    const modalBg = document.querySelector(".file-send-modal.folder-move");
    modalBg.style.display = "none";
    const container = document.querySelector(".folder-list-wrap");
    const template = document.getElementById("folder-option-template");

    // Remove all children *except* the template
    Array.from(container.children).forEach(child => {
      if (child !== template) {
        child.remove();
      }
    });

    
    // Deselect all file tabs after sending
    document.querySelectorAll('.file-tab.selected').forEach(tab => {
      console.log(tab);
      tab.classList.remove('selected');
      const checkbox = tab.querySelector(".file-select-box");
      if (checkbox) checkbox.checked = false;
    });

    const selectAllCheckbox = document.querySelector("#select-all");
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
    }

    // Reset selected count display
    const selectedDisplay = document.getElementById("number-selected");
    if (selectedDisplay) {
      selectedDisplay.textContent = "0 Selected";
      selectedDisplay.classList.remove("selected");
    }
  });
});
