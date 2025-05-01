<script>
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
    checkbox.checked = isChecked;
    if (isChecked) {
      tab.classList.add("selected");
    } else {
      tab.classList.remove("selected");
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
</script>

<script>
// Data file structure src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/apr28-map-structure.js"
  // Maps and Infrastructure Setup
const fileDataMap = new Map();
const jobDataMap = new Map();
const printerDataMap = new Map();
let jobIdCounter = 1;


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


  const matches = getMatchingPrintersForTags(fileData.defaultTags);


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
    matchingPrinters: matches,
    matchingPrinterNames: matches.map(p => p.name),
    matchingPrinterStatuses: matches.map(p => p.status),
    assignedPrinterName: null,
    assignedPrinterNames: [],
    activePrinterNames: [],
    printedSoFar: 0
  };


  jobDataMap.set(jobID, jobData);


  matches.forEach(match => {
    const printer = printerDataMap.get(match.name);
    if (printer) {
      printer.compatibleJobs.push(jobID);
    }
  });


  console.log("Created Job:", jobData);
  if (matches.length === 0) {
    console.log(`Job ${jobID} has no matching printers.`);
  } else {
    console.log(`Job ${jobID} has ${matches.length} matching printer(s):`);
    matches.forEach(p => {
      console.log(`- ${p.name} (Status: ${p.status})`);
    });
  }


  return jobData;
}


document.addEventListener("DOMContentLoaded", function () {
  initializeFileData();
  initializePrinterData();
});
</script>

<script>
// Modal Handling and Job Creation  src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/apr26-modal-handling.js"
document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("send-button");
  const confirmSendBtn = document.getElementById("confirm-send");
  const modal = document.getElementById("file-modal");


  function getSelectedFilesData() {
    const selectedTabs = document.querySelectorAll('.file-tab.selected');
    const fileDataArray = [];


    selectedTabs.forEach(tab => {
      const fileName = tab.querySelector(".file-text.filename")?.textContent.trim() || '';
      const data = fileDataMap.get(fileName);
      if (data) {
        fileDataArray.push({...data});
      }
    });


    return fileDataArray;
  }


  function populateSendModal(files) {
    const modalContent = document.getElementById("modal-content");
    const template = document.getElementById("file-entry-template");
  
    modalContent.querySelectorAll(".demo-q-file").forEach(el => el.remove());
  
    files.forEach(file => {
      const fileName = file.fileName;
      const clone = template.cloneNode(true);
      clone.style.display = "flex";
  
      clone.querySelector(".filename.q-send").textContent = fileName;

      // 🌟 Pull live job if it exists
      const job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
      const effectiveData = job || file;

      // 🏷️ Tags
      const tagsContainer = clone.querySelector(".tags");
      tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());
      (effectiveData.tags || effectiveData.defaultTags || []).forEach(tag => {
        const tagDiv = document.createElement("div");
        tagDiv.className = "demo-tag";
        tagDiv.style.display = "flex";
        tagDiv.textContent = tag;
        tagsContainer.appendChild(tagDiv);
      });

      // 🔢 Quantity
      const qtyInput = clone.querySelector(".filament-weight-wrap.q-qty input");
      if (qtyInput) qtyInput.value = effectiveData.quantity ?? 1;

      // 🌡️ Temp
      const tempInput = clone.querySelector(".filament-weight-wrap.release-temp input");
      if (tempInput) tempInput.value = effectiveData.releaseTemp ?? effectiveData.defaultReleaseTemp ?? 29;

      // ✅ Distribute
      const distCheckbox = clone.querySelector(".distribute-checkbox");
      if (distCheckbox) distCheckbox.checked = effectiveData.distribute ?? true;

      modalContent.appendChild(clone);
    });

    initTagAndDistributeListeners();
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
      const fileName = item.querySelector(".filename.q-send")?.textContent.trim();
      if (!fileName) return;

      // 🔥 Instead of creating a new job, find the existing one
      const job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
      if (job) {
        confirmedJobs.push(structuredClone(job)); // snapshot if you want to protect from future mutations
      }
    });


      console.log("Confirmed Jobs (Structured):", confirmedJobs);


      const queueBackground = document.querySelector(".demo-q-background");
      const queuedJobTemplate = document.getElementById("queued-job-template");


      if (!queuedJobTemplate) {
        console.error("Template not found!");
        return;
      }


      confirmedJobs.forEach(job => {
  assignJobsToPrinters(confirmedJobs);
        console.log("Jobs assigned");
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


  // Replace or duplicate .matching-printers-text elements
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


  // Show popup on hover only if there are matching printers
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
  //clone.querySelector(".file-text:nth-of-type(10)").textContent = job.jobID || '--';

const distributeCheckbox = clone.querySelector(".file-text.jobs .w-embed input[type='checkbox']");
if (distributeCheckbox) {
  distributeCheckbox.checked = job.distribute;
}

          queueBackground.appendChild(clone);
        });


        ["Queued", "In Production", "Collect", "Blocked"].forEach(countVisibleJobs);
    });
  }


  function countVisibleJobs(tabName) {
  const tabPane = document.querySelector(`.w-tab-pane[data-w-tab="${tabName}"]`);
  if (!tabPane) return;
  const jobSelector = (tabName === "Blocked") ? '.blocked-job' : '.queued-job';
  const jobs = tabPane.querySelectorAll(jobSelector);
  let realJobCount = 0;
  jobs.forEach(job => { if (!job.id) realJobCount++; });
  const counterMap = {
    "Queued": "q-num",
    "In Production": "prod-num",
    "Collect": "collect-num",
    "Blocked": "block-num"
  };
  const counter = document.getElementById(counterMap[tabName]);
  if (counter) counter.textContent = realJobCount;
  console.log(`Tab '${tabName}' has ${realJobCount} real jobs.`);
}
});
</script>

