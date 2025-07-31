
  // Hash-based tab nav src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/working-code.js"
$(document).on('click', '.tag-modal-background.w-inline-block', function() {
  console.log("Tag Modal Clicked");
  $(this).hide(); // Hides only the clicked background
  $('.add-tag-modal').hide(); // Hide associated modal
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded");
  initializeFileRepo();
  initializeFileData(10);
  initializeFavoritesTab();
  initializeFlaggedTab();
  initializePrinterData();
  initPrinterTagListeners();

  function updateCurrentClasses() {
    console.log("updateCurrentClasses");
    document.querySelectorAll(".job-state-tab.w-tab-link").forEach(tab => {
      const textBlock = tab.querySelector(".text-block-170");
      if (textBlock) {
        if (tab.classList.contains("w--current")) {
          textBlock.classList.add("current");
        } else {
          textBlock.classList.remove("current");
        }
      }
    });
  }


  updateCurrentClasses();


  const observer = new MutationObserver(updateCurrentClasses);
  document.querySelectorAll(".job-state-tab.w-tab-link").forEach(tab => {
    observer.observe(tab, { attributes: true, attributeFilter: ["class"] });
  });


  document.querySelectorAll(".job-state-tab.w-tab-link").forEach(tab => {
    tab.addEventListener("click", () => {
      setTimeout(updateCurrentClasses, 50);
    });
  });

    const selectedPrinters = new Map();

  const printerOptions = document.querySelectorAll(".printer-option");
  printerOptions.forEach(printerEl => {
    const modelNameEl = printerEl.querySelector(".printer-model-name");
    const printerModelName = modelNameEl?.textContent.trim();
    if (!printerModelName) return;

    // Quantity Buttons (+/-)
    printerEl.querySelectorAll(".add-printer-qty").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // ✅ Prevent selection toggle on qty change

        const isPlus = btn.classList.contains("add");
        const isMinus = btn.classList.contains("minus");
        const numberEl = printerEl.querySelector(".add-printer-qty-number");
        let currentQty = parseInt(numberEl.textContent.trim(), 10) || 1;

        if (isPlus) currentQty++;
        if (isMinus && currentQty > 1) currentQty--;

        numberEl.textContent = currentQty;

        // Update map if already selected
        if (printerEl.classList.contains("selected")) {
          selectedPrinters.set(printerModelName, {
            name: printerModelName,
            quantity: currentQty
          });
        }
      });
    });

    // Selection toggle
    printerEl.addEventListener("click", () => {
      const isSelected = printerEl.classList.contains("selected");
      const qtyEl = printerEl.querySelector(".add-printer-qty-number");
      const qty = parseInt(qtyEl?.textContent.trim(), 10) || 1;

      if (!isSelected) {
        printerEl.classList.add("selected");
        printerEl.querySelector(".printer-add-qty")?.classList.add("selected");
        selectedPrinters.set(printerModelName, { name: printerModelName, quantity: qty });
      } else {
        printerEl.classList.remove("selected");
        printerEl.querySelector(".printer-add-qty")?.classList.remove("selected");
        selectedPrinters.delete(printerModelName);
      }

      const addButton = document.querySelector(".add-new-printers-button");
      if (addButton) {
        addButton.classList.toggle("active", selectedPrinters.size > 0);
      }
    });
  });

  const addButton = document.querySelector(".add-new-printers-button");
  if (addButton) {
    addButton.addEventListener("click", () => {
      const printersToAdd = Array.from(selectedPrinters.values());
      if (printersToAdd.length === 0) return;

      addNewPrinters(printersToAdd);

      document.querySelectorAll(".printer-option.selected").forEach(el => {
        el.classList.remove("selected");
        el.querySelector(".printer-add-qty")?.classList.remove("selected");
      });
      selectedPrinters.clear();
      addButton.classList.remove("active");
    });
  }

  function addNewPrinters(printers) {
    console.log("addNewPrinters");
    const container = document.querySelector(".demo-printer-card-area");
    const template = document.getElementById("printer-template");
    if (!container || !template) return;

    const modelCount = {};
    document.querySelectorAll(".demo-printer-card").forEach(card => {
      const fullName = card.querySelector(".demo-printer-name")?.textContent.trim();
      if (fullName) {
        const baseModel = fullName.split(" - ")[0].trim();
        modelCount[baseModel] = (modelCount[baseModel] || 0) + 1;
      }
    });

    printers.forEach(printer => {
      const baseModelName = printer.name;
      const startingCount = modelCount[baseModelName] || 0;
      const quantity = printer.quantity || 1;

      for (let i = 0; i < quantity; i++) {
        const modelNumber = startingCount + i + 1;
        const fullPrinterName = `${baseModelName} - ${modelNumber}`;

        const clone = template.cloneNode(true);
        clone.removeAttribute("id");
        clone.style.display = "flex";
        clone.setAttribute("data-printer-name", fullPrinterName);

        const fullNameEl = clone.querySelector(".demo-printer-name");
        if (fullNameEl) fullNameEl.textContent = fullPrinterName;

        // ✅ Add .demo-tag.printer
        const tagContainer = clone.querySelector(".default-file-tags");
        if (tagContainer) {
          const tagDiv = document.createElement("div");
          tagDiv.className = "demo-tag printer";
          tagDiv.style.display = "flex";

          const inner = document.createElement("div");
          inner.className = "demo-tag-text printer";
          inner.textContent = baseModelName;

          tagDiv.appendChild(inner);
          tagContainer.appendChild(tagDiv);
        }

        container.appendChild(clone);

        if (!printerDataMap.has(fullPrinterName)) {
          printerDataMap.set(fullPrinterName, {
            printerName: fullPrinterName,
            printerModel: baseModelName,
            printerTags: [baseModelName],
            printerTagsNum: 0,
            filamentRemaining: 1000,
            currentJob: null,
            compatibleJobs: [],
            printerStatus: "idle"
          });
        }

        initFilamentPopup(clone);

        modelCount[baseModelName] = modelNumber;
      }
    });

    initPrinterTagListeners();
    updateAllJobMatches();
  }

function initFilamentPopup(card) {
  const printerName = card.querySelector(".demo-printer-name")?.textContent.trim();
  if (!printerName || printerName === "Printer Name") {
    console.warn("Skipping invalid printer card during filament init.");
    return;
  }

  const printerData = printerDataMap.get(printerName);
  if (!printerData) {
    console.warn(`No printerData found for ${printerName}`);
    return;
  }

  console.log(`🧵 Initializing filament popup for printer: ${printerName}`);

  const filamentSpool = card.querySelector(".filament-icon.fill:not(.in-popup)");
  const filamentLeftOnSpool = (printerData.filamentRemaining * 360) / 1000;
  console.log("Filament remaining:",printerData.filamentRemaining, "Filament left on spool:", filamentLeftOnSpool);
  const filamentSpoolDeg = 360 - filamentLeftOnSpool;
  filamentSpool.style.background = `conic-gradient(black ${filamentSpoolDeg}deg,white ${filamentSpoolDeg}deg)`;

  const filamentMenuOpen = card.querySelector(".demo-printer-filament");
  const filamentModal = filamentMenuOpen.querySelector(".printer-filament-popup");

  if (!filamentModal) {
    console.warn(`Filament modal missing for ${printerName}`);
    return;
  }

  const modalSpool = filamentModal.querySelector(".filament-icon.fill.in-popup");
  modalSpool.style.background = `conic-gradient(black ${filamentSpoolDeg}deg,#60a5fa ${filamentSpoolDeg}deg)`;

  const modalFilamentLevel = filamentModal.querySelector(".filament-input-printer");
  modalFilamentLevel.value = `${printerData.filamentRemaining}g`;
  modalFilamentLevel.setAttribute("tabindex", "0");
  modalFilamentLevel.disabled = true;

  const filamentRemainingText = card.querySelector(".demo-filament-remaining");
  console.log(filamentRemainingText, filamentRemainingText.textContent);
  filamentRemainingText.textContent = `${printerData.filamentRemaining}g Remaining`;
  console.log(filamentRemainingText, filamentRemainingText.textContent);

  if (!filamentModal.dataset.listenerAttached) {
    document.addEventListener("mousedown", (e) => {
      if (filamentModal.style.display !== "block") return;

      const isInside = filamentModal.contains(e.target);
      const isTrigger = filamentMenuOpen.contains(e.target);
      if (!isInside && !isTrigger) {
        console.log(`📦 Closing filament modal for ${printerName}`);
        filamentModal.style.display = "none";
        filamentModal.querySelectorAll(".add-filament-demo.clicked").forEach(btn => btn.classList.remove("clicked"));
        filamentModal.querySelector(".filament-save-changes:not(.cannot)").style.display = "none";
        filamentModal.querySelector(".filament-save-changes.cannot").style.display = "none";
      }
    });
    filamentModal.dataset.listenerAttached = "true";
  }

  filamentMenuOpen.addEventListener("click", () => {
    console.log(`📤 Opening filament modal for ${printerName}`);
    filamentModal.style.display = "block";
  });

  const add75Btn = filamentModal.querySelector(".add-filament-demo.add-75");
  const add1Btn = filamentModal.querySelector(".add-filament-demo.add-1");
  const add5Btn = filamentModal.querySelector(".add-filament-demo.add-5");
  const addCustomBtn = filamentModal.querySelector(".add-filament-demo.add-custom");
  const filamentSave = filamentModal.querySelector(".filament-save-changes:not(.cannot)");

  function handleAmountClick(btn, value) {
    [add75Btn, add1Btn, add5Btn, addCustomBtn].forEach(b => b.classList.remove("clicked"));
    btn.classList.add("clicked");
    modalFilamentLevel.value = value;
    modalFilamentLevel.disabled = true;
    filamentSave.style.display = "flex";
    console.log(`🎚️ Set filament to ${value} for ${printerName}`);
  }

  add75Btn.addEventListener("click", () => handleAmountClick(add75Btn, "750g"));
  add1Btn.addEventListener("click", () => handleAmountClick(add1Btn, "1000g"));
  add5Btn.addEventListener("click", () => handleAmountClick(add5Btn, "5000g"));

  addCustomBtn.addEventListener("click", () => {
    modalFilamentLevel.disabled = false;
    [add75Btn, add1Btn, add5Btn].forEach(b => b.classList.remove("clicked"));
    addCustomBtn.classList.add("clicked");
    modalFilamentLevel.focus();
    filamentSave.style.display = "flex";
    console.log(`✏️ Custom input enabled for ${printerName}`);
  });

  filamentSave.addEventListener("click", () => {
    const newVal = modalFilamentLevel.value.replace(/g$/, '');
    const newRemaining = parseInt(newVal);
    if (isNaN(newRemaining)) {
      console.warn(`🚫 Invalid filament value for ${printerName}: ${modalFilamentLevel.value}`);
      return;
    }

    const prevRemaining = printerData.filamentRemaining;
    printerData.filamentRemaining = newRemaining;
    printerDataMap.set(printerName, printerData);

    const newDeg = 360 - (newRemaining * 360) / 1000;
    filamentSpool.style.background = `conic-gradient(black ${newDeg}deg,white ${newDeg}deg)`;
    modalSpool.style.background = `conic-gradient(black ${newDeg}deg,#60a5fa ${newDeg}deg)`;

    filamentRemainingText.textContent = `${newRemaining}g Remaining`;
    console.log(filamentRemainingText, filamentRemainingText.textContent);

    filamentSave.style.display = "none";
    modalFilamentLevel.value = `${newRemaining}g`;
    modalFilamentLevel.disabled = true;
    setTimeout(() => {
      filamentModal.style.display = "none";
    }, 0);

    console.log(`💾 Saved filament value for ${printerName}: ${prevRemaining}g ➜ ${newRemaining}g`);

    if (newRemaining <= 20) {
      setPrinterToError(card);
      console.log(`⚠️ Low filament for ${printerName}, status set to error`);
    } else if (prevRemaining <= 20 && newRemaining > 20) {
      setPrinterToIdle(card);
      findAndAssignNextJob(card);
      console.log(`🔁 Printer ${printerName} back to idle, job reassignment triggered`);
    }
  });
}

    document.querySelectorAll(".q-modal-exit-btn, .cancel-queue").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      clearSendModal();
    });
  });

    const addFolderBtn = document.querySelector(".add-folder-button");

  addFolderBtn.addEventListener("click", () => {
    const folderTabTemplate = document.getElementById("file-folder-tab-template");
    const folderPaneTemplate = document.getElementById("file-folder-pane-template");
    const folderTabWrap = document.querySelector(".tabs-menu-7");
    const folderPaneWrap = document.querySelector(".tabs-content-6");
    
    const folderTotal = folderTabWrap.children.length;
    const folderNumber = folderTotal - 4;

    const folderNameDefault = "New Folder " + folderNumber;

    const cloneTab = folderTabTemplate.cloneNode(true);
    const clonePane = folderPaneTemplate.cloneNode(true);

    cloneTab.removeAttribute("id");
    cloneTab.setAttribute("data-w-tab", folderNameDefault);
    clonePane.removeAttribute("id");
    clonePane.setAttribute("data-w-tab", folderNameDefault);

    cloneTab.style.display = "flex";

    const folderNameEdit = cloneTab.querySelector(".folder-name-edit");
    const folderName = cloneTab.querySelector(".folder-title");
    
    folderNameEdit.setAttribute("value", folderNameDefault);
    
    requestAnimationFrame(() => {
      folderNameEdit.focus();
      folderNameEdit.select();
    });
    
    
    const folderNameEditWrap = cloneTab.querySelector(".folder-name-edit-wrap");
    
    folderNameEdit.addEventListener('keydown', (e) => { 
      if (e.key === 'Enter') {
        folderName.textContent = folderNameEdit.value;
        cloneTab.setAttribute("data-w-tab", folderNameEdit.value);
        clonePane.setAttribute("data-w-tab", folderNameEdit.value);
        folderNameEditWrap.classList.add("hide");
        folderName.classList.remove("hide");
      } 
    });
    
    folderNameEdit.addEventListener('blur', (e) => { 
        folderName.textContent = folderNameEdit.value;
        cloneTab.setAttribute("data-w-tab", folderNameEdit.value);
        clonePane.setAttribute("data-w-tab", folderNameEdit.value);
        folderNameEditWrap.classList.add("hide");
        folderName.classList.remove("hide");
    });
    
    const folderDots = cloneTab.querySelector(".folder-number.dots");
    const dotsMenu = cloneTab.querySelector(".dots-menu-wrap");
    
    folderDots.addEventListener('click', (e) => {    
      dotsMenu.style.display = "block";
      
      dotsMenu.setAttribute("tabindex", "-1");
      dotsMenu.focus();
      
      dotsMenu.addEventListener('blur', (e) => {
        dotsMenu.style.display = "none";
      });
    });
    
    const editFolderBtn = dotsMenu.querySelector(".edit-folder:not(.delete)");
    const deleteFolderBtn = dotsMenu.querySelector(".edit-folder.delete:not(.confirm)");
    
    editFolderBtn.addEventListener('click', (e) => {
      folderNameEditWrap.classList.remove("hide");
      folderName.classList.add("hide");
      dotsMenu.style.display = "none";
      
      requestAnimationFrame(() => {
        folderNameEdit.focus();
        folderNameEdit.select();
      }); 
      
      folderNameEdit.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') {
          folderName.textContent = folderNameEdit.value;
          cloneTab.setAttribute("data-w-tab", folderNameEdit.value);
          clonePane.setAttribute("data-w-tab", folderNameEdit.value);
          folderNameEditWrap.classList.add("hide");
          folderName.classList.remove("hide");
        } 
      });
    
      folderNameEdit.addEventListener('blur', (e) => { 
        folderName.textContent = folderNameEdit.value;
        cloneTab.setAttribute("data-w-tab", folderNameEdit.value);
        clonePane.setAttribute("data-w-tab", folderNameEdit.value);
        folderNameEditWrap.classList.add("hide");
        folderName.classList.remove("hide");
      });
    });
    
    deleteFolderBtn.addEventListener('click', (e) => {
      dotsMenu.style.display = "none";
      
      const confirmDelete = cloneTab.querySelector(".confirm-folder-delete");
      const confirmDeleteBtn = confirmDelete.querySelector(".edit-folder.delete.confirm");
      
      confirmDelete.style.display = "block";
      confirmDeleteBtn.addEventListener('click', (e) => {
        cloneTab.remove();
        clonePane.remove();
        
        setTimeout(() => {
          switchToTab("All");
        }, "100");
        
        setTimeout(() => {  
          if (window.Webflow && Webflow.require) {
            const tabs = Webflow.require('tabs');
            if (tabs && typeof tabs.ready === 'function') {
              tabs.ready();
            }
          }
        }, "200");
      });
    });
    
    const clonePaneContentWrap = clonePane.querySelector(".files-tabs-wrap");

    folderTabWrap.appendChild(cloneTab);
    folderPaneWrap.appendChild(clonePane);
    
      if (window.Webflow && Webflow.require) {
    const tabs = Webflow.require('tabs');
    if (tabs && typeof tabs.ready === 'function') {
      tabs.ready();
    }
  }
  });

    const moveBtn = document.querySelector(".demo-button.grey.folder");

  moveBtn.addEventListener("click", () => {
    const selectedFiles = getSelectedFilesData();
    const moveFilesModal = document.getElementById("move-files-modal");
    const moveFilesFolders = Array.from(document.querySelectorAll(".file-folder.custom")).filter(el => {
      return el.offsetParent !== null;
    });
    const container = moveFilesModal.querySelector(".folder-list-wrap");
    const moveFileBg = moveFilesModal.querySelector(".file-send.save-changes.move-files");

    moveFilesModal.style.display = "flex";

    moveFilesModal.addEventListener("click", (e) => {
      if (e.target === moveFilesModal) {
        moveFilesModal.style.display = "none";

        const container = moveFilesModal.querySelector(".folder-list-wrap");
        const template = document.getElementById("folder-option-template");

        // Remove all children *except* the template
        Array.from(container.children).forEach(child => {
          if (child !== template) {
            child.remove();
          }
        });
      }
    });
    
    moveFilesFolders.forEach(folder => {
      const folderName = folder.querySelector(".folder-title").textContent;
      const folderElTemplate = document.getElementById("folder-option-template");
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

    const selectedFiles = getSelectedFilesData();

    selectedFolders.forEach(folderID => {
      const folderName = folderID.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

      const folderTabPane = Array.from(document.querySelectorAll(".w-tab-pane[data-w-tab]"))
  .find(el => el.getAttribute("data-w-tab")?.toLowerCase() === folderName.toLowerCase());
      const tabContainer = folderTabPane?.querySelector(".files-tabs-wrap");
      const paneContainer = folderTabPane?.querySelector(".file-info-content");
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

        if (tabContainer.querySelector(`.file-tab[data-tab-id="${fileName}"]`)) return;
          
        const tab = tabTemplate.cloneNode(true);
        const pane = paneTemplate.cloneNode(true);
          
        tab.removeAttribute("id");
        tab.style.display = "flex";
        tab.classList.add("file-tab");
        tab.setAttribute("data-tab-id", `${fileName}`);
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
          const rawID = tab.getAttribute("data-tab-id");
          const fileName = rawID?.replace(`${folderID}-`, "").trim();
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
        });

        pane.removeAttribute("id");
        pane.style.display = "";
        pane.classList.add("file-info-tab");
        pane.setAttribute("data-tab-id", `${fileName}`);

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
          weightInput.addEventListener("input", () => {
            const newVal = parseFloat(weightInput.value);
            if (!isNaN(newVal)) {
              fileData.filamentWeight = newVal;
              fileDataMap.set(fileName, structuredClone(fileData));
            }
            updateAllInstancesOfFile(fileName);
          });
        }

        if (tempInput) {
          tempInput.setAttribute("value", fileData.defaultReleaseTemp);
          tempInput.addEventListener("input", () => {
            const newVal = parseInt(tempInput.value);
            if (!isNaN(newVal)) {
              fileData.defaultReleaseTemp = newVal;
              fileDataMap.set(fileName, structuredClone(fileData));
            }
            updateAllInstancesOfFile(fileName);
          });
        }

        if (notesArea) {
          notesArea.value = fileData.productionNotes;
          notesArea.addEventListener("input", () => {
            fileData.productionNotes = notesArea.value;
            fileDataMap.set(fileName, structuredClone(fileData));
            updateAllInstancesOfFile(fileName);
          });
        }


        const flagCheck = pane.querySelector("input.flag-check");
        if (flagCheck) flagCheck.checked = fileData.fileFlag ?? false;
        if (flagCheck.checked === true) {
          tab.classList.add("flagged");
        }

        paneContainer.appendChild(pane);

        flagCheck.addEventListener("change", () => {
          console.log("File flag checked");
          const fileData = fileDataMap.get(fileName);
          setTimeout(() => {
          fileData.fileFlag = flagCheck.checked;
          fileDataMap.set(fileName, structuredClone(fileData));

          initializeFlaggedTab();
          updateAllInstancesOfFile(fileName);
          }, "1000");
        });

      const tagWrap = pane.querySelector(".default-file-tags");
      if (tagWrap) {
        updateDefaultTagsUI(tagWrap, fileData.defaultTags || []);
      }

      updateAllInstancesOfFile(fileName);
      initFileTagListeners();
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
      tab.classList.remove('selected');
      const checkbox = tab.querySelector(".file-select-box");
      if (checkbox) checkbox.checked = false;
    });
    // Deselect all file tabs after sending
    document.querySelectorAll('.file-tab.selected').forEach(tab => {
      tab.classList.remove('selected');
      const checkbox = tab.querySelector(".file-select-box");
      if (checkbox) checkbox.checked = false;
    });

    // ⛔️ Prevent stale selections from persisting
    fileSelectionOrder = [];

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
    updateSelectedCount();
  });
});

    const customFolders = document.querySelectorAll(".file-folder.custom");

  customFolders.forEach(folder => {
    const folderNameEdit = folder.querySelector(".folder-name-edit");
    const folderName = folder.querySelector(".folder-title");
    const folderId = folder.getAttribute("data-w-tab");
    const folderPane = document.querySelector(`.files-tab-pane.w-tab-pane[data-w-tab="${folderId}"]`);
    
    folderNameEdit.setAttribute("value", folderName.textContent);
    
    const folderNameEditWrap = folder.querySelector(".folder-name-edit-wrap");
    
    folderNameEdit.addEventListener('keydown', (e) => { 
      if (e.key === 'Enter') {
        folderName.textContent = folderNameEdit.value;
        folder.setAttribute("data-w-tab", folderNameEdit.value);
        folderPane.setAttribute("data-w-tab", folderNameEdit.value);
        folderNameEditWrap.classList.add("hide");
        folderName.classList.remove("hide");
      } 
    });
    
    folderNameEdit.addEventListener('blur', (e) => { 
        folderName.textContent = folderNameEdit.value;
        folder.setAttribute("data-w-tab", folderNameEdit.value);
        folderPane.setAttribute("data-w-tab", folderNameEdit.value);
        folderNameEditWrap.classList.add("hide");
        folderName.classList.remove("hide");
    });
    
    const folderDots = folder.querySelector(".folder-number.dots");
    const dotsMenu = folder.querySelector(".dots-menu-wrap");
    
    folderDots.addEventListener('click', (e) => {    
      dotsMenu.style.display = "block";
      
      dotsMenu.setAttribute("tabindex", "-1");
      dotsMenu.focus();
      
      dotsMenu.addEventListener('blur', (e) => {
        dotsMenu.style.display = "none";
      });
    });
    
    const editFolderBtn = dotsMenu.querySelector(".edit-folder:not(.delete)");
    const deleteFolderBtn = dotsMenu.querySelector(".edit-folder.delete:not(.confirm)");
    
    editFolderBtn.addEventListener('click', (e) => {
      folderNameEditWrap.classList.remove("hide");
      folderName.classList.add("hide");
      dotsMenu.style.display = "none";
      
      requestAnimationFrame(() => {
        folderNameEdit.focus();
        folderNameEdit.select();
      }); 
      
      folderNameEdit.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') {
          folderName.textContent = folderNameEdit.value;
          folder.setAttribute("data-w-tab", folderNameEdit.value);
          folderPane.setAttribute("data-w-tab", folderNameEdit.value);
          folderNameEditWrap.classList.add("hide");
          folderName.classList.remove("hide");
        } 
      });
    
      folderNameEdit.addEventListener('blur', (e) => { 
        folderName.textContent = folderNameEdit.value;
        folder.setAttribute("data-w-tab", folderNameEdit.value);
        folderPane.setAttribute("data-w-tab", folderNameEdit.value);
        folderNameEditWrap.classList.add("hide");
        folderName.classList.remove("hide");
      });
    });
    
    deleteFolderBtn.addEventListener('click', (e) => {
      dotsMenu.style.display = "none";
      
      const confirmDelete = folder.querySelector(".confirm-folder-delete");
      const confirmDeleteBtn = confirmDelete.querySelector(".edit-folder.delete.confirm");
      
      confirmDelete.style.display = "block";
      
      confirmDelete.setAttribute("tabindex", "-1");
      confirmDelete.focus();
      
      confirmDelete.addEventListener('blur', (e) => {
        confirmDelete.style.display = "none";
      });
      
      confirmDeleteBtn.addEventListener('click', (e) => {
        folder.remove();
        folderPane.remove();
        
        setTimeout(() => {
          switchToTab("All");
        }, "100");
        
        setTimeout(() => {  
          if (window.Webflow && Webflow.require) {
            const tabs = Webflow.require('tabs');
            if (tabs && typeof tabs.ready === 'function') {
              tabs.ready();
            }
          }
        }, "200");
      });
    });
  });

    const deleteFileBtn = document.querySelector(".demo-button.delete");

  deleteFileBtn.addEventListener("click", () => {
    const selectedFiles = getSelectedFilesData();
    const delFilesModal = document.getElementById("delete-files-modal");
    // const delFilesFolder = selectedFiles.closest(".files-tab-pane");
    const containerEl = document.querySelector(".files-tab-pane.w-tab-pane.w--tab-active");
    const container = containerEl.getAttribute("data-w-tab");

    delFilesModal.style.display = "flex";

    delFilesModal.addEventListener("click", () => {
      delFilesModal.style.display = "none";
    });

    const selectedFilesNum = selectedFiles.length;

    const fileDelNum1 = document.getElementById("file-del-num-1");
    const fileDelNum2 = document.getElementById("file-del-num-2");
    const fileDelFolder = document.getElementById("file-del-fol");

    fileDelNum1.textContent = selectedFilesNum;
    fileDelNum2.textContent = selectedFilesNum;
    fileDelFolder.textContent = container;

    const confirmDeleteBtn = document.getElementById("delete-files-btn");

    confirmDeleteBtn.addEventListener("click", () => {
      selectedFiles.forEach(file => {
        const fileEls = document.querySelectorAll(`.file-tab.div-block-430.w-inline-block[data-tab-id="${file.fileName}"]`);

        fileEls.forEach(fileEl => {
          const fileSel = fileEl.querySelector(".file-select-box");

          if (!fileSel.checked) return;

          const fileFolder = fileEl.closest(".files-tab-pane");
          const fileTab = fileFolder.querySelector(`.file-info-tab[data-tab-id="${file.fileName}"]`);
        
          fileTab.remove();
          fileEl.remove();
        });
      });
      delFilesModal.style.display = "none";
          // Deselect all file tabs after sending
    document.querySelectorAll('.file-tab.selected').forEach(tab => {
      tab.classList.remove('selected');
      const checkbox = tab.querySelector(".file-select-box");
      if (checkbox) checkbox.checked = false;
    });

    // ⛔️ Prevent stale selections from persisting
    fileSelectionOrder = [];

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
      updateSelectedCount();
    });
  });
});


