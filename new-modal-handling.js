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
    console.log("🔵 Confirm Send clicked.");

    // 🚨 1. Clear any dirty pre-created jobs
    jobDataMap.clear();
    jobIDCounter = 0;

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

    console.log("✅ Confirmed Jobs (Structured):", confirmedJobs);

    assignJobsToPrinters(confirmedJobs);

    console.log("🚀 Jobs assigned");

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
