#!/usr/bin/env node

var GCC_PREPROCESSOR_DEFINITIONS = '"$(inherited) DISABLE_PUSH_NOTIFICATIONS=1"';

var fs = require("fs");
var path = require("path");
var xcode = require('xcode');
var projectRoot = process.argv[2];

function getProjectName(protoPath) {
    var cordovaConfigPath = path.join(protoPath, 'config.xml');
    var content = fs.readFileSync(cordovaConfigPath, 'utf-8');

    return /<name>([\s\S]*)<\/name>/mi.exec(content)[1].trim();
}

function run(projectRoot) {   
    console.log('# ================================================================');
    console.log('# START: ios_disable_push_notifications.js');
    console.log('# ================================================================');

    var projectName = getProjectName(projectRoot);
    var xcodeProjectName = projectName + '.xcodeproj';
    var xcodeProjectPath = path.join(projectRoot, 'platforms', 'ios', xcodeProjectName, 'project.pbxproj');
    var xcodeProject;

    if (!fs.existsSync(xcodeProjectPath)) {
        return;
    }

    xcodeProject = xcode.project(xcodeProjectPath);

    console.log('Setting GCC Preprocessor Definitions for ' + projectName + ' to: [' + GCC_PREPROCESSOR_DEFINITIONS + '] ...');
    xcodeProject.parse(function(error){
        if(error){
            console.log('An error occured during parsing of [' + xcodeProjectPath + ']: ' + JSON.stringify(error));
        } else {
            var configurations = nonComments(xcodeProject.pbxXCBuildConfigurationSection());
            for (var config in configurations) {
                var buildSettings = configurations[config].buildSettings;
                buildSettings.GCC_PREPROCESSOR_DEFINITIONS = GCC_PREPROCESSOR_DEFINITIONS;
            }

            fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync(), 'utf-8');

            console.log('[' + xcodeProjectPath + '] now has GCC Preprocessor Definitions set to:[' + GCC_PREPROCESSOR_DEFINITIONS + '] ...');
        }
    });
    
    console.log('# ================================================================');
    console.log('# DONE: ios_disable_push_notifications.js');
    console.log('# ================================================================');
}

var COMMENT_KEY = /_comment$/;
function nonComments(obj) {
    var keys = Object.keys(obj),
        newObj = {}, i = 0;

    for (i; i < keys.length; i++) {
        if (!COMMENT_KEY.test(keys[i])) {
            newObj[keys[i]] = obj[keys[i]];
        }
    }

    return newObj;
}

run(projectRoot);