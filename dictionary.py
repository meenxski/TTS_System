from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API keys from environment variables or use the provided ones
MW_DICTIONARY_KEY = os.environ.get('MW_DICTIONARY_KEY', 'b679d43c-5a46-40dc-827b-e7494d806747')
MW_THESAURUS_KEY = os.environ.get('MW_THESAURUS_KEY', 'b2fdec5b-51e5-4760-b469-dcf5e7368c35')

# Base URLs for Merriam-Webster APIs
DICTIONARY_BASE_URL = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/"
THESAURUS_BASE_URL = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"

@app.route('/api/lookup', methods=['GET'])
def lookup_word():
    word = request.args.get('word', '')
    if not word:
        return jsonify({"error": "No word provided"}), 400
    
    # Clean the word (remove spaces, special characters)
    word = word.strip().lower()
    
    try:
        # Get dictionary definition
        dictionary_data = get_dictionary_data(word)
        
        # Get thesaurus data (synonyms, antonyms)
        thesaurus_data = get_thesaurus_data(word)
        
        # Process and combine the data
        result = process_word_data(word, dictionary_data, thesaurus_data)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error looking up word '{word}': {str(e)}")
        return jsonify({"error": f"Failed to look up word: {str(e)}"}), 500

def get_dictionary_data(word):
    """Fetch dictionary data from Merriam-Webster API"""
    url = f"{DICTIONARY_BASE_URL}{word}?key={MW_DICTIONARY_KEY}"
    response = requests.get(url)
    response.raise_for_status()  # Raise exception for HTTP errors
    return response.json()

def get_thesaurus_data(word):
    """Fetch thesaurus data from Merriam-Webster API"""
    url = f"{THESAURUS_BASE_URL}{word}?key={MW_THESAURUS_KEY}"
    response = requests.get(url)
    response.raise_for_status()  # Raise exception for HTTP errors
    return response.json()

