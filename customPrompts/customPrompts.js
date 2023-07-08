// Wenn der Benutzer das Formular abschickt
document.getElementById('new-prompt-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Verhindert das Neuladen der Seite
  
    // Nehmen Sie den Text aus dem Eingabefeld
    const newPrompt = document.getElementById('new-prompt').value;
  
    // Lesen Sie die gespeicherten Prompts aus dem Local Storage
    const storedPrompts = JSON.parse(localStorage.getItem('prompts') || '[]');
  
    // Fügen Sie den neuen Prompt zur Liste hinzu
    storedPrompts.push(newPrompt);
  
    // Speichern Sie die aktualisierte Liste im Local Storage
    localStorage.setItem('prompts', JSON.stringify(storedPrompts));
  
    // Aktualisieren Sie die Dropdown-Liste
    updatePromptList();
  });
  
  // Wenn der Benutzer auf den Löschen-Button klickt
  document.getElementById('delete-prompt').addEventListener('click', function() {
    // Lesen Sie die gespeicherten Prompts aus dem Local Storage
    const storedPrompts = JSON.parse(localStorage.getItem('prompts') || '[]');
  
    // Finden Sie den ausgewählten Prompt
    const selectedPrompt = document.getElementById('prompt-list').value;
  
    // Entfernen Sie den ausgewählten Prompt aus der Liste
    const index = storedPrompts.indexOf(selectedPrompt);
    if (index !== -1) {
      storedPrompts.splice(index, 1);
    }
  
    // Speichern Sie die aktualisierte Liste im Local Storage
    localStorage.setItem('prompts', JSON.stringify(storedPrompts));
  
    // Aktualisieren Sie die Dropdown-Liste
    updatePromptList();
  });
  
  // Funktion zum Aktualisieren der Dropdown-Liste
  function updatePromptList() {
    // Lesen Sie die gespeicherten Prompts aus dem Local Storage
    const storedPrompts = JSON.parse(localStorage.getItem('prompts') || '[]');
  
    // Leeren Sie die Dropdown-Liste
    const promptList = document.getElementById('prompt-list');
    while (promptList.firstChild) {
      promptList.removeChild(promptList.firstChild);
    }
  
    // Fügen Sie jeden gespeicherten Prompt zur Dropdown-Liste hinzu
    for (const prompt of storedPrompts) {
      const option = document.createElement('option');
      option.value = prompt;
      option.textContent = prompt;
      promptList.appendChild(option);
    }
  }
  
  // Aktualisieren Sie die Dropdown-Liste, wenn die Seite geladen wird
  window.addEventListener('load', updatePromptList);
  