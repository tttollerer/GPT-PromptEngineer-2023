const fs = require('fs');
const xml2js = require('xml2js');

// XML-Dateien laden
const dataEn = loadXMLFile('XML/data_en.xml');  
const dataDe = loadXMLFile('XML/data_de.xml');  

// Übersetzungen sammeln
const translations = {
  de: {}  
};

// Deutsche Übersetzungen aus data_de.xml extrahieren  
const deInputs = dataDe.getElementsByTagName('input');
Array.from(deInputs).forEach(input => {
  const label = input.querySelector('label').textContent;
  const translation = input.querySelector('translation').textContent;
  translations.de[label] = translation;
});

// JSON-Datei mit Übersetzungen speichern
saveJSONFile('translations.json', translations);  

function loadXMLFile(filename) {
  const xmlData = fs.readFileSync(filename, 'utf8');
  xml2js.parseString(xmlData, (err, result) => {
    return result;
  });
}

function saveJSONFile(filename, data) {
  const fs = require('fs');
  const xmlData = fs.readFileSync(filename, 'utf8');
  const parser = new DOMParser();
  return parser.parseFromString(xmlData, 'application/xml');
}

function saveJSONFile(filename, data) {
  const jsonData = JSON.stringify(data);
  const blob = new Blob([jsonData], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);  
}
