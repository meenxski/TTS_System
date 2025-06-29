
// Tab Functionality for Tools, Resources, and Support tabs
document.addEventListener('DOMContentLoaded', function() {
    // Tools Tab Functionality
    setupToolsTabFunctionality();
    
    // Resources Tab Functionality
    setupResourcesTabFunctionality();
    
    // Support Tab Functionality
    setupSupportTabFunctionality();
});

// ========== TOOLS TAB FUNCTIONALITY ==========
function setupToolsTabFunctionality() {
    const toolsContainer = document.getElementById('toolsContent');
    if (!toolsContainer) return;

    // Dictionary Tool
    const dictionaryBtn = toolsContainer.querySelector('.feature-card:nth-child(1) button');
    dictionaryBtn.addEventListener('click', function() {
        // Switch to home tab and focus on dictionary panel
        activateTab('homeTab');
        const wordInput = document.getElementById('word-input');
        wordInput.focus();
        showNotification('Dictionary tool activated');
    });

    // Note-Taking Tool
    const noteTakingBtn = toolsContainer.querySelector('.feature-card:nth-child(2) button');
    noteTakingBtn.addEventListener('click', function() {
        createNotesTool();
        showNotification('Note-taking tool opened');
    });

    // // Highlighting Tool
    // const highlightBtn = toolsContainer.querySelector('.feature-card:nth-child(3) button');
    // highlightBtn.addEventListener('click', function() {
    //     activateHighlighter();
    //     showNotification('Highlighting tool activated');
    // });

    // Word Prediction Tool
    const predictionBtn = toolsContainer.querySelector('.feature-card:nth-child(4) button');
    predictionBtn.addEventListener('click', function() {
        toggleWordPrediction();
        if (this.textContent === 'Enable Prediction') {
            this.textContent = 'Disable Prediction';
            showNotification('Word prediction enabled');
        } else {
            this.textContent = 'Enable Prediction';
            showNotification('Word prediction disabled');
        }
    });

    // Grammar Tool
    const grammarBtn = toolsContainer.querySelector('.feature-card:nth-child(5) button');
    grammarBtn.addEventListener('click', function() {
        checkGrammar();
        showNotification('Grammar check in progress');
    });

    // Translation Tool
    const translateBtn = toolsContainer.querySelector('.feature-card:nth-child(6) button');
    translateBtn.addEventListener('click', function() {
        showTranslationDialog();
        showNotification('Translation tool opened');
    });
}

// Create a notification system
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.setAttribute('aria-live', 'polite');
        document.body.appendChild(notification);
    }
    
    // Set notification content and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Notes tool implementation
function createNotesTool() {
    // Check if notes tool already exists
    if (document.getElementById('notes-container')) return;
    
    // Create notes container
    const notesContainer = document.createElement('div');
    notesContainer.id = 'notes-container';
    notesContainer.className = 'modal';
    
    notesContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Notes Tool</h3>
                <button class="close-btn" aria-label="Close notes tool">&times;</button>
            </div>
            <div class="modal-body">
                <div class="notes-list-container">
                    <h4>My Notes</h4>
                    <ul id="notes-list">
                        <li data-note-id="note1" tabindex="0">Study Plan</li>
                        <li data-note-id="note2" tabindex="0">Reading Notes</li>
                    </ul>
                    <button id="new-note-btn" class="accent">New Note</button>
                </div>
                <div class="note-editor">
                    <input type="text" id="note-title" placeholder="Note Title">
                    <textarea id="note-content" placeholder="Type your note here..."></textarea>
                    <div class="button-group">
                        <button id="save-note-btn">Save</button>
                        <button id="read-note-btn">Read Aloud</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notesContainer);
    
    // Add event listeners
    notesContainer.querySelector('.close-btn').addEventListener('click', () => {
        notesContainer.remove();
    });
    
    const notesList = notesContainer.querySelector('#notes-list');
    notesList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            loadNote(e.target.dataset.noteId);
        }
    });
    
    notesContainer.querySelector('#new-note-btn').addEventListener('click', createNewNote);
    notesContainer.querySelector('#save-note-btn').addEventListener('click', saveNote);
    notesContainer.querySelector('#read-note-btn').addEventListener('click', readNoteAloud);
    
    // Sample note data
    const notesData = {
        note1: {
            title: "Study Plan",
            content: "1. Review chapter 3\n2. Complete practice questions\n3. Prepare notes for discussion"
        },
        note2: {
            title: "Reading Notes",
            content: "Main character development shows progression from uncertainty to confidence."
        }
    };
    
    // Function to load a note
    function loadNote(noteId) {
        const note = notesData[noteId];
        if (note) {
            notesContainer.querySelector('#note-title').value = note.title;
            notesContainer.querySelector('#note-content').value = note.content;
        }
    }
    
    // Function to create a new note
    function createNewNote() {
        notesContainer.querySelector('#note-title').value = '';
        notesContainer.querySelector('#note-content').value = '';
        notesContainer.querySelector('#note-title').focus();
    }
    
    // Function to save a note
    function saveNote() {
        const title = notesContainer.querySelector('#note-title').value;
        const content = notesContainer.querySelector('#note-content').value;
        
        if (!title) {
            showNotification('Please enter a title for your note');
            return;
        }
        
        // Generate a new note ID
        const noteId = 'note' + Date.now();
        
        // Create new note data
        notesData[noteId] = {
            title: title,
            content: content
        };
        
        // Add to list
        const newNoteItem = document.createElement('li');
        newNoteItem.dataset.noteId = noteId;
        newNoteItem.textContent = title;
        newNoteItem.tabIndex = 0;
        notesList.appendChild(newNoteItem);
        
        showNotification('Note saved successfully');
    }
    
    // Function to read note aloud
    function readNoteAloud() {
        const content = notesContainer.querySelector('#note-content').value;
        
        if (!content) {
            showNotification('No content to read');
            return;
        }
        
        // Use the main TTS engine to read the note
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(content);
            
            // Get settings from main app if available
            if (window.currentVoice) utterance.voice = window.currentVoice;
            if (window.currentRate) utterance.rate = window.currentRate;
            if (window.currentPitch) utterance.pitch = window.currentPitch;
            
            window.speechSynthesis.speak(utterance);
            showNotification('Reading note aloud');
        } else {
            showNotification('Text-to-speech not supported in your browser');
        }
    }
}

