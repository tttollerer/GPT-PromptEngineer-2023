let firstDropdownsUnhidable = 6;
let dropdownsAdded = false;
let initCalled = false;
let container;
let toggleButtonAdded = false;
let xmlData;
let combinedText;



async function init() {
  try {
    if (initCalled || dropdownsAdded) {
      return;
    }

    initCalled = true;

    removeExistingContainer();

    const container = createContainer();
    document.body.appendChild(container);
    window.initLanguageSwitcher();
    xmlData = await window.fetchDropdownData();

    if (!xmlData) {
      console.error('Failed to fetch XML data');
      return;
    }

    window.buildUI(xmlData);
    addEventListeners(container);
  } catch (error) {
    console.error('Error in init:', error);
  }
}


function createContainer() {
  container = document.createElement("div");
  container.id = "prompt-generator-container";
  container.classList.add("prompt-generator-container");

  return container;
}


function addEventListeners(container) {
  const targetNode = document.querySelector(window.getSelector());

  if (!targetNode) {
    console.error('PromptEngineer: Target input field not found. Selector:', window.getSelector());
    console.error('PromptEngineer: Available textareas:', document.querySelectorAll('textarea'));
    return;
  }

  console.log('PromptEngineer: Target node found:', targetNode);

  window.submitForm = async function(xmlData) {
    try {
      if (!targetNode) {
        console.error('Target node not found');
        return;
      }

      const formData = collectFormData();
      const combinedText = buildPromptText(formData);
      
      targetNode.value = combinedText.trim();
      
      await submitPrompt();
      scheduleCleanup();
    } catch (error) {
      console.error('Error in submitForm:', error);
    }
  };

  function collectFormData() {
    const originalText = targetNode.value.trim();
    const dropdownTexts = collectDropdownTexts();
    const inputTexts = collectInputTexts();
    const { checkboxTexts, additionalIds } = collectCheckboxData();
    const languageInfo = getLanguageInfo();

    return {
      originalText,
      dropdownTexts,
      inputTexts,
      checkboxTexts,
      additionalIds,
      languageInfo
    };
  }

  function collectDropdownTexts() {
    let dropdownTexts = '';
    const selects = document.querySelectorAll('.prompt-generator-container select');
    
    for (const select of selects) {
      const selectedOption = select.options[select.selectedIndex];
      const selectedText = selectedOption?.dataset?.text;
      if (selectedText) {
        dropdownTexts += ' ' + selectedText;
      }
    }
    return dropdownTexts;
  }

  function collectInputTexts() {
    let inputTexts = '';
    const inputs = document.querySelectorAll('.prompt-generator-container input[type="text"]');
    
    for (const input of inputs) {
      if (input.value) {
        const valueBefore = input.getAttribute('valueBefore') || '';
        const valueAfter = input.getAttribute('valueAfter') || '';
        inputTexts += ' ' + valueBefore + input.value + valueAfter;
      }
    }
    return inputTexts;
  }

  function collectCheckboxData() {
    let checkboxTexts = '';
    let additionalIds = [];
    const checkboxes = document.querySelectorAll('.prompt-generator-container input[type="checkbox"]');

    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        checkboxTexts += ' ' + checkbox.value;
        const additionalFields = checkbox.getAttribute('additionals');
        if (additionalFields) {
          const ids = additionalFields.split(',');
          ids.forEach(id => additionalIds.push(id.trim()));
        }
      } else {
        hideUncheckedFields(checkbox);
      }
    }

    return { checkboxTexts, additionalIds };
  }

  function hideUncheckedFields(checkbox) {
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

  function getLanguageInfo() {
    const currentLanguageDropdown = document.getElementById('language-selector');
    if (!currentLanguageDropdown) {
      return { code: 'en', name: 'English' };
    }

    const selectedLanguageCode = currentLanguageDropdown.value;
    const selectedLanguageName = languageMapping[selectedLanguageCode] || selectedLanguageCode;
    
    return {
      code: selectedLanguageCode,
      name: selectedLanguageName
    };
  }

  function buildPromptText(formData) {
    if (container.classList.contains('hidden')) {
      return formData.originalText;
    }

    let combinedText = `${formData.dropdownTexts}\n${formData.checkboxTexts}\n${formData.inputTexts}\n\n${formData.originalText}`;
    
    if (formData.languageInfo.code && formData.languageInfo.code !== "en") {
      combinedText += `\n\nAnswer in ${formData.languageInfo.name} all the time.`;
    }
    
    return combinedText;
  }

  async function submitPrompt() {
    const sendButton = document.getElementById('PromptButton');
    if (!sendButton) {
      console.log("Send button not found");
      return;
    }

    sendButton.click();
    
    setTimeout(() => {
      sendButton.click();
    }, 10000);
  }

  function scheduleCleanup() {
    setTimeout(() => {
      if (targetNode) {
        targetNode.value = '';
      }
    }, 2000);

    setTimeout(() => {
      if (isContainerOpen()) {
        toggleContainerVisibility();
      }
    }, 10000);
  }
  





  targetNode.addEventListener("keydown", function (event) {
    if (event.target === targetNode && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitForm(xmlData);
    }
  });



  container.addEventListener("change", handleContainerChange);

  function handleContainerChange(event) {
    try {
      if (!event.target.options || typeof event.target.selectedIndex === 'undefined') {
        return;
      }

      const selectedOption = event.target.options[event.target.selectedIndex];
      const additionalIds = extractAdditionalIds(selectedOption);

      hideAllInputs(additionalIds);
      handleCheckboxVisibility(selectedOption);
      showAdditionalInputs(additionalIds);
    } catch (error) {
      console.error('Error handling container change:', error);
    }
  }

  function extractAdditionalIds(selectedOption) {
    const additionalIds = [];
    if (selectedOption.dataset && selectedOption.dataset.additionals) {
      const ids = selectedOption.dataset.additionals.split(',');
      ids.forEach(id => additionalIds.push(id.trim()));
    }
    return additionalIds;
  }

  function hideAllInputs(additionalIds) {
    const inputDivs = container.querySelectorAll('.prompt-generator-input-div');
    inputDivs.forEach(inputDiv => {
      const inputElement = inputDiv.querySelector('input[type="text"]');
      if (inputElement && !additionalIds.includes(inputElement.id)) {
        inputDiv.classList.add('HideInput');
        inputElement.value = '';
      }
    });
  }

  function handleCheckboxVisibility(selectedOption) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      const checkboxField = checkbox.parentElement.parentElement;
      const additionals = checkbox.getAttribute('additionals');
      const additionalsHide = checkbox.getAttribute('additionalsHide');

      if (additionals && additionalsHide) {
        if (selectedOption.dataset && selectedOption.dataset.text === checkbox.value) {
          checkboxField.classList.remove('HideInput');
        } else {
          checkboxField.classList.add('HideInput');
          clearHiddenFields(additionalsHide);
        }
      }
    });
  }

  function clearHiddenFields(additionalsHide) {
    const ids = additionalsHide.split(',');
    ids.forEach(id => {
      const inputField = document.getElementById(id.trim());
      if (inputField) {
        inputField.value = '';
      }
    });
  }

  function showAdditionalInputs(additionalIds) {
    additionalIds.forEach(id => {
      const inputField = document.getElementById(id.trim());
      if (inputField) {
        inputField.parentElement.classList.remove('HideInput');
      }
    });
  }

  dropdownsAdded = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
  initMutationObserver();
}

function initMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    const targetNode = document.querySelector(window.getSelector());
    if (targetNode) {
      init();
      observer.disconnect();
    } else {
      console.log("targetNode, bzw. das Eingabefeld wurde nicht gefunden, überprüfe den Spaceholder in den Settings.");
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


function isContainerOpen() {
  // Prüfen, ob der Container sichtbar ist, indem die Sichtbarkeit des Elements geprüft wird
  return window.getComputedStyle(container).display !== "none";
}


