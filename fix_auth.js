const fs = require('fs');

const files = [
  'app/login/page.tsx', 
  'app/register/page.tsx', 
  'components/auth/login-form.tsx', 
  'components/auth/register-form.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Match 'dark:' followed by any characters that are not whitespace, quote or backtick
  c = c.replace(/dark:[^\s"'\`]+/g, '');
  // Clean up extra spaces
  c = c.replace(/ +/g, ' ');
  fs.writeFileSync(f, c);
  console.log('Fixed', f);
});
