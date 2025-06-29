let synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;
let isPlaying = false;
let isPaused = false;
let trackingInterval = null;
let trackingEnabled = false;
let currentWordIndex = 0;
let words = [];
let currentTheme = 'default';
let csrfToken = generateCSRFToken();

// DOM Elements
let textInput, voiceSelect, defaultVoice, statusText, readingProgress, rateRange, pitchRange, trackingLine;
document.addEventListener('DOMContentLoaded', 
    function() {
    // Initialize the application when the DOM is fully loaded
    initializeApp();
});

function initializeApp() {
    // Set CSRF token
    document.getElementById('csrf_token').value = csrfToken;
    
    // Initialize DOM elements
    textInput = document.getElementById('textInput');
    voiceSelect = document.getElementById('voiceSelect');
    defaultVoice = document.getElementById('defaultVoice');
    statusText = document.getElementById('statusText');
    readingProgress = document.getElementById('readingProgress');
    rateRange = document.getElementById('rateRange');
    pitchRange = document.getElementById('pitchRange');
    trackingLine = document.getElementById('trackingLine');

    // Populate voices dropdown
    populateVoiceList();
    
    // If speechSynthesis.onvoiceschanged exists, register the event
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    
    // Initialize event listeners
    initializeEventListeners();
    document.addEventListener('DOMContentLoaded', function() {
        initializeTabs();
        // Other initialization code...
    });
    // Initialize tabs
    initializeTabs();
    setupToolsTabFunctionality();
    setupResourcesTabFunctionality();
    setupSupportTabFunctionality();
    
    // Initialize other features
    setupAccessibilityOptions();
    // Initialize accordions
    initializeAccordions();
    
    // Set default text for demo purposes
    setDemoText();
    
    // Load user preferences if available
    loadUserPreferences();
    
    // Update font preview based on initial settings
    updateFontPreview();
    
    // Check for browser compatibility
    checkBrowserCompatibility();
    // Add this to your initializeApp function
function addHighlightStyles() {
    if(!document,getElementById('highlightStyles')) {
        const style = document.createElement('style');
        style.id = 'highlightStyles';
        style.textContent = `
        .highlight-word {
            display: inline;
            border-radius: 3px;
            transition: background-color 0.2s ease;
        }
        .highlight-word.active {
            background-color: #ffff00;!important;
            color: #000000;
            font-weight: bold;
        }
        `;
        document.head.appendChild(style);
    }
}

addHighlightStyles()
}

/**
 * Populate the voice selection dropdown
 */
function populateVoiceList() {
    voices = synth.getVoices();

    // Clear dropdown
    voiceSelect.innerHTML = '';
    if (defaultVoice) defaultVoice.innerHTML = '';

    // Add voices to dropdown
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;

        voiceSelect.appendChild(option);

        // Clone for default voice dropdown
        if (defaultVoice){
            const defaultOption = option.cloneNode(true);
            defaultVoice.appendChild(defaultOption);
        }
    });

    // Set default voice (prefer English voices)
    const englishVoice = voices.findIndex(voice => voice.lang.includes('en-'));
    if (englishVoice !== -1) {
        voiceSelect.value = englishVoice;
        defaultVoice.value = englishVoice;
        currentVoice = voices[englishVoice];
    } else if (voices.length > 0) {
        voiceSelect.value = 0;
        defaultVoice.value = 0;
        currentVoice = voices[0];
    }

    // Update voice when changed
    voiceSelect.addEventListener('change', () => {
        currentVoice = voices[parseInt(voiceSelect.value)];
    });
}

