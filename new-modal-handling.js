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
      const clone = template.cloneNode(true);
      clone.style.display = "flex";


      clone.querySelector(".filename.q-send").textContent = file.fileName;


      const tagsContainer = clone.querySelector(".tags");
      tagsContainer.querySelectorAll(".demo-tag").forEach(tag => tag.remove());


      file.defaultTags.forEach(tag => {
         const tagDiv = document.createElement("div");
         tagDiv.className = "demo-tag";
         tagDiv.style.display = "flex";
         tagDiv.textContent = tag;
         tagsContainer.appendChild(tagDiv);
      });



      const qtyInput = clone.querySelector(".filament-weight-wrap.q-qty input");
      const tempInput = clone.querySelector(".filament-weight-wrap.release-temp input");
      const distCheckbox = clone.querySelector(".distribute-checkbox");

      if (qtyInput) qtyInput.value = file.quantity || 1;
      if (tempInput) tempInput.value = file.defaultReleaseTemp || 29;
      if (distCheckbox) distCheckbox.checked = file.distribute || true;



      modalContent.appendChild(clone);
      const existingJob = Array.from(jobDataMap.values()).find(j => j.fileName === file.fileName);
if (!existingJob) {
  const newJob = createJobFromFile(file.fileName, file.quantity || 1, false);
  console.log("Pre-created job for modal:", newJob);
}

    });
    initTagAndDistributeListeners(); // Called after cloning demo-q-file elements
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
        const qtyInput = item.querySelector(".q-qty input");
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        const distCheckbox = item.querySelector(".distribute input[type='checkbox']");
        const distribute = distCheckbox ? distCheckbox.checked : false;


        if (fileName) {
          const newJob = createJobFromFile(fileName, quantity, distribute);
          if (newJob) {
            confirmedJobs.push(newJob);
          }
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
