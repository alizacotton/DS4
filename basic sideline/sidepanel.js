const createNoteBtn = document.getElementById('create-note');
const deleteAllBtn = document.getElementById('delete-all');
const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-button');
const darkModeToggle = document.getElementById('toggle-dark-mode');

// Load notes from chrome.storage.local
function loadNotes() {
  chrome.storage.local.get(['notes'], (result) => {
    const notes = result.notes || [];
    notesContainer.innerHTML = '';

    notes.reverse().forEach((note, index) => {
      createNoteElement(note.title, note.body, note.url, note.textAreaHeight, index);
    });
  });
}

function applyTheme(isDarkMode) {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.querySelector('.header').classList.add('dark-mode');
      document.querySelectorAll('.note').forEach(note => note.classList.add('dark-mode'));
      document.querySelectorAll('.note-footer').forEach(footer => footer.classList.add('dark-mode'));
    } else {
      document.body.classList.remove('dark-mode');
      document.querySelector('.header').classList.remove('dark-mode');
      document.querySelectorAll('.note').forEach(note => note.classList.remove('dark-mode'));
      document.querySelectorAll('.note-footer').forEach(footer => footer.classList.remove('dark-mode'));
    }
  }

  // Check for existing dark mode preference in storage
chrome.storage.local.get(['darkMode'], (result) => {
    const isDarkMode = result.darkMode || false;
    applyTheme(isDarkMode); // Apply the theme on page load
  });

//create auto-resizing text area
function textAreaAdjust(element) {
    if (element) {  // Check if element is not null or undefined
      element.style.height = "1px";
      element.style.height = (25 + element.scrollHeight) + "px";
    } else {
      console.error('Element is undefined or null');
    }
  }


// Create a new note element
function createNoteElement(title = '', body = '', url = '', textAreaHeight = 25, index = null) {
  const noteDiv = document.createElement('div');
  noteDiv.className = 'note';

  // Title input
  const titleInput = document.createElement('input');
  titleInput.placeholder = 'Note Title';
  titleInput.value = title;
  titleInput.addEventListener('input', () => saveNotes());

  // Body textarea
  const bodyTextarea = document.createElement('textarea');
  bodyTextarea.placeholder = 'Start typing here...';
  bodyTextarea.value = body;
  bodyTextarea.style.height = `${textAreaHeight}px`;
  bodyTextarea.addEventListener('input', () => {
    textAreaAdjust(bodyTextarea); // Auto-resize as user types
    saveNotes(); // Save notes when content changes
  });

  //URL and delete icon footer
  const footerDiv = document.createElement('div');
  footerDiv.className = 'note-footer';
  

  // Trash can icon
  const deleteIcon = document.createElement('img');
  deleteIcon.src = 'icons/trash.png';
  deleteIcon.className = 'delete-icon';
  deleteIcon.addEventListener('click', () => deleteNote(index));

  //URL display creation
  const urlDisplay = document.createElement('p');
  urlDisplay.className = 'note-url';
  urlDisplay.id = 'editable-url';
  urlDisplay.textContent = url;
  urlDisplay.contentEditable = false;
  urlDisplay.addEventListener('input', () => {
    saveNotes();
  })
  urlDisplay.addEventListener('click', () => chrome.tabs.create({url: url}));
  footerDiv.appendChild(urlDisplay);
  footerDiv.appendChild(deleteIcon);

  //appending everything to the note
  noteDiv.appendChild(titleInput);
  noteDiv.appendChild(bodyTextarea);
  noteDiv.appendChild(footerDiv)
  notesContainer.appendChild(noteDiv);
}

// Save all notes to chrome.storage.local
function saveNotes() {
  const notes = [];
  const noteElements = document.querySelectorAll('.note');
  noteElements.forEach((noteElement) => {
    const title = noteElement.querySelector('input').value;
    const body = noteElement.querySelector('textarea').value;
    const url = noteElement.querySelector('.note-url').textContent;

    const textAreaHeight = noteElement.querySelector('textarea').style.height;
    notes.unshift({ title, body, url, textAreaHeight: parseInt(textAreaHeight, 10) || 25});
  });
  chrome.storage.local.set({ notes });
}

// Delete a note by index
function deleteNote(index) {
  chrome.storage.local.get(['notes'], (result) => {
    const notes = result.notes || [];
    notes.splice(notes.length - 1 - index, 1); // Remove note by index
    chrome.storage.local.set({ notes }, () => {
      loadNotes(); // Reload notes after deletion
    });
  });
}

//Delete all notes
deleteAllBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all notes?")) {
      chrome.storage.local.set({ notes: [] }, () => {
        loadNotes(); // Clear all notes from the UI
      });
    }
  });

// Create a new note when the button is clicked
createNoteBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url; // Get the URL of the current active tab
  
      chrome.storage.local.get(['notes'], (result) => {
        const notes = result.notes || [];
        notes.push({ title: '', body: '', url: currentUrl, textAreaHeight: 25}); // New note with empty title and body, and the current URL
        chrome.storage.local.set({ notes }, () => {
          loadNotes(); // Reload notes
        });
      });
    });
  });

  darkModeToggle.addEventListener('click', () => {
    // Toggle dark mode on button click
    chrome.storage.local.get(['darkMode'], (result) => {
      const currentMode = result.darkMode || false;
      const newMode = !currentMode;
  
      // Save the new mode preference to chrome.storage.local
      chrome.storage.local.set({ darkMode: newMode }, () => {
        applyTheme(newMode); // Apply the theme based on the updated preference
      });
    });
  });

// Load notes when the extension popup opens
loadNotes();