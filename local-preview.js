(() => {
  function runner(success, failure) {
    return new Proxy({}, {
      get(_target, method) {
        if (method === 'withSuccessHandler') return callback => runner(callback, failure);
        if (method === 'withFailureHandler') return callback => runner(success, callback);
        return (...args) => {
          fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method, args })
          })
            .then(async response => {
              const payload = await response.json();
              if (!response.ok) throw new Error(payload.error || 'อ่านข้อมูลไม่สำเร็จ');
              return payload.result;
            })
            .then(result => { if (success) success(result); })
            .catch(error => { if (failure) failure(error); else console.error(error); });
        };
      }
    });
  }
  window.google = { script: { run: runner() } };

  const blockedButtons = new Set([
    'planSaveBtn', 'actSubmitBtn', 'btnSaveDept', 'btnSaveWeights',
    'adminSubmitBtn', 'btnUploadMasterDoc'
  ]);
  document.addEventListener('DOMContentLoaded', () => {
    for (const id of blockedButtons) {
      const button = document.getElementById(id);
      if (button) {
        button.disabled = true;
        button.title = 'ตัวอย่างบน localhost อ่านข้อมูลได้อย่างเดียว';
      }
    }
    const fileInput = document.getElementById('actFiles');
    if (fileInput) fileInput.disabled = true;
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[onclick="saveBudgetSetting()"]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert('ตัวอย่างบน localhost อ่านข้อมูลได้อย่างเดียว');
    }
  }, true);
})();
