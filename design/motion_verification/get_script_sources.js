const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Juliana\\antigravity\\Slides\\SiteMentoria\\motion_verification';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const scripts = [];
  const regex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    scripts.push(match[1]);
  }
  console.log(`${file}:`, scripts);
});