// Handles hash-based tab navigation
$(function() {
  function changeTab() {
    var tabName = window.location.hash.substr(1);
    var tabEl = $('[data-w-tab="' + tabName + '"]');
    if (tabEl.length) {
      tabEl.click();
    }
  }


  if (window.location.hash) {
    changeTab();
  }


  $(window).on('hashchange', changeTab);


  $('[data-w-tab]').on('click', function(){
    history.pushState({}, '', '#' + $(this).data("w-tab"));
  });
});

// Handles file selection and 'select all'
function initFileCheckboxListeners() {
  console.log("initFileCheckboxListeners");
  const checkboxes = document.querySelectorAll(".file-select-box");
  const selectedDisplay = document.getElementById("number-selected");
  const selectAllCheckbox = document.getElementById("select-all");


  function updateSelectedCount() {
    console.log("updateSelectedCount");
    const selectedTabs = document.querySelectorAll("a.file-tab.selected");
    const count = selectedTabs.length;
    selectedDisplay.textContent = `${count} Selected`;
    const moveBtnSel = document.querySelector(".demo-button.grey.folder");
    const createJobBtn = document.querySelector(".demo-button.create-print-job");
    const btnContain = document.querySelector(".div-block-435");
    const delBtnSel = btnContain.querySelector(".demo-button.delete");
    const currentFolder = document.querySelector(".files-tab-pane.w-tab-pane.w--tab-active");
    const currentFolderID = currentFolder.getAttribute("data-w-tab");


    if (count > 0) {
      selectedDisplay.classList.add("selected");
      moveBtnSel.classList.remove("inactive");
      createJobBtn.classList.remove("inactive");
      if (currentFolderID !== "Fav" && currentFolderID !== "Flag" && currentFolderID !== "All") {
        delBtnSel.classList.remove("inactive");
      }
    } else {
      selectedDisplay.classList.remove("selected");
      moveBtnSel.classList.add("inactive");
      createJobBtn.classList.add("inactive");
      if (currentFolderID !== "Fav" && currentFolderID !== "Flag" && currentFolderID !== "All") {
        delBtnSel.classList.add("inactive");
      }
    }
  }


  function toggleTabSelection(checkbox, isChecked) {
    console.log("toggleTabSelection");
    const tab = checkbox.closest("a.file-tab, .file-tab");
    const fileName = tab.querySelector(".file-text.filename")?.textContent.trim();
    checkbox.checked = isChecked;
    if (isChecked) {
      tab.classList.add("selected");
      if (!fileSelectionOrder.includes(fileName)) {
        fileSelectionOrder.push(fileName);
      }
    } else {
      tab.classList.remove("selected");
      fileSelectionOrder = fileSelectionOrder.filter(name => name !== fileName)
    }
  }


  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", function (e) {
      e.stopPropagation();
    });


    checkbox.addEventListener("change", function () {
      toggleTabSelection(checkbox, checkbox.checked);
      updateSelectedCount();
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      selectAllCheckbox.checked = allChecked;
    });
  });


  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const isChecked = selectAllCheckbox.checked;
      const currentPane = document.querySelector(".files-tab-pane.w-tab-pane.w--tab-active");
      const currentPaneCheckboxes = [...currentPane.querySelectorAll(".file-select-box")].filter(
  el => el.offsetParent !== null
);
      currentPaneCheckboxes.forEach((checkbox) => {
        toggleTabSelection(checkbox, isChecked);
      });
      updateSelectedCount();
    });
  }

  updateSelectedCount();
}

// Data file structure src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/apr28-map-structure.js"
  // Maps and Infrastructure Setup
const fileDataMap = new Map();
const jobDataMap = new Map();
const printerDataMap = new Map();
let jobIdCounter = 1;
let fileSelectionOrder = [];

// Tag map
const tagRepoMap = new Map([
  ["PLA", "material"],
  ["PETG", "material"],
  ["TPU", "material"],
  ["ABS", "material"],
  ["ASA", "material"],
  ["Matte PLA", "material"],
  ["Satin PLA", "material"],
  ["Bambu X1C", "printer"],
  ["Bambu P1S", "printer"],
  ["Bambu P1P", "printer"],
  ["Bambu A1", "printer"],
  ["Bambu A1 Mini", "printer"],
  ["Prusa Mk3", "printer"],
  ["Prusa MK4", "printer"],
  ["Prusa Mini", "printer"],
  ["Ender 3", "printer"],
  ["Ender 3 V2", "printer"],
  ["CR 10", "printer"],
  ["Red", "color"],
  ["Blue", "color"],
  ["Green", "color"],
  ["Yellow", "color"],
  ["Black", "color"],
  ["White", "color"],
  ["Grey", "color"],
  ["Orange", "color"],
  ["Purple", "color"]
]);


// Helper to convert minutes
function convertMinutes(totalMinutes) {
  console.log("convertMinutes");
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}


// Match printers that contain all file tags
function getMatchingPrintersForTags(fileTags, filamentWeight) {
  console.log("getMatchingPrintersForTags");
  const matches = [];


  printerDataMap.forEach((printer, name) => {
    // Normalize printer tags once
    const normalizedPrinterTags = printer.printerTags.map(t => t.trim().toLowerCase());


    const hasAllTags = fileTags.every(tag =>
      normalizedPrinterTags.includes(tag.trim().toLowerCase())
    );

    const hasEnoughFilament = printer.filamentRemaining >= filamentWeight;

    if (hasAllTags && hasEnoughFilament) {
      const cleanStatus = printer.printerStatus.replace("•", "").trim();
      matches.push({
        name: printer.printerName,
        status: cleanStatus
      });
    }
  });

  return matches;
}