def process_word_data(word, dictionary_data, thesaurus_data):
    """Process and combine dictionary and thesaurus data"""
    # Initialize result structure
    result = {
        "word": word,
        "definitions": [],
        "partOfSpeech": "",
        "pronunciation": {
            "text": "",
            "audio": ""
        },
        "synonyms": [],
        "antonyms": []
    }
    
    # Process dictionary data
    if dictionary_data and isinstance(dictionary_data, list):
        # Check if we got suggestions instead of definitions
        if dictionary_data and isinstance(dictionary_data[0], str):
            return {
                "word": word,
                "suggestions": dictionary_data[:5]  # Return top 5 suggestions
            }
        
        # Process first entry (most common definition)
        for entry in dictionary_data:
            if isinstance(entry, dict) and 'meta' in entry:
                # Get part of speech
                if 'fl' in entry:
                    result["partOfSpeech"] = entry["fl"]
                
                # Get pronunciation
                if 'hwi' in entry and 'prs' in entry['hwi'] and entry['hwi']['prs']:
                    pron = entry['hwi']['prs'][0]
                    if 'mw' in pron:
                        result["pronunciation"]["text"] = pron["mw"]
                    
                    # Get audio file if available
                    if 'sound' in pron and 'audio' in pron['sound']:
                        audio = pron['sound']['audio']
                        # Construct the audio URL according to MW API specs
                        subdirectory = ''
                        if audio.startswith('bix'):
                            subdirectory = 'bix'
                        elif audio.startswith('gg'):
                            subdirectory = 'gg'
                        elif audio[0].isdigit() or audio[0] in '_.:,\'':
                            subdirectory = 'number'
                        else:
                            subdirectory = audio[0]
                        
                        audio_url = f"https://media.merriam-webster.com/audio/prons/en/us/mp3/{subdirectory}/{audio}.mp3"
                        result["pronunciation"]["audio"] = audio_url
                
                # Get definitions
                if 'shortdef' in entry:
                    for definition in entry['shortdef']:
                        if definition not in result["definitions"]:
                            result["definitions"].append(definition)
                
                # If we have enough data, we can stop processing
                if result["partOfSpeech"] and result["definitions"] and result["pronunciation"]["text"]:
                    break
    
    # Process thesaurus data
    if thesaurus_data and isinstance(thesaurus_data, list):
        # Add debugging logs
        logger.info(f"Thesaurus data type: {type(thesaurus_data)}, length: {len(thesaurus_data)}")
        if thesaurus_data and isinstance(thesaurus_data[0], dict):
            logger.info(f"First thesaurus entry keys: {thesaurus_data[0].keys()}")
        
        for entry in thesaurus_data:
            if isinstance(entry, dict) and 'meta' in entry:
                # Try to find synonyms
                if 'syns' in entry:
                    logger.info(f"Found 'syns' key in entry: {type(entry['syns'])}")
                    for syn_list in entry['syns']:
                        for syn in syn_list:
                            if syn not in result["synonyms"]:
                                result["synonyms"].append(syn)
                
                # Try alternative location for synonyms
                if 'def' in entry and isinstance(entry['def'], list):
                    for def_entry in entry['def']:
                        if isinstance(def_entry, dict) and 'sseq' in def_entry:
                            for sseq_group in def_entry['sseq']:
                                for sseq_item in sseq_group:
                                    if isinstance(sseq_item, list) and len(sseq_item) > 1:
                                        syn_data = sseq_item[1]
                                        if isinstance(syn_data, dict) and 'syn_list' in syn_data:
                                            for syn_group in syn_data['syn_list']:
                                                for syn in syn_group:
                                                    if isinstance(syn, dict) and 'wd' in syn:
                                                        if syn['wd'] not in result["synonyms"]:
                                                            result["synonyms"].append(syn['wd'])
                
                # Try to find antonyms
                if 'ants' in entry:
                    logger.info(f"Found 'ants' key in entry: {type(entry['ants'])}")
                    for ant_list in entry['ants']:
                        for ant in ant_list:
                            if ant not in result["antonyms"]:
                                result["antonyms"].append(ant)
                
                # Try alternative location for antonyms
                if 'def' in entry and isinstance(entry['def'], list):
                    for def_entry in entry['def']:
                        if isinstance(def_entry, dict) and 'sseq' in def_entry:
                            for sseq_group in def_entry['sseq']:
                                for sseq_item in sseq_group:
                                    if isinstance(sseq_item, list) and len(sseq_item) > 1:
                                        ant_data = sseq_item[1]
                                        if isinstance(ant_data, dict) and 'ant_list' in ant_data:
                                            for ant_group in ant_data['ant_list']:
                                                for ant in ant_group:
                                                    if isinstance(ant, dict) and 'wd' in ant:
                                                        if ant['wd'] not in result["antonyms"]:
                                                            result["antonyms"].append(ant['wd'])
    
    # Limit the number of results to avoid overwhelming the UI
    result["definitions"] = result["definitions"][:3]  # Top 3 definitions
    result["synonyms"] = result["synonyms"][:7]        # Top 7 synonyms
    result["antonyms"] = result["antonyms"][:7]        # Top 7 antonyms
    
    return result
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok"})

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500
@app.route('/', methods=['GET'])
def home():
    return """
    <html>
        <head>
            <title>VoiceReady Dictionary API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #333; }
                code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>VoiceReady Dictionary API</h1>
            <p>Use the <code>/api/lookup?word=WORD</code> endpoint to look up definitions.</p>
            <p>Example: <a href="/api/lookup?word=intelligent">/api/lookup?word=intelligent</a></p>
        </body>
    </html>
    """

if __name__ == '__main__':
    # Get port from environment variable or use default 5000
    port = int(os.environ.get('PORT', 5000))
    # In production, you would set debug=False
    app.run(host='0.0.0.0', port=port, debug=True)