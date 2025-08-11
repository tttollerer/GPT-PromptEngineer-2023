# 🔧 XML-Editor für PromptEngineer Extension

## ✨ Neue Funktionen

Die Chrome Extension hat jetzt einen **eingebauten XML-Editor** mit professionellen Features:

- 📝 **Syntax Highlighting** für XML
- ✅ **Echtzeit-Validierung** 
- 💾 **Speichern/Laden** von Änderungen
- 🔄 **Reset zu Original-Dateien**
- 📤 **Export aller XML-Dateien**
- 🎨 **Moderne, responsive UI**

## 🚀 Verwendung

### 1. XML-Editor öffnen
- **Method 1**: Klicke auf das Extension-Icon in der Chrome-Toolbar
- **Method 2**: Rechtsklick auf Extension-Icon → "PromptEngineer XML Editor"

### 2. XML-Dateien bearbeiten

#### Verfügbare Dateien:
- 📋 `data_dropdowns.xml` - Dropdown-Menü Optionen
- 📝 `data_inputs.xml` - Input-Feld Konfiguration  
- ✅ `data_checkboxes.xml` - Checkbox-Optionen
- 👥 `data_dropdown_employee.xml` - Mitarbeiter-Dropdown
- 📋 `data_dropdown_tasks.xml` - Aufgaben-Dropdown

#### Arbeitsablauf:
1. **Datei auswählen** - Klick auf Datei in der linken Liste
2. **Bearbeiten** - XML im Editor mit Syntax Highlighting ändern
3. **Validieren** - Klick auf "Validieren"-Button (oder automatisch)
4. **Speichern** - Klick auf "Speichern"-Button
5. **Testen** - Extension auf ChatGPT testen

## 🎯 XML-Struktur verstehen

### Dropdown-Struktur (`data_dropdowns.xml`):
```xml
<data>
  <dropdowns>
    <dropdown>
      <label>Angezeigter Name</label>
      <id>unique_id</id>
      <options>
        <option>
          <label>Option Name</label>
          <value>Der Prompt-Text der eingefügt wird</value>
          <id>option_id</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
      </options>
    </dropdown>
  </dropdowns>
</data>
```

### Input-Struktur (`data_inputs.xml`):
```xml
<data>
  <inputs>
    <input>
      <label>Input-Feld Beschreibung</label>
      <id>input_id</id>
      <class>prompt-generator-input</class>
      <valueBefore>Text davor: </valueBefore>
      <valueAfter>. Text danach</valueAfter>
    </input>
  </inputs>
</data>
```

### Checkbox-Struktur (`data_checkboxes.xml`):
```xml
<data>
  <checkboxes>
    <checkbox>
      <label>Checkbox Beschreibung</label>
      <id>checkbox_id</id>
      <value>Zusätzlicher Prompt wenn aktiviert</value>
      <additionals></additionals>
      <additionalsHide />
    </checkbox>
  </checkboxes>
</data>
```

## 🔧 Editor-Features

### Toolbar-Funktionen:
- **Format** - XML automatisch einrücken und formatieren
- **Validieren** - XML auf Gültigkeit prüfen
- **Speichern** - Änderungen in Extension speichern
- **Zurücksetzen** - Datei auf Original-Zustand zurücksetzen
- **Alle exportieren** - Alle XML-Dateien als ZIP herunterladen

### Status-Anzeige:
- **Grüner Punkt** - Extension bereit
- **Gelber Punkt** - Lädt...
- **Roter Punkt** - Fehler

### Validierung:
- ✅ **Gültiges XML** - Grüner Status
- ❌ **Ungültiges XML** - Roter Status mit Fehlerbeschreibung
- **Echtzeit-Validierung** - Automatische Prüfung während der Eingabe

## 💾 Speicher-System

### Wie Änderungen gespeichert werden:
1. **Original-Dateien** bleiben unverändert (in Extension enthalten)
2. **Geänderte Dateien** werden in Chrome Storage gespeichert
3. **Extension lädt** immer die neueste Version (gespeichert oder original)
4. **Reset-Funktion** entfernt gespeicherte Version → zurück zum Original

