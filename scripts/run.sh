#!/bin/sh
search_dir=JSON
for ENTRY in "$search_dir"/*
do
    echo "processing $ENTRY #############################################"
    FILE=$( echo $ENTRY | sed 's/\//\\\//g'  )
    sed -i '' "s/JSON_NAME = .*/JSON_NAME = '$FILE';/" index.html
    sed -i '' "s/reportType = .*/reportType = '$1';/" index.html
    ./pdf.sh $FILE
    DATE=$( date "+%m-%d-%Y")   
    PDF=$( echo $ENTRY | sed 's/.json//g' | sed 's/JSON\///g')    
    mv ./Analytics-report* ./output/$PDF-$DATE.pdf
    echo "process completed $PDF #############################################"    
done
echo "Process completed"