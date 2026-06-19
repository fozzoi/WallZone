#!/usr/bin/env node
/**
 * Syncs all icon/splash assets from the master icon.png.
 * Run: npm run generate-icons
 */

const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets', 'images');
const SOURCE = path.join(ASSETS, 'icon.png');

const TARGETS = [
  'splash-icon.png',
  'favicon.png',
  'android-icon-foreground.png',
];

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error('Missing source icon:', SOURCE);
    process.exit(1);
  }

  for (const file of TARGETS) {
    const dest = path.join(ASSETS, file);
    fs.copyFileSync(SOURCE, dest);
    console.log(`✓ ${file}`);
  }

  console.log('\nAll icon assets synced from icon.png');
  console.log('Rebuild native app to apply: npx expo prebuild --clean');
}

main();
