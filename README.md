ChatGPT PromptEngineer 2023

Dieses Projekt ist eine Chrome-Erweiterung, die darauf abzielt, den ChatGPT-Benutzern eine bessere Erfahrung zu bieten, indem sie ihnen ermöglicht, die Sprache der Benutzeroberfläche auszuwählen und die Eingabeaufforderungen schneller und effizienter zu erstellen.

Technische Details
manifest.json

Die manifest.json-Datei enthält Metadaten und Berechtigungen für die Chrome-Erweiterung.

Dateien und Funktionen

input_field_creation.js: Erstellt Eingabefelder und Dropdown-Listen basierend auf Daten aus XML-Dateien.
fetch_data.js: Ruft Sprachdaten in XML-Format ab und liest Cookies aus.
build_ui.js: Baut die Benutzeroberfläche auf, indem XML-Daten in HTML-Elemente umgewandelt und der Seite hinzugefügt werden.
language_switcher.js: Steuert das Umschalten der Sprachen und Aktualisieren der Benutzeroberfläche. Enthält Funktionen zum Erstellen des Sprachumschalters, Laden von Sprachdaten und Aktualisieren der Benutzeroberfläche.
styles.js: Wendet benutzerdefinierte CSS-Stile auf von der Erweiterung erstellte Elemente an.
content_script.js: Das Hauptinhalts-Skript, das die anderen JavaScript-Dateien verwendet, um die Chrome-Erweiterung zu initialisieren und auszuführen.
data_de.xml, data_en.xml, data_es.xml: XML-Dateien mit Daten für verschiedene Sprachen.
styles.css: Enthält CSS-Stile für die Erweiterung.
Arbeitsablauf

Die Erweiterung lädt Sprachdaten aus den XML-Dateien.
Die Benutzeroberfläche wird erstellt und der ChatGPT-Website hinzugefügt. Eingabefelder und Dropdown-Listen werden basierend auf den geladenen Daten erstellt.
Der Benutzer kann die Sprache über das Sprachumschalter-Dropdown ändern.
Abhängig von den Benutzerauswahlen werden zusätzliche Eingabefelder ein- oder ausgeblendet.
Ausgewählte Texte aus den Eingabefeldern werden kombiniert und in das Zielfeld auf ChatGPT übertragen.
Nachdem der kombinierte Text gesetzt wurde, wird das Formular zurückgesetzt und der Generator ausgeblendet.
Bei Fragen oder dem Wunsch, an dem Projekt mitzuarbeiten, kontaktieren Sie bitte den Projekteigentümer. Vielen Dank!