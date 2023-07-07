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
    <option value="de" data-src="XML/data_de.xml">🇩🇪 Deutsch</option>
    <option value="en" data-src="XML/data_en.xml">🇺🇸 English</option>
    <option value="es" data-src="XML/data_en.xml">🇪🇸 Spanish</option>
    <option value="es" data-src="XML/data_en.xml">🇵🇹 Portuguese</option>
    <option value="fr" data-src="XML/data_en.xml">🇫🇷 French</option>
    <option value="it" data-src="XML/data_en.xml">🇮🇹 Italian</option>
    <option value="ru" data-src="XML/data_en.xml">🇷🇺 Russian</option>
    <option value="zh" data-src="XML/data_en.xml">🇨🇳 Chinese</option>
    <option value="th" data-src="XML/data_en.xml">🇹🇭 Thai</option>
    <option value="it" data-src="XML/data_en.xml">Dialects:</option>
    <option value="ch" data-src="XML/data_en.xml">🇨🇭 Swiss German</option>
    <option value="sch" data-src="XML/data_en.xml">🇩🇪 Schwäbisch</option>
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