<script>
// Plus/Minus Buttons for Quantity and Temp  src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/qty-temp-btn.js"
document.addEventListener("click", function (e) {
  const fileName = e.target.closest(".demo-q-file")
    ?.querySelector(".filename.q-send")?.textContent.trim();

  if (e.target.matches(".qtyplus") || e.target.matches(".qtyminus")) {
    const wrapper = e.target.closest(".div-block-439.q-qty");
    const input = wrapper?.querySelector("input[type='number']");
    if (input) {
      let value = parseInt(input.value) || 1;
      if (e.target.matches(".qtyplus")) value++;
      if (e.target.matches(".qtyminus") && value > 1) value--;
      input.value = value;

      if (fileName) {
        const job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
        if (job) {
          job.quantity = value;
          jobDataMap.set(job.jobID, structuredClone(job));
          console.log("🔢 [jobDataMap] Updated quantity:", job.jobID, value);
        }
      }
      e.preventDefault();
    }
  }

  if (e.target.matches(".tempplus") || e.target.matches(".tempminus")) {
    const wrapper = e.target.closest(".div-block-439.q-temp");
    const input = wrapper?.querySelector("input[type='number']");
    if (input) {
      let value = parseInt(input.value) || 29;
      if (e.target.matches(".tempplus")) value++;
      if (e.target.matches(".tempminus") && value > 0) value--;
      input.value = value;

      if (fileName) {
        const job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
        if (job) {
          job.releaseTemp = value;
          jobDataMap.set(job.jobID, structuredClone(job));
          console.log("🌡️ [jobDataMap] Updated releaseTemp:", job.jobID, value);
        }
      }
      e.preventDefault();
    }
  }
});
</script>

<script>
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
  const tagEl = Array.from(container.querySelectorAll('.demo-tag.in-modal'))
    .find(el => el.textContent.trim() === tag && el.style.display !== 'none');
  if (tagEl) tagEl.remove();
}

function initTagAndDistributeListeners() {
  document.querySelectorAll('.add-tag').forEach(addTagBtn => {
      const fileBlock = addTagBtn.closest('.demo-q-file');
      const modal = fileBlock.querySelector('.add-tag-modal');
      const modalBg = fileBlock.querySelector('.tag-modal-background');
      const currentTagsWrap = modal.querySelector('.current-tags');
      const tagListWrap = modal.querySelector('.tag-list-wrap');
      const fileName = fileBlock.querySelector('.filename.q-send')?.textContent.trim();
      if (!fileName) return;

      let job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
      if (!job) {
        const fileData = fileDataMap.get(fileName);
        if (!fileData) return;
        job = createJobFromFile(fileName, fileData.quantity || 1, false);
      }

      if (!Array.isArray(job.tags)) {
        job.tags = [...(fileDataMap.get(fileName)?.defaultTags || [])];
        job.tagsNum = job.tags.length;
        jobDataMap.set(job.jobID, structuredClone(job));
      }

      let jobID = job.jobID;

      currentTagsWrap.querySelectorAll(".demo-tag.in-modal:not([style*='display: none'])").forEach(tag => tag.remove());
      job.tags.forEach(tag => addTagToModal(tag, currentTagsWrap));
      updateDefaultTagsUI(fileBlock.querySelector('.default-file-tags.tags'), job.tags);
    
      document.querySelectorAll('.distribute-checkbox').forEach(cb => {
        cb.addEventListener('change', function () {
          const wrapper = this.closest('.demo-q-file');
          const fileName = wrapper.querySelector('.filename.q-send')?.textContent.trim();
          const job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
          if (job) {
            job.distribute = this.checked;
            jobDataMap.set(job.jobID, structuredClone(job));
            console.log("🔄 [jobDataMap] Updated distribute:", job.jobID, job.distribute);
          }
        });
      });



    // On click
    addTagBtn.addEventListener('click', e => {
      e.preventDefault();

      modal.style.display = 'block';
      if (modalBg) modalBg.style.display = 'block';
      
      tagListWrap.querySelectorAll('.tag-name-in-list').forEach(tagEl => {
        const tag = tagEl.textContent.trim();
        const tagWrap = tagEl.closest('.tag-in-list-wrap');

        tagWrap.style.display = job.tags.includes(tag) ? 'none' : 'flex';

        tagEl.onclick = () => {
          
            addTagToJob(jobID, tag);

            addTagToModal(tag, currentTagsWrap);

            const defaultTagsContainer = fileBlock.querySelector('.default-file-tags.tags');
            if (defaultTagsContainer) {
              updateDefaultTagsUI(defaultTagsContainer, job.tags);
            }

            if (tagWrap) tagWrap.style.display = 'none';
          }
        });

      currentTagsWrap.onclick = (e) => {
        const clicked = e.target.closest('.demo-tag.in-modal');
        if (!clicked) return;

        const tag = clicked.textContent.trim();

        removeTagFromJob(jobID, tag);

        removeTagFromModal(tag, currentTagsWrap);

        const defaultTagsContainer = fileBlock.querySelector('.default-file-tags.tags');
        if (defaultTagsContainer) {
          updateDefaultTagsUI(defaultTagsContainer, job.tags);
        }

        const restoreWrap = Array.from(tagListWrap.querySelectorAll('.tag-in-list-wrap')).find(w =>
          w.querySelector('.tag-name-in-list')?.textContent.trim() === tag
        );
        if (restoreWrap) restoreWrap.style.display = 'flex';
      };
    });
  });
}
</script>

