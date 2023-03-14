import asyncio
import time
import sys
import io
from PyPDF2 import PdfFileWriter, PdfFileReader
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pyppeteer import launch

async def generate_pdf(report_url, output_file):
    browser = await launch()
    page = await browser.newPage()
    await page.goto(report_url, waitUntil='networkidle0')
    
    # Wait for 5 seconds to ensure that the page has fully loaded
    await asyncio.sleep(5)
    
    pdf_data = await page.pdf(format='A4', printBackground=True)
    await browser.close()
    
    with open(output_file, 'wb') as f:
        f.write(pdf_data)

if __name__ == '__main__':
    output_dir = "."
    if len(sys.argv) > 1:
        output_dir = sys.argv[1]
    timestr = time.strftime("%Y%m%d-%H%M%S")
    final_report_output = output_dir + '/Analytics-report'+ timestr + '.pdf'
    report_url = 'http://localhost:8888/'
    asyncio.get_event_loop().run_until_complete(generate_pdf(report_url, final_report_output))