// Activate highlighter functionality
// function activateHighlighter() {
//     // Switch to home tab where text can be highlighted
//     activateTab('homeTab');
    
//     const textInput = document.getElementById('textInput');
    
//     // Create highlighter toolbar if it doesn't exist
//     if (!document.getElementById('highlighter-toolbar')) {
//         const toolbar = document.createElement('div');
//         toolbar.id = 'highlighter-toolbar';
//         toolbar.className = 'highlighter-toolbar';
//         toolbar.innerHTML = `
//             <button class="highlight-btn" data-color="yellow" style="background-color: #ffff99;" aria-label="Highlight in yellow"></button>
//             <button class="highlight-btn" data-color="green" style="background-color: #b3ffb3;" aria-label="Highlight in green"></button>
//             <button class="highlight-btn" data-color="blue" style="background-color: #b3d9ff;" aria-label="Highlight in blue"></button>
//             <button class="highlight-btn" data-color="pink" style="background-color: #ffccff;" aria-label="Highlight in pink"></button>
//             <button class="clear-highlights-btn" aria-label="Clear highlights">Clear</button>
//         `;
        
//         const textContainer = document.getElementById('textContainer');
//         textContainer.appendChild(toolbar);
        
//         // Add event listeners to highlight buttons
//         toolbar.querySelectorAll('.highlight-btn').forEach(btn => {
//             btn.addEventListener('click', function() {
//                 highlightSelection(this.dataset.color);
//             });
//         });
        
//         toolbar.querySelector('.clear-highlights-btn').addEventListener('click', clearHighlights);
//     }
    
//     // Enable highlighting in the textarea
//     enableTextSelection();
// }

// // Function to highlight selected text
// function highlightSelection(color) {
//     const textInput = document.getElementById('textInput');
//     const selectedText = textInput.value.substring(textInput.selectionStart, textInput.selectionEnd);
    
//     if (!selectedText) {
//         showNotification('Please select text to highlight');
//         return;
//     }
    
//     // Since we can't directly style parts of a textarea, we'll track highlights separately
//     if (!window.highlights) window.highlights = [];
    
//     window.highlights.push({
//         start: textInput.selectionStart,
//         end: textInput.selectionEnd,
//         color: color,
//         text: selectedText
//     });
    
//     showNotification('Text highlighted');
//     renderHighlights();
// }

// Function to enable text selection tracking
// function enableTextSelection() {
//     const textInput = document.getElementById('textInput');
    
//     textInput.addEventListener('mouseup', function() {
//         if (textInput.selectionStart !== textInput.selectionEnd) {
//             const highlighterToolbar = document.getElementById('highlighter-toolbar');
//             if (highlighterToolbar) {
//                 highlighterToolbar.style.display = 'flex';
//             }
//         }
//     });
// }

