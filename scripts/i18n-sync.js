import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const DEFAULT_LOCALE = 'en-US';
const SUPPORTED_LOCALES = ['en-US', 'zh-Hant-TW'];

// Helper function to sort object keys
function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}

// Sync and sort locale files
function syncLocales() {
  SUPPORTED_LOCALES.forEach((locale) => {
    const localePath = path.join(LOCALES_DIR, locale);
    if (!fs.existsSync(localePath)) {
      fs.mkdirSync(localePath, { recursive: true });
    }

    // Get all JSON files in the default locale
    const defaultFiles = fs
      .readdirSync(path.join(LOCALES_DIR, DEFAULT_LOCALE))
      .filter((file) => file.endsWith('.json'));

    defaultFiles.forEach((file) => {
      const defaultFilePath = path.join(LOCALES_DIR, DEFAULT_LOCALE, file);
      const targetFilePath = path.join(LOCALES_DIR, locale, file);

      // Read default locale file
      const defaultContent = JSON.parse(fs.readFileSync(defaultFilePath, 'utf8'));

      // Read or create target locale file
      let targetContent = {};
      if (fs.existsSync(targetFilePath)) {
        targetContent = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
      }

      // Sync keys
      const syncedContent = {};
      Object.keys(defaultContent).forEach((key) => {
        syncedContent[key] = targetContent[key] || defaultContent[key];
      });

      // Sort and write
      const sortedContent = sortObject(syncedContent);
      fs.writeFileSync(targetFilePath, JSON.stringify(sortedContent, null, 2));
      console.log(`Synced and sorted ${file} for ${locale}`);
    });
  });
}

// Main execution
console.log('Syncing and sorting locale files...');
syncLocales();
console.log('Done!');
