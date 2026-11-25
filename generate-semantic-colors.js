const fs = require('fs');
const path = require('path');
const colors = require('./tailwind.colors.json');
const semantic = require('./tailwind.semantic.json');

/**
 * Resolves color references like "@colors.gray.50" to actual color values
 */
function resolveColorReference(value) {
  if (typeof value === 'string' && value.startsWith('@colors.')) {
    const pathKeys = value.replace('@colors.', '').split('.');
    let result = colors;
    for (const key of pathKeys) {
      result = result[key];
      if (result === undefined) {
        throw new Error(`Invalid color reference: ${value}`);
      }
    }
    return result;
  }
  return value;
}

/**
 * Generates separate light and dark theme objects
 */
function generateThemes() {
  const light = {};
  const dark = {};
  
  function processObject(obj, lightTarget, darkTarget, currentPath = []) {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        if ('light' in value && 'dark' in value) {
          // This is a theme-aware color
          lightTarget[key] = resolveColorReference(value.light);
          darkTarget[key] = resolveColorReference(value.dark);
        } else {
          // Nested object, recurse
          lightTarget[key] = {};
          darkTarget[key] = {};
          processObject(value, lightTarget[key], darkTarget[key], [...currentPath, key]);
        }
      }
    }
  }
  
  processObject(semantic, light, dark);
  
  return { light, dark };
}

// personal-fork: overlay theme/personal.json (instrument palette) onto the upstream semantic colors
function overlay(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !('light' in value && 'dark' in value)) {
      target[key] = target[key] || {};
      overlay(target[key], value);
    } else {
      target[key] = value;
    }
  }
}
overlay(semantic, require('./theme/personal.json').semantic);

// Generate the themes
const themes = generateThemes();

// Write the generated file
const output = {
  light: themes.light,
  dark: themes.dark
};

fs.writeFileSync(
  path.join(__dirname, 'tailwind.semantic.generated.json'),
  JSON.stringify(output, null, 2)
);

console.log('✅ Generated tailwind.semantic.generated.json');