// Initialize Files
function initializeFileData(limit = 20) {
  console.log("initializeFileData");
  
  const tabContainer = document.querySelector(".files-tabs-wrap.w-tab-menu");
  const paneContainer = document.querySelector(".file-info-content.w-tab-content");
  const tabTemplate = document.getElementById("file-tab-template");
  const paneTemplate = document.getElementById("file-pane-template");

  if (!tabContainer || !paneContainer || !tabTemplate || !paneTemplate) {
    console.error("❌ Missing containers or templates for file data init.");
    return;
  }

  const repoEntries = Array.from(fileDataMapRepo.entries()).slice(0, limit);

  repoEntries.forEach(([fileName, repoData], index) => {
    // --- Create and populate .file-tab ---
    const tab = tabTemplate.cloneNode(true);
    tab.removeAttribute("id");
    tab.style.display = "flex";
    tab.classList.add("file-tab", "w-tab-link");
    tab.setAttribute("data-w-tab", fileName);
    tab.setAttribute("id", fileName);

    const printTime = (repoData.printHours * 60) + repoData.printMins;
    const fileData = { ...repoData, printTime };
    fileDataMap.set(fileName, fileData);

    const fileTabNameText = tab.querySelector(".file-text.filename");
    const filePrintTimeText = tab.querySelector(".file-text.print-time");
    const fileDateUploadedText = tab.querySelector(".file-text.date-uploaded");
    const fileFavCheck = tab.querySelector(".material-symbols-outlined");

    if (fileTabNameText) fileTabNameText.textContent = fileName;
    if (filePrintTimeText) filePrintTimeText.textContent = `${repoData.printHours}hr ${repoData.printMins}m`;
    if (fileDateUploadedText && repoData.dayUploaded && repoData.monthUploaded && repoData.yearUploaded) {
      fileDateUploadedText.textContent = `${repoData.dayUploaded}/${repoData.monthUploaded}/${repoData.yearUploaded}`;
    }
    if (fileFavCheck) {
      fileFavCheck.classList.toggle("fav", !!repoData.fileFav);
    }
    

    tabContainer.appendChild(tab);

    tab.querySelector(".material-symbols-outlined")?.addEventListener("click", (e) => {
      console.log("Fav clicked");
      e.preventDefault();
      e.stopPropagation();
      const fileName = tab.getAttribute("data-w-tab");
      const fileData = fileDataMap.get(fileName);
      if (!fileData) return;

      // Toggle and persist
      fileData.fileFav = !fileData.fileFav;
      fileDataMap.set(fileName, structuredClone(fileData));

      // Update icon state
      const favIcon = e.currentTarget;
      favIcon.classList.toggle("fav", fileData.fileFav);

      updateAllInstancesOfFile(fileName);
      initializeFavoritesTab();
    });

    // --- Create and populate .w-tab-pane ---
    const tabPane = paneTemplate.cloneNode(true);
    tabPane.removeAttribute("id");
    tabPane.style.display = "";
    tabPane.classList.add("w-tab-pane");
    tabPane.setAttribute("data-w-tab", fileName);

    const fileNameText = tabPane.querySelector(".file-text.sidebar.filename");
    const fileZHeightText = tabPane.querySelector(".file-text.sidebar.zheight");
    const fileWeightInput = tabPane.querySelector(".file-text.sidebar.filament-weight");
    const fileTempInput = tabPane.querySelector(".file-text.sidebar.filament-weight.temp");
    const fileNotesText = tabPane.querySelector(".production-notes");
    const fileFlagCheck = tabPane.querySelector(".flag-check");
    const fileTagsWrap = tabPane.querySelector(".default-file-tags");

    if (fileNameText) fileNameText.textContent = fileName;
    if (fileZHeightText) fileZHeightText.textContent = repoData.zHeight;

    if (fileWeightInput) {
      fileWeightInput.setAttribute("value", repoData.filamentWeight);
      fileWeightInput.addEventListener("input", () => {
        const newVal = parseFloat(fileWeightInput.value);
        if (!isNaN(newVal)) {
          fileData.filamentWeight = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
        updateAllInstancesOfFile(fileName);
      });
    }

    if (fileTempInput) {
      fileTempInput.setAttribute("value", repoData.defaultReleaseTemp);
      fileTempInput.addEventListener("input", () => {
        const newVal = parseInt(fileTempInput.value);
        if (!isNaN(newVal)) {
          fileData.defaultReleaseTemp = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
        updateAllInstancesOfFile(fileName);
      });
    }

    if (fileNotesText) {
      fileNotesText.value = repoData.productionNotes;
      fileNotesText.addEventListener("input", () => {
        fileData.productionNotes = fileNotesText.value;
        fileDataMap.set(fileName, structuredClone(fileData));
        updateAllInstancesOfFile(fileName);
      });
    }
    
    if (fileFlagCheck) {
      // Set initial state from data
      fileFlagCheck.checked = repoData.fileFlag === true;


      // Listen for user interaction
      fileFlagCheck.addEventListener("change", () => {
        console.log("File flag checked");
        const fileData = fileDataMap.get(fileName); 
        fileData.fileFlag = fileFlagCheck.checked;
        fileDataMap.set(fileName, structuredClone(fileData));

        initializeFlaggedTab();
        updateAllInstancesOfFile(fileName);
      });
      
      if (fileFlagCheck.checked === true) {
        tab.classList.add("flagged");
      }
   }

    if (fileTagsWrap && fileData.defaultTags) {
      updateDefaultTagsUI(fileTagsWrap, fileData.defaultTags);
    }

    paneContainer.appendChild(tabPane);

    updateAllInstancesOfFile(fileName);
  });

  // ✅ Re-initialize Webflow's Tabs after appending file tabs
  if (window.Webflow && Webflow.require) {
    const tabs = Webflow.require('tabs');
    if (tabs && typeof tabs.ready === 'function') {
      tabs.ready();
      countFilesInTabs();
    }
  }

  initFileTagListeners();
  initFileCheckboxListeners();
}

function initializeFavoritesTab() {
  console.log("initializeFavoritesTab");
  const favorites = Array.from(fileDataMap.entries()).filter(([_, f]) => f.fileFav);
  const favTabPane = document.querySelector('.w-tab-pane[data-w-tab="Fav"]');
  const tabContainer = favTabPane?.querySelector(".files-tabs-wrap");
  const paneContainer = favTabPane?.querySelector(".file-info-content");
  const tabTemplate = document.getElementById("folder-file-tab-template");
  const paneTemplate = document.getElementById("folder-file-pane-template");

  if (!favTabPane || !tabContainer || !paneContainer || !tabTemplate || !paneTemplate) {
    console.error("❌ Missing containers or templates for Favorites tab.");
    return;
  }

  if (tabContainer) tabContainer.innerHTML = '';
  if (paneContainer) paneContainer.innerHTML = '';

  favorites.forEach(([fileName, fileData]) => {
    const tab = tabTemplate.cloneNode(true);
    const pane = paneTemplate.cloneNode(true);

    tab.removeAttribute("id");
    tab.style.display = "flex";
    tab.classList.add("file-tab");
    tab.setAttribute("data-tab-id", `fav-${fileName}`);
    tab.setAttribute("id", `fav-${fileName}`);

    const fileTabNameText = tab.querySelector(".file-text.filename");
    if (fileTabNameText) fileTabNameText.textContent = fileName;
    const favIcon = tab.querySelector(".material-symbols-outlined");
    if (favIcon) {
      favIcon.classList.toggle("fav", fileData.fileFav);
    }

    
    tabContainer.appendChild(tab);

    tab.querySelector(".material-symbols-outlined")?.addEventListener("click", (e) => {
      console.log("Fav clicked");
      e.preventDefault();
      e.stopPropagation();
      const fileName = tab.getAttribute("data-tab-id")?.replace("fav-", "");
      const fileData = fileDataMap.get(fileName);
      if (!fileData) return;

      // Toggle and persist
      fileData.fileFav = false;
      fileDataMap.set(fileName, structuredClone(fileData));

      // Update icon state
      const favIcon = e.currentTarget;
      favIcon.classList.remove("fav", fileData.fileFav);

      const currentTab = tabContainer.querySelector(`.file-tab.div-block-430[data-tab-id="fav-${fileName}"]`);
      currentTab.remove();
      
      if (!paneContainer) return;
      const currentPane = paneContainer.querySelector(`.file-info-tab[data-tab-id="fav-${fileName}"]`);
      currentPane.remove();
        
      updateAllInstancesOfFile(fileName);
      initializeFavoritesTab();
    });

    pane.removeAttribute("id");
    pane.style.display = "";
    pane.classList.add("file-info-tab");
    pane.setAttribute("data-tab-id", `fav-${fileName}`);

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
      weightInput.addEventListener("input", () => {
        const newVal = parseFloat(weightInput.value);
        if (!isNaN(newVal)) {
          fileData.filamentWeight = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
        updateAllInstancesOfFile(fileName);
      });
    }

    if (tempInput) {
      tempInput.setAttribute("value", fileData.defaultReleaseTemp);
      tempInput.addEventListener("input", () => {
        const newVal = parseInt(tempInput.value);
        if (!isNaN(newVal)) {
          fileData.defaultReleaseTemp = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
        updateAllInstancesOfFile(fileName);
      });
    }

    if (notesArea) {
      notesArea.value = fileData.productionNotes;
      notesArea.addEventListener("input", () => {
        fileData.productionNotes = notesArea.value;
        fileDataMap.set(fileName, structuredClone(fileData));
        updateAllInstancesOfFile(fileName);
      });
    }

    const flagCheck = pane.querySelector("input.flag-check");
    if (flagCheck) flagCheck.checked = fileData.fileFlag ?? false;
    if (flagCheck.checked === true) {
      tab.classList.add("flagged");
    }
    

    paneContainer.appendChild(pane);

    const tagWrap = pane.querySelector(".default-file-tags");
    if (tagWrap) {
      updateDefaultTagsUI(tagWrap, fileData.defaultTags || []);
    }

    flagCheck.addEventListener("change", () => {
      console.log("File flag checked");
      setTimeout(() => {
      fileData.fileFlag = flagCheck.checked;
      fileDataMap.set(fileName, structuredClone(fileData));

      updateAllInstancesOfFile(fileName);
      initializeFlaggedTab();
      }, "1000");
    });

    updateAllInstancesOfFile(fileName);
  });
  const tabPanes = document.querySelectorAll(".file-info-tab");
  tabPanes.forEach(pane => {
    if (pane.classList.contains("w-tab-pane")) {
      return;
    }
    pane.style.display = "none";
  });

  initFileTagListeners();
  initFileCheckboxListeners();
  countFilesInTabs();
}

function initializeFlaggedTab() {
  console.log("initializeFlaggedTab");
  const flagged = Array.from(fileDataMap.entries()).filter(([_, f]) => f.fileFlag);

  const flagTabPane = document.querySelector('.w-tab-pane[data-w-tab="Flag"]');
  const tabContainer = flagTabPane?.querySelector(".files-tabs-wrap");
  const paneContainer = flagTabPane?.querySelector(".file-info-content");
  const tabTemplate = document.getElementById("folder-file-tab-template");
  const paneTemplate = document.getElementById("folder-file-pane-template");

  if (!flagTabPane || !tabContainer || !paneContainer || !tabTemplate || !paneTemplate) {
    console.error("❌ Missing containers or templates for Flagged tab.");
    return;
  }

  if (tabContainer) tabContainer.innerHTML = '';
  if (paneContainer) paneContainer.innerHTML = '';

  flagged.forEach(([fileName, fileData]) => {
    const tab = tabTemplate.cloneNode(true);
    const pane = paneTemplate.cloneNode(true);

    tab.removeAttribute("id");
    tab.style.display = "flex";
    tab.classList.add("file-tab");
    tab.setAttribute("data-tab-id", `flag-${fileName}`);
    tab.setAttribute("id", `flag-${fileName}`);

    const fileTabNameText = tab.querySelector(".file-text.filename");
    if (fileTabNameText) fileTabNameText.textContent = fileName;
    const favIcon = tab.querySelector(".material-symbols-outlined");
    const favState = fileData.fileFav;
    if (favIcon && favState === true) {
      favIcon.classList.add("fav");
    }

    tabContainer.appendChild(tab);

    tab.querySelector(".material-symbols-outlined")?.addEventListener("click", (e) => {
      console.log("Fav clicked");
      e.preventDefault();
      e.stopPropagation();
      const fileName = tab.getAttribute("data-tab-id")?.replace("flag-", "");
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
    });

    pane.removeAttribute("id");
    pane.style.display = "";
    pane.classList.add("file-info-tab");
    pane.setAttribute("data-tab-id", `flag-${fileName}`);

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
      weightInput.addEventListener("input", () => {
        const newVal = parseFloat(weightInput.value);
        if (!isNaN(newVal)) {
          fileData.filamentWeight = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
        updateAllInstancesOfFile(fileName);
      });
    }

    if (tempInput) {
      tempInput.setAttribute("value", fileData.defaultReleaseTemp);
      tempInput.addEventListener("input", () => {
        const newVal = parseInt(tempInput.value);
        if (!isNaN(newVal)) {
          fileData.defaultReleaseTemp = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
        updateAllInstancesOfFile(fileName);
      });
    }

    if (notesArea) {
      notesArea.value = fileData.productionNotes;
      notesArea.addEventListener("input", () => {
        fileData.productionNotes = notesArea.value;
        fileDataMap.set(fileName, structuredClone(fileData));
        updateAllInstancesOfFile(fileName);
      });
    }


    const flagCheck = pane.querySelector("input.flag-check");
    if (flagCheck) flagCheck.checked = fileData.fileFlag ?? false;
    if (flagCheck.checked === true) {
      tab.classList.add("flagged");
    }

    paneContainer.appendChild(pane);

    const tagWrap = pane.querySelector(".default-file-tags");
    if (tagWrap) {
      updateDefaultTagsUI(tagWrap, fileData.defaultTags || []);
    }

    if (!flagCheck) return;
    flagCheck.addEventListener("change", () => {
      console.log("File flag checked");
      setTimeout(() => {
        fileData.fileFlag = flagCheck.checked;
        fileDataMap.set(fileName, structuredClone(fileData));

    const currentTab = tabContainer.querySelector(`.file-tab.div-block-430[data-tab-id="flag-${fileName}"]`);
      currentTab.remove();
      
      if (!paneContainer) return;
      const currentPane = paneContainer.querySelector(`.file-info-tab[data-tab-id="flag-${fileName}"]`);
      currentPane.remove();

      updateAllInstancesOfFile(fileName);
      }, "1000");
    });
  });
  
  const tabPanes = document.querySelectorAll(".file-info-tab");
  tabPanes.forEach(pane => {
    if (pane.classList.contains("w-tab-pane")) {
      return;
    }
    pane.style.display = "none";
  });

  initFileTagListeners();
  initFileCheckboxListeners();
  countFilesInTabs();
}

function initializeAllFilesTab() {
  console.log("initializeAllFilesTab");
  const allFiles = Array.from(fileDataMap.entries());

  const allTabPane = document.querySelector('.w-tab-pane[data-w-tab="All Files"]');
  const tabContainer = allTabPane?.querySelector(".files-tabs-wrap");
  const paneContainer = allTabPane?.querySelector(".file-info-content");
  const tabTemplate = document.getElementById("folder-file-tab-template");
  const paneTemplate = document.getElementById("folder-file-pane-template");

  if (!allTabPane || !tabContainer || !paneContainer || !tabTemplate || !paneTemplate) {
    console.error("❌ Missing containers or templates for All Files tab.");
    return;
  }

  tabContainer.innerHTML = '';
  paneContainer.innerHTML = '';

  allFiles.forEach(([fileName, fileData]) => {
    const tab = tabTemplate.cloneNode(true);
    const pane = paneTemplate.cloneNode(true);

    tab.removeAttribute("id");
    tab.style.display = "flex";
    tab.classList.add("file-tab");
    tab.setAttribute("data-tab-id", `${fileName}`);
    tab.setAttribute("id", `${fileName}`);

    const fileTabNameText = tab.querySelector(".file-text.filename");
    if (fileTabNameText) fileTabNameText.textContent = fileName;
    if (fileData.fileFav === true) {
      tab.querySelector(".material-symbols-outlined")?.classList.add("fav");
    }

    tabContainer.appendChild(tab);

    pane.removeAttribute("id");
    pane.style.display = "";
    pane.classList.add("file-info-tab");
    pane.setAttribute("data-tab-id", `${fileName}`);

    const wrap = pane.querySelector(".file-info-wrap");
    if (wrap) wrap.setAttribute("data-file-id", fileName);
    const nameEl = pane.querySelector(".file-text.sidebar.filename");
    if (nameEl) nameEl.textContent = fileName;

    const zHeightEl = pane.querySelector(".file-text.sidebar.zheight");
    if (zHeightEl) zHeightEl.textContent = fileData.zHeight ?? "";

    const weightInput = pane.querySelector("input.filament-weight");
    if (weightInput) {
      weightInput.setAttribute("value", fileData.filamentWeight);
      weightInput.addEventListener("input", () => {
        const newVal = parseFloat(weightInput.value);
        if (!isNaN(newVal)) {
          fileData.filamentWeight = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
      });
    }

    const tempInput = pane.querySelector("input.filament-weight.temp");
    if (tempInput) {
      tempInput.setAttribute("value", fileData.defaultReleaseTemp);
      tempInput.addEventListener("input", () => {
        const newVal = parseInt(tempInput.value);
        if (!isNaN(newVal)) {
          fileData.defaultReleaseTemp = newVal;
          fileDataMap.set(fileName, structuredClone(fileData));
        }
      });
    }

    const notesArea = pane.querySelector("textarea.production-notes");
    if (notesArea) {
      notesArea.value = fileData.productionNotes;
      notesArea.addEventListener("input", () => {
        fileData.productionNotes = notesArea.value;
        fileDataMap.set(fileName, structuredClone(fileData));
      });
    }

    const flagCheck = pane.querySelector("input.flag-check");
    if (flagCheck) {
      flagCheck.checked = fileData.fileFlag ?? false;
      flagCheck.addEventListener("change", () => {
        console.log("File flag checked");
        setTimeout(() => {
        fileData.fileFlag = flagCheck.checked;
        fileDataMap.set(fileName, structuredClone(fileData));
        initializeFlaggedTab();
        updateAllInstancesOfFile(fileName);
        }, "1000");
      });
    }

    if (flagCheck.checked === true) {
      tab.classList.add("flagged");
    }

    paneContainer.appendChild(pane);

    const tagWrap = pane.querySelector(".default-file-tags");
    if (tagWrap) {
      updateDefaultTagsUI(tagWrap, fileData.defaultTags || []);
    }
  });

  const tabPanes = allTabPane.querySelectorAll(".file-info-tab");
  tabPanes.forEach(pane => {
    if (!pane.classList.contains("w-tab-pane")) pane.style.display = "none";
  });

  updateAllInstancesOfFile(fileName);
  initFileTagListeners();
  initFileCheckboxListeners();
  countFilesInTabs();
}

// Initialize Printers
function initializePrinterData() {
  console.log("initializePrinterData");
  const printerCards = document.querySelectorAll(".demo-printer-card:not(.template)");


  printerCards.forEach((card, index) => {
    // if (card.classList.contains("template")) return;
    
    const rawName = card.querySelector(".demo-printer-name")?.textContent.trim();
    const printerName = (rawName && rawName !== "Printer Name") ? rawName : null;
    if (!printerName) return; // Skip invalid/placeholder printers
    const tagsEls = card.querySelectorAll(".demo-tag-text.printer");
    const tags = Array.from(tagsEls).map(tagEl => tagEl.textContent.trim());


    const filamentText = card.querySelector(".demo-filament-remaining")?.textContent.trim() || "";
    let filamentRemaining = 0;
    if (filamentText.includes("kg")) {
      filamentRemaining = parseFloat(filamentText) * 1000;
    } else {
      filamentRemaining = parseInt(filamentText);
    }


    const printerData = {
      printerName,
      printerModel: tags.join(", "),
      printerTags: tags,
      printerTagsNum: tags.length,
      filamentRemaining,
      currentJob: null,
      compatibleJobs: [],
      printerStatus: "idle"
    };

    const filamentSpool = card.querySelector(".filament-icon.fill:not(.in-popup)");
    const filamentLeftOnSpool = ((printerData.filamentRemaining * 360) / 1000);
    const filamentSpoolDeg = 360 - filamentLeftOnSpool;
    
    filamentSpool.style.background = "conic-gradient(black " + filamentSpoolDeg + "deg,white " + filamentSpoolDeg + "deg)";

    // Filament modal click

    const filamentMenuOpen = card.querySelector(".demo-printer-filament");
    const filamentModal = filamentMenuOpen.querySelector(".printer-filament-popup");

    if (!filamentModal) return;
      
    const modalSpoolWrap = filamentModal.querySelector(".filament-spool-popup-wrap");
    const modalSpool = modalSpoolWrap.querySelector(".filament-icon.fill.in-popup");

    modalSpool.style.background = "conic-gradient(black " + filamentSpoolDeg + "deg,#60a5fa " + filamentSpoolDeg + "deg)";

    const modalFilamentLevel = filamentModal.querySelector(".filament-input-printer");
    modalFilamentLevel.setAttribute("value", printerData.filamentRemaining + "g");
    modalFilamentLevel.setAttribute('tabindex', '0');
    modalFilamentLevel.disabled = true;

    if (!filamentModal.dataset.listenerAttached) {
        document.addEventListener("mousedown", (e) => {
          if (filamentModal.style.display !== "block") return;
          
        const isInside = filamentModal.contains(e.target);
        const isTrigger = filamentMenuOpen.contains(e.target);
        
        if (!isInside && !isTrigger) {
        /* if (filamentModal.contains(e.relatedTarget)) {
          return;
        }*/
  
        filamentModal.style.display = "none";
        const add75Btn = filamentModal.querySelector(".add-filament-demo.add-75");
        const add1Btn = filamentModal.querySelector(".add-filament-demo.add-1");
        const add5Btn = filamentModal.querySelector(".add-filament-demo.add-5");
        const addCustomBtn = filamentModal.querySelector(".add-filament-demo.add-custom");
        const filamentSave = filamentModal.querySelector(".filament-save-changes:not(.cannot)");
        if (add5Btn.classList.contains("clicked")) add5Btn.classList.remove("clicked");
        if (add1Btn.classList.contains("clicked")) add1Btn.classList.remove("clicked");
        if (add75Btn.classList.contains("clicked")) add75Btn.classList.remove("clicked");
        if (addCustomBtn.classList.contains("clicked")) addCustomBtn.classList.remove("clicked");
        const cannotSave = filamentModal.querySelector(".filament-save-changes.cannot");
        filamentSave.style.display = "none";
        cannotSave.style.display = "none";
        /*modalFilamentLevel.value = printerData.filamentRemaining + "g";*/
        }
      });   
    }
    
    filamentMenuOpen.addEventListener("click", () => {
      filamentModal.style.display = "block";

      // filamentModal.setAttribute("tabindex", "-1");
      // filamentModal.focus();

      const inputElement = filamentModal.querySelector('.filament-input-printer');

      inputElement.addEventListener('focus', (e) => {
        e.stopPropagation(); // Prevent the blur event from triggering on the modal
      });
    });

    const add75Btn = filamentModal.querySelector(".add-filament-demo.add-75");
        const add1Btn = filamentModal.querySelector(".add-filament-demo.add-1");
        const add5Btn = filamentModal.querySelector(".add-filament-demo.add-5");
        const addCustomBtn = filamentModal.querySelector(".add-filament-demo.add-custom");
        const filamentSave = filamentModal.querySelector(".filament-save-changes:not(.cannot)");

    add75Btn.addEventListener("click", () => {
      if (add75Btn.classList.contains("clicked")) {
        add75Btn.classList.remove("clicked");
      } else {
        add75Btn.classList.add("clicked");
      }
      if (add5Btn.classList.contains("clicked")) add5Btn.classList.remove("clicked");
      if (add1Btn.classList.contains("clicked")) add1Btn.classList.remove("clicked");
      if (addCustomBtn.classList.contains("clicked")) addCustomBtn.classList.remove("clicked");

      modalFilamentLevel.value = "750g";
      filamentSave.style.display = "flex";
    });

    add1Btn.addEventListener("click", () => {
      if (add1Btn.classList.contains("clicked")) {
        add1Btn.classList.remove("clicked");
      } else {
        add1Btn.classList.add("clicked");
      }
      if (add5Btn.classList.contains("clicked")) add5Btn.classList.remove("clicked");
      if (addCustomBtn.classList.contains("clicked")) addCustomBtn.classList.remove("clicked");
      if (add75Btn.classList.contains("clicked")) add75Btn.classList.remove("clicked");

      modalFilamentLevel.value = "1000g";
      filamentSave.style.display = "flex";
    });

    add5Btn.addEventListener("click", () => {
      if (add5Btn.classList.contains("clicked")) {
        add5Btn.classList.remove("clicked");
      } else {
        add5Btn.classList.add("clicked");
      }
      if (addCustomBtn.classList.contains("clicked")) addCustomBtn.classList.remove("clicked");
      if (add1Btn.classList.contains("clicked")) add1Btn.classList.remove("clicked");
      if (add75Btn.classList.contains("clicked")) add75Btn.classList.remove("clicked");

      modalFilamentLevel.value = "5000g";
      filamentSave.style.display = "flex";
    });

    addCustomBtn.addEventListener("click", () => {
      const wasDisabled = modalFilamentLevel.disabled;
      
      if (wasDisabled) {
        modalFilamentLevel.disabled = false;
      } else {
      }

      modalFilamentLevel.focus();
      
      if (addCustomBtn.classList.contains("clicked")) {
        addCustomBtn.classList.remove("clicked");
      } else {
        addCustomBtn.classList.add("clicked");
      }
      if (add5Btn.classList.contains("clicked")) add5Btn.classList.remove("clicked");
      if (add1Btn.classList.contains("clicked")) add1Btn.classList.remove("clicked");
      if (add75Btn.classList.contains("clicked")) add75Btn.classList.remove("clicked");

      modalFilamentLevel.addEventListener("click", () => {
      });
      
      filamentSave.style.display = "flex";
    });

    filamentSave.addEventListener("click", () => {
      const printerStatus = card.querySelector(".demo-printer-status-text");
      if (printerStatus.classList.contains("status-printing")) {
        const cannotSave = filamentModal.querySelector(".filament-save-changes.cannot");

        cannotSave.style.display = "flex";
        filamentSave.style.display = "none";
        modalFilamentLevel.disabled = true;

        cannotSave.addEventListener("click", () => {
          cannotSave.style.display = "none";
          setTimeout(() => {
            filamentModal.style.display = "none";
          }, 0);
          modalFilamentLevel.value = printerData.filamentRemaining;
          if (add5Btn.classList.contains("clicked")) add5Btn.classList.remove("clicked");
          if (add1Btn.classList.contains("clicked")) add1Btn.classList.remove("clicked");
          if (add75Btn.classList.contains("clicked")) add75Btn.classList.remove("clicked");
          if (addCustomBtn.classList.contains("clicked")) addCustomBtn.classList.remove("clicked");
        });

        return;
      } else {
      
        const newFilamentLevel = modalFilamentLevel.value.replace(/g$/, '');

        if (printerData.filamentRemaining <= 20 && newFilamentLevel >= 20) {
          setPrinterToIdle(card);
          findAndAssignNextJob(card);
        }

      printerData.filamentRemaining = newFilamentLevel;
      printerDataMap.set(printerName, printerData);

      const cardFilamentSpool = card.querySelector(".filament-icon.fill:not(.in-popup)");
      const filamentLeftOnSpool = (printerData.filamentRemaining === "5000") ? ((printerData.filamentRemaining * 360) / 5000) : ((printerData.filamentRemaining * 360) / 1000);
      const filamentSpoolDeg = 360 - filamentLeftOnSpool;
    
      cardFilamentSpool.style.background = "conic-gradient(black " + filamentSpoolDeg + "deg,white " + filamentSpoolDeg + "deg)";

      const popupFilamentSpool = card.querySelector(".filament-icon.fill.in-popup");
    
      popupFilamentSpool.style.background = "conic-gradient(black " + filamentSpoolDeg + "deg,#60a5fa " + filamentSpoolDeg + "deg)";

      const filamentText = card.querySelector(".demo-filament-remaining");
      filamentText.textContent = printerData.filamentRemaining + "g Remaining";

      
      if (add5Btn.classList.contains("clicked")) add5Btn.classList.remove("clicked");
      if (add1Btn.classList.contains("clicked")) add1Btn.classList.remove("clicked");
      if (add75Btn.classList.contains("clicked")) add75Btn.classList.remove("clicked");
      if (addCustomBtn.classList.contains("clicked")) addCustomBtn.classList.remove("clicked");
      filamentSave.style.display = "none";
      modalFilamentLevel.value = printerData.filamentRemaining + "g";
      modalFilamentLevel.disabled = true;
      setTimeout(() => {
        filamentModal.style.display = "none";
      }, 0);
        setTimeout(() => {
        }, 100);
      }
      if (printerData.filamentRemaining <= 20) {
         setPrinterToError(card);
       }
    });

    printerDataMap.set(printerName, printerData);
  });


}


// Job Creation
function createJobFromFile(fileName, quantity = 1, distribute = false) {
  console.log("createJobFromFile");
  const fileData = fileDataMap.get(fileName);
  if (!fileData) return;


  const jobID = `j${jobIdCounter++}`;
  const jobPrintTime = fileData.printTime * quantity;
  const jobPrintConverted = convertMinutes(jobPrintTime);

  const jobData = {
    jobID,
    fileName: fileData.fileName,
    tags: [...fileData.defaultTags],
    tagsNum: fileData.defaultTags.length,
    quantity,
    distribute,
    printTime: fileData.printTime,
    printHours: fileData.printHours,
    printMins: fileData.printMins,
    jobPrintTime,
    jobPrintHours: jobPrintConverted.hours,
    jobPrintMins: jobPrintConverted.minutes,
    filamentWeight: fileData.filamentWeight,
    zHeight: fileData.zHeight,
    defaultReleaseTemp: fileData.defaultReleaseTemp,
    jobProgQueued: quantity,
    jobProgProd: 0,
    jobProgCol: 0,
    jobProgDone: 0,
    jobProgressTotal: 0,
    jobStatus: "q",
    matchingPrinters: [],
    matchingPrinterNames: [],
    matchingPrinterStatuses: [],
    assignedPrinterName: null,
    assignedPrinterNames: [],
    activePrinterNames: [],
  };

  jobDataMap.set(jobID, jobData);

  return jobData;
}


// Modal Handling and Job Creation  src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/apr26-modal-handling.js"
document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("send-button");
  const confirmSendBtn = document.getElementById("confirm-send");
  const modal = document.getElementById("file-modal");


 function populateSendModal(files) {
   console.log("populateSendModal");
  const modalContent = document.getElementById("modal-content");
  const template = document.getElementById("file-entry-template");

  modalContent.querySelectorAll(".demo-q-file").forEach(el => el.remove());

  files.forEach(file => {
    const fileName = file.fileName;

    // 🆕 Always create a fresh job object
    const job = createJobFromFile(fileName, 1, true); // quantity: 1, distribute: true (default)
    jobDataMap.set(job.jobID, job);

    const clone = template.cloneNode(true);
    clone.style.display = "flex";
    clone.dataset.jobId = job.jobID; // 🆕 Attach jobID directly to modal block
    clone.querySelector(".filename.q-send").textContent = fileName;


    // 🏷️ Tags
    const tagsContainer = clone.querySelector(".tags");
    tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
    /*job.tags.forEach(tag => {
      const tagDiv = document.createElement("div");
      tagDiv.className = "demo-tag";
      tagDiv.style.display = "flex";
      tagDiv.textContent = tag;
      tagsContainer.appendChild(tagDiv);
    });*/
    updateDefaultTagsUI(tagsContainer, job.tags);

    // 🔢 Quantity
    const qtyInput = clone.querySelector(".div-block-439.q-qty input");
    if (qtyInput) qtyInput.value = job.quantity;

    // 🔄 Listen for manual input changes
qtyInput.addEventListener('change', () => {
  const newQty = Math.max(1, parseInt(qtyInput.value) || 1);
  job.quantity = newQty;
  job.jobProgQueued = Math.max(0, newQty - (job.jobProgProd + job.jobProgCol + job.jobProgDone));

  // Recalculate total job print time
  job.jobPrintTime = job.printTime * newQty;
  const converted = convertMinutes(job.jobPrintTime);
  job.jobPrintHours = converted.hours;
  job.jobPrintMins = converted.minutes;

  jobDataMap.set(job.jobID, structuredClone(job));
});
    
    // Update job print time
    job.jobPrintTime = job.printTime * job.quantity;
    const converted = convertMinutes(job.jobPrintTime);
    job.jobPrintHours = converted.hours;
    job.jobPrintMins = converted.minutes;
    jobDataMap.set(job.jobID, job);

    // 🌡️ Temp
    const tempInput = clone.querySelector(".div-block-439.q-temp input");
    if (tempInput) tempInput.value = job.releaseTemp ?? job.defaultReleaseTemp ?? 29;

    if (tempInput) {
  tempInput.value = job.releaseTemp ?? job.defaultReleaseTemp ?? 29;

  // 🔄 Listen for manual input changes
  tempInput.addEventListener('change', () => {
    const newTemp = Math.max(0, parseInt(tempInput.value) || 29);
    job.releaseTemp = newTemp;
    jobDataMap.set(job.jobID, structuredClone(job));
  });
}

    // ✅ Distribute
    const distCheckbox = clone.querySelector(".distribute-checkbox");
    if (distCheckbox) distCheckbox.checked = job.distribute;

    modalContent.appendChild(clone);
  });

  initTagAndDistributeListeners(); // assumes jobs are now created and in jobDataMap
}

  if (sendButton) {
    sendButton.addEventListener("click", () => {
      const selectedFiles = getSelectedFilesData();
      populateSendModal(selectedFiles);
      modal.style.display = "flex";
    });
  }


if (confirmSendBtn) {
  confirmSendBtn.addEventListener("click", () => {
    const confirmedJobs = [];
    const fileItems = modal.querySelectorAll(".demo-q-file");

    fileItems.forEach(item => {
  const jobID = item.dataset.jobId;
  if (!jobID) return;

  const job = jobDataMap.get(jobID);
  if (job) {
    // 👇 NEW: Recalculate matches based on current tags
    const matches = getMatchingPrintersForTags(job.tags, job.filamentWeight);
    job.matchingPrinters = matches;
    job.matchingPrinterNames = matches.map(p => p.name);
    job.matchingPrinterStatuses = matches.map(p => p.status);

    // 👇 NEW: Update printer compatibleJobs
    printerDataMap.forEach(p => {
      p.compatibleJobs = p.compatibleJobs.filter(jid => jid !== jobID);
      if (matches.some(m => m.name === p.printerName)) {
        p.compatibleJobs.push(jobID);
      }
    });

    confirmedJobs.push(job);
  }
});
    const queueBackground = document.querySelector(".demo-q-background");
    const blockedBackground = document.querySelector(".demo-q-background.blocked");
    const queuedJobTemplate = document.getElementById("queued-job-template");
    const blockedJobTemplate = document.getElementById("blocked-job-template");
    const blockedJobTemplateBlocked = document.getElementById("blocked-job-template-2");
    const blockedTab = document.querySelector('.w-tab-pane[data-w-tab="Blocked"]');

    if (!queueBackground) {
      console.error("Queue background not found!");
      return;
    }

    if (!blockedBackground) {
      console.error("Blocked background not found!");
      return;
    }

    if (!queuedJobTemplate) {
      console.error("Queued job template not found!");
      return;
    }
    
    if (!blockedJobTemplateBlocked) {
      console.error("Blocked job template not found in blocked tab!");
      return;
    }

    if (!blockedJobTemplate) {
      console.error("Blocked job template not found!");
      return;
    }

    confirmedJobs.forEach(job => {
      if (job.matchingPrinters.length === 0) {

        const cloneQueue = blockedJobTemplate.cloneNode(true);
        
        cloneQueue.style.display = "flex";
        cloneQueue.removeAttribute('id');

        cloneQueue.querySelector(".filename").textContent = job.fileName;
        cloneQueue.querySelector(".jobs.ul").textContent = `${job.matchingPrinters.length} Matching`;

        const tagsContainer = cloneQueue.querySelector(".tags .default-file-tags");
        tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
        /*job.tags.forEach(tag => {
          const tagDiv = document.createElement("div");
          tagDiv.className = "demo-tag";
          tagDiv.style.display = "flex";
          tagDiv.textContent = tag;
          tagsContainer.appendChild(tagDiv);
        });*/
        updateDefaultTagsUI(tagsContainer, job.tags);

        cloneQueue.querySelector(".qty").textContent = job.quantity;
        cloneQueue.querySelector(".weight").textContent = job.filamentWeight || '--';
        cloneQueue.querySelector(".time").textContent = job.printTime;

        const distributeCheckbox = cloneQueue.querySelector(".file-text.jobs .w-embed input[type='checkbox']");
        if (distributeCheckbox) {
          distributeCheckbox.checked = job.distribute;
        }

        cloneQueue.dataset.jobId = job.jobID;

        queueBackground.appendChild(cloneQueue);

                if (!blockedBackground) {
          console.error("Blocked background not found!");
          return;
        } else {

        const cloneBlocked = blockedJobTemplateBlocked.cloneNode(true);

        cloneBlocked.style.display = "flex";
        cloneBlocked.removeAttribute('id');

        cloneBlocked.querySelector(".filename").textContent = job.fileName;
        cloneBlocked.querySelector(".jobs.ul").textContent = `${job.matchingPrinters.length} Matching`;

        const tagsContainer = cloneBlocked.querySelector(".tags .default-file-tags");
        tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
        /*job.tags.forEach(tag => {
          const tagDiv = document.createElement("div");
          tagDiv.className = "demo-tag";
          tagDiv.style.display = "flex";
          tagDiv.textContent = tag;
          tagsContainer.appendChild(tagDiv);
        });*/
        updateDefaultTagsUI(tagsContainer, job.tags);

        cloneBlocked.querySelector(".qty").textContent = job.quantity;
        cloneBlocked.querySelector(".weight").textContent = job.filamentWeight || '--';
        cloneBlocked.querySelector(".time").textContent = job.printTime;

        const distributeCheckbox = cloneBlocked.querySelector(".file-text.jobs .w-embed input[type='checkbox']");
        if (distributeCheckbox) {
          distributeCheckbox.checked = job.distribute;
        }

        cloneBlocked.dataset.jobId = job.jobID;

        blockedBackground.appendChild(cloneBlocked);
        }
      } else {
        job.matchingPrinters.forEach(p => {
        });
        
        const clone = queuedJobTemplate.cloneNode(true);
        clone.style.display = "flex";
        clone.removeAttribute('id');

        clone.querySelector(".filename").textContent = job.fileName;
        clone.querySelector(".jobs.ul").textContent = `${job.matchingPrinters.length} Matching`;

        const tagsContainer = clone.querySelector(".tags .default-file-tags");
        tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
        /*job.tags.forEach(tag => {
          const tagDiv = document.createElement("div");
          tagDiv.className = "demo-tag";
          tagDiv.style.display = "flex";
          tagDiv.textContent = tag;
          tagsContainer.appendChild(tagDiv);
        });*/
        updateDefaultTagsUI(tagsContainer, job.tags);

        // Update matching printers popup
        const popup = clone.querySelector(".matching-printers-popup");
        const printerTextTemplate = popup.querySelector(".matching-printers-text");
        popup.querySelectorAll(".matching-printers-text").forEach(el => el.remove());

        if (job.matchingPrinterNames.length > 0) {
          const container = popup.querySelector(".div-block-453") || popup;
          job.matchingPrinters.forEach(p => {
            const printerText = printerTextTemplate.cloneNode(true);
            printerText.textContent = `${p.name} - ${p.status.toUpperCase()}`;
            container.appendChild(printerText);
          });
        }

        const hoverTarget = clone.querySelector(".file-text.jobs.ul");
        if (job.matchingPrinterNames.length > 0) {
          hoverTarget.addEventListener("mouseenter", () => {
            popup.style.display = "block";
          });
          hoverTarget.addEventListener("mouseleave", () => {
            popup.style.display = "none";
          });
        } else {
          popup.style.display = "none";
        }

        clone.querySelector(".qty").textContent = job.quantity;
        clone.querySelector(".weight").textContent = job.filamentWeight || '--';
        clone.querySelector(".time").textContent = job.printTime;

        const distributeCheckbox = clone.querySelector(".file-text.jobs .w-embed input[type='checkbox']");
        if (distributeCheckbox) {
          distributeCheckbox.checked = job.distribute;
        }

        clone.dataset.jobId = job.jobID;

        queueBackground.appendChild(clone);
        }
      
      });

        // ✅ Assign jobs ONCE, after UI rendering
    assignJobsToPrinters(confirmedJobs);
    
    // Deselect all file tabs after sending
document.querySelectorAll('.file-tab.selected').forEach(tab => {
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

    ["Queued", "In Production", "Collect", "Blocked"].forEach(countVisibleJobs);

    fileSelectionOrder = [];
  });
}
});

// Plus/Minus Buttons for Quantity and Temp  src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/qty-temp-btn.js"
document.addEventListener("click", function (e) {
  const fileBlock = e.target.closest(".demo-q-file");
  const jobID = fileBlock?.dataset.jobId;
  const job = jobID ? jobDataMap.get(jobID) : null;
  if (!job) return;

  // 🔢 Quantity
  if (e.target.matches(".qtyplus") || e.target.matches(".qtyminus")) {
    const wrapper = e.target.closest(".div-block-439.q-qty");
    const input = wrapper?.querySelector("input[type='number']");
    if (input) {
      let value = parseInt(input.value) || 1;
      if (e.target.matches(".qtyplus")) value++;
      if (e.target.matches(".qtyminus") && value > 1) value--;
      input.value = value;

      job.quantity = value;
      job.jobProgQueued = Math.max(0, value - (job.jobProgProd + job.jobProgCol + job.jobProgDone));
      jobDataMap.set(jobID, structuredClone(job));
      e.preventDefault();
    }
  }

  // 🌡️ Temp
  if (e.target.matches(".tempplus") || e.target.matches(".tempminus")) {
    const wrapper = e.target.closest(".div-block-439.q-temp");
    const input = wrapper?.querySelector("input[type='number']");
    if (input) {
      let value = parseInt(input.value) || 29;
      if (e.target.matches(".tempplus")) value++;
      if (e.target.matches(".tempminus") && value > 0) value--;
      input.value = value;

      job.releaseTemp = value;
      jobDataMap.set(jobID, structuredClone(job));
      e.preventDefault();
    }
  }
});

function countVisibleJobs(tabName) {
    console.log("countVisibleJobs");
  const tabPane = document.querySelector(`.w-tab-pane[data-w-tab="${tabName}"]`);
  if (!tabPane) return;
  const jobSelector = (tabName === "Blocked") ? '.queued-job.blocked' : (tabName === "In Production") ? '.queued-job.in-progress' : (tabName === "Collect") ? '.queued-job.to-collect' : '.queued-job';
  const jobs = tabPane.querySelectorAll(jobSelector);
  let realJobCount = 0;
  jobs.forEach(job => { if (!job.id) realJobCount++; });
  const counterMap = {
    "Queued": "q-num",
    "In Production": "prod-num",
    "Collect": "col-num",
    "Blocked": "block-num"
  };
  const counter = document.getElementById(counterMap[tabName]);
  if (counter) counter.textContent = realJobCount;
}

// Queue tagging src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/queue-tagging.js"
function updateDefaultTagsUI(container, tagList) {
  console.log("updateDefaultTagsUI");

  const defaultTagsContainer = container;
  if (!defaultTagsContainer) {
    console.warn("⚠️ [updateDefaultTagsUI] No container provided:", container);
    return;
  }

  // Remove all non-modal tags first
  Array.from(defaultTagsContainer.querySelectorAll('.demo-tag:not(.in-modal)')).forEach(tagEl => {
    tagEl.remove();
  });

  // Now, re-add tags according to the rule
  const totalTags = tagList.length;

  tagList.forEach((tag, index) => {
    const category = tagRepoMap.get(tag);
    
    if (index < 2 || totalTags <= 3) {
      // ➡️ Normal tags for first 2 (or all if 3 or fewer)
      const div = document.createElement("div");
      div.className = "demo-tag";
      div.style.display = "flex";

      const inner = document.createElement("div");
      inner.className = "demo-tag-text";
      inner.textContent = tag;

      if (category === "color" && tag !== "White") {
        div.classList.add(tag.toLowerCase()); // Ensure CSS class matches
      } else if (category === "color" && tag === "White") {
        div.classList.add(tag.toLowerCase()); // Ensure CSS class matches
        inner.classList.add("printer"); // Ensure CSS class matches
      }

      div.appendChild(inner);
      defaultTagsContainer.appendChild(div);

    } else if (index === 2) {
      // ➡️ Fourth tag becomes "additional-tags"
      const div = document.createElement("div");
      div.className = "demo-tag additional-tags";
      div.style.display = "flex";

      const moreCount = totalTags - 2;
      div.textContent = `+${moreCount} More`;

      defaultTagsContainer.appendChild(div);

    } else {
      // ➡️ Skip adding tags beyond 3
    }
  });

}

function addTagToJob(jobID, tag) {
  console.log("addTagToJob");
  const job = jobDataMap.get(jobID);
  if (!job) return;

  if (!Array.isArray(job.tags)) job.tags = [];

  if (!job.tags.includes(tag)) {
    job.tags.push(tag);
    job.tagsNum = job.tags.length;
    jobDataMap.set(jobID, structuredClone(job));
  }
}

function removeTagFromJob(jobID, tag) {
  console.log("removeTagFromJob");
  const job = jobDataMap.get(jobID);
  if (!job || !Array.isArray(job.tags)) return;

  const index = job.tags.indexOf(tag);
  if (index !== -1) {
    job.tags.splice(index, 1);
    job.tagsNum = job.tags.length;
    jobDataMap.set(jobID, structuredClone(job));
  }
}

function addTagToModal(tag, container) {
  console.log("addTagToModal");
  const exists = Array.from(container.querySelectorAll('.demo-tag.in-modal'))
    .some(el => el.style.display !== 'none' && el.textContent.trim() === tag);
  if (exists) return;

  const div = document.createElement("div");
  div.className = "demo-tag in-modal";
  div.style.display = "flex";

  const inner = document.createElement("div");
  inner.className = "demo-tag-text in-modal";
  inner.textContent = tag;

  div.appendChild(inner);
  container.appendChild(div);
}

function removeTagFromModal(tag, container) {
  console.log("removeTagFromModal");
  const tagEl = Array.from(container.querySelectorAll('.demo-tag.in-modal'))
    .find(el => el.textContent.trim() === tag && el.style.display !== 'none');
  if (tagEl) tagEl.remove();
}

function initTagAndDistributeListeners() {
  console.log("initTagAndDistributeListeners");
  document.querySelectorAll('.add-tag').forEach(addTagBtn => {
    const fileBlock = addTagBtn.closest('.demo-q-file');
    const jobID = fileBlock?.dataset.jobId;
    if (!jobID) return;

    let job = jobDataMap.get(jobID);
    if (!job) return;

    const modal = fileBlock.querySelector('.add-tag-modal');
    const modalBg = fileBlock.querySelector('.tag-modal-background');
    const currentTagsWrap = modal.querySelector('.current-tags');
    const tagListWrap = modal.querySelector('.tag-list-wrap');

    // Clean current tags in modal
    currentTagsWrap.querySelectorAll(".demo-tag.in-modal:not([style*='display: none'])").forEach(tag => tag.remove());
    job.tags.forEach(tag => addTagToModal(tag, currentTagsWrap));
    updateDefaultTagsUI(fileBlock.querySelector('.default-file-tags.tags'), job.tags);

    // ✅ Distribute checkbox (updated to use jobID)
    const distCheckbox = fileBlock.querySelector('.distribute-checkbox');
    if (distCheckbox) {
      distCheckbox.addEventListener('change', function () {
        job.distribute = this.checked;
        jobDataMap.set(jobID, structuredClone(job));
      });
    }

    // Add tag button opens modal
    addTagBtn.addEventListener('click', e => {
      e.preventDefault();

      modal.style.display = 'block';
      if (modalBg) modalBg.style.display = 'block';
          
      tagListWrap.innerHTML = "";
      const listTagTemplate = document.getElementById("tag-in-list-template");

      // Show only unselected tags
      tagRepoMap.forEach((category, name) => {

        const tag = name;

        if (job.tags.includes(name)) {
          return;
        }

        const tagWrap = document.createElement("div");
        tagWrap.className = "tag-in-list-wrap";
        tagWrap.style.display = "flex";
        tagListWrap.appendChild(tagWrap);

        const tagEl = document.createElement("div");
        tagEl.className = "tag-name-in-list";
        tagEl.textContent = name;
        tagWrap.appendChild(tagEl);

        if (category === "color") {
          tagEl.classList.add(name.toLowerCase());
        }

        const tagEditWrap = document.createElement("div");
        tagEditWrap.className = "div-block-456";
        tagWrap.appendChild(tagEditWrap);
        
        const tagEdit = document.createElement("button");
        tagEdit.className = "edit-tag-button";
        tagEditWrap.appendChild(tagEdit);
        
        const tagDel = document.createElement("button");
        tagDel.className = "edit-tag-button delete";
        tagEditWrap.appendChild(tagDel);

        tagWrap.onclick = () => {

          addTagToJob(jobID, tag);
          addTagToModal(tag, currentTagsWrap);

          const defaultTagsContainer = fileBlock.querySelector('.default-file-tags.tags');
          if (defaultTagsContainer) {
            const updatedJob = jobDataMap.get(jobID);
            updateDefaultTagsUI(defaultTagsContainer, updatedJob?.tags || []);
          }

          if (tagWrap) tagWrap.style.display = 'none';
        };
      });

      currentTagsWrap.onclick = (e) => {
        const clicked = e.target.closest('.demo-tag.in-modal');
        if (!clicked) return;

        const tag = clicked.textContent.trim();

        removeTagFromJob(jobID, tag);
        removeTagFromModal(tag, currentTagsWrap);

        const defaultTagsContainer = fileBlock.querySelector('.default-file-tags.tags');
        if (defaultTagsContainer) {
          const updatedJob = jobDataMap.get(jobID);
          updateDefaultTagsUI(defaultTagsContainer, updatedJob?.tags || []);
        }

        const restoreWrap = Array.from(tagListWrap.querySelectorAll('.tag-in-list-wrap')).find(w =>
          w.querySelector('.tag-name-in-list')?.textContent.trim() === tag
        );
        if (restoreWrap) restoreWrap.style.display = 'flex';

        if (!restoreWrap) {
            const category = tagRepoMap.get(tag);
  if (!category) {
    console.warn(`Category not found for tag: ${tag}`);
    return;
  }

  const tagWrap = document.createElement("div");
  tagWrap.className = "tag-in-list-wrap";
  tagWrap.style.display = "flex";
  tagListWrap.prepend(tagWrap);

  const tagEl = document.createElement("div");
  tagEl.className = "tag-name-in-list";
  tagEl.textContent = tag;
  tagWrap.appendChild(tagEl);

  if (category === "color") {
    tagEl.classList.add(tag.toLowerCase());
  }

  const tagEditWrap = document.createElement("div");
  tagEditWrap.className = "div-block-456";
  tagWrap.appendChild(tagEditWrap);

  const tagEdit = document.createElement("button");
  tagEdit.className = "edit-tag-button";
  tagEditWrap.appendChild(tagEdit);

  const tagDel = document.createElement("button");
  tagDel.className = "edit-tag-button delete";
  tagEditWrap.appendChild(tagDel);
          tagWrap.onclick = () => {
            addTagToJob(jobID, tag);
            addTagToModal(tag, currentTagsWrap);

            const defaultTagsContainer = fileBlock.querySelector('.default-file-tags.tags');
            if (defaultTagsContainer) {
              const updatedJob = jobDataMap.get(jobID);
              updateDefaultTagsUI(defaultTagsContainer, updatedJob?.tags || []);
            }

            if (tagWrap) tagWrap.style.display = 'none';
          };
        }
      };
    });
  });
}
// Sends jobs to printers and prints    src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/new-job-printer-handling.js"
function assignJobsToPrinters(jobs) {
  console.log("assignJobsToPrinters");

  const assignedPrinters = new Set(); // Used only during this assignment pass

  for (const job of jobs) {
    const matchingPrinters = job.matchingPrinterNames || [];

    // ✅ Recalculate queued iterations based on quantity and current progress
    const totalProgress = job.jobProgProd + job.jobProgCol + job.jobProgDone;
    job.jobProgQueued = Math.max(0, job.quantity - totalProgress);

    if (matchingPrinters.length === 0 || job.jobProgQueued <= 0) {
      continue;
    }

    const availablePrinters = matchingPrinters.filter(p =>
      isPrinterIdle(p) && !assignedPrinters.has(p)
    );

    if (job.distribute) {
      const assignCount = Math.min(availablePrinters.length, job.jobProgQueued);

      for (let i = 0; i < assignCount; i++) {
        const printerName = availablePrinters[i];
        const printerCard = findPrinterCardByName(printerName);
        const jobDiv = findJobDivByID(job.jobID);
        if (!printerCard) continue;

        // Mark this printer as taken during this pass
        assignedPrinters.add(printerName);

        // Move one iteration into production
        assignJobToPrinter(printerCard, job);
      }

    } else {
      // Non-distributed job: entire job goes to one printer
      if (job.assignedPrinterName) {
        continue;
      }

      const printerName = availablePrinters[0];
      if (!printerName) {
        console.warn(`⚠️ No IDLE compatible printer for non-distributed job ${job.jobID}`);
        continue;
      }

      const printerCard = findPrinterCardByName(printerName);
      if (!printerCard) continue;

      assignedPrinters.add(printerName);

      // Lock this printer to the job
      job.assignedPrinterName = printerName;

      assignJobToPrinter(printerCard, job);
    }
  }
}

function findPrinterCardByName(printerName) {
  console.log("findPrinterCardByName");
  const printerCards = document.querySelectorAll(".demo-printer-card");
  for (const card of printerCards) {
    if (card.id === "printer-template") continue; // 🚫 Skip template
    const nameEl = card.querySelector(".demo-printer-name");
    if (nameEl && nameEl.textContent.trim() === printerName) {
      return card;
    }
  }
  console.warn(`⚠️ Printer card not found for "${printerName}"`);
  return null;
}

function isPrinterIdle(printerName) {
  console.log("isPrinterIdle");
  const card = findPrinterCardByName(printerName);
  if (!card) return false;
  const statusEls = card.querySelectorAll(".demo-printer-status-text");
  for (const el of statusEls) {
    if (el.textContent.trim().toUpperCase() === "IDLE") {
      return true;
    }
  }
  return false;
}

function populatePrinterCard(card, job, currentIteration, quantity) {
  console.log("populatePrinterCard");

  const printerName = card.querySelector(".demo-printer-name")?.textContent.trim(); 
  if (!printerName || !printerDataMap.has(printerName)) {
    console.warn(`❌ Printer data not found for "${printerName}"`);
    return;
  }
  const printerData = printerDataMap.get(printerName);

  const printName = card.querySelector(".demo-printer-printname");
  const qtyText = card.querySelector(".demo-printer-smltxt:not(.time)"); // The "1 of 2" type qty
  const timeText = card.querySelector(".demo-printer-smltxt.time"); // 🔥 Correct target for time

  if (printName) printName.textContent = job.fileName;
  if (qtyText) qtyText.textContent = `${currentIteration} of ${quantity}`;
  if (timeText) timeText.textContent = `0% - ${job.printHours}h ${job.printMins}m remaining`;

  const filamentSpool = card.querySelector(".filament-icon.fill");

  const jobFilamentWeight = job.filamentWeight;
  const printerFilamentRemaining = printerData.filamentRemaining;

  const filamentRemainingConverted = Math.round(((printerData.filamentRemaining * 360) / 1000));
  const jobFilamentConverted = Math.round(((job.filamentWeight * 360) / 1000));

  const filamentLeft = filamentRemainingConverted - jobFilamentConverted;

  const spoolBlack = 360 - filamentRemainingConverted;
  const spoolGrey1 = 360 - filamentRemainingConverted;
  const spoolGrey2 = 360 - filamentLeft;
  const spoolWhite = 360 - filamentLeft;
  
  filamentSpool.style.background = "conic-gradient(black " + spoolBlack + "deg,grey " + spoolGrey1 + "deg " + spoolGrey2 + "deg,white " + spoolWhite + "deg)";

  printerData.filamentRemaining -= jobFilamentWeight;
  printerDataMap.set(printerName, printerData);

  const filamentText = card.querySelector(".demo-filament-remaining");
  filamentText.textContent = printerData.filamentRemaining + "g Remaining";

  const filamentMenuOpen = card.querySelector(".demo-printer-filament");
  const filamentModal = filamentMenuOpen.querySelector(".printer-filament-popup");

  const modalSpoolWrap = filamentModal.querySelector(".filament-spool-popup-wrap");
  const modalSpool = modalSpoolWrap.querySelector(".filament-icon.fill");

  modalSpool.style.background = "conic-gradient(black " + spoolBlack + "deg,grey " + spoolGrey1 + "deg " + spoolGrey2 + "deg,#60a5fa " + spoolWhite + "deg)";

  const modalFilamentLevel = filamentModal.querySelector(".filament-input-printer");
  modalFilamentLevel.value = printerData.filamentRemaining;

  setPrinterToPrinting(card);
  simulatePrinting(card, job);
}
function findPrinterCardByName(printerName) {
  console.log("findPrinterCardByName");
  const printerCards = document.querySelectorAll(".demo-printer-card");
  for (const card of printerCards) {
    const nameEl = card.querySelector(".demo-printer-name");
    if (nameEl && nameEl.textContent.trim() === printerName) {
      return card;
    }
  }
  console.warn(`⚠️ Printer card not found for "${printerName}"`);
  return null;
}

function findJobDivByID(jobID) {
  console.log("findJobDivByID");
  const job = jobDataMap.get(jobID);
  const jobDivs = document.querySelectorAll(".queued-job");
  for (const jobDiv of jobDivs) {
    const divJobID = jobDiv.dataset.jobId;
    if (divJobID === jobID){
      return jobDiv;
    }
  }
  console.warn(`Div not found for ${jobID}`);
  return null;
}

function jobToProduction(jobID, jobDiv) {
  console.log("jobToProduction");
  if (!jobDiv) return;
  jobDiv.remove();

  const job = jobDataMap.get(jobID);
  const prodBackground = document.querySelector(".demo-q-background.in-production");
  const prodJobTemplate = document.getElementById("in-production-job-template");

  const cloneProd = prodJobTemplate.cloneNode(true);
  cloneProd.style.display = "flex";
  cloneProd.removeAttribute("id");
  cloneProd.dataset.jobId = jobID;

  // Basic info
  cloneProd.querySelector(".filename").textContent = job.fileName;
  cloneProd.querySelector(".jobs.ul").textContent = `${job.jobProgProd} Active`;
  cloneProd.querySelector(".qty").textContent = job.quantity;
  cloneProd.querySelector(".weight").textContent = job.filamentWeight || "--";
  cloneProd.querySelector(".time").textContent = job.jobPrintHours + "h " + job.jobPrintMins + "m";

  // Tags
  const tagsContainer = cloneProd.querySelector(".tags .default-file-tags");
  tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
  /*job.tags.forEach(tag => {
    const tagDiv = document.createElement("div");
    tagDiv.className = "demo-tag";
    tagDiv.style.display = "flex";
    tagDiv.textContent = tag;
    tagsContainer.appendChild(tagDiv);
  });*/
  updateDefaultTagsUI(tagsContainer, job.tags);

  // Distribute checkbox
  const distributeCheckbox = cloneProd.querySelector(".file-text .w-embed input[type='checkbox']");
  if (distributeCheckbox) {
    distributeCheckbox.checked = job.distribute;
  }

  // Progress bars
  cloneProd.querySelector(".demo-progress.done").style.width =
    ((job.jobProgCol + job.jobProgDone) / job.quantity * 100) + "%";
  cloneProd.querySelector(".demo-progress.printing").style.width =
    (job.jobProgProd / job.quantity * 100) + "%";

  // Progress popup
  const progressPopup = cloneProd.querySelector(".job-progress-popup");
  const progressRemaining = progressPopup.querySelector(".job-progress-popup-text.lighter.remaining");
  const progressPrinting = progressPopup.querySelector(".job-progress-popup-text.lighter.in-progress");
  const progressDone = progressPopup.querySelector(".job-progress-popup-text.lighter.done");

  progressRemaining.textContent = job.jobProgQueued;
  progressPrinting.textContent = job.jobProgProd;
  progressDone.textContent = (job.jobProgCol + job.jobProgDone);
  
  const progPopupHoverTarget = cloneProd.querySelector(".job-progress-wrap");

  progPopupHoverTarget.onmouseenter = () => {
    progressPopup.style.display = "block";
  };
  progPopupHoverTarget.onmouseleave = () => {
    progressPopup.style.display = "none";
  };

  // Matching printers popup
  const printingPopup = cloneProd.querySelector(".matching-printers-popup");
  const container = printingPopup.querySelector(".div-block-453") || printingPopup;
  container.innerHTML = ""; // Clear old content

  job.activePrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    if (p) {
      const printerText = document.createElement("div");
      printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  });

  // Hover logic (bind once)
  const hoverTarget = cloneProd.querySelector(".file-text.jobs.ul");
  hoverTarget.onmouseenter = () => {
    printingPopup.style.display = "block";
  };
  hoverTarget.onmouseleave = () => {
    printingPopup.style.display = "none";
  };

  prodBackground.appendChild(cloneProd);
}


function updateJobInProduction(jobID, jobDiv) {
  console.log("updateJobInProduction");
  if (!jobDiv) return;

  const job = jobDataMap.get(jobID);

  // Update counts
  jobDiv.querySelector(".jobs.ul").textContent = `${job.jobProgProd} Active`;

  // Update popup contents only — do not rebind events
  const printingPopup = jobDiv.querySelector(".matching-printers-popup");
  const container = printingPopup.querySelector(".div-block-453") || printingPopup;
  container.innerHTML = "";

  job.activePrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    if (p) {
      const printerText = document.createElement("div");
      printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  });

  // Update progress popup
  const progressPopup = jobDiv.querySelector(".job-progress-popup");
  const progressRemaining = progressPopup.querySelector(".job-progress-popup-text.lighter.remaining");
  const progressPrinting = progressPopup.querySelector(".job-progress-popup-text.lighter.in-progress");
  const progressDone = progressPopup.querySelector(".job-progress-popup-text.lighter.done");

  progressRemaining.textContent = job.jobProgQueued;
  progressPrinting.textContent = job.jobProgProd;
  progressDone.textContent = (job.jobProgCol + job.jobProgDone);

  // Update progress bars
  jobDiv.querySelector(".demo-progress.done").style.width =
    ((job.jobProgCol + job.jobProgDone) / job.quantity * 100) + "%";
  jobDiv.querySelector(".demo-progress.printing").style.width =
    (job.jobProgProd / job.quantity * 100) + "%";
}



function setPrinterToPrinting(card) {
  console.log("setPrinterToPrinting");
  if (!card) return;
  
  const printerName = card.querySelector(".demo-printer-name")?.textContent.trim();
  const printerData = printerDataMap.get(printerName);
  if (printerData) printerData.printerStatus = "printing";

  card.classList.add("status-printing");
  card.querySelectorAll("*").forEach(child => {
    child.classList.add("status-printing");
  });

  const statusBlock = card.querySelector(".demo-printer-status");
  if (statusBlock) {
    const statusTexts = statusBlock.querySelectorAll(".demo-printer-status-text");
    statusTexts.forEach(el => {
      const text = el.textContent.trim().toUpperCase();
      if (text === "IDLE") {
        el.textContent = "PRINTING"; // Only change "IDLE", NOT "•"
      }
    });
  }

}

function setPrinterToIdle(card) {
  console.log("setPrinterToIdle");
  if (!card) return;
  
  const printerName = card.querySelector(".demo-printer-name")?.textContent.trim();
  const printerData = printerDataMap.get(printerName);
  if (printerData) printerData.printerStatus = "printing";

  if (card.classList.contains("status-suspended")){
    card.classList.remove("status-suspended");
    card.querySelectorAll("*").forEach(child => {
      child.classList.remove("status-suspended");
    });
  } else if (card.classList.contains("status-error")){
    card.classList.remove("status-error");
    card.querySelectorAll("*").forEach(child => {
      child.classList.remove("status-error");
    });
  }

  const statusBlock = card.querySelector(".demo-printer-status");
  if (statusBlock) {
    const statusTexts = statusBlock.querySelectorAll(".demo-printer-status-text");
    statusTexts.forEach(el => {
      const text = el.textContent.trim().toUpperCase();
      if (text === "FILAMENT OUT" || text === "SUSPENDED") {
        el.textContent = "IDLE"; // Only change text, NOT "•"
      }
    });
  }

}

function setPrinterToSuspended(card) {
  console.log("setPrinterToSuspended");
  if (!card) return;
  
  const printerName = card.querySelector(".demo-printer-name")?.textContent.trim();
  const printerData = printerDataMap.get(printerName);
  if (printerData) printerData.printerStatus = "printing";

  card.classList.add("status-suspended");
  card.querySelectorAll("*").forEach(child => {
    child.classList.add("status-suspended");
  });

  const statusBlock = card.querySelector(".demo-printer-status");
  if (statusBlock) {
    const statusTexts = statusBlock.querySelectorAll(".demo-printer-status-text");
    statusTexts.forEach(el => {
      const text = el.textContent.trim().toUpperCase();
      if (text === "IDLE" || text === "PRINTING" || text === "FILAMENT OUT") {
        el.textContent = "SUSPENDED"; // Only change text, NOT "•"
      }
    });
  }
}

function setPrinterToError(card) {
  console.log("setPrinterToError - filament out");
  if (!card) return;
  
  const printerName = card.querySelector(".demo-printer-name")?.textContent.trim();
  const printerData = printerDataMap.get(printerName);
  if (printerData) printerData.printerStatus = "printing";

  card.classList.add("status-error");
  card.querySelectorAll("*").forEach(child => {
    child.classList.add("status-error");
  });

  const statusBlock = card.querySelector(".demo-printer-status");
  if (statusBlock) {
    const statusTexts = statusBlock.querySelectorAll(".demo-printer-status-text");
    statusTexts.forEach(el => {
      const text = el.textContent.trim().toUpperCase();
      if (text === "IDLE" || text === "PRINTING" || text === "SUSPENDED") {
        el.textContent = "FILAMENT OUT"; // Only change text, NOT "•"
      }
    });
  }
}

function simulatePrinting(printerCard, job) {
  console.log("simulatePrinting");
  if (!printerCard || !job) return;

  const progressBar = printerCard.querySelector(".af3d-demo-progress-bar");
  const timeText = printerCard.querySelector(".demo-printer-smltxt.time"); // the "0% - 1h 20m" text

  if (!progressBar || !timeText) {
    console.warn(`⚠️ Progress bar or time text not found on printer ${printerCard}`);
    return;
  }

  const totalPrintMinutes = job.printHours * 60 + job.printMins;
  const totalDurationInSeconds = totalPrintMinutes / 5; // 5 minutes = 1 second real-time

  let elapsedSeconds = 0;

  const interval = setInterval(() => {
    elapsedSeconds++;

    const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalDurationInSeconds) * 100));
    progressBar.style.width = `${progressPercent}%`;

    const minutesRemaining = Math.max(0, totalPrintMinutes - elapsedSeconds);
    const hoursLeft = Math.floor(minutesRemaining / 60);
    const minsLeft = minutesRemaining % 60;

    timeText.textContent = `${progressPercent}% - ${hoursLeft}h ${minsLeft}m remaining`;

    if (progressPercent >= 100) {
      clearInterval(interval);

      job.jobProgProd--;
      job.jobProgCol++;
      job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;
  
      finishPrint(printerCard, job.jobID);
    }
  }, 1000);
}

