const save = document.getElementById("save");
const clear = document.getElementById("clear");
const noteInput = document.getElementById("noteInput");
const create = document.getElementById("create")
const notesContainer = document.getElementById("notes-container")
const darkModeToggle = document.getElementById('darkModeToggle')
const body = document.body

let notes = document.querySelectorAll(".input-box")

(function checkOldData() {
    getData(function (data) {
      noteInput.value = data
    });
    console.log(1);
  })();

  noteInput.addEventListener('keyup', async function() {
    if (noteInput.value === "") return;
    chrome.storage.local.set({ myData: noteInput.value });
  })

  save.addEventListener("click", async () => {
    if (noteInput.value === "") return;
    chrome.storage.local.set({ myData: noteInput.value });
  });

  async function getData(callback) {
    chrome.storage.local.get(["myData"], function (result) {
      let savedData = result.myData || "";
      if (callback) {
        callback(savedData);
      }
    });
  }


  document.addEventListener('DOMContentLoaded', function() {
    darkModeToggle.addEventListener('click', function() {
      body.classList.toggle('dark-mode');   
  
    });
  });