import xml.etree.ElementTree as ET

# Laden Sie die XML-Datei
tree = ET.parse('data_en.xml')
root = tree.getroot()

# Entfernen Sie die Inhalte der "value", "additionals" und "additionalshide" Knoten
for element in root.findall('.//value') + root.findall('.//additionals') + root.findall('.//additionalshide'):
    element.text = ''

# Speichern Sie die XML-Datei unter einem neuen Namen
tree.write('data_de_neu.xml')
