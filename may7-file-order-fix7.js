
  // Hash-based tab nav src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/working-code.js"
$(document).on('click', '.tag-modal-background.w-inline-block', function() {
  console.log("Tag Modal Clicked");
  $(this).hide(); // Hides only the clicked background
  $('.add-tag-modal').hide(); // Hide associated modal
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

// Updates 'current' class on tabs
document.addEventListener("DOMContentLoaded", function () {
  function updateCurrentClasses() {
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
});

// Handles file selection and 'select all'
document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll(".file-select-box");
  const selectedDisplay = document.getElementById("number-selected");
  const selectAllCheckbox = document.getElementById("select-all");


  function updateSelectedCount() {
    const selectedTabs = document.querySelectorAll("a.file-tab.selected");
    const count = selectedTabs.length;
    selectedDisplay.textContent = `${count} Selected`;


    if (count > 0) {
      selectedDisplay.classList.add("selected");
    } else {
      selectedDisplay.classList.remove("selected");
    }
  }


  function toggleTabSelection(checkbox, isChecked) {
    const tab = checkbox.closest("a.file-tab");
    const fileName = tab.querySelector(".file-text.filename")?.textContent.trim();
    checkbox.checked = isChecked;
    if (isChecked) {
      tab.classList.add("selected");
      console.log(`${fileName} selected`);
      fileSelectionOrder.push(fileName);
      console.log(`File selection order: ${fileSelectionOrder}`);
    } else {
      tab.classList.remove("selected");
      console.log(`${fileName} removed`);
      fileSelectionOrder = fileSelectionOrder.filter(name => name !== fileName)
      console.log(`File selection order: ${fileSelectionOrder}`);
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
      checkboxes.forEach((checkbox) => {
        toggleTabSelection(checkbox, isChecked);
      });
      updateSelectedCount();
    });
  }


  updateSelectedCount();
});

// Data file structure src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/apr28-map-structure.js"
  // Maps and Infrastructure Setup
const fileDataMap = new Map();
const jobDataMap = new Map();
const printerDataMap = new Map();
let jobIdCounter = 1;
let fileSelectionOrder = [];

// Helper to convert minutes
function convertMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}


// Match printers that contain all file tags
function getMatchingPrintersForTags(fileTags) {
  const matches = [];


  printerDataMap.forEach((printer, name) => {
    // Normalize printer tags once
    const normalizedPrinterTags = printer.printerTags.map(t => t.trim().toLowerCase());


    const hasAllTags = fileTags.every(tag =>
      normalizedPrinterTags.includes(tag.trim().toLowerCase())
    );


    if (hasAllTags) {
      const cleanStatus = printer.printerStatus.replace("•", "").trim();
      matches.push({
        name: printer.printerName,
        status: cleanStatus
      });
    }
  });


  console.log("Matching printers for tags [" + fileTags.join(", ") + "]:", matches);
  return matches;
}


// Initialize Files
function initializeFileData() {
  const fileTabs = document.querySelectorAll(".file-tab");


  fileTabs.forEach(tab => {
    const fileName = tab.querySelector(".file-text.filename")?.textContent.trim() || "Unnamed File";
    const tags = tab.dataset.tags ? tab.dataset.tags.split(',').map(tag => tag.trim()) : [];
    const filamentWeight = parseFloat(tab.dataset.weight) || 0;
    const printHours = parseInt(tab.dataset.hrs) || 0;
    const printMins = parseInt(tab.dataset.mins) || 0;
    const printTime = (printHours * 60) + printMins;


    const fileData = {
      fileName,
      defaultTags: tags,
      defaultTagsNum: tags.length,
      printTime,
      printHours,
      printMins,
      dayUploaded: 4,
      monthUploaded: 3,
      yearUploaded: 2025,
      zHeight: 43.2,
      filamentWeight,
      defaultReleaseTemp: 29,
      productionNotes: "",
      fileFlag: false,
      fileFav: false,
      fileFolders: ["All Files"]
    };


    fileDataMap.set(fileName, fileData);
  });


  console.log("Files Initialized:", fileDataMap);
}


// Initialize Printers
function initializePrinterData() {
  const printerCards = document.querySelectorAll(".demo-printer-card");


  printerCards.forEach((card, index) => {
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


    printerDataMap.set(printerName, printerData);
  });


  console.log("Printers Initialized:", printerDataMap);
}


