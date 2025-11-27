// file: svg-to-pdf.js

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function svgFileToPdf(svgFilePath, pdfOutputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // Extract the name from the SVG filename
  const name = path.basename(svgFilePath, '.svg');
  // Read SVG content
  const svgData = fs.readFileSync(svgFilePath, 'utf8');
  // Wrap it into a minimal HTML so browser renders it
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${name}</title> <!-- PDF title -->
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    </style>
  </head>
  <body>
    ${svgData}
  </body>
  </html>
`;


  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfOutputPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0cm', right: '0cm', bottom: '0cm', left: '0cm' }
  });

  await browser.close();
  console.log(`PDF written: ${pdfOutputPath}`);
}

async function batchConvert(folderWithSvgs, outputFolder) {
  const files = fs.readdirSync(folderWithSvgs);
  for (const f of files) {
    if (f.toLowerCase().endsWith('.svg')) {
      const svgPath = path.join(folderWithSvgs, f);
      const pdfName = f.replace(/\.svg$/i, '.pdf');
      const pdfPath = path.join(outputFolder, pdfName);
      await svgFileToPdf(svgPath, pdfPath);
    }
  }
}

const svgFolder = './certificates_svg';  // folder where generated SVGs are saved
const pdfFolder = './certificates';

if (!fs.existsSync(pdfFolder)) {
  fs.mkdirSync(pdfFolder);
}

batchConvert(svgFolder, pdfFolder)
  .then(() => console.log('Done'))
  .catch(err => console.error(err));
