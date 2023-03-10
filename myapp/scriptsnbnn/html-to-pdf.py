import time
import sys
import urllib.request
import os
import PyPDF2
from fpdf import FPDF

from pyhtml2pdf import converter

import reportlab
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from PyPDF2 import PdfFileWriter, PdfFileReader

print(sys.argv)

output_dir = "."
json_name = ""
if len(sys.argv) > 1 :
    json_name = sys.argv[1]
    json_name = json_name.replace("\\", "")

timestr = time.strftime("%Y%m%d-%H%M%S")

final_report_output = output_dir + '/Analytics-report'+ timestr + '.pdf'
report_url = 'http://localhost:8001/'
json_url = 'http://localhost:8888/'
new_json_url = json_url + json_name
url=urllib.request.urlopen(new_json_url)
print(len(url.read()))

timeout_value = 20
if len(url.read()) > 60000 :
    timeout_value = 200

result = converter.__get_pdf_from_html(report_url, timeout_value, True, print_options={'landscape': False,'paperWidth': 8.27,'paperHeight': 11.69})

with open(final_report_output, "wb") as file:
    file.write(result)

#basic class with super - to skip parent tempo.
class NumberPDF(FPDF):
    def __init__(self, numberOfPages):
        super(NumberPDF, self).__init__()
        self.numberOfPages = numberOfPages
#not header - pass      #self used for first arg
    def header(self):
        pass #pass is used for pass - no error - code run

    def footer(self):
        self.set_y(-12)
        self.set_font('Arial', 'I', 6)
        #self.cell(0){self.page_no()}{self.numberOfPages}"'')
        #self.cell(0, 10, f"{self.page_no()}{self.numberOfPages}", 0, 0,'')
        self.cell(0, 10, f"Page {self.page_no()} of {self.numberOfPages}", 0, 0, 'R')


# Grab the file you want to add pages to
inputFile = PyPDF2.PdfFileReader(final_report_output)
outputFile = final_report_output

tempNumFile = NumberPDF(inputFile.getNumPages())

for page in range(inputFile.getNumPages()):
    tempNumFile.add_page()

tempNumFile.output("tempNumbering.pdf")

mergeFile = PyPDF2.PdfFileReader("tempNumbering.pdf")

mergeWriter = PyPDF2.PdfFileWriter()

# Loop through the page - Temporary numbering
for x, page in enumerate(mergeFile.pages):
    # Get page input 1
    inputPage = inputFile.getPage(x)
    # Merge the input and Temporary numbering
    inputPage.mergePage(page)
    # Add the merged to the final_report_output
    mergeWriter.addPage(inputPage)

# To Delete temporary file
os.remove("tempNumbering.pdf")

#merged output - write
with open(outputFile, 'wb') as fh:
    mergeWriter.write(fh)

