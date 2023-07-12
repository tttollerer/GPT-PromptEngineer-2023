window.languageMapping = {
    'de': 'German',
    'en': 'English',
    'es': 'Spain',
    'ch': 'Schwitzerdütch',
    'sch': 'Schwäbisch',
    'fr': 'French',
    'it': 'Italian',
    'ru': 'Russian',
    'zh': 'Chinese',
    'th': 'Thai',
    'pt': 'Portuguese'
  };

  window.XML_FILES = [
    'data_dropdown_employee.xml',
    'data_dropdown_clients.xml',
    'data_dropdown_tasks.xml',
    'data_dropdowns.xml',
    'data_inputs.xml',
    'data_checkboxes.xml'
  ];

  window.SETTINGS = {
    LANGUAGE_DROPDOWN_OPTIONS: `
    <option value="en">🇺🇸 English</option>
    <option value="zh">🇨🇳 Chinese</option>
    <option value="es">🇪🇸 Spanish</option>
    <option value="hi">🇮🇳 Hindi</option>
    <option value="fr">🇫🇷 French</option>
    <option value="de">🇩🇪 German</option>
    <option value="ru">🇷🇺 Russian</option>
    <option value="pt">🇵🇹 Portuguese</option>
    <option value="it">🇮🇹 Italian</option>
    <option value="th">🇹🇭 Thai</option>
    <option value="">Dialects:</option>
    <option value="ch">🇨🇭 Switzerdütsch</option>
    <option value="by">💠 Bayrisch</option>
    <option value="sch">🇩🇪 Schwäbisch</option>
    `,
  };


  const attributionHTML = 'Supported by <a href="https://www.ritterwagner.de/?utm_source=promptEngineer&utm_medium=chromeExtension" tabindex="-1" <font style="text-decoration:underline;">RitterWagner</a> Germany. Developed with ❤ at night in Tenerife. <font style="text-decoration:underline;"><a href="https://ko-fi.com/42aidiaries" tabindex="-1">Donate A Coffee ☕️</a></font> or <font style="text-decoration:underline;"><a href="https://amzn.to/3qdpAY4" tabindex="-1">Free Affiliate Support</a></font>';






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