### Datenpersistenz:
- ✅ **Änderungen überleben Browser-Restart**
- ✅ **Änderungen überleben Extension-Updates** 
- ❌ **Änderungen gehen verloren bei Extension-Deinstallation**

## 🧪 Testing-Workflow

### Nach XML-Änderungen:
1. **Speichern** in XML-Editor
2. **Popup schließen**
3. **ChatGPT öffnen** (https://chatgpt.com)
4. **Extension testen** - Sind neue Optionen sichtbar?
5. **Prompt testen** - Wird der richtige Text eingefügt?

### Bei Problemen:
1. **XML validieren** - Ist die Syntax korrekt?
2. **Original wiederherstellen** - Reset-Button verwenden
3. **Browser neu starten** - Cache leeren
4. **Console checken** - F12 → Console → Nach Fehlern schauen

## 📋 Häufige XML-Patterns

### Neuen Dropdown hinzufügen:
```xml
<dropdown>
  <label>Mein neuer Dropdown</label>
  <id>my_dropdown</id>
  <options>
    <option>
      <label>Option 1</label>
      <value>Das ist der Prompt-Text für Option 1</value>
      <id>option1</id>
      <additionals></additionals>
      <additionalsHide />
    </option>
    <option>
      <label>Option 2</label>
      <value>Das ist der Prompt-Text für Option 2</value>
      <id>option2</id>
      <additionals></additionals>
      <additionalsHide />
    </option>
  </options>
</dropdown>
```

### Input mit Before/After-Text:
```xml
<input>
  <label>Firmenname</label>
  <id>company_name</id>
  <class>prompt-generator-input</class>
  <valueBefore>Schreibe über das Unternehmen: </valueBefore>
  <valueAfter>. Fokussiere dich auf deren Hauptprodukte.</valueAfter>
</input>
```

### Einfache Checkbox:
```xml
<checkbox>
  <label>Kurze Antwort</label>
  <id>short_answer</id>
  <value>Halte die Antwort kurz und prägnant.</value>
  <additionals></additionals>
  <additionalsHide />
</checkbox>
```

## ⚠️ Wichtige Hinweise

### XML-Regeln:
- **Alle Tags müssen geschlossen werden** (`<tag></tag>` oder `<tag />`)
- **Attribute in Anführungszeichen** (`id="my_id"`)
- **Sonderzeichen escapen** (`&amp;` für `&`, `&lt;` für `<`)
- **UTF-8 Encoding** verwenden

### Performance:
- **Große XML-Dateien** (>100KB) können langsam laden
- **Viele Optionen** (>50 pro Dropdown) verlangsamen die UI
- **Komplexe Prompts** mit vielen Variablen sind OK

### Backup:
- **Immer exportieren** vor großen Änderungen
- **Reset-Funktion** ist dein Freund bei Problemen
- **Original-Dateien** sind immer verfügbar

## 🎨 Anpassungen

### Eigene Prompt-Templates:
1. Bestehende XML-Struktur kopieren
2. Labels und Values anpassen
3. IDs eindeutig machen  
4. Speichern und testen

### Multi-Language Support:
- Aktuell nur in `translation/translations.js`
- XML-Editor zeigt rohe Labels (nicht übersetzt)
- Labels werden zur Laufzeit übersetzt

## 🔍 Debugging

### Console-Kommandos:
```javascript
// Chrome DevTools → Console:

// XML-Editor Status
console.log(window.XMLEditor);

// Storage-Inhalt anzeigen
chrome.storage.local.get(null, console.log);

// Bestimmte XML-Datei anzeigen
chrome.storage.local.get('data_dropdowns.xml', console.log);
```

### Häufige Probleme:
1. **XML-Editor lädt nicht** → CodeMirror CDN-Verbindung prüfen
2. **Änderungen werden nicht übernommen** → Cache leeren, Browser neu starten
3. **Syntax-Fehler** → XML-Validator verwenden
4. **Extension reagiert nicht** → Original-Dateien wiederherstellen

## 📞 Support

Bei Problemen:
1. **Export** erstellen (als Backup)
2. **Console-Logs** sammeln (F12)
3. **Reset** zu Original-Dateien
4. **Issue** auf GitHub erstellen mit Details

---

**Viel Spaß beim Anpassen der Prompt-Templates! 🚀**