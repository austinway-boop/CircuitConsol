export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Circuit API Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Real-time emotion analysis for voice and text using advanced AI
        </p>
      </div>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Get your API key</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a new API key from the API Keys page in your dashboard.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Make your first request</h3>
            <div className="p-4 bg-slate-900 rounded-lg">
              <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`curl -X POST https://api.circuit.dev/v1/analyze-text \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "I am feeling really excited about this new project!"}'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        <p className="text-sm text-muted-foreground mb-3">
          All API requests require authentication using your API key in the Authorization header.
        </p>
        <div className="p-4 bg-slate-900 rounded-lg mb-3">
          <pre className="text-sm text-emerald-400 font-mono">
{`Authorization: Bearer YOUR_API_KEY`}
          </pre>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          Use keys starting with <code className="font-mono bg-blue-100 px-1 rounded">sk_test_</code> for development and <code className="font-mono bg-blue-100 px-1 rounded">sk_live_</code> for production.
        </div>
      </section>

      {/* Text Analysis Endpoint */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Text Emotion Analysis</h2>
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded mr-2">POST</span>
          <code className="text-sm font-mono">/v1/analyze-text</code>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Analyzes text for emotional content using our proprietary word-level emotion database with over 25,000 words.
        </p>

        <h3 className="font-semibold mb-2">Request Body</h3>
        <div className="p-4 bg-slate-900 rounded-lg mb-4">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`{
  "text": "I am feeling really excited about this new opportunity!"
}`}
          </pre>
        </div>

        <h3 className="font-semibold mb-2">Response</h3>
        <div className="p-4 bg-slate-900 rounded-lg mb-4">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`{
  "success": true,
  "result": {
    "transcription": "I am feeling really excited about this new opportunity!",
    "confidence": 1.0,
    "emotion_analysis": {
      "overall_emotion": "anticipation",
      "confidence": 0.72,
      "emotions": {
        "joy": 0.35,
        "trust": 0.10,
        "anticipation": 0.45,
        "surprise": 0.05,
        "anger": 0.01,
        "fear": 0.01,
        "sadness": 0.01,
        "disgust": 0.02
      },
      "word_analysis": [
        {
          "word": "excited",
          "clean_word": "excited",
          "emotion": "anticipation",
          "confidence": 0.78,
          "valence": 0.85,
          "arousal": 0.9,
          "dominance": 0.6,
          "sentiment": "positive",
          "found": true
        }
      ],
      "vad": {
        "valence": 0.8,
        "arousal": 0.75,
        "dominance": 0.7
      },
      "sentiment": {
        "polarity": "positive",
        "strength": 0.85
      },
      "word_count": 9,
      "analyzed_words": 7,
      "coverage": 0.78
    },
    "processing_time": 0.045
  }
}`}
          </pre>
        </div>

        <h3 className="font-semibold mb-2">Example: JavaScript</h3>
        <div className="p-4 bg-slate-900 rounded-lg">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`const analyzeText = async (text) => {
  const response = await fetch('https://api.circuit.dev/v1/analyze-text', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY_HERE',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  const data = await response.json();
  
  if (data.success) {
    const emotion = data.result.emotion_analysis;
    console.log('Detected emotion:', emotion.overall_emotion);
    console.log('Confidence:', emotion.confidence);
    console.log('Sentiment:', emotion.sentiment.polarity);
    console.log('Valence:', emotion.vad.valence);
    
    // Access individual word emotions
    emotion.word_analysis.forEach(word => {
      console.log(\`"\${word.word}" - \${word.emotion} (confidence: \${word.confidence})\`);
    });
  }
  
  return data;
};

// Usage
analyzeText('I am absolutely thrilled about this amazing opportunity!');`}
          </pre>
        </div>
      </section>

      {/* Audio Analysis */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Audio Emotion Analysis</h2>
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded mr-2">POST</span>
          <code className="text-sm font-mono">/v1/analyze-audio</code>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Transcribes speech from audio files and performs emotion analysis with advanced features like laughter detection and music filtering.
        </p>

        <h3 className="font-semibold mb-2">Request (multipart/form-data)</h3>
        <div className="mb-3">
          <p className="text-sm mb-2"><strong>Fields:</strong></p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li><code className="font-mono bg-accent px-1 rounded">audio</code>: Audio file (WAV, MP3, FLAC, WebM, AIFF)</li>
            <li><code className="font-mono bg-accent px-1 rounded">retry_mode</code>: "normal" or "aggressive" (optional, default: "normal")</li>
          </ul>
        </div>

        <div className="mb-4">
          <p className="text-sm mb-2"><strong>Supported formats:</strong></p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-accent text-xs rounded">WAV</span>
            <span className="px-2 py-1 bg-accent text-xs rounded">MP3</span>
            <span className="px-2 py-1 bg-accent text-xs rounded">FLAC</span>
            <span className="px-2 py-1 bg-accent text-xs rounded">WebM</span>
            <span className="px-2 py-1 bg-accent text-xs rounded">AIFF</span>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Example: cURL</h3>
        <div className="p-4 bg-slate-900 rounded-lg mb-4">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`curl -X POST https://api.circuit.dev/v1/analyze-audio \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -F "audio=@recording.wav" \\
  -F "retry_mode=normal"`}
          </pre>
        </div>

        <h3 className="font-semibold mb-2">Example: JavaScript with FormData</h3>
        <div className="p-4 bg-slate-900 rounded-lg mb-4">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`const analyzeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('retry_mode', 'normal');

  const response = await fetch('https://api.circuit.dev/v1/analyze-audio', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY_HERE'
    },
    body: formData
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Transcription:', data.result.transcription);
    console.log('Confidence:', data.result.confidence);
    console.log('Emotion:', data.result.emotion_analysis.overall_emotion);
    console.log('Laughter detected:', data.result.laughter_analysis.laughter_percentage + '%');
    console.log('Music detected:', data.result.music_analysis.music_percentage + '%');
  }
  
  return data;
};

// From file input
document.getElementById('audioInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  analyzeAudio(file);
});`}
          </pre>
        </div>

        <h3 className="font-semibold mb-2">Response Structure</h3>
        <div className="p-4 bg-slate-900 rounded-lg">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`{
  "success": true,
  "result": {
    "transcription": "I am feeling happy today",
    "confidence": 0.95,
    "emotion_analysis": {
      "overall_emotion": "joy",
      "confidence": 0.78,
      "emotions": { /* 8 emotion scores */ },
      "word_analysis": [ /* per-word analysis */ ],
      "vad": {
        "valence": 0.75,
        "arousal": 0.65,
        "dominance": 0.6
      },
      "sentiment": {
        "polarity": "positive",
        "strength": 0.8
      },
      "word_count": 5,
      "analyzed_words": 4,
      "coverage": 0.8
    },
    "laughter_analysis": {
      "laughter_segments": [
        {"start": 2.3, "end": 3.1, "duration": 0.8}
      ],
      "laughter_percentage": 12.5,
      "total_laughter_duration": 0.8
    },
    "music_analysis": {
      "music_segments": [],
      "music_percentage": 0.0
    },
    "processing_time": 2.34,
    "file_info": {
      "size": 156789,
      "name": "recording.wav",
      "type": "audio/wav"
    }
  }
}`}
          </pre>
        </div>
      </section>

      {/* Python Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Python Integration</h2>
        
        <h3 className="font-semibold mb-2">Text Analysis</h3>
        <div className="p-4 bg-slate-900 rounded-lg mb-4">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`import requests

API_KEY = 'YOUR_API_KEY_HERE'
BASE_URL = 'https://api.circuit.dev/v1'

def analyze_text(text):
    response = requests.post(
        f'{BASE_URL}/analyze-text',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={'text': text}
    )
    
    data = response.json()
    
    if data['success']:
        emotion = data['result']['emotion_analysis']
        print(f"Overall emotion: {emotion['overall_emotion']}")
        print(f"Confidence: {emotion['confidence']:.2f}")
        print(f"Sentiment: {emotion['sentiment']['polarity']}")
        print(f"\\nEmotion breakdown:")
        for emo, score in emotion['emotions'].items():
            if score > 0.05:
                print(f"  {emo}: {score:.2f}")
        
        print(f"\\nVAD scores:")
        print(f"  Valence (positivity): {emotion['vad']['valence']:.2f}")
        print(f"  Arousal (intensity): {emotion['vad']['arousal']:.2f}")
        print(f"  Dominance (control): {emotion['vad']['dominance']:.2f}")
    
    return data

# Usage
result = analyze_text("I am absolutely thrilled about this amazing news!")`}
          </pre>
        </div>

        <h3 className="font-semibold mb-2">Audio Analysis</h3>
        <div className="p-4 bg-slate-900 rounded-lg">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`def analyze_audio(audio_path, retry_mode='normal'):
    with open(audio_path, 'rb') as audio_file:
        files = {'audio': audio_file}
        data = {'retry_mode': retry_mode}
        
        response = requests.post(
            f'{BASE_URL}/analyze-audio',
            headers={'Authorization': f'Bearer {API_KEY}'},
            files=files,
            data=data
        )
        
        result = response.json()
        
        if result['success']:
            print(f"Transcription: {result['result']['transcription']}")
            print(f"Confidence: {result['result']['confidence']:.2f}")
            print(f"Emotion: {result['result']['emotion_analysis']['overall_emotion']}")
            
            # Laughter analysis
            laughter = result['result']['laughter_analysis']
            if laughter['laughter_percentage'] > 0:
                print(f"Laughter detected: {laughter['laughter_percentage']:.1f}%")
            
            # Music detection
            music = result['result']['music_analysis']
            if music['music_percentage'] > 0:
                print(f"Music detected: {music['music_percentage']:.1f}%")
        
        return result

# Usage
analyze_audio('recording.wav', retry_mode='normal')`}
          </pre>
        </div>
      </section>

      {/* Node.js Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Node.js Integration</h2>
        <div className="p-4 bg-slate-900 rounded-lg">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.circuit.dev/v1';

// Text analysis
async function analyzeText(text) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/analyze-text\`,
      { text },
      {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const { result } = response.data;
    const { emotion_analysis } = result;
    
    console.log('Detected emotion:', emotion_analysis.overall_emotion);
    console.log('Confidence:', emotion_analysis.confidence);
    console.log('Sentiment:', emotion_analysis.sentiment.polarity);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Audio analysis
async function analyzeAudio(audioPath) {
  const formData = new FormData();
  formData.append('audio', fs.createReadStream(audioPath));
  formData.append('retry_mode', 'normal');
  
  try {
    const response = await axios.post(
      \`\${BASE_URL}/analyze-audio\`,
      formData,
      {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          ...formData.getHeaders()
        }
      }
    );
    
    const { result } = response.data;
    
    console.log('Transcription:', result.transcription);
    console.log('Emotion:', result.emotion_analysis.overall_emotion);
    console.log('Processing time:', result.processing_time + 's');
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage examples
(async () => {
  await analyzeText('I love this amazing product!');
  await analyzeAudio('./my_recording.wav');
})();`}
          </pre>
        </div>
      </section>

      {/* Emotion Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Emotion Categories</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Circuit uses Plutchik&apos;s 8 basic emotions model for comprehensive emotional classification:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Joy</h4>
            <p className="text-xs text-muted-foreground">Happiness, pleasure, contentment, delight</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Trust</h4>
            <p className="text-xs text-muted-foreground">Confidence, faith, reliability, acceptance</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Anticipation</h4>
            <p className="text-xs text-muted-foreground">Expectation, hope, excitement, interest</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Surprise</h4>
            <p className="text-xs text-muted-foreground">Amazement, astonishment, wonder, shock</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Anger</h4>
            <p className="text-xs text-muted-foreground">Rage, irritation, annoyance, fury</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Fear</h4>
            <p className="text-xs text-muted-foreground">Anxiety, worry, apprehension, terror</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Sadness</h4>
            <p className="text-xs text-muted-foreground">Grief, sorrow, melancholy, disappointment</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Disgust</h4>
            <p className="text-xs text-muted-foreground">Revulsion, distaste, aversion, loathing</p>
          </div>
        </div>
      </section>

      {/* VAD Dimensions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">VAD Dimensions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Every analysis includes Valence-Arousal-Dominance scores for fine-grained emotional understanding:
        </p>
        <div className="space-y-3">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Valence</h4>
            <p className="text-sm text-muted-foreground">
              Emotional positivity (0.0 = very negative, 1.0 = very positive)
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Example: "happy" has high valence (0.9), "sad" has low valence (0.2)
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Arousal</h4>
            <p className="text-sm text-muted-foreground">
              Emotional intensity (0.0 = very calm, 1.0 = very intense)
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Example: "excited" has high arousal (0.9), "calm" has low arousal (0.2)
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-1">Dominance</h4>
            <p className="text-sm text-muted-foreground">
              Emotional control (0.0 = submissive, 1.0 = dominant)
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Example: "powerful" has high dominance (0.8), "helpless" has low dominance (0.2)
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Advanced Features</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Laughter Detection</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Circuit automatically detects laughter in audio and adjusts emotion scores. Laughter boosts joy and reduces negative emotions.
          </p>
          <div className="p-4 bg-slate-900 rounded-lg">
            <pre className="text-sm text-emerald-400 font-mono">
{`"laughter_analysis": {
  "laughter_segments": [
    {"start": 2.3, "end": 3.1, "duration": 0.8},
    {"start": 5.2, "end": 5.9, "duration": 0.7}
  ],
  "laughter_percentage": 15.0,
  "total_laughter_duration": 1.5
}`}
            </pre>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Music Detection</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Background music is identified and filtered to prevent interference with speech emotion analysis.
          </p>
          <div className="p-4 bg-slate-900 rounded-lg">
            <pre className="text-sm text-emerald-400 font-mono">
{`"music_analysis": {
  "music_segments": [
    {"start": 0.0, "end": 10.0, "duration": 10.0}
  ],
  "music_percentage": 100.0
}`}
            </pre>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Confidence Scoring</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Multi-level confidence scores help you understand result reliability:
          </p>
          <ul className="text-sm space-y-1 ml-6">
            <li className="text-muted-foreground">Transcription confidence (speech recognition accuracy)</li>
            <li className="text-muted-foreground">Overall emotion confidence (emotion classification certainty)</li>
            <li className="text-muted-foreground">Word-level confidence (individual word scores)</li>
            <li className="text-muted-foreground">Coverage ratio (percentage of words in database)</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Retry Modes</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Control transcription behavior for difficult audio:
          </p>
          <div className="space-y-2">
            <div className="p-3 border rounded-lg">
              <span className="font-semibold text-sm">normal:</span>
              <span className="text-sm text-muted-foreground ml-2">Single transcription attempt with standard settings</span>
            </div>
            <div className="p-3 border rounded-lg">
              <span className="font-semibold text-sm">aggressive:</span>
              <span className="text-sm text-muted-foreground ml-2">Multiple engines and retry attempts for challenging audio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Rate Limits & Constraints</h2>
        <div className="space-y-2">
          <div className="flex justify-between p-3 bg-accent/40 rounded-lg text-sm">
            <span className="font-medium">Development keys</span>
            <span className="text-muted-foreground">100 requests/minute</span>
          </div>
          <div className="flex justify-between p-3 bg-accent/40 rounded-lg text-sm">
            <span className="font-medium">Production keys</span>
            <span className="text-muted-foreground">1,000 requests/minute</span>
          </div>
          <div className="flex justify-between p-3 bg-accent/40 rounded-lg text-sm">
            <span className="font-medium">Max audio duration</span>
            <span className="text-muted-foreground">5 minutes</span>
          </div>
          <div className="flex justify-between p-3 bg-accent/40 rounded-lg text-sm">
            <span className="font-medium">Max audio size</span>
            <span className="text-muted-foreground">50MB</span>
          </div>
          <div className="flex justify-between p-3 bg-accent/40 rounded-lg text-sm">
            <span className="font-medium">Max text length</span>
            <span className="text-muted-foreground">10,000 characters</span>
          </div>
        </div>
      </section>

      {/* Error Handling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
        
        <h3 className="font-semibold mb-3">HTTP Status Codes</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 p-2 border rounded text-sm">
            <code className="font-mono bg-accent px-2 py-1 rounded">200</code>
            <span className="text-muted-foreground">Success</span>
          </div>
          <div className="flex items-center gap-3 p-2 border rounded text-sm">
            <code className="font-mono bg-accent px-2 py-1 rounded">400</code>
            <span className="text-muted-foreground">Bad request or analysis failed</span>
          </div>
          <div className="flex items-center gap-3 p-2 border rounded text-sm">
            <code className="font-mono bg-accent px-2 py-1 rounded">401</code>
            <span className="text-muted-foreground">Invalid or missing API key</span>
          </div>
          <div className="flex items-center gap-3 p-2 border rounded text-sm">
            <code className="font-mono bg-accent px-2 py-1 rounded">413</code>
            <span className="text-muted-foreground">Payload too large</span>
          </div>
          <div className="flex items-center gap-3 p-2 border rounded text-sm">
            <code className="font-mono bg-accent px-2 py-1 rounded">429</code>
            <span className="text-muted-foreground">Rate limit exceeded</span>
          </div>
          <div className="flex items-center gap-3 p-2 border rounded text-sm">
            <code className="font-mono bg-accent px-2 py-1 rounded">500</code>
            <span className="text-muted-foreground">Server error</span>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Error Response Format</h3>
        <div className="p-4 bg-slate-900 rounded-lg">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
{`{
  "success": false,
  "error": "Speech recognition failed. Audio may be too quiet or noisy.",
  "details": {
    "confidence": 0.12,
    "processing_time": 1.23,
    "suggested_action": "Try aggressive retry mode or improve audio quality"
  }
}`}
          </pre>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
            <h4 className="font-semibold text-sm mb-1">Audio Quality</h4>
            <p className="text-sm text-muted-foreground">
              Use WAV or FLAC formats for best transcription accuracy. Ensure clear speech with minimal background noise.
            </p>
          </div>
          <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
            <h4 className="font-semibold text-sm mb-1">Error Handling</h4>
            <p className="text-sm text-muted-foreground">
              Always check the success field and handle errors gracefully. Low confidence scores may indicate unclear audio or ambiguous text.
            </p>
          </div>
          <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
            <h4 className="font-semibold text-sm mb-1">Rate Limiting</h4>
            <p className="text-sm text-muted-foreground">
              Implement exponential backoff when hitting rate limits. Consider caching results for frequently analyzed content.
            </p>
          </div>
          <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
            <h4 className="font-semibold text-sm mb-1">Retry Modes</h4>
            <p className="text-sm text-muted-foreground">
              Use normal mode for standard audio. Only use aggressive mode when normal fails or for challenging audio conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Support */}
      <section>
        <div className="p-6 border rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Our support team is here to help you integrate Circuit emotion analysis into your application.
          </p>
          <p className="text-sm">
            <strong>Email:</strong> <a href="mailto:support@circuit.dev" className="text-primary hover:underline">support@circuit.dev</a>
          </p>
          <p className="text-sm">
            <strong>Response time:</strong> Within 24 hours
          </p>
        </div>
      </section>
    </div>
  )
}
