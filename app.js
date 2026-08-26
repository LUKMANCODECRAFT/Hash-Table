/**
 * HashTable Visualizer & Engine - JavaScript Implementation
 */

class JS_HashTable {
  constructor(capacity = 8, algo = "unicode_sum") {
    self.capacity = capacity;
    this.capacity = capacity;
    this.algo = algo;
    this.buckets = Array.from({ length: capacity }, () => []);
    this.totalItems = 0;
  }

  setAlgo(algo) {
    this.algo = algo;
  }

  setCapacity(newCap) {
    const oldItems = this.getAllItems();
    this.capacity = Math.max(1, newCap);
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.totalItems = 0;
    for (const { key, value } of oldItems) {
      this.insert(key, value);
    }
  }

  computeHashTrace(key) {
    const keyStr = String(key);
    let traceSteps = [];
    let rawHash = 0;

    if (this.algo === "unicode_sum") {
      let charSums = [];
      for (let i = 0; i < keyStr.length; i++) {
        const code = keyStr.charCodeAt(i);
        charSums.push(`'${keyStr[i]}'(${code})`);
        rawHash += code;
      }
      traceSteps.push(`Sum of ASCII values: ${charSums.join(" + ")} = ${rawHash}`);
    } else if (this.algo === "polynomial") {
      const p = 31, m = 1000000009;
      let pPow = 1;
      for (let i = 0; i < keyStr.length; i++) {
        const code = keyStr.charCodeAt(i) - 96;
        rawHash = (rawHash + code * pPow) % m;
        pPow = (pPow * p) % m;
      }
      traceSteps.push(`Polynomial hash (p=31): raw_hash = ${rawHash}`);
    } else if (this.algo === "fnv1a") {
      let hash = 0x811c9dc5;
      for (let i = 0; i < keyStr.length; i++) {
        hash ^= keyStr.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0;
      }
      rawHash = hash;
      traceSteps.push(`FNV-1a 32-bit: raw_hash = 0x${rawHash.toString(16).toUpperCase()} (${rawHash})`);
    } else {
      for (let i = 0; i < keyStr.length; i++) {
        rawHash += keyStr.charCodeAt(i);
      }
      traceSteps.push(`Simple Hash: raw_hash = ${rawHash}`);
    }

    const bucketIndex = rawHash % this.capacity;
    traceSteps.push(`Bucket Slot = ${rawHash} % ${this.capacity} = Bucket [${bucketIndex}]`);

    return { rawHash, bucketIndex, trace: traceSteps.join("\n") };
  }

  insert(key, value) {
    const { bucketIndex } = this.computeHashTrace(key);
    const chain = this.buckets[bucketIndex];
    const existingIndex = chain.findIndex((item) => item.key === key);

    if (existingIndex !== -1) {
      chain[existingIndex].value = value;
      return { bucketIndex, isUpdate: true };
    } else {
      chain.push({ key, value });
      this.totalItems++;
      return { bucketIndex, isUpdate: false };
    }
  }

  lookup(key) {
    const { bucketIndex } = this.computeHashTrace(key);
    const chain = this.buckets[bucketIndex];
    const item = chain.find((entry) => entry.key === key);
    return item ? { item, bucketIndex } : null;
  }

  remove(key) {
    const { bucketIndex } = this.computeHashTrace(key);
    const chain = this.buckets[bucketIndex];
    const itemIndex = chain.findIndex((entry) => entry.key === key);

    if (itemIndex !== -1) {
      const removed = chain.splice(itemIndex, 1)[0];
      this.totalItems--;
      return { bucketIndex, removed };
    }
    return null;
  }

  clear() {
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.totalItems = 0;
  }

  getAllItems() {
    const items = [];
    for (const chain of this.buckets) {
      for (const entry of chain) {
        items.push(entry);
      }
    }
    return items;
  }

