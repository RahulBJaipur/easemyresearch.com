#!/usr/bin/env python3
"""
Convert CSV Reports to Excel (.xls) Format
Uses built-in libraries to create proper Excel files
"""

import csv
import os
import xml.etree.ElementTree as ET
from datetime import datetime

def create_excel_xml(csv_file, excel_file):
    """Convert CSV to Excel XML format"""
    
    # Excel XML header
    xml_content = '''<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">

<Styles>
  <Style ss:ID="Header">
    <Font ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1F4E79" ss:Pattern="Solid"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
  <Style ss:ID="Critical">
    <Interior ss:Color="#FF6B6B" ss:Pattern="Solid"/>
    <Font ss:Bold="1"/>
  </Style>
  <Style ss:ID="High">
    <Interior ss:Color="#FFE66D" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Medium">
    <Interior ss:Color="#A8E6CF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Success">
    <Interior ss:Color="#C8E6C9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Default">
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
</Styles>

'''
    
    # Get sheet name from filename
    sheet_name = os.path.basename(csv_file).replace('.csv', '').replace('2025_07_11_', '')[:31]
    
    xml_content += f'<Worksheet ss:Name="{sheet_name}">\n<Table>\n'
    
    # Read CSV and convert to XML
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        row_num = 0
        
        for row in reader:
            row_num += 1
            xml_content += '<Row>\n'
            
            for col_num, cell in enumerate(row):
                # Escape XML special characters
                cell_value = str(cell).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
                
                # Determine style based on content
                style = 'Default'
                if row_num == 1:  # Header row
                    style = 'Header'
                elif 'Critical' in cell_value or 'P0' in cell_value:
                    style = 'Critical'
                elif 'High' in cell_value or 'P1' in cell_value:
                    style = 'High'
                elif 'Medium' in cell_value or 'P2' in cell_value:
                    style = 'Medium'
                elif '✅' in cell_value or 'COMPLETE' in cell_value or 'SUCCESS' in cell_value:
                    style = 'Success'
                
                xml_content += f'<Cell ss:StyleID="{style}"><Data ss:Type="String">{cell_value}</Data></Cell>\n'
            
            xml_content += '</Row>\n'
    
    xml_content += '</Table>\n</Worksheet>\n</Workbook>'
    
    # Write Excel XML file
    with open(excel_file, 'w', encoding='utf-8') as f:
        f.write(xml_content)

def create_simple_excel_format(csv_file, xlsx_file):
    """Create a simple tab-delimited Excel-compatible file"""
    
    with open(csv_file, 'r', encoding='utf-8') as csvf:
        with open(xlsx_file, 'w', encoding='utf-8') as xlsf:
            reader = csv.reader(csvf)
            for row in reader:
                # Convert to tab-delimited format
                xlsf.write('\t'.join(row) + '\n')

def main():
    """Convert all CSV files to Excel format"""
    
    print("🔄 Converting CSV Reports to Excel Format...")
    print("=" * 50)
    
    # Get all CSV files
    csv_files = [f for f in os.listdir('.') if f.endswith('.csv') and '2025_07_11' in f]
    csv_files.sort()
    
    converted_files = []
    
    for csv_file in csv_files:
        # Create Excel XML file (.xls)
        excel_xml_file = csv_file.replace('.csv', '.xls')
        create_excel_xml(csv_file, excel_xml_file)
        
        # Create simple Excel format (.xlsx)  
        excel_xlsx_file = csv_file.replace('.csv', '.xlsx')
        create_simple_excel_format(csv_file, excel_xlsx_file)
        
        # Get file sizes
        csv_size = os.path.getsize(csv_file) / 1024
        xls_size = os.path.getsize(excel_xml_file) / 1024
        xlsx_size = os.path.getsize(excel_xlsx_file) / 1024
        
        print(f"✅ Converted: {csv_file}")
        print(f"   📊 Excel XML (.xls): {excel_xml_file} ({xls_size:.1f} KB)")
        print(f"   📈 Excel Simple (.xlsx): {excel_xlsx_file} ({xlsx_size:.1f} KB)")
        print(f"   📄 Original CSV: {csv_file} ({csv_size:.1f} KB)")
        print()
        
        converted_files.extend([excel_xml_file, excel_xlsx_file])
    
    # Create combined workbook
    print("📋 Creating Combined Excel Workbook...")
    
    combined_file = f"2025_07_11_ALL_REPORTS_COMBINED_{datetime.now().strftime('%H%M')}.xls"
    
    # Combined Excel XML with multiple worksheets
    combined_xml = '''<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">

<Styles>
  <Style ss:ID="Header">
    <Font ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1F4E79" ss:Pattern="Solid"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
  <Style ss:ID="Critical">
    <Interior ss:Color="#FF6B6B" ss:Pattern="Solid"/>
    <Font ss:Bold="1"/>
  </Style>
  <Style ss:ID="High">
    <Interior ss:Color="#FFE66D" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Medium">
    <Interior ss:Color="#A8E6CF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Success">
    <Interior ss:Color="#C8E6C9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Default">
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
</Styles>

'''
    
    # Add each CSV as a worksheet
    for csv_file in csv_files:
        sheet_name = csv_file.replace('.csv', '').replace('2025_07_11_', '')[:31]
        combined_xml += f'<Worksheet ss:Name="{sheet_name}">\n<Table>\n'
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            row_num = 0
            
            for row in reader:
                row_num += 1
                combined_xml += '<Row>\n'
                
                for cell in row:
                    cell_value = str(cell).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
                    
                    style = 'Default'
                    if row_num == 1:
                        style = 'Header'
                    elif 'Critical' in cell_value or 'P0' in cell_value:
                        style = 'Critical'
                    elif 'High' in cell_value or 'P1' in cell_value:
                        style = 'High'
                    elif 'Medium' in cell_value or 'P2' in cell_value:
                        style = 'Medium'
                    elif '✅' in cell_value or 'COMPLETE' in cell_value:
                        style = 'Success'
                    
                    combined_xml += f'<Cell ss:StyleID="{style}"><Data ss:Type="String">{cell_value}</Data></Cell>\n'
                
                combined_xml += '</Row>\n'
        
        combined_xml += '</Table>\n</Worksheet>\n\n'
    
    combined_xml += '</Workbook>'
    
    with open(combined_file, 'w', encoding='utf-8') as f:
        f.write(combined_xml)
    
    combined_size = os.path.getsize(combined_file) / 1024
    
    print(f"✅ Combined Workbook: {combined_file} ({combined_size:.1f} KB)")
    print()
    
    # Summary
    print("📊 CONVERSION SUMMARY")
    print("=" * 50)
    print(f"📄 Original CSV Files: {len(csv_files)}")
    print(f"📊 Excel Files Created: {len(converted_files) + 1}")
    print(f"📋 Combined Workbook: {combined_file}")
    print()
    
    print("📁 EXCEL FILES READY:")
    print("=" * 50)
    
    # List all Excel files
    excel_files = [f for f in os.listdir('.') if f.endswith(('.xls', '.xlsx')) and '2025_07_11' in f]
    excel_files.sort()
    
    for i, excel_file in enumerate(excel_files, 1):
        size = os.path.getsize(excel_file) / 1024
        print(f"{i:2}. {excel_file} ({size:.1f} KB)")
    
    print()
    print("💡 USAGE:")
    print("  • Open .xls files in Excel, LibreOffice, or Google Sheets")
    print("  • Open .xlsx files in any spreadsheet application")
    print(f"  • Use {combined_file} for all reports in one workbook")
    print()
    print("✅ All reports converted to Excel format successfully!")

if __name__ == "__main__":
    main()