<script>
// Sends jobs to printers and prints    src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/new-job-printer-handling.js"
  function assignJobsToPrinters(jobs) {
  console.log("🚀 Assigning jobs to printers...");
  const assignedPrinters = new Set(); // 🔒 Prevents double assignment in this round

  jobs.forEach(job => {
    const matchingPrinters = job.matchingPrinterNames || [];
    const quantity = job.quantity || 1;
    const distribute = job.distribute || false;

    if (matchingPrinters.length === 0) {
      console.warn(`⚠️ No matching printers for job ${job.jobID}`);
      return;
    }

    if (distribute) {
      console.log(`🔄 Distribute mode for ${job.jobID}`);

      const availablePrinters = matchingPrinters.filter(p => isPrinterIdle(p) && !assignedPrinters.has(p));
      const assignableCount = Math.min(availablePrinters.length, job.jobProgQueued);

      for (let i = 0; i < assignableCount; i++) {
        const printerName = availablePrinters[i];
        if (!printerName) break;

        const printerCard = findPrinterCardByName(printerName);
        if (!printerCard) continue;

        assignedPrinters.add(printerName);

        // 🧠 Immediately move one unit into production
        job.jobProgQueued = Math.max(0, job.jobProgQueued - 1);
        job.jobProgProd++;
        job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;

        const printedSoFar = quantity - job.jobProgQueued;
        populatePrinterCard(printerCard, job, printedSoFar, quantity);

        console.log(`🖨️ Distributed: Assigned print #${printedSoFar} of ${job.quantity} for ${job.jobID} to ${printerName}`);
      }
    } else {
      console.log(`🔒 Non-distribute mode for ${job.jobID}`);

      if (job.assignedPrinterName) {
        console.log(`Skipping ${job.jobID}, already assigned to ${job.assignedPrinterName}`);
        return;
      }

      const availablePrinters = matchingPrinters.filter(p => isPrinterIdle(p) && !assignedPrinters.has(p));
      const printerName = availablePrinters[0];
      if (!printerName) {
        console.warn(`⚠️ No available printer for non-distributed job ${job.jobID}`);
        return;
      }

      const printerCard = findPrinterCardByName(printerName);
      if (!printerCard) return;

      assignedPrinters.add(printerName);

      // 🔒 Lock printer to this job
      job.assignedPrinterName = printerName;

      // ✅ Only one print at a time
      job.jobProgQueued = Math.max(0, job.jobProgQueued - 1);
      job.jobProgProd++;
      job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;

      populatePrinterCard(printerCard, job, 1, quantity);

      console.log(`🖨️ Non-distributed: Started first print of ${job.jobID} (${quantity} total) on ${printerName}`);
    }
  });
}

function findPrinterCardByName(printerName) {
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

function setPrinterToPrinting(card) {
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
  
      finishPrint(printerCard);
    }
  }, 1000);
}

function finishPrint(printerCard) {
  if (!printerCard) return;

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

  // 🔵 New addition: trigger looking for a new job after finishing
  setTimeout(() => {
    findAndAssignNextJob(printerCard);
  }, 500);
}

function findAndAssignNextJob(printerCard) {
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
}
</script>
