#!/bin/bash
#build app
echo "browserify  -d public/js/main.js -o public/js/build.js"
browserify  -d public/js/main.js -o public/js/build.js
echo "browserify public/js/main.js | uglifyjs > public/js/build.min.js"
export NODE_ENV=production
browserify public/js/main.js | uglifyjs > public/js/build.min.js
unset NODE_ENV

#build iot
pushd iot
if test -f all.tgz; then
    tar xvf all.tgz
fi
rm -f *.tgz
rm -f npm-shrinkwrap.json
npm install --production
npm shrinkwrap
npm pack
cp *.tgz ../public/iot.tgz

# browserify iot
cafjs mkStatic
echo "browserify --ignore ws -d . -o ../public/js/build-iot.js"
browserify --ignore ws -d . -o ../public/js/build-iot.js
echo "browserify --ignore ws . | uglifyjs > ../public/js/build-iot.min.js"
export NODE_ENV=production
browserify  --ignore ws . | uglifyjs > ../public/js/build-iot.min.js
unset NODE_ENV
# rm staticArtifacts.js
rm -fr node_modules/*;
popd #iot
