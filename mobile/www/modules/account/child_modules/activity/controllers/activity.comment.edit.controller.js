(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCommentEditCtrl', ActivityCommentEditCtrl);

    ActivityCommentEditCtrl.$inject = ['parameters'];

    function ActivityCommentEditCtrl(parameters) {
        var vm = this;
        vm.comment = parameters.entry;

        vm.close = close;
        vm.saveComment = saveComment;

        function saveComment() {
            console.log('saveComment()',vm.comment);
        }

        function close() {
            vm.closeModal(vm.entry);
        }
    }
})();