// // Function to render highlights
// function renderHighlights() {
//     // In a real implementation, this would create a styled overlay on the textarea
//     // For simplicity, we'll just show a notification of how many highlights exist
//     if (window.highlights && window.highlights.length > 0) {
//         showNotification(`${window.highlights.length} highlighted sections`);
//     }
// }

// // Function to clear all highlights
// function clearHighlights() {
//     if (window.highlights) {
//         window.highlights = [];
//         showNotification('All highlights cleared');
//         renderHighlights();
//     }
// }

// Word prediction functionality
function toggleWordPrediction() {
    const textInput = document.getElementById('textInput');
    
    if (!window.predictionEnabled) {
        // Create prediction container if it doesn't exist
        if (!document.getElementById('prediction-container')) {
            const predictionContainer = document.createElement('div');
            predictionContainer.id = 'prediction-container';
            predictionContainer.className = 'prediction-container';
            document.getElementById('textContainer').appendChild(predictionContainer);
        }
        
        // Add event listener for input
        textInput.addEventListener('input', showPredictions);
        window.predictionEnabled = true;
    } else {
        // Remove prediction container
        const predictionContainer = document.getElementById('prediction-container');
        if (predictionContainer) {
            predictionContainer.remove();
        }
        
        // Remove event listener
        textInput.removeEventListener('input', showPredictions);
        window.predictionEnabled = false;
    }
}

// Function to show word predictions
function showPredictions() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value;
    const cursorPos = textInput.selectionStart;
    
    // Get current word
    let startPos = cursorPos;
    while (startPos > 0 && text[startPos - 1] !== ' ' && text[startPos - 1] !== '\n') {
        startPos--;
    }
    
    const currentWord = text.substring(startPos, cursorPos);
    
    if (currentWord.length < 2) {
        document.getElementById('prediction-container').innerHTML = '';
        return;
    }
    
    // Sample prediction words (in a real app, this would use an algorithm or API)
    const predictions = getPredictionWords(currentWord);
    
    // Display predictions
    const predictionContainer = document.getElementById('prediction-container');
    predictionContainer.innerHTML = '';
    
    predictions.forEach(word => {
        const predBtn = document.createElement('button');
        predBtn.className = 'prediction-btn';
        predBtn.textContent = word;
        predBtn.addEventListener('click', () => {
            // Replace current word with prediction
            const newText = text.substring(0, startPos) + word + text.substring(cursorPos);
            textInput.value = newText;
            textInput.setSelectionRange(startPos + word.length, startPos + word.length);
            textInput.focus();
            predictionContainer.innerHTML = '';
        });
        predictionContainer.appendChild(predBtn);
    });
}

// Sample word prediction function
function getPredictionWords(partial) {
    const commonWords = {
        'th': ['the', 'this', 'that', 'they', 'then', 'their', 'there', 'them', 'think', 'through'],
        'an': ['and', 'any', 'another', 'answer', 'animal', 'announce', 'annual', 'analyze', 'angle'],
        'in': ['in', 'into', 'information', 'inside', 'include', 'increase', 'instead', 'industry'],
        're': ['read', 'real', 'really', 'research', 'result', 'return', 'ready', 'reason'],
        'st': ['study', 'student', 'still', 'start', 'state', 'stop', 'story', 'strong'],
        'co': ['could', 'come', 'company', 'computer', 'consider', 'continue', 'control', 'cost'],
        'pr': ['problem', 'process', 'provide', 'product', 'program', 'present', 'price', 'prepare'],
        'ex': ['example', 'experience', 'expect', 'explain', 'executive', 'exist', 'exactly', 'examination'],
    };
    
    const firstTwoChars = partial.substring(0, 2).toLowerCase();
    
    if (commonWords[firstTwoChars]) {
        return commonWords[firstTwoChars].filter(word => 
            word.toLowerCase().startsWith(partial.toLowerCase())
        ).slice(0, 5);
    }
    
    return [];
}

// Grammar check functionality
function checkGrammar() {
    // Switch to home tab
    activateTab('homeTab');
    
    const textInput = document.getElementById('textInput');
    const text = textInput.value;
    
    if (!text) {
        showNotification('Please enter text to check grammar');
        return;
    }
    
    // In a real app, this would call a grammar API
    // For demo purposes, we'll simulate grammar checking
    setTimeout(() => {
        // Sample grammar issues (in a real app, this would come from an API)
        const grammarIssues = findSampleGrammarIssues(text);
        
        if (grammarIssues.length > 0) {
            showGrammarIssues(grammarIssues);
        } else {
            showNotification('No grammar issues found');
        }
    }, 1000);
}