function finishPrint(printerCard, jobID) {
  console.log("finishPrint");
  if (!printerCard) return;
  const job = jobDataMap.get(jobID);

  // Remove status-printing classes
  printerCard.classList.remove("status-printing");
  printerCard.querySelectorAll("*").forEach(child => child.classList.remove("status-printing"));

  // Reset the printer status text inside .demo-printer-status
  const statusBlock = printerCard.querySelector(".demo-printer-status");
  if (statusBlock) {
    const name = printerCard.querySelector(".demo-printer-name")?.textContent.trim() || "Printer";
    statusBlock.innerHTML = `
      <div class="demo-printer-name">${name}</div>
      <div class="demo-printer-status-tag">
        <div class="demo-printer-status-text">•</div>
        <div class="demo-printer-status-text">IDLE</div>
      </div>
    `;
  }
  
  // Reset printer status
  const printerName = printerCard.querySelector(".demo-printer-name")?.textContent.trim();
if (printerName && printerDataMap.has(printerName)) {
  printerDataMap.get(printerName).printerStatus = "idle"; // 🛠️ Reset status in the DATA too
}

  // Reset print name
  const printName = printerCard.querySelector(".demo-printer-printname");
  if (printName) {
    printName.textContent = "--";
  }

  // Reset quantity text
  const qtyText = printerCard.querySelector(".demo-printer-smltxt:not(.time)");
  if (qtyText) {
    qtyText.textContent = "- of -";
  }

  // Reset time text
  const timeText = printerCard.querySelector(".demo-printer-smltxt.time");
  if (timeText) {
    timeText.textContent = "Idle";
  }

  // Reset progress bar
  const progressBar = printerCard.querySelector(".af3d-demo-progress-bar");
  if (progressBar) {
    progressBar.style.width = "0%";
  }

  const filamentSpool = printerCard.querySelector(".filament-icon.fill:not(.in-popup)");
    const filamentLeftOnSpool = ((printerDataMap.get(printerName).filamentRemaining * 360) / 1000);
    const filamentSpoolDeg = 360 - filamentLeftOnSpool;
    
    filamentSpool.style.background = "conic-gradient(black " + filamentSpoolDeg + "deg,white " + filamentSpoolDeg + "deg)";

    // Filament modal click

    const filamentMenuOpen = printerCard.querySelector(".demo-printer-filament");
    const filamentModal = filamentMenuOpen.querySelector(".printer-filament-popup");

    if (!filamentModal) return;
      
    const modalSpoolWrap = filamentModal.querySelector(".filament-spool-popup-wrap");
    const modalSpool = modalSpoolWrap.querySelector(".filament-icon.fill.in-popup");

    modalSpool.style.background = "conic-gradient(black " + filamentSpoolDeg + "deg,#60a5fa " + filamentSpoolDeg + "deg)";

  if (job && Array.isArray(job.activePrinterNames)) {
    job.activePrinterNames = job.activePrinterNames.filter(name => name !== printerName);

    // 🔁 Adjust job progress counts
    job.jobProgProd = Math.max(0, job.jobProgProd - 1);
    job.jobProgCol = (job.jobProgCol || 0) + 1;
    job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;

    updateJobStatus(job.jobID);         // Ensure jobStatus = 'c' when appropriate
    promoteOrUpdateJob(job.jobID);      // Trigger UI update for progress bar + active printer list    
    promoteOrUpdateCollectJob(job.jobID);
  }

  ["Queued", "In Production", "Collect", "Blocked"].forEach(countVisibleJobs);

  const printerData = printerDataMap.get(printerName);
  if (printerData.filamentRemaining <= 20) {
    setPrinterToError(card);
  }
  
  // 🔵 New addition: trigger looking for a new job after finishing
  setTimeout(() => {
    findAndAssignNextJob(printerCard);
  }, 500);
}

