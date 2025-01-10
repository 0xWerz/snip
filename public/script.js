let currentMode = "edit";

async function saveSnippet() {
  try {
    const code = document.getElementById("editor").textContent;
    const response = await fetch("/save", { method: "POST", body: code });
    const result = await response.json();
    showSavedCode(result.key, code);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function showSavedCode(key, code) {
  history.pushState(null, "", `/${key}`);

  const editor = document.getElementById("editor");
  editor.textContent = code;
  editor.contentEditable = "false";

  hljs.highlightAll();
  currentMode = "view";
  updateLineNumbers();

  document.getElementById("line-numbers").style.display = "block";
  document.getElementById("chevron").style.display = "none";
}

function switchToEditMode() {
  const editor = document.getElementById("editor");
  editor.contentEditable = "true";
  editor.innerHTML = editor.textContent; // Remove highlighting
  currentMode = "edit";
  updateLineNumbers();
}

function updateLineNumbers() {
  const editor = document.getElementById("editor");
  const lineNumbers = document.getElementById("line-numbers");
  const lines = editor.textContent.split("\n");
  lineNumbers.innerHTML = lines.map((_, index) => index + 1).join("<br>");
}

function showTutorial() {
  const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
  if (!hasSeenTutorial) {
    const dialog = document.getElementById("tutorial-dialog");
    dialog.showModal();

    dialog.addEventListener(
      "close",
      () => {
        localStorage.setItem("hasSeenTutorial", "true");
      },
      { once: true }
    );
  }
}

document.addEventListener("keydown", async (e) => {
  if (e.key === "s" && e.ctrlKey) {
    e.preventDefault();
    if (currentMode === "edit") {
      await saveSnippet();
    }
  } else if (e.key === "e" && e.ctrlKey) {
    e.preventDefault();
    if (currentMode === "view") {
      switchToEditMode();
    }
  }
});

window.addEventListener("load", () => {
  document.getElementById("editor").focus();
  if (window.location.pathname !== "/") {
    updateLineNumbers();
  } else {
    document.getElementById("line-numbers").style.display = "none";
    showTutorial();
  }
});

document.getElementById("editor").addEventListener("input", () => {
  if (window.location.pathname !== "/") {
    updateLineNumbers();
  }
});

document.getElementById("editor").addEventListener("scroll", () => {
  document.getElementById("line-numbers").scrollTop =
    document.getElementById("editor").scrollTop;
});
