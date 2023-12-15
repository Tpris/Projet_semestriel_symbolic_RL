#!/bin/sh
pip install -r requirements.txt

flask --app app run &> /dev/null

xdg-open index.html &> /dev/null

# sleep 10

touch /tmp/text.txt
echo "*** INSTRUCTIONS ***" > /tmp/text.txt
echo 'Clic on "importer mur"' >> /tmp/text.txt
echo 'Select the wall "data/wall/wall_test.json"' >> /tmp/text.txt
echo 'move the person' >> /tmp/text.txt
echo 'clic on "Chemin génétique"' >> /tmp/text.txt

gedit /tmp/text.txt