function findAndAssignNextJob(printerCard) {
  console.log("findAndAssignNextJob");
  const printerName = printerCard.querySelector(".demo-printer-name")?.textContent.trim();
  if (!printerName) {
    console.warn("⚠️ Printer name not found.");
    return;
  }

  for (const job of jobDataMap.values()) {
    if (job.jobProgQueued <= 0) continue;

    const matchingPrintersRaw = getMatchingPrintersForTags(job.tags, job.filamentWeight) || [];
    const matchingPrinters = matchingPrintersRaw.map(p =>
      typeof p === 'string' ? p : p.name
    );
        
    if (job.distribute) {
      if (job.jobProgQueued > 0 && matchingPrinters.includes(printerName)) {
        if (matchingPrinters.includes(printerName)){
          assignJobToPrinter(printerCard, job);
          break;
        }
      }
    } else {
      if (job.assignedPrinterName) {
        if (job.assignedPrinterName === printerName) {
        assignJobToPrinter(printerCard, job);
        break;
        } else {
        continue;
        }
      } else {
        // ⚡ NO assigned printer yet
        job.assignedPrinterName = printerName;
        assignJobToPrinter(printerCard, job);
        break;
      }
    }
  }
}

function assignJobToPrinter(printerCard, job) {
  console.log("assignJobToPrinter");
  if (!printerCard || !job) return;

  const printerName = printerCard.querySelector(".demo-printer-name")?.textContent.trim();
  if (!printerName) return;
  
    // Check if the printer is actually idle
  if (!isPrinterIdle(printerName)) {
    console.warn(`🚫 ${printerName} is not idle.`);
    return;
  }

  const currentIteration = job.jobProgProd + job.jobProgCol + job.jobProgDone + 1;

  // Lock printer immediately
  //setPrinterToPrinting(printerCard);

  // Update job progress
  job.jobProgQueued = Math.max(0, job.jobProgQueued - 1);
  job.jobProgProd++;
  job.jobProgressTotal = + job.jobProgProd + job.jobProgCol + job.jobProgDone;
  

  // Populate printer
  populatePrinterCard(printerCard, job, currentIteration, job.quantity);

  // ➡️ Printer tracking
  if (job.distribute) {
    if (!job.assignedPrinterNames.includes(printerName)) {
      job.assignedPrinterNames.push(printerName);
    }
  } else {
    if (!job.assignedPrinterName) {
      job.assignedPrinterName = printerName;
    }
  }

  if (!job.activePrinterNames.includes(printerName)) {
    job.activePrinterNames.push(printerName);
  }

  jobDataMap.set(job.jobID, structuredClone(job));

  if (!job.promotedToProduction) {
  const jobDiv = findJobDivByID(job.jobID);
  jobToProduction(job.jobID, jobDiv);
  job.promotedToProduction = true;
  jobDataMap.set(job.jobID, structuredClone(job));
} else {
  const prodDiv = findProdJobDivByID(job.jobID);
  updateJobInProduction(job.jobID, prodDiv);
  jobDataMap.set(job.jobID, structuredClone(job));
  }
  updateJobStatus(job.jobID);
  
  ["Queued", "In Production", "Collect", "Blocked"].forEach(countVisibleJobs);
}