function initializeEventListeners() {
    // Speech control buttons
    document.getElementById('playBtn').addEventListener('click', playText);
    document.getElementById('pauseBtn').addEventListener('click', pauseResumeText);
    document.getElementById('stopBtn').addEventListener('click', stopText);
    document.getElementById('clearBtn').addEventListener('click', clearText);
    
    // Visual tracking button
    document.getElementById('visualTrackingBtn').addEventListener('click', toggleVisualTracking);
    
    // Text settings controls
    document.getElementById('fontSelect').addEventListener('change', updateTextSettings);
    document.getElementById('fontSizeRange').addEventListener('input', updateTextSettings);
    document.getElementById('lineSpacingRange').addEventListener('input', updateTextSettings);
    document.getElementById('colorPicker').addEventListener('input', updateTextSettings);
    
    // Voice settings controls
    document.getElementById('rateRange').addEventListener('input', function() {
        document.getElementById('rateValue').textContent = this.value;
    });
    
    document.getElementById('pitchRange').addEventListener('input', function() {
        document.getElementById('pitchValue').textContent = this.value;
    });
    
  
    // Color themes
    const colorThemes = document.querySelectorAll('.color-theme');
    colorThemes.forEach(theme => {
        theme.addEventListener('click', function() {
            applyColorTheme(this.getAttribute('data-theme'));
            
            // Update active state
            colorThemes.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        
        // Make it keyboard accessible
        theme.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // File upload
    document.getElementById('uploadBtn').addEventListener('click', handleFileUpload);
    
    // Save current text
    document.getElementById('saveCurrentBtn').addEventListener('click', saveCurrentText);
    
    // Load saved text items
    const savedItems = document.querySelectorAll('.saved-item');
    savedItems.forEach(item => {
        item.addEventListener('click', function() {
            loadSavedText(this.querySelector('strong').textContent);
        });
        
        // Make it keyboard accessible
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Profile icon - toggle account tab
    document.getElementById('profileIcon').addEventListener('click', function() {
        const accountTab = document.getElementById('accountContent');
        const tabs = document.querySelectorAll('.main-tab-content');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        accountTab.classList.add('active');
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('active');
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', showRegistrationForm);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Save preferences button
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', saveUserPreferences);
    }
    
    // Speak word button in dictionary
    const speakBtn = document.getElementById('speakBtn');
    if (speakBtn) {
        speakBtn.addEventListener('click', function() {
            const word = document.getElementById('word-input').value;
            if (word) {
                speakWord(word);
            }
        });
    }
}

/**
 * Initialize tab navigation
 */
function initializeTabs() {
    const tabs = document.querySelectorAll('.main-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            const tabContents = document.querySelectorAll('.main-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}Content`).classList.add('active');
            
            // Update aria-current
            tabs.forEach(t => t.removeAttribute('aria-current'));
            this.setAttribute('aria-current', 'page');
        });
    });
}

/**
 * Initialize accordion functionality
 */
function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle the accordion content
            const content = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Update ARIA attributes
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle display
            if (content.style.display === 'block') {
                content.style.display = 'none';
                this.querySelector('span:last-child').textContent = '+';
            } else {
                content.style.display = 'block';
                this.querySelector('span:last-child').textContent = '-';
            }
        });
        
        // Make it keyboard accessible
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Play the text using speech synthesis
 */
function playText() {
    if (isPlaying) {
        stopText();
    }

    const text = textInput.value.trim();
    if (!text) {
        statusText.textContent = "No text to read";
        return;
    }

    // Split the text into words for tracking
    words = text.split(/\s+/);
    currentWordIndex = 0;

    currentUtterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const selectedVoiceIndex = parseInt(voiceSelect.value);
    if (!isNaN(selectedVoiceIndex) && voices[selectedVoiceIndex]) {
        currentUtterance.voice = voices[selectedVoiceIndex];
    }

    // Set rate and pitch
    currentUtterance.rate = parseFloat(rateRange.value);
    currentUtterance.pitch = parseFloat(pitchRange.value);

    // Set event handlers
    currentUtterance.onstart = () => {
        statusText.textContent = "Reading...";
        isPlaying = true;
        
        if (trackingEnabled) {
            prepareTextForHighlighting();
        }
        
        updateProgressBar();
    };

    currentUtterance.onend = () => {
        statusText.textContent = "Finished reading";
        isPlaying = false;
        
        if (trackingEnabled) {
            clearHighlighting();
        }
        
        readingProgress.style.width = "100%";
    };

    currentUtterance.onboundary = (event) => {
        // Calculate progress based on character index
        const progress = (event.charIndex / text.length) * 100;
        readingProgress.style.width = `${progress}%`;
        
        // Handle word highlighting if enabled
        if (trackingEnabled) {
            highlightCurrentWord(event.charIndex, event.charLength || 0);
        }
    }

    synth.speak(currentUtterance);
}
    function pauseResumeText() {
        if (!isPlaying) return;
        
        if (isPaused) {
            // Resume
            synth.resume();
            isPaused = false;
            updatePlaybackStatus('Playing...');
        } else {
            // Pause
            synth.pause();
            isPaused = true;
            updatePlaybackStatus('Paused');
        }
    }
    
    /**
     * Stop text playback
     */
    function stopText() {
        if (!isPlaying && !isPaused) return;
        
            synth.cancel();
            isPlaying = false;
            isPaused = false;
            updatePlaybackStatus('Stopped');
        
        // Reset progress bar
        document.getElementById('readingProgress').style.width = '0%';
        
        // Clear visual tracking
        if (trackingEnabled) {
            clearHighlighting();
        }
    }
    /**
     * Clear the text input
     */
    function clearText() {
        // Stop any current speech
        stopText();
        
        // Clear the text input
        document.getElementById('textInput').value = '';
        
        // Update status
        updatePlaybackStatus('Text cleared');
    }
    
    /**
     * Update the playback status text
     * @param {string} status - The status message to display
     */
    function updatePlaybackStatus(status) {
        document.getElementById('statusText').textContent = status;
    }
    
    /**
     * Update the progress bar during playback
     */
    function updateProgressBar() {
        if (!isPlaying) return;
        
        const text = document.getElementById('textInput').value;
        const progress = currentWordIndex / words.length * 100;
        
        document.getElementById('readingProgress').style.width = `${progress}%`;
        document.querySelector('.progress-bar').setAttribute('aria-valuenow', Math.round(progress));
        
        // Update progress every 100ms
        setTimeout(updateProgressBar, 100);
    }
    
    /**
     * Toggle visual tracking feature
     */
    function toggleVisualTracking() {
        trackingEnabled = !trackingEnabled;
        
        const trackingBtn = document.getElementById('visualTrackingBtn');
        
        if (trackingBtn) {
            if (trackingEnabled) {
                trackingBtn.classList.add('active');
                trackingBtn.setAttribute('aria-pressed', 'true');
                
                // If already playing, set up highlighting immediately
                if (isPlaying) {
                    prepareTextForHighlighting();
                }
            } else {
                trackingBtn.classList.remove('active');
                trackingBtn.setAttribute('aria-pressed', 'false');
                clearHighlighting();
             // Restore the original text input if currently playing
             if (isPlaying) {
                const textInput = document.getElementById('textInput');
                textInput.style.opacity = '1';
                textInput.style.position = 'relative';
            }
        }
    }
}
    function updateTextSettings() {
        const fontFamily = document.getElementById('fontSelect').value;
        const fontSize = document.getElementById('fontSizeRange').value;
        const lineSpacing = document.getElementById('lineSpacingRange').value;
        const backgroundColor = document.getElementById('colorPicker').value;
        
        // Update text input
        const textInput = document.getElementById('textInput');
        textInput.style.fontFamily = fontFamily;
        textInput.style.fontSize = `${fontSize}px`;
        textInput.style.lineHeight = lineSpacing;
        textInput.style.backgroundColor = backgroundColor;
        
        // Update font size display
        document.getElementById('fontSizeValue').textContent = fontSize;
        
        // Update line spacing display
        document.getElementById('lineSpacingValue').textContent = lineSpacing;
        
        // Update font preview
        updateFontPreview();
    }
    
    /**
     * Update the font preview based on current settings
     */
    function updateFontPreview() {
        const fontFamily = document.getElementById('fontSelect').value;
        const fontSize = document.getElementById('fontSizeRange').value;
        const lineSpacing = document.getElementById('lineSpacingRange').value;
        
        const fontPreview = document.querySelector('.font-preview p');
        if (fontPreview) {
            fontPreview.style.fontFamily = fontFamily;
            fontPreview.style.fontSize = `${fontSize}px`;
            fontPreview.style.lineHeight = lineSpacing;
        }
    }
    
    
    /**
     * Speak a single word
     * @param {string} word - The word to speak
     */
    function speakWord(word) {
        // Create a new utterance for the word
        const utterance = new SpeechSynthesisUtterance(word);
        
        // Use the same voice as the main reader
        const selectedVoice = document.getElementById('voiceSelect').value;
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }
        
        // Speak the word
        synth.speak(utterance);
    }
    
    /**
     * Apply a color theme to the application
     * @param {string} theme - The theme name to apply
     */
    function applyColorTheme(theme) {
        let backgroundColor, textColor, primaryColor, secondaryColor;
        
        switch (theme) {
            case 'cool':
                backgroundColor = '#e0f7fa';
                textColor = '#01579b';
                primaryColor = '#0288d1';
                secondaryColor = '#b3e5fc';
                break;
            case 'warm':
                backgroundColor = '#fff8e1';
                textColor = '#bf360c';
                primaryColor = '#ff9800';
                secondaryColor = '#ffecb3';
                break;
            case 'nature':
                backgroundColor = '#f1f8e9';
                textColor = '#33691e';
                primaryColor = '#689f38';
                secondaryColor = '#dcedc8';
                break;
            case 'rose':
                backgroundColor = '#fce4ec';
                textColor = '#880e4f';
                primaryColor = '#ec407a';
                secondaryColor = '#f8bbd0';
                break;
            default: // Default theme
                backgroundColor = '#f8f0e5';
                textColor = '#1e293b';
                primaryColor = '#1e40af';
                secondaryColor = '#f1f5f9';
                break;
        }
        
        // Apply theme colors
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--text-color', textColor);
        
        // Update color picker to match background
        document.getElementById('colorPicker').value = backgroundColor;
        
        // Update text input background
        document.getElementById('textInput').style.backgroundColor = backgroundColor;
        
        // Save current theme
        currentTheme = theme;
    }
    
    /**
     * Handle file upload and text extraction
     */
    /**
 * Handle file upload and text extraction
 */
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }
    
    // Show loading state
    updatePlaybackStatus('Extracting text from file...');
    
    // Extract text from the file
    extractTextFromFile(file)
        .then(extractedText => {
            // Update text input with extracted text
            document.getElementById('textInput').value = extractedText;
            updatePlaybackStatus('Text extracted successfully');
        })
        .catch(error => {
            console.error('File extraction error:', error);
            updatePlaybackStatus('Error extracting text from file: ' + error.message);
            alert('Failed to extract text: ' + error.message);
        });
}
    
    /**
     * Save the current text to the user's saved texts
     */
    function saveCurrentText() {
        const text = document.getElementById('textInput').value.trim();
        
        if (!text) {
            alert('Please enter some text to save.');
            return;
        }
        
        // Create a name for the saved text
        const name = prompt('Enter a name for this saved text:');
        
        if (!name) return;
        
        // Create data to send
        const data = {
            name: name,
            text: text,
            csrf_token: csrfToken
        };
        
        // Send to server
        fetch('/api/save-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save text');
            }
            return response.json();
        })
        .then(data => {
            // Add to saved texts list
            const savedTextsList = document.getElementById('savedTextsList');
            const newItem = document.createElement('div');
            newItem.className = 'saved-item';
            newItem.setAttribute('tabindex', '0');
            newItem.setAttribute('role', 'button');
            
            const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            newItem.innerHTML = `
                <strong>${name}</strong>
                <p>Last modified: ${date}</p>
            `;
                    // Add event listener
        newItem.addEventListener('click', function() {
            loadSavedText(name);
        });
        
        // Make it keyboard accessible
        newItem.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        savedTextsList.appendChild(newItem);
        
        updatePlaybackStatus('Text saved successfully');
    })
    .catch(error => {
        console.error('Save text error:', error);
        updatePlaybackStatus('Error saving text');
    });
}

/**
 * Load a saved text into the text input
 * @param {string} name - The name of the saved text to load
 */
function loadSavedText(name) {
    // Send request to server
    fetch(`/api/get-text?name=${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load text');
        }
        return response.json();
    })
    .then(data => {
        // Update text input with loaded text
        document.getElementById('textInput').value = data.text;
        updatePlaybackStatus(`Loaded text: ${name}`);
    })
    .catch(error => {
        console.error('Load text error:', error);
        updatePlaybackStatus('Error loading text');
    });
}

/**
 * Handle login form submission
 * @param {Event} event - The form submission event
 */
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Create data to send
    const data = {
        username: username,
        password: password,
        csrf_token: csrfToken
    };
    
    // Send to server
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        // Hide login section and show profile section
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('profileSection').style.display = 'block';
        
        // Update profile information
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profileJoinDate').textContent = new Date(data.joinDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Load user preferences
        if (data.preferences) {
            applyUserPreferences(data.preferences);
        }
        
        // Update profile icon
        document.getElementById('profileIcon').textContent = data.name.charAt(0).toUpperCase();
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
    });
}

/**
 * Show the registration form
 */
function showRegistrationForm() {
    // For demo purposes, we'll just show an alert
    alert('Registration functionality would be implemented here.');
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Send logout request to server
    fetch('/api/logout', {
        method: 'POST',
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Logout failed');
        }
        return response.json();
    })
    .then(data => {
        // Show login section and hide profile section
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('profileSection').style.display = 'none';
        
        // Reset profile icon
        document.getElementById('profileIcon').textContent = '?';
        
        // Reset form
        document.getElementById('loginForm').reset();
    })
    .catch(error => {
        console.error('Logout error:', error);
    });
}

/**
 * Save user preferences
 */
function saveUserPreferences() {
    const preferences = {
        defaultVoice: document.getElementById('defaultVoice').value,
        defaultFont: document.getElementById('defaultFont').value,
        defaultTheme: document.getElementById('defaultTheme').value,
        csrf_token: csrfToken
    };
    
    // Send to server
    fetch('/api/save-preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(preferences)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save preferences');
        }
        return response.json();
    })
    .then(data => {
        alert('Preferences saved successfully');
    })
    .catch(error => {
        console.error('Save preferences error:', error);
        alert('Error saving preferences');
    });
}

