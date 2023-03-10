
import os
import subprocess
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse

import subprocess

def generate_pdf(request):
    report_type = request.GET.get('report_type', '')
    command = '/Users/arunshah/Desktop/reks/reks/scripts/pdf.sh'
    subprocess.run([command, report_type])
    return HttpResponse('PDF generated!')





# Create your views here.

def my_view(request):
    return render(request, 'index.html')
