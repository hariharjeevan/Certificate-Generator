#script.py

import csv
import os
from collections import defaultdict

def replace_name_in_svg(svg_file, name, output_svg):
    with open(svg_file, 'r', encoding='utf-8') as f:
        svg_content = f.read()
    modified_svg = svg_content.replace("myname", name)
    with open(output_svg, 'w', encoding='utf-8') as f:
        f.write(modified_svg)
    print(f"SVG file created: {output_svg}")

def process_certificates(csv_file, svg_template, output_folder):
    # Read template once
    with open(svg_template, 'r', encoding='utf-8') as f:
        template_svg = f.read()

    name_count = defaultdict(int)

    with open(csv_file, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            name = row['Full Name'].strip()
            name_count[name] += 1
            
            # Create a unique filename
            if name_count[name] > 1:
                svg_output = os.path.join(output_folder, f"{name}_{name_count[name]}.svg")
            else:
                svg_output = os.path.join(output_folder, f"{name}.svg")
            
            svg_filled = template_svg.replace("myname", name)
            with open(svg_output, 'w', encoding='utf-8') as f:
                f.write(svg_filled)
            print(f"SVG file created: {svg_output}")

if __name__ == "__main__":
    csv_file = 'names.csv'
    svg_template = 'certificate_template.svg'
    output_folder = 'certificates_svg'

    os.makedirs(output_folder, exist_ok=True)
    process_certificates(csv_file, svg_template, output_folder)
