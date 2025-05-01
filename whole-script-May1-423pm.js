<script src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/working-code.js">
// Hash-based tab nav
</script>

<script src="https://cdn.jsdelivr.net/gh/mattea-s/af3d-demo@main/apr28-map-structure.js">
// Data file structure 
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
    job.tags.forEach(tag => {
      const tagDiv = document.createElement("div");
      tagDiv.className = "demo-tag";
      tagDiv.style.display = "flex";
      tagDiv.textContent = tag;
      tagsContainer.appendChild(tagDiv);
    });

    // 🔢 Quantity
    const qtyInput = clone.querySelector(".filament-weight-wrap.q-qty input");
    if (qtyInput) qtyInput.value = job.quantity;

    // 🌡️ Temp
    const tempInput = clone.querySelector(".filament-weight-wrap.release-temp input");
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
    confirmedJobs.push(job); // 👈 Do NOT clone — we want to mutate the real object
  }
});

    console.log("Confirmed Jobs (Structured):", confirmedJobs);

    // ✅ Assign jobs ONCE, before UI rendering
    assignJobsToPrinters(confirmedJobs);
    console.log("Jobs assigned");

    const queueBackground = document.querySelector(".demo-q-background");
    const queuedJobTemplate = document.getElementById("queued-job-template");

    if (!queuedJobTemplate) {
      console.error("Template not found!");
      return;
    }

    confirmedJobs.forEach(job => {
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
</script>

<script>
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
      const assignCount = Math.min(availablePrinters.length, job.jobProgQueued);

      for (let i = 0; i < assignCount; i++) {
        const printerName = availablePrinters[i];
        const printerCard = findPrinterCardByName(printerName);
        if (!printerCard) continue;

        // Mark this printer as taken during this pass
        assignedPrinters.add(printerName);

        // Move one iteration into production
        job.jobProgQueued = Math.max(0, job.jobProgQueued - 1);
        job.jobProgProd++;
        job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;

        const printedSoFar = job.quantity - job.jobProgQueued;

        populatePrinterCard(printerCard, job, printedSoFar, job.quantity);

        if (!job.assignedPrinterNames.includes(printerName)) {
          job.assignedPrinterNames.push(printerName);
        }

        console.log(`🖨️ Distributed: Assigned iteration ${printedSoFar} of ${job.quantity} for ${job.jobID} to ${printerName}`);
      }

    } else {
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

      job.jobProgQueued = Math.max(0, job.jobProgQueued - 1);
      job.jobProgProd++;
      job.jobProgressTotal = job.jobProgQueued + job.jobProgProd + job.jobProgCol + job.jobProgDone;

      populatePrinterCard(printerCard, job, 1, job.quantity);

      if (!job.assignedPrinterNames.includes(printerName)) {
        job.assignedPrinterNames.push(printerName);
      }

      console.log(`🖨️ Non-distributed: Assigned ${job.jobID} to ${printerName}`);
    }
  }
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
