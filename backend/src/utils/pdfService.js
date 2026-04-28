// services/pdfService.js
const puppeteer = require('puppeteer');
const marked = require('marked');

async function convertMarkdownToPDF(markdownContent) {
  // Convert markdown to HTML
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1 { font-size: 28px; margin-bottom: 10px; }
    h2 { font-size: 20px; margin-top: 20px; border-bottom: 2px solid #333; }
    h3 { font-size: 16px; margin-top: 15px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    a { color: #0066cc; text-decoration: none; }
  </style>
</head>
<body>
  ${marked.parse(markdownContent)}
</body>
</html>
  `;

  // Use Puppeteer to generate PDF
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ],
    protocolTimeout: 180000
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { convertMarkdownToPDF };
