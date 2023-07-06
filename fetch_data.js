let preferLocalizedLabel = true;

async function fetchFallbackXml() {
  const url = chrome.runtime.getURL('data_en.xml');
  const response = await fetch(url);
  const data = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'application/xml');
  return xml;
}

async function fetchDropdownData(lang) {
  // Immer die englische XML-Datei laden
  const url = chrome.runtime.getURL(`data_en.xml`);

  const response = await fetch(url);
  const data = await response.text();
  let parser = new DOMParser();
  let xml = parser.parseFromString(data, 'application/xml');

  // Load the fallback XML file (English) if the language is not English or preferLocalizedLabel is false
  let fallbackXml;
  if ((lang && lang !== 'en') || !preferLocalizedLabel) {
    fallbackXml = await fetchFallbackXml();
  }

  const nodesToCheck = ["value", "label", "additionals", "additionalsHide"]; // added "label"
  
  for (const nodeToCheck of nodesToCheck) {
    const nodeSnapshot = xml.evaluate(`//${nodeToCheck}`, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < nodeSnapshot.snapshotLength; i++) {
      const node = nodeSnapshot.snapshotItem(i);
      const idNode = node.parentNode.querySelector('id');
      if (!idNode || !idNode.textContent) {
        continue;
      }

      const id = idNode.textContent;
      if (nodeToCheck === 'label' && translations[lang][id]) {
        node.textContent = translations[lang][id];
      } else {
        if (fallbackXml) {
          const elementTypes = ["checkbox", "dropdown", "option", "input"];
          let fallbackNode;
          for (const elementType of elementTypes) {
            fallbackNode = fallbackXml.evaluate(`//${elementType}[id="${id}"]/${nodeToCheck}`, fallbackXml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (fallbackNode) {
              break;
            }
          }
      
          if (fallbackNode) {
            if (fallbackNode.textContent) {
              node.textContent = fallbackNode.textContent;
            } else {
              /* Fehlermeldungen nur für "Value" Nodes */
              if (nodeToCheck !== "additionals" && nodeToCheck !== "additionalsHide") {
                console.log(`Fallback ${nodeToCheck} found for id ${id} but it is empty.`);
              }
            }
          } else {
            console.log(`No fallback ${nodeToCheck} node found for id ${id}.`);
          }
        }
      }
    }
  }
  
  return xml;
}





window.fetchDropdownData = fetchDropdownData;
