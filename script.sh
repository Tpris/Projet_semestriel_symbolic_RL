#!/bin/sh

pip install -r requirements.txt

xterm -T 'Generateur de chemin Genetique' -e flask --app app run &

xdg-open index.html"?wall=`cat data/wall/wall_test.json`&initPos={x:??,y:??}&run_genetic"

# sleep 10

touch /tmp/text.txt
echo "*** INSTRUCTIONS ***" > /tmp/text.txt
#echo 'Clic on "importer mur"' >> /tamp/text.txt
#echo 'Select the wall "data/wall/wall_test.json"' >> /tmp/text.txt
echo 'move the person' >> /tmp/text.txt
echo 'clic on "Chemin génétique"' >> /tmp/text.txt
gedit /tmp/text.txt

