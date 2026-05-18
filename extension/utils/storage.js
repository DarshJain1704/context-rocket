// Handles saving and loading from chrome.storage.local

async function saveContext(title, compressedText) {
  const newContext = {
    id: Date.now().toString(),
    title: title || "Untitled Context",
    text: compressedText,
    timestamp: new Date().toISOString()
  };

  // Get existing contexts first
  const existing = await getContexts();
  existing.push(newContext);

  // Save back to storage
  return new Promise((resolve) => {
    chrome.storage.local.set({ savedContexts: existing }, () => {
      resolve(newContext);
    });
  });
}

async function getContexts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['savedContexts'], (result) => {
      resolve(result.savedContexts || []);
    });
  });
}

async function deleteContext(id) {
  const existing = await getContexts();
  const filtered = existing.filter(ctx => ctx.id !== id);
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ savedContexts: filtered }, () => {
      resolve();
    });
  });
}
