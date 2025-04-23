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
