# TabSum AI for Microsoft Edge

## Installation Guide

### Method 1: Install from Edge Add-ons
*Coming soon*

### Method 2: Developer Mode Installation
1. Download `tabsum-ai-edge.zip` from the [latest release](https://github.com/MarsX-2002/tabsum-ai/releases)
2. Extract the ZIP file
3. Open Edge and go to `edge://extensions/`
4. Enable "Developer mode" in the bottom left
5. Click "Load unpacked"
6. Select the extracted folder

## Edge-Specific Features
- Uses Manifest V3 for Edge compatibility
- Optimized performance for Edge
- Native Edge UI integration

## Known Issues
- None currently reported

## Development
To build for Edge:
```bash
npm run build:edge
```

## Testing in Edge
1. Clone the repository
2. Run `npm install`
3. Run `npm run build:edge`
4. Load the extension in Edge using developer mode

## Edge Add-on Guidelines
This extension follows [Microsoft Edge Add-on Policies](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/store-policies/developer-policies)