/**
 * Load user preferences
 */
function loadUserPreferences() {
    // In a real app, this would fetch from server
    // For demo, we'll use localStorage
    const savedPreferences = localStorage.getItem('userPreferences');
    
    if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        applyUserPreferences(preferences);
    }
}

/**
 * Apply user preferences to the UI
 * @param {Object} preferences - The user preferences object
 */
function applyUserPreferences(preferences) {
    // Apply voice preference
    if (preferences.defaultVoice) {
        document.getElementById('voiceSelect').value = preferences.defaultVoice;
        if (document.getElementById('defaultVoice')) {
            document.getElementById('defaultVoice').value = preferences.defaultVoice;
        }
    }
    
    // Apply font preference
    if (preferences.defaultFont) {
        document.getElementById('fontSelect').value = preferences.defaultFont;
        document.getElementById('textInput').style.fontFamily = preferences.defaultFont;
        
        if (document.getElementById('defaultFont')) {
            document.getElementById('defaultFont').value = preferences.defaultFont;
        }
    }
    
    // Apply theme preference
    if (preferences.defaultTheme) {
        applyColorTheme(preferences.defaultTheme);
        
        if (document.getElementById('defaultTheme')) {
            document.getElementById('defaultTheme').value = preferences.defaultTheme;
        }
        
        // Update active theme indicator
        const colorThemes = document.querySelectorAll('.color-theme');
        colorThemes.forEach(theme => {
            theme.classList.remove('active');
            if (theme.getAttribute('data-theme') === preferences.defaultTheme) {
                theme.classList.add('active');
            }
        });
    }
}

