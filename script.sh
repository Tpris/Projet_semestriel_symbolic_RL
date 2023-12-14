#!/bin/sh
pip install -r requirements.txt

flask --app app run &> /dev/null

xdg-open http://127.0.0.1:5000 &> /dev/null

sleep 10
echo "\033[44m*** INSTRUCTIONS ***\033[m"
echo 'Clic on "importer mur"'
echo 'Select the wall "data/wall/wall_test.json"'
echo 'move the person'
echo 'clic on "Chemin génétique"'