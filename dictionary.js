// Dictionary feature integration for VoiceReady
document.addEventListener('DOMContentLoaded', function() {
    const wordInput = document.getElementById('word-input');
    const lookupBtn = document.getElementById('lookupBtn');
    const speakBtn = document.getElementById('speakBtn');
    const definitionElem = document.getElementById('definition');
    const partOfSpeechElem = document.getElementById('partOfSpeech');
    const synonymsElem = document.getElementById('synonyms');
    const antonymsElem = document.getElementById('antonyms');
    const pronunciationElem = document.getElementById('pronunciation');
    
    // API endpoint (update this to your Flask backend URL)
    const API_URL = 'http://localhost:5000/api/lookup';
    
    // Word lookup function
    async function lookupWord(word) {
        if (!word) return;
        
        try {
            // Show loading state
            definitionElem.textContent = 'Loading...';
            partOfSpeechElem.textContent = '';
            synonymsElem.textContent = '';
            antonymsElem.textContent = '';
            pronunciationElem.textContent = '';
            
            // Fetch word data from API
            const response = await fetch(`${API_URL}?word=${encodeURIComponent(word)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch word data');
            }
            
            const data = await response.json();
            
            // Handle suggestions (when exact word not found)
            if (data.suggestions) {
                definitionElem.textContent = 'Word not found. Suggestions: ' + data.suggestions.join(', ');
                return;
            }
            
            // Display word data
            if (data.definitions && data.definitions.length > 0) {
                definitionElem.textContent = data.definitions.join('; ');
            } else {
                definitionElem.textContent = 'No definition available';
            }
            
            partOfSpeechElem.textContent = data.partOfSpeech || 'N/A';
            
            if (data.synonyms && data.synonyms.length > 0) {
                synonymsElem.textContent = data.synonyms.join(', ');
            } else {
                synonymsElem.textContent = 'None available';
            }
            
            if (data.antonyms && data.antonyms.length > 0) {
                antonymsElem.textContent = data.antonyms.join(', ');
            } else {
                antonymsElem.textContent = 'None available';
            }
            
            if (data.pronunciation && data.pronunciation.text) {
                pronunciationElem.textContent = data.pronunciation.text;
                
                // Enable pronunciation button if audio is available
                if (data.pronunciation.audio) {
                    speakBtn.dataset.audioUrl = data.pronunciation.audio;
                    speakBtn.disabled = false;
                } else {
                    speakBtn.disabled = true;
                }
            } else {
                pronunciationElem.textContent = 'Not available';
                speakBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error looking up word:', error);
            definitionElem.textContent = 'Error looking up word. Please try again.';
        }
    }
    
    // Event listeners
    lookupBtn.addEventListener('click', function() {
        lookupWord(wordInput.value.trim());
    });
    
    wordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupWord(this.value.trim());
        }
    });
    
    speakBtn.addEventListener('click', function() {
        const audioUrl = this.dataset.audioUrl;
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(error => {
                console.error('Error playing pronunciation:', error);
            });
        }
    });
    
    // Additional feature: Allow looking up words from the text input
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('dblclick', function() {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText) {
                wordInput.value = selectedText;
                lookupWord(selectedText);
            }
        });
        
        // Also allow right-click to look up words
        textInput.addEventListener('contextmenu', function(e) {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText) {
                e.preventDefault(); // Prevent default context menu
                wordInput.value = selectedText;
                lookupWord(selectedText);
            }
        });
    }
});