// Job Creation
function createJobFromFile(fileName, quantity = 1, distribute = false) {
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
    printedSoFar: 0
  };


  jobDataMap.set(jobID, jobData);


  console.log("Created Job:", jobData);


  return jobData;
}


document.addEventListener("DOMContentLoaded", function () {
  initializeFileData();
  initializePrinterData();
});


// Modal Handling and Job Creation  src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/apr26-modal-handling.js"
document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("send-button");
  const confirmSendBtn = document.getElementById("confirm-send");
  const modal = document.getElementById("file-modal");


function getSelectedFilesData() {
  const selectedTabs = document.querySelectorAll('.file-tab.selected');
  const selectedSet = new Set(Array.from(selectedTabs).map(tab =>
    tab.querySelector(".file-text.filename")?.textContent.trim()
  ));

  const fileDataArray = [];

  // Use fileSelectionOrder if available
  const sourceList = fileSelectionOrder.length ? fileSelectionOrder : Array.from(selectedSet);

  console.log("📦 fileSelectionOrder:", fileSelectionOrder);
  console.log("📦 sourceList being used:", sourceList);
  
  sourceList.forEach(fileName => {
    const data = fileDataMap.get(fileName);
    if (data) {
      fileDataArray.push({ ...data });
    }
  });

  return fileDataArray;
}


 function populateSendModal(files) {
   console.log("populateSendModal");
  const modalContent = document.getElementById("modal-content");
  const template = document.getElementById("file-entry-template");

  modalContent.querySelectorAll(".demo-q-file").forEach(el => el.remove());

  files.forEach(file => {
    const fileName = file.fileName;

    // 🆕 Always create a fresh job object
    const job = createJobFromFile(fileName, 1, true); // quantity: 1, distribute: true (default)
    console.log("Quantity set to 1");
    jobDataMap.set(job.jobID, job);

    const clone = template.cloneNode(true);
    clone.style.display = "flex";
    clone.dataset.jobId = job.jobID; // 🆕 Attach jobID directly to modal block
    clone.querySelector(".filename.q-send").textContent = fileName;


    // 🏷️ Tags
    const tagsContainer = clone.querySelector(".tags");
    tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
    job.tags.forEach(tag => {
      const tagDiv = document.createElement("div");
      tagDiv.className = "demo-tag";
      tagDiv.style.display = "flex";
      tagDiv.textContent = tag;
      tagsContainer.appendChild(tagDiv);
    });

    // 🔢 Quantity
    const qtyInput = clone.querySelector(".div-block-439.q-qty input");
    console.log(`qtyInput = ${qtyInput}`);
    if (qtyInput) qtyInput.value = job.quantity;
    console.log(`Set qtyInput to ${job.quantity} - ${qtyInput}`);
    
    // Update job print time
    job.jobPrintTime = job.printTime * job.quantity;
    const converted = convertMinutes(job.jobPrintTime);
    job.jobPrintHours = converted.hours;
    job.jobPrintMins = converted.minutes;
    jobDataMap.set(job.jobID, job);

    // 🌡️ Temp
    const tempInput = clone.querySelector(".div-block-439.q-temp input");
    if (tempInput) tempInput.value = job.releaseTemp ?? job.defaultReleaseTemp ?? 29;

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
    const matches = getMatchingPrintersForTags(job.tags);
    console.log(`Matches: ${matches}`);
    job.matchingPrinters = matches;
    console.log(`Matching printers: ${job.matchingPrinters}`);
    job.matchingPrinterNames = matches.map(p => p.name);
    console.log(`Matching printer names: ${job.matchingPrinterNames}`);
    job.matchingPrinterStatuses = matches.map(p => p.status);
    console.log(`Matching printer statuses: ${job.matchingPrinterStatuses}`);

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

    console.log("Confirmed Jobs (Structured):", confirmedJobs);

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
        console.log(`Job ${job.jobID} has no matching printers.`);

        const cloneQueue = blockedJobTemplate.cloneNode(true);
        
        cloneQueue.style.display = "flex";
        cloneQueue.removeAttribute('id');

        cloneQueue.querySelector(".filename").textContent = job.fileName;
        cloneQueue.querySelector(".jobs.ul").textContent = `${job.matchingPrinters.length} Matching`;

        const tagsContainer = cloneQueue.querySelector(".tags .default-file-tags");
        tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
        job.tags.forEach(tag => {
          const tagDiv = document.createElement("div");
          tagDiv.className = "demo-tag";
          tagDiv.style.display = "flex";
          tagDiv.textContent = tag;
          tagsContainer.appendChild(tagDiv);
        });

        cloneQueue.querySelector(".qty").textContent = job.quantity;
        cloneQueue.querySelector(".weight").textContent = job.filamentWeight || '--';
        cloneQueue.querySelector(".time").textContent = job.printTime;

        const distributeCheckbox = cloneQueue.querySelector(".file-text.jobs .w-embed input[type='checkbox']");
        if (distributeCheckbox) {
          distributeCheckbox.checked = job.distribute;
        }

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
        job.tags.forEach(tag => {
          const tagDiv = document.createElement("div");
          tagDiv.className = "demo-tag";
          tagDiv.style.display = "flex";
          tagDiv.textContent = tag;
          tagsContainer.appendChild(tagDiv);
        });

        cloneBlocked.querySelector(".qty").textContent = job.quantity;
        cloneBlocked.querySelector(".weight").textContent = job.filamentWeight || '--';
        cloneBlocked.querySelector(".time").textContent = job.printTime;

        const distributeCheckbox = cloneBlocked.querySelector(".file-text.jobs .w-embed input[type='checkbox']");
        if (distributeCheckbox) {
          distributeCheckbox.checked = job.distribute;
        }

        blockedBackground.appendChild(cloneBlocked);
        }
      } else {
        console.log(`Job ${job.jobID} has ${job.matchingPrinters.length} matching printer(s):`);
        job.matchingPrinters.forEach(p => {
          console.log(`- ${p.name} (Status: ${p.status})`);
        });
        
        const clone = queuedJobTemplate.cloneNode(true);
        clone.style.display = "flex";
        clone.removeAttribute('id');

        clone.querySelector(".filename").textContent = job.fileName;
        clone.querySelector(".jobs.ul").textContent = `${job.matchingPrinters.length} Matching`;

        const tagsContainer = clone.querySelector(".tags .default-file-tags");
        tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
        job.tags.forEach(tag => {
          const tagDiv = document.createElement("div");
          tagDiv.className = "demo-tag";
          tagDiv.style.display = "flex";
          tagDiv.textContent = tag;
          tagsContainer.appendChild(tagDiv);
        });

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
        console.log("Hover Target in Production:", hoverTarget);
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
        console.log("✅ Job element HTML before append:", clone.outerHTML);
        console.log("➡️ Appending job with jobID:", job.jobID);

        queueBackground.appendChild(clone);
        }
      
      });

        // ✅ Assign jobs ONCE, after UI rendering
    assignJobsToPrinters(confirmedJobs);
    console.log("Jobs assigned");
    
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
      console.log("🔢 [jobDataMap] Updated quantity:", jobID, value);
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
      console.log("🌡️ [jobDataMap] Updated releaseTemp:", jobID, value);
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
  console.log(`Tab '${tabName}' has ${realJobCount} real jobs.`);
}

