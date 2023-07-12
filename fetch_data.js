let translations;

async function loadTranslations() {
  const url = chrome.runtime.getURL('XML/translations.json');
  const response = await fetch(url);
  translations = await response.json();
}

loadTranslations();

let preferLocalizedLabel = true;

async function fetchAllXml() {
  const xmls = await Promise.all(window.XML_FILES.map(async (file) => {
    const url = chrome.runtime.getURL(file);
    const response = await fetch(url);
    const data = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'application/xml');
    return xml;
  }));

  // Merge all XMLs into one
  const mergedXml = xmls[0];
  const mergedRoot = mergedXml.documentElement;
  for (let i = 1; i < xmls.length; i++) {
    const xml = xmls[i];
    const root = xml.documentElement;
    while (root.firstChild) {
      mergedRoot.appendChild(root.firstChild);
    }
  }

  return mergedXml;
}

async function fetchDropdownData(lang) {
  if (!translations) {
    await loadTranslations();
  }

  let xml = await fetchAllXml();

  const nodesToCheck = ["label"];

  for (const nodeToCheck of nodesToCheck) {
    const nodeSnapshot = xml.evaluate(`//${nodeToCheck}`, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < nodeSnapshot.snapshotLength; i++) {
      const node = nodeSnapshot.snapshotItem(i);
      const label = node.textContent.trim();
      if (translations && translations[lang] && label in translations[lang]) {
        node.textContent = translations[lang][label];
      } else {
        console.log(`No translation found for label "${label}" in language ${lang}.`);
      }
    }
  }

  return xml;
}
window.fetchDropdownData = fetchDropdownData;