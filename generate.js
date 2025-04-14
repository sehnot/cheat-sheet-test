const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const yaml = require('js-yaml');
const markdown = require('markdown-it')();
const puppeteer = require('puppeteer');

(async () => {

  // Stelle sicher, dass 'public/' existiert
  const outputDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Lade Inhalte
  const introMd = fs.readFileSync('./content/de/intro.md', 'utf-8');
  const introHtml = markdown.render(introMd);
  const introTitle = introHtml.match(/<h1>(.*?)<\/h1>/)?.[1] ?? '';
  const introText = introHtml.replace(/<h1>.*?<\/h1>/, '');

  const shortcuts = yaml.load(fs.readFileSync('./content/de/keyboard-shortcuts.yml', 'utf-8'));

  // Render HTML
  const html = nunjucks.render('./templates/layout.html', {
    introTitle,
    introText,
    shortcuts,
  });

  // PDF erstellen
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // PDF erzeugen – direkt im public-Ordner
  await page.pdf({ path: path.join(outputDir, 'cheatsheet-de.pdf'), format: 'A4' });

  await browser.close();
})();