// Queue tagging src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/queue-tagging.js"
function updateDefaultTagsUI(container, tagList) {
  console.log("🔵 [updateDefaultTagsUI] Starting sync...");
  console.log("📦 Tag list to sync:", tagList);

  const defaultTagsContainer = container;
  if (!defaultTagsContainer) {
    console.warn("⚠️ [updateDefaultTagsUI] No container provided:", container);
    return;
  }
  console.log("✅ Using provided default tags container:", defaultTagsContainer);

  // Remove all non-modal tags first
  Array.from(defaultTagsContainer.querySelectorAll('.demo-tag:not(.in-modal)')).forEach(tagEl => {
    tagEl.remove();
  });

  // Now, re-add tags according to the rule
  const totalTags = tagList.length;

  tagList.forEach((tag, index) => {
    if (index < 3 || totalTags <= 4) {
      // ➡️ Normal tags for first 3 (or all if 4 or fewer)
      const div = document.createElement("div");
      div.className = "demo-tag";
      div.style.display = "flex";

      const inner = document.createElement("div");
      inner.className = "demo-tag-text";
      inner.textContent = tag;

      div.appendChild(inner);
      defaultTagsContainer.appendChild(div);

      console.log(`➕ Added visible tag: "${tag}"`);
    } else if (index === 3) {
      // ➡️ Fourth tag becomes "additional-tags"
      const div = document.createElement("div");
      div.className = "demo-tag additional-tags";
      div.style.display = "flex";

      const moreCount = totalTags - 3;
      div.textContent = `+${moreCount} More`;

      defaultTagsContainer.appendChild(div);

      console.log(`➕ Added additional-tags placeholder: "+${moreCount} More"`);
    } else {
      // ➡️ Skip adding tags beyond 4
      console.log(`⚡ Skipped tag "${tag}" (covered by "+${totalTags - 3} More")`);
    }
  });

  console.log("🎯 [updateDefaultTagsUI] Sync complete for this container.\n");
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
    console.log("➕ Added tag to job:", tag, job.tags);
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
    console.log("🗑️ Removed tag from job:", tag, job.tags);
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
        console.log("🔄 [jobDataMap] Updated distribute:", jobID, job.distribute);
      });
    }

    // Add tag button opens modal
    addTagBtn.addEventListener('click', e => {
      e.preventDefault();

      modal.style.display = 'block';
      if (modalBg) modalBg.style.display = 'block';

      // Show only unselected tags
      tagListWrap.querySelectorAll('.tag-name-in-list').forEach(tagEl => {
        const tag = tagEl.textContent.trim();
        const tagWrap = tagEl.closest('.tag-in-list-wrap');

        tagWrap.style.display = job.tags.includes(tag) ? 'none' : 'flex';

        tagEl.onclick = () => {
          console.log("New tag clicked");

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
      };
    });
  });
}
// Sends jobs to printers and prints    src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/new-job-printer-handling.js"
function assignJobsToPrinters(jobs) {
  console.log("🚀 Assigning jobs to printers...");

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
      console.log("Distributed job starting");
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
      console.log("Non-distributed job starting");
      // Non-distributed job: entire job goes to one printer
      if (job.assignedPrinterName) {
        console.log(`🔒 Job ${job.jobID} already locked to ${job.assignedPrinterName}`);
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
  console.log(`🖨️ Populating printer "${card.querySelector(".demo-printer-name")?.textContent.trim()}" with job "${job.fileName}"`);

  const printName = card.querySelector(".demo-printer-printname");
  const qtyText = card.querySelector(".demo-printer-smltxt:not(.time)"); // The "1 of 2" type qty
  const timeText = card.querySelector(".demo-printer-smltxt.time"); // 🔥 Correct target for time

  if (printName) printName.textContent = job.fileName;
  if (qtyText) qtyText.textContent = `${currentIteration} of ${quantity}`;
  if (timeText) timeText.textContent = `0% - ${job.printHours}h ${job.printMins}m remaining`;

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
  job.tags.forEach(tag => {
    const tagDiv = document.createElement("div");
    tagDiv.className = "demo-tag";
    tagDiv.style.display = "flex";
    tagDiv.textContent = tag;
    tagsContainer.appendChild(tagDiv);
  });

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

  // Matching printers popup
  const printingPopup = cloneProd.querySelector(".matching-printers-popup");
  const container = printingPopup.querySelector(".div-block-453") || printingPopup;
  container.innerHTML = ""; // Clear old content

  console.log(`Matching printers: ${job.matchingPrinterNames}`);
  console.log(`Active printers: ${job.activePrinterNames}`);

  job.activePrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    console.log(`📦 Checking printer "${name}" →`, p);
    if (p) {
      const printerText = document.createElement("div");
      console.log("🧱 Creating printerText div for:", p.printerName);
      printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  });

  // Hover logic (bind once)
  const hoverTarget = cloneProd.querySelector(".file-text.jobs.ul");
  console.log("Hover Target in Production:", hoverTarget);
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

  console.log(`Matching printers: ${job.matchingPrinterNames}`);
  console.log(`Active printers: ${job.activePrinterNames}`);

  job.activePrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    console.log(`📦 Checking printer "${name}" →`, p);
    if (p) {
      const printerText = document.createElement("div");
      console.log("🧱 Creating printerText div for:", p.printerName);
      printerText.className = "matching-printers-text";
      printerText.textContent = `${p.printerName} - ${p.printerStatus.toUpperCase()}`;
      container.appendChild(printerText);
    }
  });

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

  console.log(`✅ Printer "${card.querySelector(".demo-printer-name")?.textContent.trim()}" set to PRINTING`);
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
  const totalDurationInSeconds = totalPrintMinutes; // 1 minute = 1 second real-time

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

      console.log(`✅ Printer "${printerCard.querySelector(".demo-printer-name")?.textContent.trim()}" completed print.`);
  
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

  console.log(`♻️ Printer "${printerCard.querySelector(".demo-printer-name")?.textContent.trim()}" fully reset to IDLE state.`);

  if (job && Array.isArray(job.activePrinterNames)) {
    job.activePrinterNames = job.activePrinterNames.filter(name => name !== printerName);
    console.log(`❎ Removed ${printerName} from activePrinterNames for job ${job.jobID}`);

    // 🔁 Adjust job progress counts
    job.jobProgProd = Math.max(0, job.jobProgProd - 1);
    job.jobProgCol = (job.jobProgCol || 0) + 1;
    job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;
    console.log(`📊 Updated job progress for ${job.jobID}: prod → ${job.jobProgProd}, col → ${job.jobProgCol}`);

    updateJobStatus(job.jobID);         // Ensure jobStatus = 'c' when appropriate
    promoteOrUpdateJob(job.jobID);      // Trigger UI update for progress bar + active printer list
    promoteOrUpdateCollectJob(job.jobID);
  }

  ["Queued", "In Production", "Collect", "Blocked"].forEach(countVisibleJobs);
  
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

    const matchingPrinters = job.matchingPrinterNames || [];
    
    if (job.distribute) {
      if (job.jobProgQueued > 0 && matchingPrinters.includes(printerName)) {
        if (matchingPrinters.includes(printerName)){
          console.log(`Assigning distributed job`);
          assignJobToPrinter(printerCard, job);
          console.log(`Assigned distributed job`);
          break;
        }
      }
    } else {
      if (job.assignedPrinterName) {
        if (job.assignedPrinterName === printerName) {
        console.log(`Assigned printer name: ${job.assignedPrinterName}`);
        console.log(`Printer name: ${printerName}`);
        console.log(`CONTINUING non-distributed job on same printer`);
        assignJobToPrinter(printerCard, job);
        console.log(`DONE CONTINUING non-distributed job on same printer`);
          break;
        } else {
          console.log(`Non-distributed job is locked to a printer`);
        continue;
        }
      } else {
        // ⚡ NO assigned printer yet
        job.assignedPrinterName = printerName;
        console.log(`Assigning non-distributed job to NEW PRINTER`);
        assignJobToPrinter(printerCard, job);
        console.log(`DONE assigning non-distributed job to NEW PRINTER`);
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

  // Lock printer immediately
  //setPrinterToPrinting(printerCard);

  // Update job progress
  job.jobProgQueued = Math.max(0, job.jobProgQueued - 1);
  job.jobProgProd++;
  job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;

  const printedSoFar = job.quantity - job.jobProgQueued; // 🔵 Global "how many started"

  // Populate printer
  populatePrinterCard(printerCard, job, printedSoFar, job.quantity);

  console.log(`🖨️ Started print #${printedSoFar} of ${job.quantity} for Job ${job.jobID}`);

  if (job.jobProgQueued === 0 && job.jobProgProd === 0) {
    console.log(`🏁 Job ${job.jobID} fully printed!`);
  }

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
  console.log(`🚀 Promoted job ${job.jobID} to production`);
} else {
  const prodDiv = findProdJobDivByID(job.jobID);
  updateJobInProduction(job.jobID, prodDiv);
  jobDataMap.set(job.jobID, structuredClone(job));
  console.log(`🔄 Updated production job ${job.jobID}`);
  }
  updateJobStatus(job.jobID);
}

