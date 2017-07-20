(function(){
'use strict';

angular.module('demoApp')
    .factory('formHelperService', [formHelperService]);

    function formHelperService () {
        var service = {};

        service.getDateFormatted = getDateFormatted;
        service.showFormErrors = showFormErrors;
        service.getFormattedErrors = getFormattedErrors;

        function getDateFormatted(date, withTime) {
            var dateStr = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();

            //if (withTime) {
            //
            //}

            return dateStr;
        }

        // ex param. vm.form.$error
        function showFormErrors(formError) {
            angular.forEach(formError, function (field) {
                angular.forEach(field, function (errorField) {
                    errorField.$setTouched();
                })
            });
        }

        function getFormattedErrors(data) {
            var message = '',
                error;

            for (var key in data.errors) {
                error = data.errors[key];
                if (error.length) {
                    message += key.capitalize() + ' : ' + error[0] + '\n';
                }
            }

            return message;
        }


        return service;
    }
}());