const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const yaml = require('js-yaml');
const markdown = require('markdown-it')();
const puppeteer = require('puppeteer');

(async () => {
  // Lade Inhalte
  const introMd = fs.readFileSync('./content/de/intro.md', 'utf-8');
  const introHtml = markdown.render(introMd);
  const introTitle = introHtml.match(/<h1>(.*?)<\/h1>/)?.[1] ?? '';
  const introText = introHtml.replace(/<h1>.*?<\/h1>/, '');

  const shortcuts = yaml.load(fs.readFileSync('./content/de/keyboard-shortcuts.yml', 'utf-8'));

  // Render HTML mit Nunjucks
  const rawHtml = nunjucks.render('./templates/layout.html', {
    introTitle,
    introText,
    shortcuts,
  });

  // CSS inline einfügen
  const style = fs.readFileSync('./templates/styles.css', 'utf-8');
  const htmlWithStyles = rawHtml.replace('</head>', `<style>${style}</style></head>`);

  // Sicherstellen, dass public/ existiert
  const outputDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // PDF generieren
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(htmlWithStyles, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(outputDir, 'cheatsheet-de.pdf'),
    format: 'A4',
    landscape: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  await browser.close();
  
})();