  getStats() {
    let activeBuckets = 0;
    let collisions = 0;
    let maxChain = 0;

    for (const chain of this.buckets) {
      if (chain.length > 0) activeBuckets++;
      if (chain.length > 1) collisions += chain.length - 1;
      if (chain.length > maxChain) maxChain = chain.length;
    }

    const loadFactor = (this.totalItems / this.capacity).toFixed(2);
    const collisionRate = this.totalItems > 0 ? ((collisions / this.totalItems) * 100).toFixed(1) : "0.0";

    return {
      totalItems: this.totalItems,
      activeBuckets,
      capacity: this.capacity,
      loadFactor,
      collisions,
      maxChain,
      collisionRate
    };
  }
}

// UI Controller
document.addEventListener("DOMContentLoaded", () => {
  const table = new JS_HashTable(8, "unicode_sum");

  // DOM Elements
  const algoSelect = document.getElementById("algoSelect");
  const capacityInput = document.getElementById("capacityInput");
  const keyInput = document.getElementById("keyInput");
  const valInput = document.getElementById("valInput");
  const addBtn = document.getElementById("addBtn");
  const lookupBtn = document.getElementById("lookupBtn");
  const removeBtn = document.getElementById("removeBtn");
  const hashMathBox = document.getElementById("hashMathBox");
  const bucketsView = document.getElementById("bucketsView");
  const consoleLog = document.getElementById("consoleLog");
  const clearConsoleBtn = document.getElementById("clearConsoleBtn");

  // Stats DOM
  const statTotalItems = document.getElementById("statTotalItems");
  const statBuckets = document.getElementById("statBuckets");
  const statCollisions = document.getElementById("statCollisions");
  const statCollisionRate = document.getElementById("statCollisionRate");
  const statLoadFactor = document.getElementById("statLoadFactor");
  const loadBarFill = document.getElementById("loadBarFill");

  // Presets
  const presetAnagrams = document.getElementById("presetAnagrams");
  const presetTech = document.getElementById("presetTech");
  const presetClear = document.getElementById("presetClear");

  function logMessage(msg, type = "info") {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${time}] ${msg}`;
    consoleLog.appendChild(entry);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  function updateUI(highlightBucket = null) {
    // Update Stats
    const stats = table.getStats();
    statTotalItems.textContent = stats.totalItems;
    statBuckets.textContent = `${stats.activeBuckets} / ${stats.capacity}`;
    statCollisions.textContent = stats.collisions;
    statCollisionRate.textContent = `${stats.collisionRate}% collision rate`;
    statLoadFactor.textContent = stats.loadFactor;

    const loadPct = Math.min(100, Math.round((stats.totalItems / stats.capacity) * 100));
    loadBarFill.style.width = `${loadPct}%`;

    // Render Buckets
    bucketsView.innerHTML = "";
    for (let i = 0; i < table.capacity; i++) {
      const chain = table.buckets[i];
      const row = document.createElement("div");
      row.className = `bucket-row ${highlightBucket === i ? "active-bucket" : ""}`;

      const idxLabel = document.createElement("div");
      idxLabel.className = "bucket-index";
      idxLabel.textContent = `Bucket [${i}]`;

      const chainContainer = document.createElement("div");
      chainContainer.className = "bucket-chain";

      if (chain.length === 0) {
        chainContainer.innerHTML = `<span class="empty-bucket">empty</span>`;
      } else {
        chain.forEach((entry, index) => {
          const node = document.createElement("div");
          node.className = "chain-node";
          node.innerHTML = `<span class="chain-key">${escapeHtml(entry.key)}</span>: <span class="chain-val">${escapeHtml(entry.value)}</span>`;
          chainContainer.appendChild(node);

          if (index < chain.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "chain-arrow";
            arrow.innerHTML = "➜";
            chainContainer.appendChild(arrow);
          }
        });
      }

      row.appendChild(idxLabel);
      row.appendChild(chainContainer);
      bucketsView.appendChild(row);
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function updateTrace(key) {
    if (!key) {
      hashMathBox.innerHTML = `<span class="placeholder-text">Type a key or insert an item to see character-by-character ASCII calculation trace.</span>`;
      return;
    }
    const { trace } = table.computeHashTrace(key);
    hashMathBox.textContent = trace;
  }

  // Event Listeners
  keyInput.addEventListener("input", (e) => {
    updateTrace(e.target.value.trim());
  });

  algoSelect.addEventListener("change", (e) => {
    table.setAlgo(e.target.value);
    logMessage(`Switched hashing strategy to '${e.target.value}'.`, "info");
    updateTrace(keyInput.value.trim());
    updateUI();
  });

  capacityInput.addEventListener("change", (e) => {
    const val = parseInt(e.target.value, 10) || 8;
    table.setCapacity(val);
    logMessage(`Resized hash table capacity to ${val} buckets.`, "info");
    updateUI();
  });

  addBtn.addEventListener("click", () => {
    const key = keyInput.value.trim();
    const val = valInput.value.trim() || "val";

    if (!key) {
      logMessage("Key cannot be empty!", "error");
      return;
    }

    const { bucketIndex, isUpdate } = table.insert(key, val);
    updateTrace(key);
    updateUI(bucketIndex);

    if (isUpdate) {
      logMessage(`Updated key '${key}' = '${val}' in Bucket [${bucketIndex}].`, "warning");
    } else {
      logMessage(`Inserted key '${key}' = '${val}' into Bucket [${bucketIndex}].`, "success");
    }

    keyInput.value = "";
    valInput.value = "";
  });

  lookupBtn.addEventListener("click", () => {
    const key = keyInput.value.trim();
    if (!key) {
      logMessage("Enter a key to lookup!", "error");
      return;
    }

    updateTrace(key);
    const result = table.lookup(key);
    if (result) {
      updateUI(result.bucketIndex);
      logMessage(`FOUND '${key}' => '${result.item.value}' in Bucket [${result.bucketIndex}].`, "success");
    } else {
      logMessage(`NOT FOUND: Key '${key}' does not exist in table.`, "error");
      updateUI();
    }
  });

  removeBtn.addEventListener("click", () => {
    const key = keyInput.value.trim();
    if (!key) {
      logMessage("Enter a key to remove!", "error");
      return;
    }

    const result = table.remove(key);
    if (result) {
      updateTrace(key);
      updateUI(result.bucketIndex);
      logMessage(`REMOVED '${key}' from Bucket [${result.bucketIndex}].`, "warning");
    } else {
      logMessage(`REMOVE FAILED: Key '${key}' not found.`, "error");
    }
  });

  clearConsoleBtn.addEventListener("click", () => {
    consoleLog.innerHTML = "";
  });

  // Presets
  presetAnagrams.addEventListener("click", () => {
    table.clear();
    table.setCapacity(8);
    capacityInput.value = 8;
    algoSelect.value = "unicode_sum";
    table.setAlgo("unicode_sum");

    table.insert("golf", "sport");
    table.insert("flog", "activity");
    table.insert("post", "mail");
    table.insert("stop", "halt");
    table.insert("tops", "summit");

    logMessage("Loaded Anagram Collisions Demo ('golf' & 'flog', 'post', 'stop', 'tops').", "info");
    updateTrace("golf");
    updateUI(table.computeHashTrace("golf").bucketIndex);
  });

  presetTech.addEventListener("click", () => {
    table.clear();
    const items = [
      ["python", "scripting"],
      ["javascript", "frontend"],
      ["rust", "systems"],
      ["docker", "containers"],
      ["kubernetes", "orchestration"],
      ["postgres", "database"],
      ["redis", "cache"]
    ];
    items.forEach(([k, v]) => table.insert(k, v));
    logMessage("Loaded Tech Stack Terms dataset.", "info");
    updateTrace("python");
    updateUI();
  });

  presetClear.addEventListener("click", () => {
    table.clear();
    logMessage("Cleared all hash table entries.", "warning");
    updateTrace("");
    updateUI();
  });

  // Initial setup
  presetAnagrams.click();
});
