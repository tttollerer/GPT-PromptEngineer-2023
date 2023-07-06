function buildUIElements(container) {


  const checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('prompt-generator-checkbox-container');
  container.appendChild(checkboxContainer);

  window.createInputField = function createInputField(type, data) {
    let inputField;
    if (type === 'input') {
      inputField = document.createElement('input');
      inputField.type = data.type;
      inputField.id = data.id;
    } else if (type === 'select') {
      inputField = document.createElement('select');
      data.options.forEach((option) => {
        const opt = document.createElement('option');
        opt.textContent = option.label;
        opt.dataset.text = option.text;
        opt.dataset.additionals = option.additionals;
        inputField.appendChild(opt);
      });
    }

    return inputField;
  };

  window.createCheckbox = function createCheckbox(checkboxData) {
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
  };

  window.createDropdown = function createDropdown(dropdownData) {
    const dropdownWrapper = document.createElement('div');
    dropdownWrapper.classList.add('prompt-generator-dropdown-wrapper');
    const labelDiv = document.createElement('div');
    labelDiv.classList.add('prompt-generator-label-div');

    const label = document.createElement('label');
    label.textContent = dropdownData.label;
    labelDiv.appendChild(label);

    dropdownWrapper.appendChild(labelDiv);

    const dropdownElement = createInputField('select', { options: dropdownData.options });
    dropdownElement.id = dropdownData.id;
    dropdownElement.classList.add('prompt-generator-dropdown');
    dropdownWrapper.appendChild(dropdownElement);
    return dropdownWrapper;
  };

  window.createInput = function createInput(inputData) {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('prompt-generator-input-div');
    inputDiv.classList.add('HideInput');

    const label = document.createElement('label');
    label.textContent = inputData.label;
    inputDiv.appendChild(label);

    const inputElement = createInputField('input', { type: 'text', id: inputData.id });
    inputElement.classList.add('prompt-generator-input');
    inputDiv.appendChild(inputElement);

    return inputDiv;
  };
}

window.buildUIElements = buildUIElements;
