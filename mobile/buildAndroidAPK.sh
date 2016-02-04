#!/bin/bash

ionic build android --release

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android-release-key.keystore -storepass "&outset$" platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk android-store;
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android-release-key.keystore -storepass "&outset$" platforms/android/build/outputs/apk/android-x86-release-unsigned.apk android-store;

mkdir -p ./platforms/android/build/archives

$ANDROID_HOME/build-tools/23.0.2/zipalign -v 4 platforms/android/build/outputs/apk/android-x86-release-unsigned.apk ./platforms/android/build/archives/TruckerLine_x86_121_rc1.apk
$ANDROID_HOME/build-tools/23.0.2/zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk ./platforms/android/build/archives/TruckerLine_arm_121_rc1.apk
