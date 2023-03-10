#!/bin/bash

echo "#############################################"
echo "Start $0"
echo "#############################################"
echo ""

echo "#############################################"
echo "STARTING PYTHON SERVER"
echo "#############################################"
nohup python3 -m http.server 8001 &
echo ""

echo "#############################################"
echo "STARTING PDF GENERATION"
echo "#############################################"
cd ../reks/reks
python3 html-to-pdf.py $1
echo ""



echo "#############################################"
echo "STOPPING PYTHON SERVER"
echo "#############################################"
kill -9 `ps -ef |grep http.server |grep 8001 |awk '{print $2}'`
echo ""

echo "#############################################"
echo "End $0"
echo "#############################################"
echo ""