// Function to find sample grammar issues
function findSampleGrammarIssues(text) {
    const issues = [];
    
    // Very simple checks for demo purposes
    if (text.includes('  ')) {
        issues.push({ 
            type: 'Double Space', 
            suggestion: 'Remove extra space', 
            index: text.indexOf('  ') 
        });
    }
    
    if (text.toLowerCase().includes('their is')) {
        issues.push({ 
            type: 'Grammar Error', 
            suggestion: 'Replace "their is" with "there is"',
            index: text.toLowerCase().indexOf('their is')
        });
    }
    
    if (text.toLowerCase().includes('your welcome')) {
        issues.push({ 
            type: 'Grammar Error', 
            suggestion: 'Replace "your welcome" with "you\'re welcome"',
            index: text.toLowerCase().indexOf('your welcome')
        });
    }
    
    // Check for sentences without capital letters
    const sentences = text.split('. ');
    sentences.forEach((sentence, index) => {
        if (sentence.length > 0 && sentence[0] === sentence[0].toLowerCase() && /[a-z]/.test(sentence[0])) {
            issues.push({ 
                type: 'Capitalization', 
                suggestion: 'Capitalize the first letter of the sentence',
                index: index === 0 ? 0 : text.indexOf('. ' + sentence) + 2
            });
        }
    });
    
    return issues;
}

// Function to show grammar issues
function showGrammarIssues(issues) {
    // Create grammar issues container if it doesn't exist
    let grammarContainer = document.getElementById('grammar-container');
    if (!grammarContainer) {
        grammarContainer = document.createElement('div');
        grammarContainer.id = 'grammar-container';
        grammarContainer.className = 'modal';
        
        grammarContainer.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Grammar Check Results</h3>
                    <button class="close-btn" aria-label="Close grammar check">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="grammar-issues-list"></div>
                    <div class="button-group">
                        <button id="fix-all-btn">Fix All Issues</button>
                        <button id="ignore-all-btn">Ignore All</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(grammarContainer);
        
        // Add event listeners
        grammarContainer.querySelector('.close-btn').addEventListener('click', () => {
            grammarContainer.remove();
        });
        
        grammarContainer.querySelector('#fix-all-btn').addEventListener('click', () => {
            // In a real app, this would apply all suggested fixes
            showNotification('All grammar issues fixed');
            grammarContainer.remove();
        });
        
        grammarContainer.querySelector('#ignore-all-btn').addEventListener('click', () => {
            grammarContainer.remove();
        });
    }
    
    // Populate issues list
    const issuesList = document.getElementById('grammar-issues-list');
    issuesList.innerHTML = '';
    
    issues.forEach((issue, index) => {
        const issueItem = document.createElement('div');
        issueItem.className = 'grammar-issue';
        issueItem.innerHTML = `
            <div class="issue-type">${issue.type}</div>
            <div class="issue-suggestion">${issue.suggestion}</div>
            <div class="button-group">
                <button class="fix-btn" data-index="${index}">Fix</button>
                <button class="ignore-btn" data-index="${index}">Ignore</button>
            </div>
        `;
        issuesList.appendChild(issueItem);
    });
    
    // Add event listeners to fix and ignore buttons
    issuesList.querySelectorAll('.fix-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const issueIndex = parseInt(this.dataset.index);
            // In a real app, this would apply the specific fix
            showNotification(`Fixed: ${issues[issueIndex].suggestion}`);
            this.closest('.grammar-issue').remove();
        });
    });
    
    issuesList.querySelectorAll('.ignore-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.grammar-issue').remove();
        });
    });
}