/**
 * Set demo text for the application
 */
function setDemoText() {
    const demoText = `Welcome to your text-to-speech assistant designed for students with dyslexia. This application helps you read and comprehend text more easily by converting written content into spoken words. You can adjust the reading speed, voice, and text display to suit your preferences. Try selecting some text to look up words in the dictionary, or upload a document to have it read aloud. We hope this tool makes reading more accessible and enjoyable for you!`;
    
    document.getElementById('textInput').value = demoText;
}

/**
 * Check browser compatibility for required features
 */
function checkBrowserCompatibility() {
    // Check for Speech Synthesis API
    if (!('speechSynthesis' in window)) {
        alert('Your browser does not support the Speech Synthesis API. Some features may not work correctly.');
    }
    
    // Check for File API
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('Your browser does not fully support the File API. File upload features may not work correctly.');
    }
}

/**
 * Generate a CSRF token for form security
 * @returns {string} A random token
 */
function generateCSRFToken() {
    // In a real application, this would come from the server
    // For demo purposes, we generate a random string
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

/**
 * Validate login form before submission
 * @param {Event} event - The form submission event
 * @returns {boolean} Whether the form is valid
 */
function validateLogin(event) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter both username and password.');
        return false;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return false;
    }
    
    // For demo purposes, we'll prevent actual form submission
    event.preventDefault();
    
    // Simulate login
    setTimeout(() => {
        // Show profile section
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('profileSection').style.display = 'block';
        
        // Update profile information
        document.getElementById('profileName').textContent = 'Demo User';
        document.getElementById('profileEmail').textContent = username;
        document.getElementById('profileJoinDate').textContent = 'January 15, 2025';
        
        // Update profile icon
        document.getElementById('profileIcon').textContent = 'D';
    }, 1000);
    
    return false;
}
// Add this to your initializeEventListeners function
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleThemeMode);
}

