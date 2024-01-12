#!/bin/sh

#pip install -r requirements.txt

xterm -T 'Generateur de chemin Genetique' -e flask --app app run &

if [ -z "$BROWSER" ] ; then BROWSER=firefox ; fi

$BROWSER file://`pwd`/index.html\?"wall=`cat data/wall/wall_test.json`&initPos={\"x\":638,\"y\":635}&runGenetic"

#touch /tmp/text.txt
#echo "*** INSTRUCTIONS ***" > /tmp/text.txt
#echo 'Clic on "importer mur"' >> /tamp/text.txt
#echo 'Select the wall "data/wall/wall_test.json"' >> /tmp/text.txt
#echo 'move the person' >> /tmp/text.txt
#echo 'clic on "Chemin génétique"' >> /tmp/text.txt
#gedit /tmp/text.txt

