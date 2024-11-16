const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Ensure build directory exists
if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
}

// Create Chrome package
function createChromePackage() {
    const output = fs.createWriteStream('build/tabsum-ai-chrome.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    archive.directory('popup/', 'popup');
    archive.directory('icons/', 'icons');
    archive.file('manifest.json', { name: 'manifest.json' });
    archive.file('background.js', { name: 'background.js' });
    
    return archive.finalize();
}

// Create Firefox package
function createFirefoxPackage() {
    const output = fs.createWriteStream('build/tabsum-ai-firefox.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    archive.directory('popup/', 'popup');
    archive.directory('icons/', 'icons');
    archive.file('browser-specific/firefox/manifest.json', { name: 'manifest.json' });
    archive.file('background.js', { name: 'background.js' });
    
    return archive.finalize();
}

// Create Edge package
function createEdgePackage() {
    const output = fs.createWriteStream('build/tabsum-ai-edge.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    archive.directory('popup/', 'popup');
    archive.directory('icons/', 'icons');
    archive.file('browser-specific/edge/manifest.json', { name: 'manifest.json' });
    archive.file('background.js', { name: 'background.js' });
    
    return archive.finalize();
}

async function buildAll() {
    try {
        console.log('Building Chrome package...');
        await createChromePackage();
        
        console.log('Building Firefox package...');
        await createFirefoxPackage();
        
        console.log('Building Edge package...');
        await createEdgePackage();
        
        console.log('All packages built successfully!');
    } catch (err) {
        console.error('Error building packages:', err);
        process.exit(1);
    }
}

buildAll();
