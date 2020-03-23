#!/bin/bash

#At console, press ctrl-c twice for each device

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
pushd $DIR
cp ./service2.js /tmp
#Puck.js cb90
../node_modules/.bin/espruino -p fc:22:4a:44:cb:90 -w /tmp/service2.js -e "save()"

popd
