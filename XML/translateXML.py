import xml.etree.ElementTree as ET
import json
from translate import Translator
import time

# Laden Sie die XML-Datei
tree = ET.parse('data_en.xml')
root = tree.getroot()

# Erstellen Sie ein leeres Wörterbuch für die Übersetzungen
translations = {
    'en': {},
    'de': {},
    'es': {},
    'fr': {},
    'it': {}
}

# Extrahieren Sie die Labels aus der XML-Datei und übersetzen Sie sie
for element in root.findall('.//label'):
    label = element.text.strip()
    translations['en'][label] = label  # Setzen Sie die englische Übersetzung als das Label selbst
    print(f'Translating label "{label}"...')
    time.sleep(1)  # Warten Sie eine Sekunde
    translator = Translator(to_lang="de")
    translations['de'][label] = translator.translate(label)
    print(f'Translated to German: {translations["de"][label]}')
    time.sleep(1)  # Warten Sie eine Sekunde
    translator = Translator(to_lang="es")
    translations['es'][label] = translator.translate(label)
    print(f'Translated to Spanish: {translations["es"][label]}')
    time.sleep(1)  # Warten Sie eine Sekunde
    translator = Translator(to_lang="fr")
    translations['fr'][label] = translator.translate(label)
    print(f'Translated to French: {translations["fr"][label]}')
    time.sleep(1)  # Warten Sie eine Sekunde
    translator = Translator(to_lang="it")
    translations['it'][label] = translator.translate(label)
    print(f'Translated to Italian: {translations["it"][label]}')

# Speichern Sie die Übersetzungen in einer JSON-Datei
with open('translations.json', 'w') as f:
    json.dump(translations, f)
