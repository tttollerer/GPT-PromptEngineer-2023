# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome browser extension called "ChatGPT PromptEngineer 2023" that enhances the user experience on ChatGPT, Google Bard, and Bing by providing a dynamic form interface for generating structured prompts. The extension injects customizable UI elements that help users create precise, tailored prompts without manual typing.

## Architecture

The extension follows a content script architecture that dynamically loads and injects UI components:

### Core Components
- **Content Script** (`engine/content_script.js`): Main orchestrator that initializes the extension, manages the container, and handles form submission
- **UI Builder** (`engine/build_ui.js`): Creates dynamic form elements (dropdowns, inputs, checkboxes) based on XML configuration
- **Data Fetcher** (`engine/fetch_data.js`): Loads XML configuration files for different languages
- **Language System** (`translation/translations.js`, `engine/language_switcher.js`): Multi-language support with dynamic UI translation
- **Settings** (`settings/settings.js`): Configuration constants including language mappings and XML file references

### Data Structure
The extension uses XML files to define form elements:
- `data_dropdowns.xml`: Main dropdown menus with prompt templates
- `data_inputs.xml`: Text input fields with before/after text wrapping
- `data_checkboxes.xml`: Checkbox options for additional prompt modifiers
- `data_dropdown_employee.xml` / `data_dropdown_tasks.xml`: Specialized dropdown data

### Key Workflow
1. Extension detects target sites (ChatGPT, Bard, Bing)
2. Creates container with dynamic form elements based on XML data
3. User selects options and fills inputs
4. Form submission combines all selections into a structured prompt
5. Automatically injects the combined prompt into the target input field

### Target Selectors
The extension uses `window.getSelector()` to identify input fields on different platforms. This selector logic is crucial for cross-platform compatibility.

## Development Notes

- No build system or package manager - pure JavaScript/HTML/CSS
- XML-driven configuration allows easy prompt template modifications
- Dynamic element visibility based on dropdown selections using `additionals` attributes
- Language switching affects both UI language and prompt output language
- Container auto-hides after form submission with configurable timing