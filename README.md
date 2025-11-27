# Certificate Generator

This project allows you to generate personalized certificates in PDF format from a CSV file of names and an SVG template. The workflow uses Python to generate SVGs and Node.js with Puppeteer to convert SVGs to A4 landscape PDFs.

---

## Features

- Replace placeholder `myname` in an SVG template with names from a CSV file.
- Automatically generate high-quality PDFs for each name.
- Maintains system fonts used in the SVG template.
- PDF output is A4 size in landscape orientation.
- PDF metadata (`title`) is set to the recipient's name.

---

## Requirements

### Python
- Python 3.x
- `csv` and `os` modules (built-in)

### Node.js
- Node.js v20 or later
- 
  ```bash
  npm install
  ```

## Usage
- ```python script.py``` (Generates the SVG files)
- ```node svg-to-pdf.js``` (Generates the PDF files)