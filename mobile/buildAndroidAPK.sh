#!/bin/bash

ionic build android --release

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android-release-key.keystore -storepass "&outset$" platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk android-store;
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android-release-key.keystore -storepass "&outset$" platforms/android/build/outputs/apk/android-x86-release-unsigned.apk android-store;

~/.android/build-tools/22.0.1/zipalign -v 4 platforms/android/build/outputs/apk/android-x86-release-unsigned.apk ./platforms/android/archives/TruckerLine_x86_100_rc30.apk
~/.android/build-tools/22.0.1/zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk ./platforms/android/archives/TruckerLine_arm_100_rc30.apk
