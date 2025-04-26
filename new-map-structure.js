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
