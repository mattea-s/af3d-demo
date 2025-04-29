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

      document.querySelectorAll('.distribute-checkbox').forEach(cb => {
    cb.addEventListener('change', function () {
      const wrapper = this.closest('.demo-q-file');
      const fileName = wrapper.querySelector('.filename.q-send')?.textContent.trim();
      const job = Array.from(jobDataMap.values()).find(j => j.fileName === fileName);
      if (job) job.distribute = this.checked;
    });
  });
    
    // On click
    addTagBtn.addEventListener('click', e => {
      e.preventDefault();

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
}
