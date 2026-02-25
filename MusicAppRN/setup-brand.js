const fs = require('fs');
const path = require('path');

// Read the brand config (Need to parse the export since it's an ES module or just regex it for simplicity in this script)
const configContent = fs.readFileSync(path.join(__dirname, 'brandConfig.js'), 'utf-8');

// Simple regex to find the active brand
const activeBrandMatch = configContent.match(/export const ACTIVE_BRAND\s*=\s*["']([^"']+)["']/);

if (!activeBrandMatch) {
    console.error("Could not determine ACTIVE_BRAND from brandConfig.js");
    process.exit(1);
}

const activeBrand = activeBrandMatch[1];
console.log(`Setting up icons for brand: ${activeBrand}`);

// Simple regex to find the icon for the active brand
// This is a naive regex parser for the JS object structure we created
const brandBlockRegex = new RegExp(`${activeBrand}:\\s*{[\\s\\S]*?icon:\\s*["']([^"']+)["']`);
const iconMatch = configContent.match(brandBlockRegex);

if (!iconMatch) {
    console.error(`Could not find icon configuration for brand: ${activeBrand}`);
    process.exit(1);
}

const iconFileName = iconMatch[1];
const sourceIconPath = path.join(__dirname, '..', iconFileName);

if (!fs.existsSync(sourceIconPath)) {
    console.error(`Source icon file not found: ${sourceIconPath}`);
    process.exit(1);
}

// Destination paths for React Native (Expo)
const destinations = [
    path.join(__dirname, 'assets', 'icon.png'),
    path.join(__dirname, 'assets', 'adaptive-icon.png'),
    path.join(__dirname, 'assets', 'splash-icon.png'),
    path.join(__dirname, 'assets', 'favicon.png')
];

destinations.forEach(dest => {
    fs.copyFileSync(sourceIconPath, dest);
    console.log(`Copied ${iconFileName} to ${dest}`);
});

console.log("Mobile app icons updated successfully!");