/**
 * Toggle between light and dark mode
 */
function toggleThemeMode() {
    const body = document.body;
    
    // Toggle the class
    body.classList.toggle('light-mode-override');
    
    // Save preference to localStorage
    const isLightMode = body.classList.contains('light-mode-override');
    localStorage.setItem('lightModePreference', isLightMode);
    
    // Update aria-label for accessibility
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', 
            isLightMode ? 'Switch to dark mode' : 'Switch to light mode');
    }
}

// Add this to your initializeApp function to load saved preference
function loadThemePreference() {
    const isLightMode = localStorage.getItem('lightModePreference') === 'true';
    if (isLightMode) {
        document.body.classList.add('light-mode-override');
    }
    
    // Update aria-label
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', 
            isLightMode ? 'Switch to dark mode' : 'Switch to light mode');
    }
}

// Call this in your initializeApp function
loadThemePreference();
/**
 * Prepare text for word highlighting
 */
function prepareTextForHighlighting() {
    // Skip if tracking is not enabled
    if (!trackingEnabled) return;
    
    const textInput = document.getElementById('textInput');
    const originalText = textInput.value;
    
    // Clear any existing highlighting first
    clearHighlighting();
    
    // Create a container for the highlighted text
    const highlightContainer = document.createElement('div');
    highlightContainer.id = 'highlightContainer';
    highlightContainer.style.position = 'relative';
    highlightContainer.style.width = '100%';
    highlightContainer.style.height = '100%';
    
    // Hide the original textarea during playback
    textInput.style.opacity = '0';
    textInput.style.position = 'absolute';
    
    // Insert the highlight container
    textInput.parentNode.insertBefore(highlightContainer, textInput.nextSibling);
    // Split text into words and create spans
    const words = originalText.split(/(\s+)/);
    let html = '';
    
    words.forEach((word, index) => {
        if (word.trim() === '') {
            html += word; // Keep spaces as is
        } else {
            html += `<span class="highlight-word" data-index="${index}">${word}</span>`;
        }
    });
    
    highlightContainer.innerHTML = html;
    highlightContainer.style.fontFamily = textInput.style.fontFamily;
    highlightContainer.style.fontSize = textInput.style.fontSize;
    highlightContainer.style.lineHeight = textInput.style.lineHeight;
    highlightContainer.style.padding = window.getComputedStyle(textInput).padding;
    highlightContainer.style.backgroundColor = textInput.style.backgroundColor;
    highlightContainer.style.color = textInput.style.color;
    highlightContainer.style.border = textInput.style.border;
    highlightContainer.style.borderRadius = textInput.style.borderRadius;
    highlightContainer.style.overflowY = 'auto';
    highlightContainer.style.whiteSpace = 'pre-wrap';
    highlightContainer.style.wordBreak = 'break-word';
}
/**
 * Highlight the current word being spoken
 * @param {number} charIndex - The character index where the word starts
 * @param {number} charLength - The length of the word
 */
