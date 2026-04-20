#!/bin/bash
# Deploy aplikacji EngLearn na katalog WWW.
# NIE kopiujemy profiles/ — na serwerze zostają konta i postępy użytkowników.
SRC=~/englearn
DST=/var/www/html/englearn

cp "$SRC/index.php"  "$DST/index.php"
cp "$SRC/api.php"    "$DST/api.php"
cp "$SRC/app.js"     "$DST/app.js"
cp "$SRC/style.css"  "$DST/style.css"
cp "$SRC/data/"*.json "$DST/data/"

chmod o+w "$DST/profiles/"

echo "Deploy gotowy."
