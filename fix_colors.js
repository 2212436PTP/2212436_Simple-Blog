const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove all dark: classes safely (e.g. dark:bg-slate-900, dark:hover:text-blue-500)
      const original = content;
      content = content.replace(/\bdark:[a-zA-Z0-9\-:]+\b/g, '');
      // Clean up multiple spaces that might be left behind
      content = content.replace(/  +/g, ' ');
      
      if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// 1. Restore header.tsx to get the avatar back
try {
  const { execSync } = require('child_process');
  execSync('git checkout components/layout/header.tsx');
  console.log('Restored header.tsx from git');
} catch (e) {
  console.log('Failed to restore header.tsx');
}

// 2. Process all UI files to remove dark: classes
processDirectory('./app');
processDirectory('./components');

console.log('Done fixing colors!');
