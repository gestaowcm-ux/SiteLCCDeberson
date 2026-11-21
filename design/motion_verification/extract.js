const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\Juliana\\antigravity\\Slides\\SiteMentoria\\agente especializado em motion';
const destDir = 'c:\\Users\\Juliana\\antigravity\\Slides\\SiteMentoria\\motion_verification';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mdFiles = fs.readdirSync(srcDir).filter(file => file.endsWith('.md'));

mdFiles.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find code block starting with ```html
  const match = content.match(/```html\r?\n([\s\S]*?)\r?\n```/);
  if (match) {
    const htmlCode = match[1];
    const htmlFileName = file.replace('.md', '.html');
    const destPath = path.join(destDir, htmlFileName);
    fs.writeFileSync(destPath, htmlCode, 'utf8');
    console.log(`Extracted: ${file} -> ${htmlFileName}`);
  } else {
    console.warn(`No HTML code block found in: ${file}`);
  }
});
