import xml.etree.ElementTree as ET
import json

# Laden Sie die XML-Dateien
tree_en = ET.parse('XML/data_en.xml')
root_en = tree_en.getroot()

tree_de = ET.parse('XML/data_de.xml')
root_de = tree_de.getroot()

# Erstellen Sie ein leeres Wörterbuch für die Übersetzungen
translations = {
    'en': {},
    'de': {}
}

# Extrahieren Sie die Übersetzungen aus der englischen XML-Datei
for checkbox in root_en.findall('checkboxes/checkbox'):
    label = checkbox.find('label').text
    value = checkbox.find('value').text
    translations['en'][label] = value

# Extrahieren Sie die Übersetzungen aus der deutschen XML-Datei
for checkbox in root_de.findall('checkboxes/checkbox'):
    label = checkbox.find('label').text
    value = checkbox.find('value').text
    translations['de'][label] = value

# Speichern Sie die Übersetzungen in einer JSON-Datei
with open('XML/translations.json', 'w') as f:
    json.dump(translations, f)