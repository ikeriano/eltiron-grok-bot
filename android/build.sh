#!/bin/bash
# Construye el APK de El Tirón: copia src/www a assets y compila (firma con keystore/).
set -e
cd "$(dirname "$0")"
rm -rf app/src/main/assets/www && mkdir -p app/src/main/assets && cp -r .. app/src/main/assets/www
export JAVA_HOME=/home/box/jdk17
./gradlew assembleRelease -q
cp app/build/outputs/apk/release/app-release.apk ../ElTiron-$(grep versionName app/build.gradle | sed "s/.*'\(.*\)'.*/\1/").apk
