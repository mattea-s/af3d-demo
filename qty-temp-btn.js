document.addEventListener("click", function (e) {
  if (e.target.matches(".qtyplus") || e.target.matches(".qtyminus")) {
    const wrapper = e.target.closest(".div-block-439.q-qty");
    const input = wrapper?.querySelector("input[type='number']");
    if (input) {
      let value = parseInt(input.value) || 1;
      if (e.target.matches(".qtyplus")) value++;
      if (e.target.matches(".qtyminus") && value > 1) value--;
      input.value = value;


      const fileName = e.target.closest(".demo-q-file")?.querySelector(".filename.q-send")?.textContent.trim();
      if (fileName && fileDataMap.has(fileName)) {
        fileDataMap.get(fileName).quantity = value;
      }
    }
    e.preventDefault();
  }


  if (e.target.matches(".tempplus") || e.target.matches(".tempminus")) {
    const wrapper = e.target.closest(".div-block-439.q-temp");
    const input = wrapper?.querySelector("input[type='number']");
    if (input) {
      let value = parseInt(input.value) || 29;
      if (e.target.matches(".tempplus")) value++;
      if (e.target.matches(".tempminus") && value > 0) value--;
      input.value = value;


      const fileName = e.target.closest(".demo-q-file")?.querySelector(".filename.q-send")?.textContent.trim();
      if (fileName && fileDataMap.has(fileName)) {
        fileDataMap.get(fileName).releaseTemp = value;
      }
    }
    e.preventDefault();
  }
});
