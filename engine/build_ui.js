window.attributionHTML = attributionHTML;



(async function() {
  const inputFieldCreation = {
    createInputField: function(type, data) {
      let inputField;
      if (type === 'input') {
        inputField = document.createElement('input');
        inputField.type = data.type;
        inputField.id = data.id;
      } else if (type === 'select') {
        inputField = document.createElement('select');
        data.options.forEach((option) => {
          if (option) {
            const opt = document.createElement('option');
            if (option.label) {
              opt.textContent = option.label;
            }
            if (option.text) {
              opt.dataset.text = option.text;
            }
            if (option.additionals) {
              opt.dataset.additionals = option.additionals;
            }
            inputField.appendChild(opt);
          }
        });
      }

      return inputField;
    },

    createCheckbox: function(checkboxData) {
      const labelDiv = document.createElement('div');
      labelDiv.classList.add('prompt-generator-label-div');
      const label = document.createElement('label');
      label.classList.add('checkbox_btn');
      label.textContent = checkboxData.label;
      labelDiv.appendChild(label);

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = checkboxData.value;
      input.id = checkboxData.id;
      input.setAttribute('additionals', checkboxData.additionals);
      input.setAttribute('additionalsHide', checkboxData.additionalsHide);

      label.appendChild(input);
      return labelDiv;
    },

    createDropdown: function(dropdownData) {
      const dropdownWrapper = document.createElement('div');
      dropdownWrapper.classList.add('prompt-generator-dropdown-wrapper');
      const labelDiv = document.createElement('div');
      labelDiv.classList.add('prompt-generator-label-div');

      const label = document.createElement('label');
      label.textContent = dropdownData.label;
      labelDiv.appendChild(label);

      dropdownWrapper.appendChild(labelDiv);

      const dropdownElement = this.createInputField('select', { options: dropdownData.options });
      dropdownElement.id = dropdownData.id;
      dropdownElement.classList.add('prompt-generator-dropdown');
      dropdownWrapper.appendChild(dropdownElement);
      return dropdownWrapper;
    },

    createInput: function(inputData) {
      const inputDiv = document.createElement('div');
      inputDiv.classList.add('prompt-generator-input-div');
      inputDiv.classList.add('HideInput');

      const label = document.createElement('label');
      label.textContent = inputData.label;
      inputDiv.appendChild(label);

      const inputElement = this.createInputField('input', { type: 'text', id: inputData.id });
      inputElement.classList.add('prompt-generator-input');
      inputDiv.appendChild(inputElement);

      return inputDiv;
    },
  };
  let lastSelectedLanguageIndex = 0;
  async function buildUI(xmlData) {

      if (!xmlData) {console.error('xmlData is null');
        return;
      }

    const dropdowns = xmlData.getElementsByTagName('dropdown');
    const checkboxes = xmlData.getElementsByTagName('checkbox');
    const inputs = xmlData.getElementsByTagName('input');
    
    const targetNode = document.querySelector(window.getSelector());

if (targetNode) {
  targetNode.setAttribute('id', 'PromptInput');
  const promptButton = targetNode.nextElementSibling;

  if (promptButton) {
    promptButton.setAttribute('id', 'PromptButton');
    
  }

} else {
  console.log('Das targetNode-Element wurde nicht gefunden.');
}
    if (!targetNode) {
      return;
    }

    const existingContainer = document.getElementById('prompt-generator-container');
const container = existingContainer ? existingContainer : document.createElement('div');
container.id = 'prompt-generator-container';
container.classList.add('prompt-generator-container');
clearContainer(container);


    const image = document.createElement('img');
image.src = chrome.runtime.getURL('Images/logo.png');
image.classList.add('prompt-generator-image');
container.appendChild(image);









if (!toggleButtonAdded) {
/* On Off Button */
const toggleButton = document.createElement('button');
toggleButton.classList.add('toggle-button');
toggleButton.onclick = toggleContainer;

const toggleButtonImage = document.createElement('img');
toggleButtonImage.src = chrome.runtime.getURL('Images/OnOff.png');
toggleButtonImage.width = 128;
toggleButtonImage.height = 128;
toggleButton.appendChild(toggleButtonImage);

const parentElement = targetNode.parentElement;
parentElement.insertBefore(container, targetNode);
parentElement.insertBefore(toggleButton, targetNode);
toggleButtonAdded = true;


}






    const languageDropdown = createLanguageDropdown();
    container.appendChild(languageDropdown);




    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add('prompt-generator-checkbox-container');
    container.appendChild(checkboxContainer);

    Array.from(checkboxes).forEach((checkbox) => {
      const checkboxData = {
        label: checkbox.querySelector('label').textContent,
        value: checkbox.querySelector('value').textContent,
        id: checkbox.querySelector('id').textContent,
        additionals: checkbox.querySelector('additionals').textContent,
        additionalsHide: checkbox.querySelector('additionalsHide').textContent,
      };
      const checkboxElement = inputFieldCreation.createCheckbox(checkboxData);
      checkboxContainer.appendChild(checkboxElement);
    });

    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('prompt-generator-dropdown-container');
    container.appendChild(dropdownContainer);

    Array.from(dropdowns).forEach((dropdown) => {
  const options = dropdown.querySelectorAll('options option');
  const idElement = dropdown.querySelector('id');
  const labelElement = dropdown.querySelector('label');
  const dropdownData = {
    id: idElement ? idElement.textContent : '',
    label: labelElement ? labelElement.textContent : '',
    options: Array.from(options).map((option) => {
      const optionLabelElement = option.querySelector('label');
      const optionValueElement = option.querySelector('value');
      const optionAdditionalsElement = option.querySelector('additionals');
      return {
        label: optionLabelElement ? optionLabelElement.textContent : '',
        text: optionValueElement ? optionValueElement.textContent : '',
        additionals: optionAdditionalsElement ? optionAdditionalsElement.textContent : null,
      };
    }),
  };
  const dropdownElement = inputFieldCreation.createDropdown(dropdownData);
  dropdownContainer.appendChild(dropdownElement);
});


/*funktioniert */
const inputContainer = document.createElement('div');
inputContainer.classList.add('prompt-generator-input-container');
container.appendChild(inputContainer);

Array.from(inputs).forEach((input) => {
  const inputData = {
    label: input.querySelector('label').textContent,
    id: input.querySelector('id').textContent,
  };

  const inputElement = inputFieldCreation.createInput(inputData);
  const inputField = inputElement.querySelector('input');
  inputField.placeholder = inputData.label;
  inputContainer.appendChild(inputElement);
});

targetNode.parentElement.insertBefore(container, targetNode);







    const attribution = document.createElement('div');
    attribution.innerHTML = window.attributionHTML;

    attribution.classList.add('prompt-generator-attribution');
    
    createInputs(container, xmlData);
    getInputTexts(xmlData);
  
    container.appendChild(attribution);
   
  }

  function clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function createInputs(container, xmlData) {
    const inputs = xmlData.getElementsByTagName('input');
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('prompt-generator-input-container');
    container.appendChild(inputContainer);
  
    Array.from(inputs).forEach((input) => {
      const labelElement = input.querySelector('label');
      const idElement = input.querySelector('id');
      const valueBeforeElement = input.querySelector('valueBefore');
      const valueAfterElement = input.querySelector('valueAfter');
  
      const inputData = {
        label: labelElement ? labelElement.textContent : '',
        id: idElement ? idElement.textContent : '',
        valueBefore: valueBeforeElement ? valueBeforeElement.textContent : '',
        valueAfter: valueAfterElement ? valueAfterElement.textContent : '',
      };
  
      const inputElement = inputFieldCreation.createInput(inputData);
      const inputField = inputElement.querySelector('input');
      inputField.setAttribute('valueBefore', inputData.valueBefore);
      inputField.setAttribute('valueAfter', inputData.valueAfter);
      inputField.placeholder = inputData.label;
      inputContainer.appendChild(inputElement);
    });
  }
  


  window.buildUI = buildUI;

})();

   

/*container öffnen schliessen */

let containerVisible = true;

function toggleContainer() {
  const container = document.getElementById('prompt-generator-container');
  const containerVisible = !container.classList.contains('hidden');
  const toggleButton = document.querySelector('.toggle-button');
  if (containerVisible) {
    container.classList.add('hidden');
    toggleButton.classList.add('rotated'); 

  } else {
    const selectedLanguage = localStorage.getItem('selectedLanguage') || initialLang;
    updateUI(selectedLanguage); 
    container.classList.remove('hidden');
    toggleButton.classList.remove('rotated'); 

  }
}

function resetInputFields() {
  const container = document.getElementById('prompt-generator-container');
  const inputs = container.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      input.checked = false;
    } else if (input.tagName === 'SELECT') {
      input.selectedIndex = 0;
    } else {
      input.value = '';
    }
  });
}



function hideAdditionalInputs() {
  const inputElements = document.querySelectorAll('.prompt-generator-input-container .prompt-generator-input-div');
  inputElements.forEach(inputDiv => {
    if (!inputDiv.classList.contains('HideInput')) {
      inputDiv.classList.add('HideInput');
      const inputElement = inputDiv.querySelector('input[type="text"]');
      inputElement.value = '';
    }
  });
}