function findProdJobDivByID(jobID) {
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
console.log(`Job ${job.jobID} status: ${job.jobStatus}`);
}

function promoteOrUpdateJob(jobID) {
  const jobDiv = findJobDivByID(jobID);
  const inProdContainer = document.querySelector('.w-tab-pane[data-w-tab="In Production"]');
  const alreadyInProd = inProdContainer?.querySelector(`[data-job-id="${jobID}"]`);

  if (jobDiv && !alreadyInProd) {
    jobToProduction(jobID, jobDiv);  // First iteration promotion
    console.log("In production job created");
  } else {
    updateJobInProduction(jobID, jobDiv);  // Visual update only
    console.log("In production job updated");
  }
}

function jobToCollect(jobID, jobDiv) {
  console.log("jobToCollect");
  if (!jobDiv) return;
  jobDiv.remove();

  const job = jobDataMap.get(jobID);
  const colBackground = document.querySelector(".demo-q-background.collect");
  const colJobTemplate = document.getElementById("collect-job-template");

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
  colInput.setAttribute("placeholder", job.jobProgCol);
  colInput.setAttribute("max", job.jobProgCol);

  // Tags
  const tagsContainer = cloneCol.querySelector(".tags .default-file-tags");
  tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
  job.tags.forEach(tag => {
    const tagDiv = document.createElement("div");
    tagDiv.className = "demo-tag";
    tagDiv.style.display = "flex";
    tagDiv.textContent = tag;
    tagsContainer.appendChild(tagDiv);
  });

  // Progress bars
  cloneCol.querySelector(".demo-progress.collected").style.width =
    (job.jobProgDone / job.quantity * 100) + "%";
  cloneCol.querySelector(".demo-progress.ready-to-collect").style.width =
    (job.jobProgCol / job.quantity * 100) + "%";

  // Matching printers popup
  const collectPopup = cloneCol.querySelector(".matching-printers-popup");
  const container = collectPopup.querySelector(".div-block-453") || collectPopup;
  container.innerHTML = ""; // Clear old content

  console.log(`Assigned printers: ${job.assignedPrinterNames}, ${job.assignedPrinterName}`);

  if (job.distribute){
  job.assignedPrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    console.log(`📦 Checking printer "${name}" →`, p);
    if (p) {
      const printerText = document.createElement("div");
      console.log("🧱 Creating printerText div for:", p.printerName);
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
  console.log("Hover Target in Production:", hoverTarget);
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

  // Update popup contents only — do not rebind events
  const collectPopup = jobDiv.querySelector(".matching-printers-popup");
  const container = collectPopup.querySelector(".div-block-453") || collectPopup;
  container.innerHTML = "";

  console.log(`Assigned printers: ${job.assignedPrinterNames}, ${job.assignedPrinterName}`);

  if (job.distribute){
  job.assignedPrinterNames.forEach(name => {
    const p = printerDataMap.get(name);
    console.log(`📦 Checking printer "${name}" →`, p);
    if (p) {
      const printerText = document.createElement("div");
      console.log("🧱 Creating printerText div for:", p.printerName);
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

  // Update progress bars
  jobDiv.querySelector(".demo-progress.collected").style.width =
    (job.jobProgDone / job.quantity * 100) + "%";
  jobDiv.querySelector(".demo-progress.ready-to-collect").style.width =
    (job.jobProgCol / job.quantity * 100) + "%";

  // Collected input
    const colInput = jobDiv.querySelector(".collect-input");
    colInput.setAttribute("placeholder", job.jobProgCol);
    colInput.setAttribute("max", job.jobProgCol);
}

function promoteOrUpdateCollectJob(jobID) {
  const jobDiv = findJobDivByID(jobID);
  const collectContainer = document.querySelector('.w-tab-pane[data-w-tab="Collect"]');
  const alreadyInCollect = collectContainer?.querySelector(`[data-job-id="${jobID}"]`);

  if (jobDiv && !alreadyInCollect) {
    jobToCollect(jobID, jobDiv); // First move to Collect
    console.log("Collect job created");
  } else {
    updateJobInCollect(jobID, alreadyInCollect); // Just update counts or UI
    console.log("Collect job updated");
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
  countVisibleJobs("Collect");

  console.log(`✅ Collected ${collectQty} from ${jobID}: Done = ${job.jobProgDone}, Remaining = ${job.jobProgCol}`);

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

      historyContainer.appendChild(clone);
      console.log(`📦 Job ${job.jobID} added to history.`);
    } else {
      console.warn("⚠️ Could not find history container or template.");
    }
  }
});