function findProdJobDivByID(jobID) {
  console.log("findProdJobDivByID");
  return document.querySelector(`.w-tab-pane[data-w-tab="In Production"] [data-job-id="${jobID}"]`);
}

function updateJobStatus(jobID) {
  console.log("updateJobStatus");
  const job = jobDataMap.get(jobID);

  if (job.jobProgProd + job.jobProgCol + job.jobProgDone === 0){
    job.jobStatus = 'q';
    jobDataMap.set(jobID, structuredClone(job));
  } else if (job.jobProgProd > 0) {
    job.jobStatus = 'p';
    jobDataMap.set(jobID, structuredClone(job));
  } else if (job.jobProgProd === 0 && job.jobProgQueued === 0 && job.jobProgCol > 0){
    job.jobStatus = 'c';
    jobDataMap.set(jobID, structuredClone(job));
  } else {
    job.jobStatus = 'd';
    jobDataMap.set(jobID, structuredClone(job));
  }
}

function promoteOrUpdateJob(jobID) {
  console.log("promoteOrUpdateJob");
  const jobDiv = findJobDivByID(jobID);
  const inProdContainer = document.querySelector('.w-tab-pane[data-w-tab="In Production"]');
  const alreadyInProd = inProdContainer?.querySelector(`[data-job-id="${jobID}"]`);

  if (jobDiv && !alreadyInProd) {
    jobToProduction(jobID, jobDiv);  // First iteration promotion
  } else {
    updateJobInProduction(jobID, jobDiv);  // Visual update only
  }
}