function highlightCurrentWord(charIndex, charLength) {
    if (!trackingEnabled) return;
    
    // Clear previous highlighting
    const previousHighlighted = document.querySelector('.highlight-word.active');
    if (previousHighlighted) {
        previousHighlighted.classList.remove('active');
    }
    
    // Find the word at the current character index
    const text = textInput.value;
    let wordStart = charIndex;
    
    // Find the beginning of the word
    while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) {
        wordStart--;
    }
    
    // Count words up to this point to find the correct span
    const textUpToWord = text.substring(0, wordStart);
    const wordCount = textUpToWord.split(/\s+/).length - (textUpToWord.trim() === '' ? 1 : 0);
    
    // Find and highlight the corresponding span
    const wordSpan = document.querySelector(`.highlight-word[data-index="${wordCount}"]`);
    if (wordSpan) {
        wordSpan.classList.add('active');
        
        // Scroll to keep the highlighted word visible
        const container = document.getElementById('highlightContainer');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const wordRect = wordSpan.getBoundingClientRect();
            
            if (wordRect.bottom > containerRect.bottom || wordRect.top < containerRect.top) {
                wordSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    // Update current word index for progress bar
    currentWordIndex = wordCount;
}


function clearHighlighting() {
    const highlightContainer = document.getElementById('highlightContainer');
    if (highlightContainer) {
        highlightContainer.remove();
    }
    
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.style.opacity = '1';
        textInput.style.position = 'relative';
    }
}
// Add this to your JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    // Get all color theme options
    const themeOptions = document.querySelectorAll('.color-theme');
    
    // Add click event listener to each option
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Get the theme value from data-theme attribute
            const selectedTheme = this.getAttribute('data-theme');
            
            // Apply the theme to the body
            document.body.setAttribute('data-active-theme', selectedTheme);
        });
    });
    
    // Set default theme on page load
    const defaultTheme = document.querySelector('.color-theme.active').getAttribute('data-theme');
    document.body.setAttribute('data-active-theme', defaultTheme);
});
// /**
//  * Extract text from an uploaded file
//  * @param {File} file - The file to extract text from
//  * @returns {Promise<string>} - The extracted text
//  */
// /**
//  * Extract text from a PDF file with improved error handling
//  * @param {File} file - The PDF file
//  * @returns {Promise<string>} - The extracted text
//  */
// function extractTextFromFile(file) {
//     return new Promise((resolve, reject) => {
//         // Check file type
//         const fileType = file.type;
//         const fileName = file.name.toLowerCase();
        
//         // For PDF files
//         if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
//             // First, ensure PDF.js is loaded
//             loadPdfJsLibrary()
//                 .then(() => {
//                     const reader = new FileReader();
                    
//                     reader.onload = function(e) {
//                         try {
//                             const typedArray = new Uint8Array(e.target.result);
                            
//                             // Display status
//                             updatePlaybackStatus('Processing PDF...');
                            
//                             // Set up PDF.js options for better compatibility
//                             const loadingTask = pdfjsLib.getDocument({
//                                 data: typedArray,
//                                 cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
//                                 cMapPacked: true,
//                                 standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/standard_fonts/'
//                             });
                            
//                             loadingTask.promise
//                                 .then(pdfDoc => {
//                                     const numPages = pdfDoc.numPages;
//                                     const textPromises = [];
                                    
//                                     updatePlaybackStatus(`Extracting text from ${numPages} pages...`);
                                    
//                                     // Process each page
//                                     for (let i = 1; i <= numPages; i++) {
//                                         textPromises.push(
//                                             pdfDoc.getPage(i)
//                                                 .then(page => {
//                                                     return page.getTextContent();
//                                                 })
//                                                 .then(textContent => {
//                                                     // Extract text and preserve some layout
//                                                     let lastY;
//                                                     let text = '';
                                                    
//                                                     for (const item of textContent.items) {
//                                                         // Add newlines based on position changes
//                                                         if (lastY && Math.abs(lastY - item.transform[5]) > 5) {
//                                                             text += '\n';
//                                                         }
                                                        
//                                                         text += item.str + ' ';
//                                                         lastY = item.transform[5];
//                                                     }
                                                    
