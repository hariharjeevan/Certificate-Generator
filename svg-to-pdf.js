// file: svg-to-pdf.js

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Function to convert a single SVG file to PDF
async function svgFileToPdf(browser, svgFilePath, pdfOutputPath) {
  const page = await browser.newPage();
  const name = path.basename(svgFilePath, '.svg');
  const svgData = fs.readFileSync(svgFilePath, 'utf8');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${name}</title>
      <style>
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
        svg { width: 100%; height: 100%; display: block; }
      </style>
    </head>
    <body>
      ${svgData}
    </body>
    </html>
  `;

  try {
    // Set content with a timeout
    await page.setContent(html, { waitUntil: 'load', timeout: 60000 });

    // Create PDF
    await page.pdf({
      path: pdfOutputPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0cm', right: '0cm', bottom: '0cm', left: '0cm' }
    });

    console.log(`PDF written: ${pdfOutputPath}`);
    return true;
  } catch (error) {
    console.error(`Error generating PDF for ${svgFilePath}:`, error);
    return false;
  } finally {
    await page.close();
  }
}

// Function to process a batch of SVG files
async function batchConvert(folderWithSvgs, outputFolder, maxConcurrent) {
  const files = fs.readdirSync(folderWithSvgs);
  const svgFiles = files.filter(f => f.toLowerCase().endsWith('.svg'));

  if (svgFiles.length === 0) {
    console.log('No SVG files found in the folder.');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Queue for managing the concurrent processing of SVG files
  const queue = svgFiles.slice();

  // Count statistics
  let processedCount = 0;
  let pdfCount = 0;

  // Worker function to process files with concurrency limit
  const processFile = async () => {
    while (queue.length > 0) {
      const svgFile = queue.shift();
      const svgPath = path.join(folderWithSvgs, svgFile);
      const pdfName = svgFile.replace(/\.svg$/i, '.pdf');
      const pdfPath = path.join(outputFolder, pdfName);

      processedCount++;

      if (fs.existsSync(pdfPath)) {
        console.log(`PDF already exists: ${pdfPath}, skipping.`);
        continue;
      }

      const success = await svgFileToPdf(browser, svgPath, pdfPath);
      if (success) {
        pdfCount++;
      }
    }
  };

  // Limit the number of concurrent workers
  const workers = Array.from({ length: maxConcurrent }, processFile);

  // Wait for all workers to finish
  await Promise.all(workers);
  await browser.close();

  console.log('All PDFs generated.');
  console.log(`Total SVGs processed: ${processedCount}`);
  console.log(`Total PDFs generated: ${pdfCount}`);
}

const svgFolder = './certificates_svg';
const pdfFolder = './certificates_test';

if (!fs.existsSync(pdfFolder)) {
  fs.mkdirSync(pdfFolder);
}

const maxConcurrentTabs = 5;
batchConvert(svgFolder, pdfFolder, maxConcurrentTabs)
  .then(() => console.log('Done'))
  .catch(err => console.error('Error during batch conversion:', err));
