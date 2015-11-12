angular.module('spinner', [])
    .directive('spinner', function(){
        return {
            restrict: 'EA',
            template: '<div class="input-group spinner">' +
            '<input type="text" class="form-control" max="{{max}}" min="{{min}}" input-spinner on-change="onChange()" ng-model="spinner">' +
            '<div class="input-group-btn-vertical">' +
            '<button class="btn btn-default" type="button" ng-click="add()">' +
            '<i class="fa fa-caret-up"></i>' +
            '</button>' +
            '<button class="btn btn-default" type="button" ng-click="subtract()">' +
            '<i class="fa fa-caret-down"></i>' +
            '</button>' +
            '</div>' +
            '</div>',
            scope: {
                spinner: '=',
                max: '=',
                min: '=',
                onChange: '&'
            },
            link: function(scope){
                scope.add = function(){
                    (scope.spinner <= scope.max - 1) ? scope.spinner = Math.round(scope.spinner + 1) : scope.spinner = scope.max;
                    scope.onChange();
                };
                scope.subtract = function(){
                    (scope.spinner >= scope.min + 1) ? scope.spinner = Math.round(scope.spinner - 1) : scope.spinner = scope.min;
                    scope.onChange();
                };
            }
        }
    })
    .directive('inputSpinner', function(){
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                onChange: '&'
            },
            link: function(scope, element, attrs, ctrl){
                var min = +attrs.min,
                    max = +attrs.max,
                    REPL_COMMA = /,/g,
                    VALID_REG = /^(\d+)?\.(\d{1,2})?$/,
                    REPL_DOTS = /\.{2,}/g,
                    REPL_ALL = /[^\d\.,]/g;
                ctrl.$parsers.push(function(value){
                    value = value.toString().replace(REPL_COMMA, ".");
                    if(!(VALID_REG.test(value))){
                        value = Math.round(value.replace(REPL_DOTS, ".").replace(REPL_ALL, "") * 100) /100;
                    }
                    if (!value || value < min){
                        value = min;
                    } else if (value  > max){
                        value = max;
                    }
                    ctrl.$setViewValue(value);
                    ctrl.$render();
                    scope.onChange();
                    return +value;
                })
            }
        }
    });