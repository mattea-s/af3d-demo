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
    addTagBtn.addEventListener('click', e => {
      e.preventDefault();

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

      modal.style.display = 'block';
      if (modalBg) modalBg.style.display = 'block';

      currentTagsWrap.querySelectorAll(".demo-tag.in-modal:not([style*='display: none'])").forEach(tag => tag.remove());
      job.tags.forEach(tag => addTagToModal(tag, currentTagsWrap));
      updateDefaultTagsUI(fileBlock.querySelector('.default-file-tags.tags'), job.tags);

      tagListWrap.querySelectorAll('.tag-name-in-list').forEach(tagEl => {
        const tag = tagEl.textContent.trim();
        const tagWrap = tagEl.closest('.tag-in-list-wrap');

        tagWrap.style.display = job.tags.includes(tag) ? 'none' : 'flex';

        tagEl.onclick = () => {
          const tag = tagEl.textContent.trim();
          const tagWrap = tagEl.closest('.tag-in-list-wrap');

          if (!job.tags.includes(tag)) {
            job.tags.push(tag);
            job.tagsNum = job.tags.length;
            jobDataMap.set(job.jobID, structuredClone(job));

            const fileData = fileDataMap.get(fileName);
            if (fileData) {
              if (!Array.isArray(fileData.defaultTags)) fileData.defaultTags = [];
              if (!fileData.defaultTags.includes(tag)) {
                fileData.defaultTags.push(tag);
                fileDataMap.set(fileName, structuredClone(fileData));
                console.log("✅ Updated fileDataMap:", fileDataMap.get(fileName));
              }
            }

            addTagToModal(tag, currentTagsWrap);

            const defaultTagsContainer = fileBlock.querySelector('.default-file-tags.tags');
            if (defaultTagsContainer) {
              updateDefaultTagsUI(defaultTagsContainer, job.tags);
            }

            if (tagWrap) tagWrap.style.display = 'none';
          }
        };
      });

      currentTagsWrap.onclick = (e) => {
        const clicked = e.target.closest('.demo-tag.in-modal');
        if (!clicked) return;

        const tag = clicked.textContent.trim();

        const index = job.tags.indexOf(tag);
        if (index === -1) return;
        job.tags.splice(index, 1);
        job.tagsNum = job.tags.length;
        jobDataMap.set(job.jobID, structuredClone(job));

        const fileData = fileDataMap.get(fileName);
        if (fileData && Array.isArray(fileData.defaultTags)) {
          const fileIndex = fileData.defaultTags.indexOf(tag);
          if (fileIndex !== -1) {
            fileData.defaultTags.splice(fileIndex, 1);
            fileDataMap.set(fileName, structuredClone(fileData));
            console.log("🗑️ Removed tag from fileDataMap:", fileData.defaultTags);
          }
        }

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

  document.querySelectorAll('.distribute-checkbox').forEach(cb => {
    cb.addEventListener('change', function () {
      const wrapper = this.closest('.demo-q-file');
      const fileName = wrapper.querySelector('.filename.q-send')?.textContent.trim();
      const job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
      if (job) job.distribute = this.checked;
    });
  });
}
