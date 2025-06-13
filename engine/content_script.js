let firstDropdownsUnhidable = 6;
let dropdownsAdded = false;
let initCalled = false;
let container;
let toggleButtonAdded = false;
let xmlData;
let combinedText;



async function init() {
  if (initCalled) {
    return;
  }

  initCalled = true;

  if (dropdownsAdded) {
    return;
  }

  // Add 2-second delay to ensure getSelector is available
  await new Promise(resolve => setTimeout(resolve, 2000));

  removeExistingContainer();

  const container = createContainer();
  document.body.appendChild(container);
  window.initLanguageSwitcher();
  xmlData = await window.fetchDropdownData(localStorage.getItem('selectedLanguage') || 'en');



  //window.buildUI(xmlData);
  window.buildUIElements(container);
  addEventListeners(container);
}


function createContainer() {
  container = document.createElement("div");
  container.id = "prompt-generator-container";
  container.classList.add("prompt-generator-container");

  return container;
}


function addEventListeners(container) {
  const targetNode = document.querySelector(window.getSelector());


  window.submitForm = async function(xmlData) {
    let originalText = targetNode.value.trim();
    let dropdownTexts = '';
    for (const select of document.querySelectorAll('.prompt-generator-container select')) {
      const selectedText = select.options[select.selectedIndex].dataset.text;
      dropdownTexts += selectedText ? ' ' + selectedText : '';
    }
  
    let inputTexts = '';
    for (const input of document.querySelectorAll('.prompt-generator-container input[type="text"]')) {
      if (input.value) {
        inputTexts += ' ' + input.getAttribute('valueBefore') + input.value + input.getAttribute('valueAfter');
      }
    }
  
    let checkboxTexts = '';
    let additionalIds = [];
  
    for (const checkbox of document.querySelectorAll('.prompt-generator-container input[type="checkbox"]')) {
      if (checkbox.checked) {
        checkboxTexts += ' ' + checkbox.value;
        const additionalFields = checkbox.getAttribute('additionals');
        if (additionalFields) {
          const ids = additionalFields.split(',');
          ids.forEach(id => additionalIds.push(id.trim()));
        }
      } else {
        const additionalFields = checkbox.getAttribute('additionalsHide');
        if (additionalFields) {
          const ids = additionalFields.split(',');
          ids.forEach(id => {
            const inputField = document.getElementById(id.trim());
            if (inputField) {
              inputField.parentElement.classList.add('HideInput');
              inputField.value = '';
            }
          });
        }
      }
    }
  
    function getLanguageName(langCode) {
      return languageMapping[langCode] || langCode;
    }
  
    const currentLanguageDropdown = document.getElementById('language-selector');
    const selectedLanguageCode = currentLanguageDropdown.value;
    const selectedLanguageName = getLanguageName(selectedLanguageCode);
  
   
  
    if (container.classList.contains('hidden')) {
      combinedText = originalText;
    } else {
      combinedText = `${dropdownTexts}\n${checkboxTexts}\n${inputTexts}\n\n${originalText}`;
      if (selectedLanguageCode && selectedLanguageCode !== "en") {
        combinedText += `\n\nAnswer in ${selectedLanguageName} all the time.`;
      }
    }
    targetNode.value = combinedText.trim();
  
    const sendButton = document.getElementById('PromptButton');
    if (sendButton) {
      sendButton.click();

      setTimeout(function() {
        sendButton.click();
  
      setTimeout(function () {
        targetNode.value = '';
      }, 2000);
  
      setTimeout(() => {
        if (isContainerOpen()) {
          toggleContainerVisibility();
        }
      }, 10000);
    }, 10000);  // Hinzugefügt: Warte 500 ms bevor das Senden ausgelöst wird
  } else {
      console.log("Send button not found");
    }
  }
  





  targetNode.addEventListener("keydown", function (event) {
    if (event.target === targetNode && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitForm(xmlData);
    }
  });



  container.addEventListener("change", function (event) {


    if (!event.target.options || typeof event.target.selectedIndex === 'undefined') {
      return;
    }

    const selectedOption = event.target.options[event.target.selectedIndex];
    let additionalIds = [];



    if (selectedOption.dataset && selectedOption.dataset.additionals) {
      const ids = selectedOption.dataset.additionals.split(',');
      ids.forEach(id => additionalIds.push(id.trim()));


    }

    Array.from(container.querySelectorAll('.prompt-generator-input-div')).forEach(inputDiv => {
      const inputElement = inputDiv.querySelector('input[type="text"]');
      if (inputElement && !additionalIds.includes(inputElement.id)) {
        inputDiv.classList.add('HideInput');
        inputElement.value = '';
      }
    });

    Array.from(container.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
      const checkboxField = checkbox.parentElement.parentElement;
      const additionals = checkbox.getAttribute('additionals');
      const additionalsHide = checkbox.getAttribute('additionalsHide');




      if (additionals && additionalsHide) {
        if (selectedOption.dataset && selectedOption.dataset.text === checkbox.value) {
          checkboxField.classList.remove('HideInput');
        } else {
          checkboxField.classList.add('HideInput');
          const ids = additionalsHide.split(',');
          ids.forEach(id => {
            const inputField = document.getElementById(id.trim());
            if (inputField) {
              inputField.value = '';
            }
          });
        }
      }
    });

    Array.from(additionalIds).forEach(id => {
      const inputField = document.getElementById(id.trim());
      if (inputField) {
        inputField.parentElement.classList.remove('HideInput');
      }
    });
  });

  dropdownsAdded = true;
  updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
  initMutationObserver();
}

function initMutationObserver() {
  const observer = new MutationObserver(async (mutations) => {
    // Add delay to ensure getSelector function is available
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (window.getSelector) {
      const targetNode = document.querySelector(window.getSelector());
      if (targetNode) {
        init();
        observer.disconnect();
      } else {
        console.log("targetNode, bzw. das Eingabefeld wurde nicht gefunden, überprüfe den Spaceholder in den Settings.");
      }
    } else {
      console.log("getSelector function not available yet");
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}


function removeExistingContainer() {
  const existingContainer = document.getElementById('prompt-generator-container');
  if (existingContainer) {
    existingContainer.remove();
  }
}

function toggleContainerVisibility() {
  if (isContainerOpen()) {
    container.classList.add('hidden');
  } else {
    container.classList.remove('hidden');
  }
}

function getInputTexts(xmlData) {
  const inputs = xmlData.getElementsByTagName('input');
  Array.from(inputs).forEach((input) => {
    const idElement = input.querySelector('id');
    const valueBeforeElement = input.querySelector('valueBefore');
    const valueAfterElement = input.querySelector('valueAfter');
    const inputId = idElement ? idElement.textContent : '';

    if (inputId) {
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        const valueBefore = valueBeforeElement ? valueBeforeElement.textContent : '';
        const valueAfter = valueAfterElement ? valueAfterElement.textContent : '';
        inputElement.setAttribute('valueBefore', valueBefore);
        inputElement.setAttribute('valueAfter', valueAfter);
      }
    }
  });
}

function isContainerOpen() {
  // Prüfen, ob der Container sichtbar ist, indem die Sichtbarkeit des Elements geprüft wird
  return window.getComputedStyle(container).display !== "none";
}


