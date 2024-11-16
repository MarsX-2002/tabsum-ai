# TabSum AI for Firefox

## Installation Guide

### Method 1: Install from Firefox Add-ons
*Coming soon*

### Method 2: Install as Temporary Add-on
1. Download `tabsum-ai-firefox.zip` from the [latest release](https://github.com/MarsX-2002/tabsum-ai/releases)
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the downloaded ZIP file

## Firefox-Specific Features
- Uses Manifest V2 for Firefox compatibility
- Optimized for Firefox's add-on guidelines
- Firefox-specific UI adjustments

## Known Issues
- Dark mode might need manual toggle in Firefox
- Share menu styling might differ slightly

## Development
To build for Firefox:
```bash
npm run build:firefox
```

## Testing in Firefox
1. Clone the repository
2. Run `npm install`
3. Run `npm run build:firefox`
4. Load the extension in Firefox using the temporary add-on method

## Firefox Add-on Guidelines
This extension follows [Firefox's Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)