// Translation functionality
function showTranslationDialog() {
    // Create translation dialog if it doesn't exist
    let translationDialog = document.getElementById('translation-dialog');
    if (!translationDialog) {
        translationDialog = document.createElement('div');
        translationDialog.id = 'translation-dialog';
        translationDialog.className = 'modal';
        
        translationDialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Translate Text</h3>
                    <button class="close-btn" aria-label="Close translation tool">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="control-group">
                        <label for="source-language">Source Language:</label>
                        <select id="source-language">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="zh">Chinese</option>
                            <option value="ja">Japanese</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label for="target-language">Target Language:</label>
                        <select id="target-language">
                            <option value="en">English</option>
                            <option value="es" selected>Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="zh">Chinese</option>
                            <option value="ja">Japanese</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label for="source-text">Text to Translate:</label>
                        <textarea id="source-text" placeholder="Enter text to translate..."></textarea>
                    </div>
                    <button id="translate-btn">Translate</button>
                    <div class="control-group">
                        <label for="translated-text">Translation:</label>
                        <textarea id="translated-text" readonly></textarea>
                    </div>
                    <div class="button-group">
                        <button id="copy-translation-btn">Copy Translation</button>
                        <button id="speak-translation-btn">Speak Translation</button>
                        <button id="use-translation-btn">Use in Editor</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(translationDialog);
        
        // Add event listeners
        translationDialog.querySelector('.close-btn').addEventListener('click', () => {
            translationDialog.remove();
        });
        
        translationDialog.querySelector('#translate-btn').addEventListener('click', translateText);
        translationDialog.querySelector('#copy-translation-btn').addEventListener('click', copyTranslation);
        translationDialog.querySelector('#speak-translation-btn').addEventListener('click', speakTranslation);
        translationDialog.querySelector('#use-translation-btn').addEventListener('click', useTranslation);
        
        // Get text from main editor if available
        const textInput = document.getElementById('textInput');
        if (textInput && textInput.value) {
            translationDialog.querySelector('#source-text').value = textInput.value;
        }
    }
}

// Function to translate text (mock implementation)
function translateText() {
    const sourceText = document.getElementById('source-text').value;
    if (!sourceText) {
        showNotification('Please enter text to translate');
        return;
    }
    
    const sourceLanguage = document.getElementById('source-language').value;
    const targetLanguage = document.getElementById('target-language').value;
    
    // In a real app, this would call a translation API
    // For demo purposes, we'll simulate translation
    showNotification('Translating...');
    
    setTimeout(() => {
        // Very simple mock translations for demo purposes
        const mockTranslations = {
            "en": {
                "es": {
                    "Hello": "Hola",
                    "Welcome": "Bienvenido",
                    "How are you?": "¿Cómo estás?",
                    "Thank you": "Gracias",
                    "Goodbye": "Adiós"
                },
                "fr": {
                    "Hello": "Bonjour",
                    "Welcome": "Bienvenue",
                    "How are you?": "Comment allez-vous?",
                    "Thank you": "Merci",
                    "Goodbye": "Au revoir"
                }
            }
        };
        
        let translatedText = sourceText;
        
        // Simple word replacement for demo
        if (mockTranslations[sourceLanguage] && mockTranslations[sourceLanguage][targetLanguage]) {
            const translations = mockTranslations[sourceLanguage][targetLanguage];
            Object.keys(translations).forEach(key => {
                translatedText = translatedText.replace(
                    new RegExp(key, 'gi'), 
                    translations[key]
                );
            });
        } else {
            // If no translation map exists, append mock language marker
            translatedText = sourceText + " [Translated to " + targetLanguage + "]";
        }
        
        document.getElementById('translated-text').value = translatedText;
        showNotification('Translation complete');
    }, 1000);
}

// Function to copy translation
function copyTranslation() {
    const translatedText = document.getElementById('translated-text').value;
    if (!translatedText) {
        showNotification('No translation to copy');
        return;
    }
    
    navigator.clipboard.writeText(translatedText)
        .then(() => {
            showNotification('Translation copied to clipboard');
        })
        .catch(err => {
            showNotification('Failed to copy: ' + err);
        });
}

// Function to speak translation
function speakTranslation() {
    const translatedText = document.getElementById('translated-text').value;
    if (!translatedText) {
        showNotification('No translation to speak');
        return;
    }
    
    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(translatedText);
        
        // Try to set voice based on target language
        const targetLanguage = document.getElementById('target-language').value;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(targetLanguage));
        if (voice) {
            utterance.voice = voice;
        }
        
        window.speechSynthesis.speak(utterance);
        showNotification('Speaking translation');
    } else {
        showNotification('Text-to-speech not supported in your browser');
    }
}

// Function to use translation in main editor
function useTranslation() {
    const translatedText = document.getElementById('translated-text').value;
    if (!translatedText) {
        showNotification('No translation to use');
        return;
    }
    
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.value = translatedText;
        document.getElementById('translation-dialog').remove();
        activateTab('homeTab');
        showNotification('Translation added to editor');
    }
}

// Helper function to activate a specific tab
function activateTab(tabId) {
    const tab = document.getElementById(tabId);
    if (tab) {
        // First, deactivate all tabs
        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-current', 'false');
        });
        
        document.querySelectorAll('.main-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Activate the selected tab
        tab.classList.add('active');
        tab.setAttribute('aria-current', 'page');
        
        // Get the content ID from the tab's data-tab attribute
        const contentId = tab.dataset.tab + 'Content';
        const content = document.getElementById(contentId);
        if (content) {
            content.classList.add('active');
        }
    }
}
