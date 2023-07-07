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


  window.SETTINGS = {
    LANGUAGE_DROPDOWN_OPTIONS: `
    <option value="de" data-src="XML/data_de.xml">🇩🇪 Deutsch</option>
    <option value="en" data-src="XML/data_en.xml">🇺🇸 English</option>
    <option value="pt" data-src="XML/data_en.xml">🇪🇸 Spanish</option>
    <option value="es" data-src="XML/data_en.xml">🇵🇹 Portuguese</option>
    <option value="fr" data-src="XML/data_en.xml">🇫🇷 French</option>
    <option value="it" data-src="XML/data_en.xml">🇮🇹 Italian</option>
    <option value="ru" data-src="XML/data_en.xml">🇷🇺 Russian</option>
    <option value="zh" data-src="XML/data_en.xml">🇨🇳 Chinese</option>
    <option value="th" data-src="XML/data_en.xml">🇹🇭 Thai</option>
    <option value="hi" data-src="XML/data_en.xml">🇮🇳 Hindi</option>
    <option value="" data-src="XML/data_en.xml">Dialects:</option>
    <option value="ch" data-src="XML/data_en.xml">🇨🇭 Switzerdütsch</option>
    <option value="by" data-src="XML/data_en.xml">💠 Bayrisch</option>
    <option value="sch" data-src="XML/data_en.xml">🇩🇪 Schwäbisch</option>
    `,
  };


  const attributionHTML = 'Supported by <a href="https://www.ritterwagner.de/?utm_source=promptEngineer&utm_medium=chromeExtension" tabindex="-1" <font style="text-decoration:underline;">RitterWagner</a> Germany with ❤ at night in Tenerife. <font style="text-decoration:underline;"><a href="https://ko-fi.com/42aidiaries" tabindex="-1">Donate A Coffee ☕️</a></font> or <font style="text-decoration:underline;"><a href="https://amzn.to/3qdpAY4" tabindex="-1">Affiliate Support (for free)</a></font>';






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

