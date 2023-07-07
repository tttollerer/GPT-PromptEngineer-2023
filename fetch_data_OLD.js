async function fetchFallbackXml() {
    const url = chrome.runtime.getURL('XML/data_en.xml');
    const response = await fetch(url);
    const data = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'application/xml');
    return xml;
  }
  
  async function fetchDropdownData(lang) {
    let url;
    if(lang) {
      url = chrome.runtime.getURL(`XML/data_${lang}.xml`);
    } else {
      url = chrome.runtime.getURL(`XML/data_en.xml`);
    }
    
    const response = await fetch(url);
    const data = await response.text();
    let parser = new DOMParser();
    let xml = parser.parseFromString(data, 'application/xml');
  
    // Load the fallback XML file (English) if the language is not English
    let fallbackXml;
    if (lang && lang !== 'en') {
      const fallbackResponse = await fetch(chrome.runtime.getURL(`XML/data_en.xml`));
      const fallbackData = await fallbackResponse.text();
      fallbackXml = parser.parseFromString(fallbackData, 'application/xml');
  
    }
  
    const valueNodes = xml.evaluate('//value', xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < valueNodes.snapshotLength; i++) {
      const valueNode = valueNodes.snapshotItem(i);
      const idNode = valueNode.parentNode.querySelector('id');
      if (!idNode || !idNode.textContent) {
        continue;
      }
    
      const id = idNode.textContent;
      if (!valueNode.textContent || valueNode.textContent.trim() === "") {
        if (fallbackXml) {
          // Check each type of element
          const elementTypes = ["checkbox", "dropdown", "option", "input"];
          let fallbackValueNode;
          for (const elementType of elementTypes) {
            fallbackValueNode = fallbackXml.evaluate(`//${elementType}[id="${id}"]/value`, fallbackXml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (fallbackValueNode) {
              break;
            }
          }
      
          if (fallbackValueNode) {
            /*console.log(`Fallback value node for id ${id}: `);*/
            if (fallbackValueNode.textContent) {
              valueNode.textContent = fallbackValueNode.textContent;
              /*console.log(`Fallback value for id ${id}: ${valueNode.textContent}`);*/
            } else {
              console.log(`Fallback value found for id ${id} but it is empty.`);
            }
          } else {
            console.log(`No fallback value node found for id ${id}.`);
          }
        }
      }
      
    
    }
  
    return xml;
  }
  
  
  
  window.fetchDropdownData = fetchDropdownData;
  