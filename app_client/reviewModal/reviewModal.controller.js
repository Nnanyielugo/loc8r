(function(){
    angular
        .module('loc8rApp')
        .controller('reviewModalCtrl', reviewModalCtrl);

    reviewModalCtrl.$inject = ['$uibModalInstance'];
    function reviewModalCtrl ($uibModalInstance) {
        var vm =this;
        

        //create vm.modal.cancel() method and use it to call $modalInstance.dismiss method
        vm.uibModal = {
            cancel : function() {
                $uibModalInstance.dismiss('cancel');
            }
        };
    }
})();
