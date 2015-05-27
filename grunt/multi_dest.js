/*
 * grunt-multi-dest
 * https://github.com/ErjanGavalji/grunt-multi-dest
 *
 * Copyright (c) 2014 Erjan Gavalji
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var multiDest = function () {

        //console.log('Base configuration: %s', JSON.stringify(this, undefined, 2));

        var destDirs = [];
        var destPathnames = this.files;

        //console.log('Looking at files: %s',  JSON.stringify(destPathnames, undefined, 2));

        for (var fileIdx = 0; fileIdx < destPathnames.length; fileIdx++) {
            destDirs = destDirs.concat(destPathnames[fileIdx].dest);
        }

        //console.log('[DestDirs] `%j`', destDirs);

        var subTasks = this.data.tasks;

        console.log('[Subtasks] %j', subTasks);

        var newTaskList = [];
        var newTaskName = 'multidist_runtimecreated_subtask';

        for (var i = 0; i < destDirs.length; i++) {
            var destDir = destDirs[i];

            for (var k = 0; k < subTasks.length; k++) {
                var subTask = subTasks[k];

                var subTaskSplit = subTask.split(':');

                var originalSubTaskConfig = grunt.config(subTaskSplit);

                var source = originalSubTaskConfig.files[0];

                var newFile = {src: source.src, dest: destDir + '.jshintrc', flatten: true};

                originalSubTaskConfig.files.push(newFile);

                grunt.config(subTaskSplit, originalSubTaskConfig);
            }
        }


        for (var l = 0; l < subTasks.length; l++) {
            console.log('Running subtask[%d]: %s', l, subTasks[l]);
            grunt.task.run(subTasks[l]);

        }

        //grunt.registerTask(newTaskName, newTaskList);
        //
        //console.log('Running taskList `%s`', newTaskList);
        //grunt.task.run(newTaskList);
        //
        //console.log('Running task `%s`', newTaskName);
        //grunt.task.run(newTaskName);

    };

    grunt.registerMultiTask('multidest', 'Run predefined tasks multiple times to copy their output to multiple destinations and avoid duplication', multiDest);
};
