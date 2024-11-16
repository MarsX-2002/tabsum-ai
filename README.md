# TabSum AI - Intelligent Web Content Summarizer

A Chrome extension that uses Google's Gemini Pro API to provide intelligent summaries of web content with a clean, modern interface.

## Features

- **AI-Powered Summarization**: Generate concise, intelligent summaries of any web page
- **Multiple Summary Lengths**: Choose between short, medium, or detailed summaries
- **Key Points Extraction**: Automatically identifies and lists key points from the content
- **Important Data Highlighting**: Extracts and displays important data points
- **Dark/Light Theme**: Supports both dark and light modes with system preference detection
- **Easy Sharing**: Share summaries directly to various platforms:
  - WhatsApp
  - Telegram
  - Twitter
  - Facebook
  - LinkedIn
  - Email

## Installation

1. Clone this repository or download the files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project directory
5. Add your Gemini Pro API key to `config.js`

## Usage

1. Click the TabSum AI extension icon while on any webpage
2. Select your desired summary length
3. Click "Summarize Page"
4. View the generated summary, key points, and important data
5. Use the copy or share buttons to share the insights

## Project Structure

```
├── manifest.json          # Extension configuration
├── config.js             # API key configuration
├── popup/
│   ├── popup.html        # Extension popup interface
│   ├── popup.css         # Styles for popup
│   └── popup.js          # Popup functionality
├── background.js         # Background processing
└── README.md            # Documentation
```

## Technical Details

- Built with Chrome Extension Manifest V3
- Uses Google's Generative Language API (Gemini Pro)
- Modern ES6+ JavaScript
- Responsive design with CSS variables
- Clean, minimalist UI with Inter font

## Development

### Prerequisites
- Chrome Browser
- Gemini Pro API Key
- Basic understanding of Chrome Extension development

### Setup
1. Clone the repository
2. Create a `config.js` file with your API key
3. Load the extension in Chrome
4. Start developing!

## Security

- API key is stored securely in a separate config file
- Minimal permissions requested
- No sensitive data retention
- Secure message passing between components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details