//                                                     return text;
//                                                 })
//                                                 .catch(err => {
//                                                     console.warn(`Error on page ${i}:`, err);
//                                                     return `[Error extracting page ${i}]`;
//                                                 })
//                                         );
//                                     }
                                    
//                                     // Combine all page text
//                                     Promise.all(textPromises)
//                                         .then(pageTexts => {
//                                             const fullText = pageTexts.join('\n\n');
//                                             updatePlaybackStatus('PDF text extraction complete');
//                                             resolve(fullText);
//                                         })
//                                         .catch(error => {
//                                             console.error('Error combining page texts:', error);
//                                             reject(new Error('Failed to combine PDF page texts'));
//                                         });
//                                 })
//                                 .catch(error => {
//                                     console.error('PDF parsing error:', error);
//                                     reject(new Error(`PDF parsing failed: ${error.message || 'Unknown error'}`));
//                                 });
//                         } catch (error) {
//                             console.error('Error processing PDF:', error);
//                             reject(new Error(`PDF processing error: ${error.message}`));
//                         }
//                     };
                    
//                     reader.onerror = function(error) {
//                         reject(new Error(`Failed to read PDF file: ${error.message || 'Unknown error'}`));
//                     };
                    
//                     // Read the file as an array buffer
//                     reader.readAsArrayBuffer(file);
//                 })
//                 .catch(error => {
//                     reject(new Error(`Failed to load PDF.js library: ${error.message}`));
//                 });
//         } else {
//             // Handle other file types as before...
//             reject(new Error(`File type "${fileType}" is not supported for text extraction`));
//         }
//     });
// }

// /**
//  * Load the PDF.js library dynamically
//  * @returns {Promise<void>}
//  */
// function loadPdfJsLibrary() {
//     return new Promise((resolve, reject) => {
//         // Check if PDF.js is already loaded
//         if (typeof pdfjsLib !== 'undefined') {
//             resolve();
//             return;
//         }
        
//         // Create and load the PDF.js script
//         const script = document.createElement('script');
//         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
//         script.integrity = 'sha512-EGQ2RmTAJ+1VgXm6iE+cLXf5paFpUR5FPGQuvJLJRzGRBDOL0g8mZOCQzWHLGeRoVRE5PXAXRkDZ8/2MMh+/Lw==';
//         script.crossOrigin = 'anonymous';
//         script.referrerPolicy = 'no-referrer';
        
//         script.onload = function() {
//             // Set the worker path
//             pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
//             resolve();
//         };
        
//         script.onerror = function(error) {
//             reject(new Error('Failed to load PDF.js script'));
//         };
        
//         document.head.appendChild(script);
//     });
// }

// /**
//  * Handle file upload and text extraction with detailed error handling
//  */
// function handleFileUpload() {
//     const fileInput = document.getElementById('fileInput');
//     const file = fileInput.files[0];
    
//     if (!file) {
//         alert('Please select a file to upload.');
//         return;
//     }
    
//     // Show loading state
//     updatePlaybackStatus('Preparing to extract text from file...');
    
//     // Check file size
//     const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
//     if (file.size > MAX_FILE_SIZE) {
//         updatePlaybackStatus('Error: File is too large (max 10MB)');
//         alert('File is too large. Please upload a file smaller than 10MB.');
//         return;
//     }
    
//     // Update status based on file type
//     const fileType = file.type;
//     const fileName = file.name.toLowerCase();
    
//     if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
//         updatePlaybackStatus('Processing PDF file...');
//     } else if (fileType === 'text/plain') {
//         updatePlaybackStatus('Processing text file...');
//     } else if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//         updatePlaybackStatus('Processing Word document...');
//     } else {
//         updatePlaybackStatus('Processing file...');
//     }
    
//     // Extract text from the file
//     extractTextFromFile(file)
//         .then(extractedText => {
//             if (!extractedText || extractedText.trim() === '') {
//                 updatePlaybackStatus('Warning: No text could be extracted from the file');
//                 alert('No text could be extracted from this file. It might be empty, image-based, or protected.');
//                 return;
//             }
            
//             // Update text input with extracted text
//             document.getElementById('textInput').value = extractedText;
//             updatePlaybackStatus('Text extracted successfully: ' + file.name);
//         })
//         .catch(error => {
//             console.error('File extraction error:', error);
//             updatePlaybackStatus('Error extracting text: ' + error.message);
            
//             // Show friendly error message
//             let errorMessage = 'Failed to extract text. ';
            
//             if (error.message.includes('PDF parsing failed')) {
//                 errorMessage += 'The PDF file might be corrupted or password-protected.';
//             } else if (error.message.includes('Failed to load PDF.js')) {
//                 errorMessage += 'Could not load the PDF processing library. Check your internet connection.';
//             } else {
//                 errorMessage += error.message;
//             }
            
