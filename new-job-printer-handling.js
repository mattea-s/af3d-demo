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
