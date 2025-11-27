#!/usr/bin/env node
/**
 * Script pour générer les icônes PWA FlexPOS
 * Crée des icônes PNG simples avec le logo FlexPOS
 */

const fs = require('fs');
const path = require('path');

// Couleurs FlexPOS
const PRIMARY_COLOR = '#ff6b35'; // Orange
const TEXT_COLOR = '#ffffff';

/**
 * Génère un SVG pour l'icône FlexPOS
 */
function generateSVG(size) {
  const fontSize = Math.floor(size * 0.5);
  const borderRadius = Math.floor(size * 0.15);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${PRIMARY_COLOR}"/>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${TEXT_COLOR}" text-anchor="middle" dominant-baseline="middle">F</text>
  <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="${Math.floor(fontSize * 0.25)}" fill="${TEXT_COLOR}" text-anchor="middle" dominant-baseline="middle">POS</text>
</svg>`;
}

// Créer le dossier public s'il n'existe pas
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Générer les icônes SVG (qui peuvent être utilisées comme fallback)
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✓ Créé: ${filename}`);
});

// Créer aussi un favicon.svg
const faviconSvg = generateSVG(32);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
console.log('✓ Créé: favicon.svg');

// Créer apple-touch-icon.svg
const appleTouchSvg = generateSVG(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchSvg);
console.log('✓ Créé: apple-touch-icon.svg');

console.log('\n✅ Icônes PWA générées avec succès!');
console.log('\n💡 Pour des icônes PNG de production, utilisez un outil comme:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - Ou installez sharp: npm install sharp');
