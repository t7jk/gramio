#!/bin/bash
# Jedyny zalecany sposób deployu EngLearn na serwer (~/englearn → /var/www/html/englearn).
# NIE kopiujemy profiles/ — na serwerze zostają konta i postępy użytkowników.
# Zmiany listy plików — tutaj; agent/ludzie: uruchamiaj ten skrypt zamiast własnego cp/rsync.
SRC=~/englearn
DST=/var/www/html/englearn

cp "$SRC/index.php"  "$DST/index.php"
cp "$SRC/api.php"    "$DST/api.php"
cp "$SRC/app.js"     "$DST/app.js"
cp "$SRC/style.css"  "$DST/style.css"
cp "$SRC/data/"*.json "$DST/data/"

chmod o+w "$DST/profiles/"

echo "Deploy gotowy."
