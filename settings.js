window.languageMapping = {
    'de': 'German',
    'en': 'English',
    'es': 'Spain'/*,
    'ch': 'Schwitzerdütch',
    'sch': 'Schwäbisch',
    'au': 'Österreichisch'*/
  };


  window.SETTINGS = {
    LANGUAGE_DROPDOWN_OPTIONS: `
    <option value="de" data-src="data_de.xml">🇩🇪 Deutsch</option>
    <option value="en" data-src="data_en.xml">🇺🇸 English</option>
    
    `,
  };








window.PLACEHOLDER_TEXT = 'Send a message';

window.PAGE_SETTINGS = [
    {
      url: "https://chat.openai.com/*",
      selector: `textarea[placeholder*="${window.PLACEHOLDER_TEXT}"]`,
    },
    {
      url: "https://bing.com/*",
      selector: '#searchboxform',
    },
    {
        url: "https://bard.google.com/*",
        selector: '#mat-input-0',
      },
  ];
  
  window.onload = function() {
    window.getSelector = function() {
        const url = window.location.href;

        for (let i = 0; i < window.PAGE_SETTINGS.length; i++) {
            const pageSetting = window.PAGE_SETTINGS[i];
            if (url.match(new RegExp(pageSetting.url.replace(/\*/g, ".*")))) {
                return pageSetting.selector;
            }
        }

        return "";
    };
}

