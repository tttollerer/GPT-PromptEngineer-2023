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
  dropdown.tabIndex = -1;
  
  // Create language options safely
  const languages = [
    { value: 'en', text: '🇺🇸 English' },
    { value: 'zh', text: '🇨🇳 Chinese' },
    { value: 'es', text: '🇪🇸 Spanish' },
    { value: 'hi', text: '🇮🇳 Hindi' },
    { value: 'fr', text: '🇫🇷 French' },
    { value: 'de', text: '🇩🇪 German' },
    { value: 'ru', text: '🇷🇺 Russian' },
    { value: 'pt', text: '🇵🇹 Portuguese' },
    { value: 'it', text: '🇮🇹 Italian' },
    { value: 'th', text: '🇹🇭 Thai' },
    { value: '', text: 'Dialects:' },
    { value: 'ch', text: '🇨🇭 Switzerdütsch' },
    { value: 'by', text: '🔠 Bayrisch' },
    { value: 'sch', text: '🇩🇪 Schwäbisch' }
  ];
  
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.value;
    option.textContent = lang.text;
    dropdown.appendChild(option);
  });
  
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
  
  // Language dropdown is now handled in TopBar
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

  // Language dropdown is now added via TopBar - no longer append to container


  
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
