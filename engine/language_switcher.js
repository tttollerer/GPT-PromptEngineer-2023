const initialLang = 'en';

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

async function loadLanguageData(lang) {
  if (!lang) {
    console.warn('Language code is undefined. Using initial language.');
    lang = initialLang;
  }

  const response = await fetch(chrome.runtime.getURL(`XML/data_${lang}.xml`));
  const text = await response.text();
  const parser = new DOMParser();
  const xmlData = parser.parseFromString(text, 'application/xml');
  return xmlData;
}

function createLanguageDropdown() {
  const dropdown = document.createElement('select');
  dropdown.id = 'language-selector';
  dropdown.innerHTML = window.SETTINGS.LANGUAGE_DROPDOWN_OPTIONS;
  dropdown.tabIndex = -1;
  return dropdown;
}

let languageDropdown;

async function updateUI(lang) {
  if (!lang) {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    lang = selectedLanguage || initialLang;
  }

  const xmlData = await window.fetchDropdownData(lang);
  const container = document.getElementById('prompt-generator-container');
  clearContainer(container);
  await buildUI(xmlData);
  
  if (container && languageDropdown) {
    container.appendChild(languageDropdown);
    languageDropdown.removeEventListener('change', handleLanguageChange);
    languageDropdown.addEventListener('change', handleLanguageChange);
    updateLanguageDropdown(lang);
  }
  updateLanguageDropdown(lang); 
}


function handleLanguageChange(event) {
  const lang = event.target.value;
  localStorage.setItem('selectedLanguage', lang);
  updateUI(lang);
}

async function initLanguageSwitcher() {
  languageDropdown = createLanguageDropdown();
  
  const storedLang = localStorage.getItem('selectedLanguage');
  if (storedLang) {
    languageDropdown.value = storedLang;
  }

  languageDropdown.addEventListener('change', handleLanguageChange);

  const container = document.getElementById('prompt-generator-container');
  if (container) {
    container.appendChild(languageDropdown);
  }


  
}

/*
(async function () {
  const selectedLanguage = localStorage.getItem('selectedLanguage');
  await updateUI(selectedLanguage || initialLang);
  initLanguageSwitcher();
})();
*/

function updateLanguageDropdown(lang) {
  const dropdown = document.getElementById("language-selector");
  if (dropdown) {
    const selectedOption = dropdown.querySelector(`option[value="${lang}"]`);
    if (selectedOption) {
      dropdown.value = lang;
    }
  }
}





window.initLanguageSwitcher = initLanguageSwitcher;
window.fetchDropdownData = fetchDropdownData;
//window.buildUI = buildUI;
