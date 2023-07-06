// Erstellt den Spracheingabe-Button
function createSpeechButton() {
    const speechButton = document.createElement('speechButton');
    speechButton.id = 'speech-button';
    speechButton.textContent = '🎤';
    speechButton.addEventListener('mousedown', startSpeechToText);
    speechButton.addEventListener('mouseup', stopSpeechToText);
    document.body.appendChild(speechButton);
}

// Startet die Spracherkennung
function startSpeechToText() {
    window.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    window.recognition.lang = 'de-DE';
    window.recognition.interimResults = false;
    window.recognition.maxAlternatives = 5;
    window.recognition.start();
}


window.onload = function() {
    window.getSelector = function() {
      const url = window.location.href;
  
      for (let i = 0; i < window.PAGE_SETTINGS.length; i++) {
        const pageSetting = window.PAGE_SETTINGS[i];
        if (url.match(new RegExp(pageSetting.url.replace(/\*/g, ".*")))) {
          return pageSetting.selector;
        }
      }
  
      // Rückgabe eines Standardselektors, wenn keine Übereinstimmung gefunden wurde
      return "";
    };};



// Stoppt die Spracherkennung und setzt das Ergebnis in das Textfeld
function stopSpeechToText() {
    window.recognition.stop();
    window.recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const selector = window.getSelector();
        const targetNode = document.querySelector(selector);
        if (targetNode) {
            targetNode.value = transcript;
        } else {
            console.error('targetNode, bzw. das Eingabefeld wurde nicht gefunden, überprüfe den Selektor in den Settings.');
        }
    };
}




// Erstellt den Button bei Laden der Seite
window.onload = function() {
    createSpeechButton();
}