//             alert(errorMessage);
//         });
// }
// function extractTextFromFile(file) {
//     return new Promise((resolve, reject) => {
//         // Check file type
//         const fileType = file.type;
//         const fileName = file.name.toLowerCase();
        
//         // Plain text files
//         if (fileType === 'text/plain') {
//             const reader = new FileReader();
//             reader.onload = function(e) {
//                 resolve(e.target.result);
//             };
//             reader.onerror = function() {
//                 reject(new Error('Failed to read text file'));
//             };
//             reader.readAsText(file);
//         } 
//         // PDF files
//         else if (fileType === 'application/pdf') {
//             // Load PDF.js library if needed
//             if (typeof pdfjsLib === 'undefined') {
//                 const script = document.createElement('script');
//                 script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
//                 script.onload = function() {
//                     pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
//                     extractPdfText(file).then(resolve).catch(reject);
//                 };
//                 script.onerror = function() {
//                     reject(new Error('Failed to load PDF.js library'));
//                 };
//                 document.head.appendChild(script);
//             } else {
//                 extractPdfText(file).then(resolve).catch(reject);
//             }
//         }
//         // Word documents (.docx)
//         else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
//                  fileName.endsWith('.docx')) {
//             // Load mammoth.js library if needed
//             if (typeof mammoth === 'undefined') {
//                 const script = document.createElement('script');
//                 script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
//                 script.onload = function() {
//                     extractDocxText(file).then(resolve).catch(reject);
//                 };
//                 script.onerror = function() {
//                     reject(new Error('Failed to load Mammoth.js library'));
//                 };
//                 document.head.appendChild(script);
//             } else {
//                 extractDocxText(file).then(resolve).catch(reject);
//             }
//         }
//         // HTML files
//         else if (fileType === 'text/html') {
//             const reader = new FileReader();
//             reader.onload = function(e) {
//                 const html = e.target.result;
//                 const parser = new DOMParser();
//                 const doc = parser.parseFromString(html, 'text/html');
//                 const textContent = doc.body.textContent || '';
//                 resolve(textContent.trim());
//             };
//             reader.onerror = function() {
//                 reject(new Error('Failed to read HTML file'));
//             };
//             reader.readAsText(file);
//         }
//         // RTF files
//         else if (fileType === 'application/rtf' || fileName.endsWith('.rtf')) {
//             const reader = new FileReader();
//             reader.onload = function(e) {
//                 // Basic RTF stripping - for more complex RTF, a proper parser would be needed
//                 const rtf = e.target.result;
//                 const plainText = rtf.replace(/[{}\\]|\\\w+|\\\*\w+|\\\n/g, ' ')
//                                    .replace(/\s+/g, ' ')
//                                    .trim();
//                 resolve(plainText);
//             };
//             reader.onerror = function() {
//                 reject(new Error('Failed to read RTF file'));
//             };
//             reader.readAsText(file);
//         }
//         // Unsupported file type
//         else {
//             reject(new Error(`File type "${fileType}" is not supported for text extraction`));
//         }
//     });
// }

// /**
//  * Extract text from a PDF file
//  * @param {File} file - The PDF file
//  * @returns {Promise<string>} - The extracted text
//  */
// function extractPdfText(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const typedArray = new Uint8Array(e.target.result);
            
//             pdfjsLib.getDocument(typedArray).promise.then(pdf => {
//                 const numPages = pdf.numPages;
//                 let text = '';
                
//                 // Function to extract text from each page
//                 const extractTextFromPage = (pageNum) => {
//                     return pdf.getPage(pageNum).then(page => {
//                         return page.getTextContent().then(textContent => {
//                             return textContent.items.map(item => item.str).join(' ');
//                         });
//                     });
//                 };
                
//                 // Process all pages
//                 const allPages = [];
//                 for (let i = 1; i <= numPages; i++) {
//                     allPages.push(extractTextFromPage(i));
//                 }
                
//                 Promise.all(allPages).then(pageTexts => {
//                     resolve(pageTexts.join('\n\n'));
//                 }).catch(reject);
//             }).catch(error => {
//                 reject(new Error('Failed to parse PDF: ' + error.message));
//             });
//         };
//         reader.onerror = function() {
//             reject(new Error('Failed to read PDF file'));
//         };
//         reader.readAsArrayBuffer(file);
//     });
// }

// /**
//  * Extract text from a Word document (.docx)
//  * @param {File} file - The Word document
//  * @returns {Promise<string>} - The extracted text
//  */
// function extractDocxText(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             mammoth.extractRawText({ arrayBuffer: e.target.result })
//                 .then(result => {
//                     resolve(result.value);
//                 })
//                 .catch(error => {
//                     reject(new Error('Failed to parse Word document: ' + error.message));
//                 });
//         };
//         reader.onerror = function() {
//             reject(new Error('Failed to read Word document'));
//         };
//         reader.readAsArrayBuffer(file);
//     });
// }