function jobToCollect(jobID, jobDiv) {
  console.log("jobToCollect");
  if (!jobDiv) return;

  const job = jobDataMap.get(jobID);
  const colBackground = document.querySelector(".demo-q-background.collect");
  const colJobTemplate = document.getElementById("collect-job-template");

    // 👇 If fully printed and nothing left in production, remove from In Production tab
    if (job.jobProgProd === 0 && job.jobProgQueued === 0) {
      const prodDiv = findProdJobDivByID(jobID);
      if (prodDiv) prodDiv.remove();
    }

  const cloneCol = colJobTemplate.cloneNode(true);
  cloneCol.style.display = "flex";
  cloneCol.removeAttribute("id");
  cloneCol.dataset.jobId = jobID;

  // Basic info
  cloneCol.querySelector(".filename").textContent = job.fileName;
  if (job.distribute){
    cloneCol.querySelector(".jobs.ul").textContent = `${job.assignedPrinterNames.length} Printers`;
  } else {
    cloneCol.querySelector(".jobs.ul").textContent = `1 Printer`;
  }
  cloneCol.querySelector(".qty").textContent = job.quantity;
  cloneCol.querySelector(".weight").textContent = job.filamentWeight || "--";
  
  // Collected input
  const colInput = cloneCol.querySelector(".collect-input");
  colInput.setAttribute("value", job.jobProgCol);
  colInput.setAttribute("max", job.jobProgCol);

  // Tags
  const tagsContainer = cloneCol.querySelector(".tags .default-file-tags");
  tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
  /*job.tags.forEach(tag => {
    const tagDiv = document.createElement("div");
    tagDiv.className = "demo-tag";
    tagDiv.style.display = "flex";
    tagDiv.textContent = tag;
    tagsContainer.appendChild(tagDiv);
  });*/
  updateDefaultTagsUI(tagsContainer, job.tags);

  // Progress bars
  cloneCol.querySelector(".demo-progress.collected").style.width =
    (job.jobProgDone / job.quantity * 100) + "%";
  cloneCol.querySelector(".demo-progress.ready-to-collect").style.width =
    (job.jobProgCol / job.quantity * 100) + "%";

  // Progress popup
  const progressPopupCol = cloneCol.querySelector(".job-progress-popup.collect");
  const progressRemainingCol = progressPopupCol.querySelector(".job-progress-popup-text.lighter.remaining-col");
  const progressToCollect = progressPopupCol.querySelector(".job-progress-popup-text.lighter.to-collect");
  const progressCollected = progressPopupCol.querySelector(".job-progress-popup-text.lighter.collected");

  progressRemainingCol.textContent = (job.quantity - job.jobProgCol - job.jobProgDone);
  progressToCollect.textContent = job.jobProgCol;
  progressCollected.textContent = job.jobProgDone;
  
  const colPopupHoverTarget = cloneCol.querySelector(".job-progress-wrap.collect");
  colPopupHoverTarget.onmouseenter = () => {
    progressPopupCol.style.display = "block";
  };
  colPopupHoverTarget.onmouseleave = () => {
    progressPopupCol.style.display = "none";
  };

  // Matching printers popup
  const collectPopup = cloneCol.querySelector(".matching-printers-popup");
  const container = collectPopup.querySelector(".div-block-453") || collectPopup;
  container.innerHTML = ""; // Clear old content

  if (job.distribute){
  job.assignedPrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    if (p) {
      const printerText = document.createElement("div");
      printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  });
  } else {
    const name = job.assignedPrinterName;
    const p = printerDataMap.get(name);
    if (p) {
      const printerText = document.createElement("div");
     printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  }

  // Hover logic (bind once)
  const hoverTarget = cloneCol.querySelector(".file-text.jobs.ul");
  hoverTarget.onmouseenter = () => {
    collectPopup.style.display = "block";
  };
  hoverTarget.onmouseleave = () => {
    collectPopup.style.display = "none";
  };

  colBackground.appendChild(cloneCol);
}

function updateJobInCollect(jobID, jobDiv) {
  console.log("updateJobInCollect");
  if (!jobDiv) return;

  const job = jobDataMap.get(jobID);

  // Update counts
  if (job.distribute){
    jobDiv.querySelector(".jobs.ul").textContent = `${job.assignedPrinterNames.length} Printers`;
  } else {
    jobDiv.querySelector(".jobs.ul").textContent = `1 Printer`;
  }

  // 👇 If fully printed and nothing left in production, remove from In Production tab
    if (job.jobProgProd === 0 && job.jobProgQueued === 0) {
      const prodDiv = findProdJobDivByID(jobID);
      if (prodDiv) prodDiv.remove();
    }

  // Update popup contents only — do not rebind events
  const collectPopup = jobDiv.querySelector(".matching-printers-popup");
  const container = collectPopup.querySelector(".div-block-453") || collectPopup;
  container.innerHTML = "";

  if (job.distribute){
  job.assignedPrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    if (p) {
      const printerText = document.createElement("div");
      printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  });
  } else {
    const name = job.assignedPrinterName;
    const p = printerDataMap.get(name);
    if (p) {
      const printerText = document.createElement("div");
     printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  }

  // Update progress popup
  const progressPopupCol = jobDiv.querySelector(".job-progress-popup.collect");
  const progressRemainingCol = progressPopupCol.querySelector(".job-progress-popup-text.lighter.remaining-col");
  const progressToCollect = progressPopupCol.querySelector(".job-progress-popup-text.lighter.to-collect");
  const progressCollected = progressPopupCol.querySelector(".job-progress-popup-text.lighter.collected");

  progressRemainingCol.textContent = (job.quantity - job.jobProgCol - job.jobProgDone);
  progressToCollect.textContent = job.jobProgCol;
  progressCollected.textContent = job.jobProgDone;

  // Update progress bars
  jobDiv.querySelector(".demo-progress.collected").style.width =
    (job.jobProgDone / job.quantity * 100) + "%";
  jobDiv.querySelector(".demo-progress.ready-to-collect").style.width =
    (job.jobProgCol / job.quantity * 100) + "%";

  // Collected input
    const colInput = jobDiv.querySelector(".collect-input");
    colInput.setAttribute("value", job.jobProgCol);
    colInput.setAttribute("max", job.jobProgCol);
}

function promoteOrUpdateCollectJob(jobID) {
  console.log("promoteOrUpdateCollectJob");
  const jobDiv = findJobDivByID(jobID);
  const collectContainer = document.querySelector('.w-tab-pane[data-w-tab="Collect"]');
  const alreadyInCollect = collectContainer?.querySelector(`[data-job-id="${jobID}"]`);

  if (jobDiv && !alreadyInCollect) {
    jobToCollect(jobID, jobDiv); // First move to Collect
  } else {
    updateJobInCollect(jobID, alreadyInCollect); // Just update counts or UI
  }
}

document.addEventListener("click", function (e) {
  const button = e.target.closest(".demo-col-button");
  if (!button) return;

  const jobDiv = button.closest(".queued-job.to-collect");
  const jobID = jobDiv?.dataset.jobId;
  if (!jobID) return;

  const job = jobDataMap.get(jobID);
  if (!job) return;

  const input = jobDiv.querySelector(".collect-input");
  if (!input) return;

  const value = parseInt(input.value, 10);
  const collectQty = isNaN(value) ? 0 : Math.min(value, job.jobProgCol);

  if (collectQty <= 0) {
    alert("Please enter a valid amount to collect.");
    return;
  }

  job.jobProgCol -= collectQty;
  job.jobProgDone += collectQty;
  job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;

  jobDataMap.set(jobID, structuredClone(job));

  // If no more to collect, remove job from DOM
  if (job.jobProgCol === 0) {
    jobDiv.remove();
  }

  updateJobStatus(jobID);
  promoteOrUpdateCollectJob(jobID);
  ["Queued", "In Production", "Collect", "Blocked"].forEach(countVisibleJobs);


    // ✅ Add to Job History if fully done
  if (job.jobProgDone === job.quantity) {
    const historyContainer = document.querySelector(".job-history-table");
    const template = document.getElementById("job-history-template");

    if (historyContainer && template) {
      const clone = template.cloneNode(true);
      clone.removeAttribute("id");
      clone.style.display = "flex";

      // Fill in job info
      clone.querySelector(".filename").textContent = job.fileName;
      clone.querySelector(".qty").textContent = job.quantity;

      const totalTime = `${job.jobPrintHours}h ${job.jobPrintMins}m`;
      clone.querySelector(".time").textContent = totalTime;

      // Use current date
      const now = new Date();
      const month = now.getMonth() + 1; // JS months are 0-based
      const day = now.getDate();
      const year = now.getFullYear().toString().slice(-2); // Last 2 digits
      const formattedDate = `${month}/${day}/${year}`;
      clone.querySelector(".date").textContent = formattedDate;

      const staticHeader = historyContainer.querySelector(".queued-header.history");
      historyContainer.insertBefore(clone, staticHeader.nextSibling);
    } else {
      console.warn("⚠️ Could not find history container or template.");
    }
  }
});

