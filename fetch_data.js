let translations;

async function loadTranslations() {
  const url = chrome.runtime.getURL('XML/translations.json');
  const response = await fetch(url);
  translations = await response.json();
}

loadTranslations();

let preferLocalizedLabel = true;

async function fetchFallbackXml() {
  const url = chrome.runtime.getURL('XML/data_en.xml');
  const response = await fetch(url);
  const data = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'application/xml');
  return xml;
}

async function fetchDropdownData(lang) {
  // Stellen Sie sicher, dass die Übersetzungen geladen sind
  if (!translations) {
    await loadTranslations();
  }

  // Immer die englische XML-Datei laden
  const url = chrome.runtime.getURL(`XML/data_en.xml`);

  const response = await fetch(url);
  const data = await response.text();
  let parser = new DOMParser();
  let xml = parser.parseFromString(data, 'application/xml');

  const nodesToCheck = ["label"];

  for (const nodeToCheck of nodesToCheck) {
    const nodeSnapshot = xml.evaluate(`//${nodeToCheck}`, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < nodeSnapshot.snapshotLength; i++) {
      const node = nodeSnapshot.snapshotItem(i);
      const label = node.textContent.trim();
      if (translations[lang][label]) {
        node.textContent = translations[lang][label];
      } else {
        console.log(`No translation found for label "${label}" in language ${lang}.`);
      }
    }
  }

  return xml;
}





window.fetchDropdownData = fetchDropdownData;
