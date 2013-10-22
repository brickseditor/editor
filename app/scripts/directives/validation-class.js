'use strict';

// Add Bootstrap validation classes to a form.
angular.module('bricksApp')
  .directive('validationClass', function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {form: '@'},
      link: function(scope, element, attrs) {
        var form = element.controller('form');
        var group = element.parent().parent();

        scope.$watch(attrs.ngModel, function () {
          var inputName = element[0].name;

          if (form[inputName].$dirty) {
            if (form[inputName].$invalid) {
              group.removeClass('has-success').addClass('has-error');
            } else {
              group.removeClass('has-error').addClass('has-success');
            }
          }
        });
      }
    };
  });