function initPrinterTagListeners() {
  console.log("initPrinterTagListeners");
  document.querySelectorAll('.add-tag.printer').forEach(addTagBtn => {
    const printerCard = addTagBtn.closest('.demo-printer-card');
    const printerName = printerCard?.querySelector('.demo-printer-name')?.textContent.trim();
    if (!printerName || !printerDataMap.has(printerName)) return;

    const printer = printerDataMap.get(printerName);
    const modal = printerCard.querySelector('.add-tag-modal');
    const modalBg = printerCard.querySelector('.tag-modal-background');
    const currentTagsWrap = modal.querySelector('.current-tags');
    const tagListWrap = modal.querySelector('.tag-list-wrap');

      const tagSearch = modal.querySelector(".tag-search");

      tagSearch.addEventListener('input', function() {
        console.log("Input:", this.value);
        const filter = this.value.toLowerCase();
        const items = tagListWrap.querySelectorAll('.tag-in-list-wrap');

        items.forEach(item => {
          if (item.id.includes('template')) return;
          const itemsText = item.querySelector('.tag-name-in-list');
          const text = itemsText.textContent;
          
        if (text.includes(filter)) {
            console.log(item, text);
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });

    addTagBtn.addEventListener('click', e => {
      e.preventDefault();      
      modal.style.display = 'block';
      modalBg.style.display = 'block';

      tagListWrap.innerHTML = "";

      // Clear and re-add current tags to modal
      currentTagsWrap.innerHTML = '';
      printer.printerTags.forEach(tag => {
        if (tagRepoMap.has(tag)) {
          const category = tagRepoMap.get(tag);
          // const category = tagName.category;

          if (category === "printer") {
            const exists = Array.from(currentTagsWrap.querySelectorAll('.demo-tag.in-modal'))
            .some(el => el.style.display !== 'none' && el.textContent.trim() === tag);
            if (exists) return;

            const div = document.createElement("div");
            div.className = "demo-tag in-modal printer-tag";
            div.style.display = "flex";

            const inner = document.createElement("div");
            inner.className = "demo-tag-text in-modal";
            inner.textContent = tag;

            div.appendChild(inner);
            currentTagsWrap.appendChild(div);
          } else {
            addTagToModal(tag, currentTagsWrap);
          }
        }
      });

      // New show unselected
      tagRepoMap.forEach((category, name) => {
        
        const tag = name;
        
        if (printer.printerTags.includes(tag)) {
          return;
        }

        if (category === "printer") {
          return;
        }

        const tagWrap = document.createElement("div");
        tagWrap.className = "tag-in-list-wrap";
        tagWrap.style.display = "flex";
        tagListWrap.appendChild(tagWrap);

        const tagEl = document.createElement("div");
        tagEl.className = "tag-name-in-list";
        tagEl.textContent = name;
        tagWrap.appendChild(tagEl);

        if (category === "color") {
          tagEl.classList.add(name.toLowerCase());
        }

        const tagEditWrap = document.createElement("div");
        tagEditWrap.className = "div-block-456";
        tagWrap.appendChild(tagEditWrap);

        const tagEdit = document.createElement("button");
        tagEdit.className = "edit-tag-button";
        tagEditWrap.appendChild(tagEdit);

        const tagDel = document.createElement("button");
        tagDel.className = "edit-tag-button delete";
        tagEditWrap.appendChild(tagDel);

        tagWrap.onclick = () => {
          if (!printer.printerTags.includes(tag)) {
            printer.printerTags.push(tag);
            printer.printerTagsNum = printer.printerTags.length;
            printerDataMap.set(printerName, structuredClone(printer));

            addTagToModal(tag, currentTagsWrap);
            updateDefaultPrinterTagsUI(printerCard.querySelector('.default-file-tags'), printer.printerTags);
            
            tagWrap.style.display = 'none';

            updateAllJobMatches();
            updatePrinterCompatibleJobs(printerName);
          }
        };
      });

      currentTagsWrap.onclick = (e) => {
        const clicked = e.target.closest('.demo-tag.in-modal');
        if (!clicked) return;
        const tag = clicked.textContent.trim();

        const category = tagRepoMap.get(tag);
        if (category === "printer") return;

        const index = printer.printerTags.indexOf(tag);
        if (index !== -1) {
          printer.printerTags.splice(index, 1);
          printer.printerTagsNum = printer.printerTags.length;
          printerDataMap.set(printerName, structuredClone(printer));

          removeTagFromModal(tag, currentTagsWrap);
          updateDefaultPrinterTagsUI(printerCard.querySelector('.default-file-tags'), printer.printerTags);

          const restoreWrap = Array.from(tagListWrap.querySelectorAll('.tag-in-list-wrap')).find(w =>
            w.querySelector('.tag-name-in-list')?.textContent.trim() === tag
          );
          if (restoreWrap) restoreWrap.style.display = 'flex';

          if (!restoreWrap) {
              const category = tagRepoMap.get(tag);
  if (!category) {
    console.warn(`Category not found for tag: ${tag}`);
    return;
  }

  const tagWrap = document.createElement("div");
  tagWrap.className = "tag-in-list-wrap";
  tagWrap.style.display = "flex";
  tagListWrap.prepend(tagWrap);

  const tagEl = document.createElement("div");
  tagEl.className = "tag-name-in-list";
  tagEl.textContent = tag;
  tagWrap.appendChild(tagEl);

  if (category === "color") {
    tagEl.classList.add(tag.toLowerCase());
  }

  const tagEditWrap = document.createElement("div");
  tagEditWrap.className = "div-block-456";
  tagWrap.appendChild(tagEditWrap);

  const tagEdit = document.createElement("button");
  tagEdit.className = "edit-tag-button";
  tagEditWrap.appendChild(tagEdit);

  const tagDel = document.createElement("button");
  tagDel.className = "edit-tag-button delete";
  tagEditWrap.appendChild(tagDel);
            tagWrap.onclick = () => {
              if (!printer.printerTags.includes(tag)) {
                printer.printerTags.push(tag);
                  printer.printerTagsNum = printer.printerTags.length;
                  printerDataMap.set(printerName, structuredClone(printer));

                  addTagToModal(tag, currentTagsWrap);
                  updateDefaultPrinterTagsUI(printerCard.querySelector('.default-file-tags'), printer.printerTags);
            
                  tagWrap.style.display = 'none';

                  updateAllJobMatches();
                  updatePrinterCompatibleJobs(printerName);
                }
              };
            }
          updateAllJobMatches();
          updatePrinterCompatibleJobs(printerName);
        }
      };
    });
  });
}

function updatePrinterCompatibleJobs(printerName) {
  console.log("updatePrinterCompatibleJobs");
  const printer = printerDataMap.get(printerName);
  if (!printer) return;

  printer.compatibleJobs = [];
  jobDataMap.forEach((job, jobID) => {
    const normalizedPrinterTags = printer.printerTags.map(t => t.trim().toLowerCase());
    const matches = job.tags.every(tag => normalizedPrinterTags.includes(tag.trim().toLowerCase()));
    if (matches) {
      printer.compatibleJobs.push(jobID);
    }
  });

  printerDataMap.set(printerName, structuredClone(printer));

  // After updating printerDataMap in updatePrinterCompatibleJobs()
  const printerCard = findPrinterCardByName(printerName);
  if (isPrinterIdle(printerName) && printerCard) {
    setTimeout(() => {
      findAndAssignNextJob(printerCard);
    }, 200); // Slight delay ensures maps are up-to-date
  }
}

function updateAllJobMatches() {
  console.log("updateAllJobMatches");
  jobDataMap.forEach((job, jobID) => {
    const previouslyHadNoMatches = job.matchingPrinterNames.length === 0;
    const newMatches = getMatchingPrintersForTags(job.tags, job.filamentWeight);
    const nowHasMatches = newMatches.length > 0;

    job.matchingPrinters = newMatches;
    job.matchingPrinterNames = newMatches.map(p => p.name);
    job.matchingPrinterStatuses = newMatches.map(p => p.status);
    jobDataMap.set(jobID, structuredClone(job));
    
    // Also update printers' compatibleJobs
    printerDataMap.forEach(printer => {
      const jobIndex = printer.compatibleJobs.indexOf(jobID);
      const shouldMatch = newMatches.some(m => m.name === printer.printerName);
      if (shouldMatch && jobIndex === -1) {
        printer.compatibleJobs.push(jobID);
      } else if (!shouldMatch && jobIndex !== -1) {
        printer.compatibleJobs.splice(jobIndex, 1);
      }
    });

    if (previouslyHadNoMatches && nowHasMatches) {
      unblockJob(jobID);
    }
  });

}

function updateDefaultPrinterTagsUI(container, tagList) {
  console.log("updateDefaultPrinterTagsUI.");

  const defaultTagsContainer = container;
  if (!defaultTagsContainer) {
    console.warn("⚠️ [updateDefaultPrinterTagsUI] No container provided:", container);
    return;
  }

  // Remove all non-modal tags first
  Array.from(defaultTagsContainer.querySelectorAll('.demo-tag:not(.in-modal)')).forEach(tagEl => {
    tagEl.remove();
  });

  // Now, re-add tags according to the rule
  const totalTags = tagList.length;

  tagList.forEach((tag, index) => {
    const category = tagRepoMap.get(tag);
    
    if (index < 2 || totalTags <= 3) {
      // ➡️ Normal tags for first 2 (or all if 3 or fewer)
      const div = document.createElement("div");
      div.className = "demo-tag printer";
      div.style.display = "flex";

      const inner = document.createElement("div");
      inner.className = "demo-tag-text printer";
      inner.textContent = tag;

      if (category === "color" && tag !== "White") {
        div.classList.add(tag.toLowerCase()); // Ensure CSS class matches
        inner.classList.remove("printer"); // Ensure text is white
      } else if (category === "color" && tag === "White") {
        div.classList.add(tag.toLowerCase()); // Ensure CSS class matches
      }

      div.appendChild(inner);
      defaultTagsContainer.appendChild(div);

    } else if (index === 2) {
      // ➡️ Third tag becomes "additional-tags"
      const div = document.createElement("div");
      div.className = "demo-tag additional-tags printer";
      div.style.display = "flex";

      const moreCount = totalTags - 2;
      div.textContent = `+${moreCount} More`;

      defaultTagsContainer.appendChild(div);
    } else {
      // ➡️ Skip adding tags beyond 3
    }
  });

}

function unblockJob(jobID) {
  console.log("unblockJob");
  const job = jobDataMap.get(jobID);
  if (!job) return;

  // Remove from blocked UI
  const blockedDiv = document.querySelector(`.w-tab-pane[data-w-tab="Blocked"] [data-job-id="${jobID}"]`);
  if (blockedDiv) blockedDiv.remove();

  // Also remove any secondary copies in Queued tab with class "blocked"
  const queuedBlockedDiv = document.querySelector(`.w-tab-pane[data-w-tab="Queued"] [data-job-id="${jobID}"].blocked`);
  if (queuedBlockedDiv) queuedBlockedDiv.remove();

  // Update job status
  job.jobStatus = "q";
  jobDataMap.set(jobID, structuredClone(job));

  // Otherwise, re-render it as a queued job
  renderQueuedJob(job);
}

function renderQueuedJob(job) {
  console.log("renderQueuedJob");
  const queueBackground = document.querySelector(".demo-q-background");
  const queuedJobTemplate = document.getElementById("queued-job-template");
  if (!queueBackground || !queuedJobTemplate) return;

  const clone = queuedJobTemplate.cloneNode(true);
  clone.style.display = "flex";
  clone.removeAttribute("id");
  clone.dataset.jobId = job.jobID;

  clone.querySelector(".filename").textContent = job.fileName;
  clone.querySelector(".jobs.ul").textContent = `${job.matchingPrinters.length} Matching`;
  clone.querySelector(".qty").textContent = job.quantity;
  clone.querySelector(".weight").textContent = job.filamentWeight || '--';
  clone.querySelector(".time").textContent = job.printTime;

  // Tags
  const tagsContainer = clone.querySelector(".tags .default-file-tags");
  tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
  /*job.tags.forEach(tag => {
    const tagDiv = document.createElement("div");
    tagDiv.className = "demo-tag";
    tagDiv.style.display = "flex";
    tagDiv.textContent = tag;
    tagsContainer.appendChild(tagDiv);
  });*/
  updateDefaultTagsUI(tagsContainer, job.tags);

  // Update matching printers popup
        const popup = clone.querySelector(".matching-printers-popup");
        const printerTextTemplate = popup.querySelector(".matching-printers-text");
        popup.querySelectorAll(".matching-printers-text").forEach(el => el.remove());

        if (job.matchingPrinterNames.length > 0) {
          const container = popup.querySelector(".div-block-453") || popup;
          job.matchingPrinters.forEach(p => {
            const printerText = printerTextTemplate.cloneNode(true);
            printerText.textContent = `${p.name} - ${p.status.toUpperCase()}`;
            container.appendChild(printerText);
          });
        }

        const hoverTarget = clone.querySelector(".file-text.jobs.ul");
        if (job.matchingPrinterNames.length > 0) {
          hoverTarget.addEventListener("mouseenter", () => {
            popup.style.display = "block";
          });
          hoverTarget.addEventListener("mouseleave", () => {
            popup.style.display = "none";
          });
        } else {
          popup.style.display = "none";
        }

  clone.dataset.jobId = job.jobID;

  queueBackground.appendChild(clone);
}

function clearSendModal() {
  console.log("clearSendModal");
  const modal = document.getElementById("file-modal");
  const modalContent = document.getElementById("modal-content");

  if (modal) modal.style.display = "none";

  // Only remove .demo-q-file elements that are NOT the template
  modalContent.querySelectorAll(".demo-q-file").forEach(el => {
    if (el.id !== "file-entry-template") {
      el.remove();
    }
  });
}

function initFileTagListeners() {
  console.log("initFileTagListeners");
  document.querySelectorAll('.add-tag.file').forEach(addTagBtn => {
    const fileWrap = addTagBtn.closest('.file-info-wrap');
    const fileID = fileWrap?.dataset.fileId;
    const fileName = fileWrap?.querySelector(".file-text.sidebar.filename")?.textContent.trim();

    if (!fileName || !fileDataMap.has(fileName)) return;

    const fileData = fileDataMap.get(fileName);
    const modal = fileWrap.querySelector('.add-tag-modal');
    const modalBg = fileWrap.querySelector('.tag-modal-background');
    const currentTagsWrap = modal.querySelector('.current-tags');
    const tagListWrap = modal.querySelector('.tag-list-wrap');
    const defaultTagsContainer = fileWrap.querySelector('.default-file-tags');

    addTagBtn.addEventListener('click', e => {
      e.preventDefault();

      modal.style.display = 'block';
      modalBg.style.display = 'block';
      
      tagListWrap.innerHTML = "";

      // Clear and re-add current tags to modal
      currentTagsWrap.innerHTML = '';
      fileData.defaultTags.forEach(tag => addTagToModal(tag, currentTagsWrap));

      // New show unselected
      tagRepoMap.forEach((category, name) => {
        
        const tag = name;
        
        if (fileData.defaultTags.includes(tag)) {
          return;
        }

        const tagWrap = document.createElement("div");
        tagWrap.className = "tag-in-list-wrap";
        tagWrap.style.display = "flex";
        tagListWrap.appendChild(tagWrap);

        const tagEl = document.createElement("div");
        tagEl.className = "tag-name-in-list";
        tagEl.textContent = name;
        tagWrap.appendChild(tagEl);

        if (category === "color") {
          tagEl.classList.add(name.toLowerCase());
        }

        const tagEditWrap = document.createElement("div");
        tagEditWrap.className = "div-block-456";
        tagWrap.appendChild(tagEditWrap);

        const tagEdit = document.createElement("button");
        tagEdit.className = "edit-tag-button";
        tagEditWrap.appendChild(tagEdit);

        const tagDel = document.createElement("button");
        tagDel.className = "edit-tag-button delete";
        tagEditWrap.appendChild(tagDel);

        tagWrap.onclick = () => {
          const updated = structuredClone(fileDataMap.get(fileName));
          fileData.defaultTags.push(tag);
          fileData.defaultTagsNum = fileData.defaultTags.length;
          fileDataMap.set(fileName, structuredClone(fileData));
          
          addTagToModal(tag, currentTagsWrap);
          updateDefaultTagsUI(defaultTagsContainer, fileData.defaultTags);
          tagWrap.style.display = 'none';

          updateAllInstancesOfFile(fileName);
        };
      });

      // Handle tag removal
      currentTagsWrap.onclick = (e) => {
        const clicked = e.target.closest('.demo-tag.in-modal');
        if (!clicked) return;

        const tag = clicked.textContent.trim();
        fileData.defaultTags = fileData.defaultTags.filter(t => t !== tag);
        fileData.defaultTagsNum = fileData.defaultTags.length;
        fileDataMap.set(fileName, structuredClone(fileData));

        removeTagFromModal(tag, currentTagsWrap);
        updateDefaultTagsUI(defaultTagsContainer, fileData.defaultTags);
        updateAllInstancesOfFile(fileName);

        // Restore in list
        const restoreWrap = Array.from(tagListWrap.querySelectorAll('.tag-in-list-wrap')).find(w =>
          w.querySelector('.tag-name-in-list')?.textContent.trim() === tag
        );
        if (restoreWrap) restoreWrap.style.display = 'flex';
        if (!restoreWrap) {
            const category = tagRepoMap.get(tag);
  if (!category) {
    console.warn(`Category not found for tag: ${tag}`);
    return;
  }

  const tagWrap = document.createElement("div");
  tagWrap.className = "tag-in-list-wrap";
  tagWrap.style.display = "flex";
  tagListWrap.prepend(tagWrap);

  const tagEl = document.createElement("div");
  tagEl.className = "tag-name-in-list";
  tagEl.textContent = tag;
  tagWrap.appendChild(tagEl);

  if (category === "color") {
    tagEl.classList.add(tag.toLowerCase());
  }

  const tagEditWrap = document.createElement("div");
  tagEditWrap.className = "div-block-456";
  tagWrap.appendChild(tagEditWrap);

  const tagEdit = document.createElement("button");
  tagEdit.className = "edit-tag-button";
  tagEditWrap.appendChild(tagEdit);

  const tagDel = document.createElement("button");
  tagDel.className = "edit-tag-button delete";
  tagEditWrap.appendChild(tagDel);
          tagWrap.onclick = () => {
            fileData.defaultTags.push(tag);
            fileData.defaultTagsNum = fileData.defaultTags.length;
            fileDataMap.set(fileName, structuredClone(fileData));

            addTagToModal(tag, currentTagsWrap);
            updateDefaultTagsUI(defaultTagsContainer, fileData.defaultTags);
            tagWrap.style.display = 'none';

            updateAllInstancesOfFile(fileName);
          };
        }
      };
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const paneTemplate = document.getElementById('file-pane-template');
  const tabTemplate = document.getElementById('file-tab-template');
  const favPaneTemplate = document.getElementById('fav-file-pane-template');
  const favTabTemplate = document.getElementById('fav-file-tab-template');
  const flagPaneTemplate = document.getElementById('flag-file-pane-template');
  const flagTabTemplate = document.getElementById('flag-file-tab-template');
  const folder1PaneTemplate = document.getElementById('folder1-file-pane-template');
  const folder1TabTemplate = document.getElementById('folder1-file-tab-template');
  const folder2PaneTemplate = document.getElementById('folder2-file-pane-template');
  const folder2TabTemplate = document.getElementById('folder2-file-tab-template');
  
  if (paneTemplate) paneTemplate.style.display = 'none';
  if (tabTemplate) tabTemplate.style.display = 'none';
  if (favPaneTemplate) favPaneTemplate.style.display = 'none';
  if (favTabTemplate) favTabTemplate.style.display = 'none';
  if (flagPaneTemplate) flagPaneTemplate.style.display = 'none';
  if (flagTabTemplate) flagTabTemplate.style.display = 'none';
  if (folder1PaneTemplate) folder1PaneTemplate.style.display = 'none';
  if (folder1TabTemplate) folder1TabTemplate.style.display = 'none';
  if (folder2PaneTemplate) folder2PaneTemplate.style.display = 'none';
  if (folder2TabTemplate) folder2TabTemplate.style.display = 'none';
});

document.addEventListener("click", function (e) {
  const clickedTab = e.target.closest(".file-tab");
  if (!clickedTab) return;

  const tabID = clickedTab.dataset.tabId || clickedTab.dataset.wTab;

  if (!tabID) return;

  // 🔒 Only handle custom-tab-style ones (i.e., those NOT using Webflow tabs)
  if (clickedTab.classList.contains("w-tab-link")) return;    

  // Remove .current from all tabs in this custom system
  document.querySelectorAll(".file-tab").forEach(tab => {
    if (!tab.classList.contains("w-tab-link")) {
      tab.classList.remove("current");
    }
  });

  const tabPanes = document.querySelectorAll(".file-info-tab");
  tabPanes.forEach(pane => {
    if (pane.classList.contains("w-tab-pane")) return;
    pane.style.display = "none";
  });

  // Add .current to clicked tab
  clickedTab.classList.add("current");

  // Show matching pane
  const matchingPane = document.querySelector(`.file-info-tab[data-tab-id="${tabID}"]`);
  if (matchingPane) {
    matchingPane.style.display = "block";
  }
});

function updateAllInstancesOfFile(fileName) {
  console.log("updateAllInstancesOfFile");

  // Update All Files tab
  updateTabWithID(fileName, fileName);

  // Update Favorites and Flagged tabs
  updateTabWithID(`fav-${fileName}`, fileName);
  updateTabWithID(`flag-${fileName}`, fileName);

  // Update all folder-based tabs
  const folderTabs = document.querySelectorAll(".file-folder.custom");

  folderTabs.forEach(tab => {
    const folderName = tab.querySelector(".folder-title")?.textContent;
    if (!folderName) return;

    const safeFolderID = folderName.replace(/\s+/g, "-").toLowerCase();
    const tabID = `${safeFolderID}-${fileName}`;
    updateTabWithID(tabID, fileName);
  });
}


function updateTabWithID(tabID, fileName) {
  console.log(`updateTabWithID ${tabID}`);
  const fileData = fileDataMap.get(fileName);
  if (!fileData) return;
  const tabFile = fileData.fileName;
  const tab = (tabID === tabFile) ? document.querySelector(`.file-tab[data-w-tab="${tabID}"]`) : document.querySelector(`.file-tab[data-tab-id="${tabFile}"]`);
  const pane = (tabID === tabFile) ? document.querySelector(`.file-info-tab[data-w-tab="${tabID}"]`) : document.querySelector(`.file-info-tab[data-tab-id="${tabFile}"]`);

  if (!tab || !pane) return;

  // const fileName = tab.querySelector(".file-text.filename")?.textContent.trim();

  // Update tab UI (fav/star, flag, etc)
  const favIcon = tab.querySelector(".material-symbols-outlined");
  if (favIcon) {
    if (fileData.fileFav === true) favIcon.classList.add("fav");
    else favIcon.classList.remove("fav");
  }
  const flagCheck = pane.querySelector(".flag-check");
  if (flagCheck) {
    if (fileData.fileFlag) {
      flagCheck.checked = true;
      tab.classList.add("flagged");
    } else {
      flagCheck.checked = false;
      tab.classList.remove("flagged");
    }
  }

  const tagWrap = pane.querySelector(".default-file-tags");
  if (tagWrap) {
    updateDefaultTagsUI(tagWrap, fileData.defaultTags || []);
  }
}

function switchToTab(tabName) {
  console.log(`switchToTab`);
  const tabButton = document.querySelector(`[data-w-tab="${tabName}"]`);
  if (tabButton) tabButton.click();
}

function countFilesInTabs() {
  console.log("countFilesInTabs");
  const tabsMenu = document.querySelector(".tabs-menu-7");
  const folderTabs = tabsMenu.querySelectorAll(".file-folder.w-inline-block.w-tab-link:not(.custom)");

  folderTabs.forEach(tab => {
    const tabName = tab.getAttribute("data-w-tab");
    const tabPane = document.querySelector(`.files-tab-pane.w-tab-pane[data-w-tab="${tabName}"]`);
    if (!tabPane) return;

    const tabPaneWrap = tabPane.querySelector(".files-tabs-wrap");
    if (!tabPaneWrap) return;

    const folderNumber = tab.querySelector(".folder-number");
    const fileTabs = tabPane.querySelectorAll(".file-tab.div-block-430:not([id*='template'])");
    const tabNumberVal = fileTabs.length;

    if (folderNumber) {
      folderNumber.textContent = "(" + tabNumberVal + ")";
    }
  });
  
const allFilesTab = document.getElementById("w-tabs-3-data-w-tab-0");
const allFilesNum = allFilesTab.querySelector(".folder-number");
}

function getSelectedFilesData() {
  console.log("getSelectedFilesData");
  const selectedTabs = document.querySelectorAll('.file-tab.selected');
  const selectedSet = new Set(Array.from(selectedTabs).map(tab =>
    tab.querySelector(".file-text.filename")?.textContent.trim()
  ));

  const fileDataArray = [];

  // Use fileSelectionOrder if available
  const sourceList = fileSelectionOrder.length ? fileSelectionOrder : Array.from(selectedSet);
  
  sourceList.forEach(fileName => {
    const data = fileDataMap.get(fileName);
    if (data) {
      fileDataArray.push({ ...data });
    }
  });

  return fileDataArray;
}

 function updateSelectedCount() {
   console.log("updateSelectedCount");
    const selectedDisplay = document.getElementById("number-selected");
    const selectedTabs = document.querySelectorAll("a.file-tab.selected");
    const count = selectedTabs.length;
    selectedDisplay.textContent = `${count} Selected`;
    const moveBtnSel = document.querySelector(".demo-button.grey.folder");
    const createJobBtn = document.querySelector(".demo-button.create-print-job");
    const btnContain = document.querySelector(".div-block-435");
    const delBtnSel = btnContain.querySelector(".demo-button.delete");
    const currentFolder = document.querySelector(".files-tab-pane.w-tab-pane.w--tab-active");
    const currentFolderID = currentFolder.getAttribute("data-w-tab");


    if (count > 0) {
      selectedDisplay.classList.add("selected");
      moveBtnSel.classList.remove("inactive");
      createJobBtn.classList.remove("inactive");
      if (currentFolderID !== "Fav" && currentFolderID !== "Flag" && currentFolderID !== "All") {
        delBtnSel.classList.remove("inactive");
      }
    } else {
      selectedDisplay.classList.remove("selected");
      moveBtnSel.classList.add("inactive");
      createJobBtn.classList.add("inactive");
      if (currentFolderID !== "Fav" && currentFolderID !== "Flag" && currentFolderID !== "All") {
        delBtnSel.classList.add("inactive");
      }
    }
  }
