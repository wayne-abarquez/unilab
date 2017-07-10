(function () {
    'use strict';

    angular.module('demoApp')
        .factory('modalServices', ['$q', '$mdDialog', '$mdMedia', '$rootScope', modalServices]);

    function modalServices($q, $mdDialog, $mdMedia, $rootScope) {
        var service = {};

        var customFullscreen = $mdMedia('xs') || $mdMedia('sm');

        var newTransactionModal;

        /* Service Functions */
        service.showNewTransactionForm = showNewTransactionForm;
        //service.showProjectDetail = showProjectDetail;
        service.hideResolveModal = hideResolveModal;
        service.closeModal = closeModal;

        function showModal(modalObj, modalParams) {
            var dfd = $q.defer();
            if (modalObj) {
                dfd.reject("Modal already opened");
            } else {
                $rootScope.$broadcast("modal-opened");
                modalObj = $mdDialog.show(modalParams);
                modalObj.then(function (result) {
                        dfd.resolve(result);
                    }, function (reason) {
                        $rootScope.$broadcast("modal-dismissed");
                        dfd.reject(reason);
                    })
                    .finally(function () {
                        modalObj = null;
                    });
            }
            return dfd.promise;
        }

        function showNewTransactionForm(ev) {
            var opts = {
                controller: 'newTransactionController',
                controllerAs: 'vm',
                templateUrl: '/partials/modals/_new_transaction.html',
                parent: angular.element(document.querySelector('#index-container')),
                targetEvent: ev,
                hasBackdrop: false,
                fullscreen: customFullscreen,
                onComplete: function (scope, element, options) {
                    $('.md-scroll-mask').css('z-index', '-1');
                }
            };

            return showModal(newTransactionModal, opts);
        }

        //function showProjectDetail(proj) {
        //    var opts = {
        //        controller: 'projectDetailsController',
        //        controllerAs: 'vm',
        //        templateUrl: '/partials/modals/_view-project.tmpl.html',
        //        parent: angular.element(document.querySelector('#admin-container')),
        //        hasBackdrop: false,
        //        locals: {project: proj},
        //        fullscreen: $mdMedia('xs'),
        //        onComplete: function (scope, element, options) {
        //            $('.md-scroll-mask').css('z-index', '-1');
        //        }
        //    };
        //    return showModal(projectDetailModal, opts);
        //}

        function hideResolveModal(response) {
            $rootScope.$broadcast("modal-closed");
            $mdDialog.hide(response);
        }

        // Close Modal
        function closeModal() {
            $rootScope.$broadcast("modal-closed");
            $mdDialog.cancel();
        }

        return service;
    }
}());