angular.module('app', ['spinner', 'rzModule'])
    .controller('MainController', ['itemsService', 'utilService', '$timeout', function(itemsService, utilService, $timeout){
        var self = this,
            MAX = 100;
        this.items = [];
        this.onChange = function(index){
            updateSum(index);
        };
        this.getItems = function(count){
            itemsService.getItems(count).then(function(res){
                if (count === 1){
                    res[0].Percent = (res[0].Percent > MAX ? MAX : res[0].Percent);
                }
                self.items = prepareItems(res);
                updateSum();

            });
        };
        function prepareItems(items){
            var newArr = [];
            angular.forEach(items, function(item){
                newArr.push(utilService.lowercaseProperty(item));
            });
            return newArr;
        }
        function updateSum(index){
            if (self.items.length > 1){
                $timeout(function () {
                    var sum = getSum(),
                        temp = angular.copy(self.items);
                    if (index !== undefined) temp.splice(index, 1);
                    changeValues(sum, temp);
                    reAssignValues(self.items, utilService.arrToObj(temp, 'name', 'percent'), 'name');
                });
            }

        }
        function changeValues(sum, temp){
            if (sum > MAX){
                temp.sort(function(a, b){
                    return b.percent - a.percent;
                });
                temp = subtract(utilService.round(sum - 100), temp, 0);
            } else {
                temp.sort(function(a, b){
                    return a.percent - b.percent;
                });
                temp = add(utilService.round(MAX - sum), temp, 0);
            }
        }
        function getSum(){
            var sum = utilService.round(self.items.map(function(item){
                return +item.percent;
            }).reduce(function(prev, cur){
                return prev + cur;
            }, 0));
            return sum;
        }
        function reAssignValues(oldVals, newValsObj, field){
            angular.forEach(oldVals, function(element){
                if (newValsObj.hasOwnProperty(element[field])){
                    element.percent = newValsObj[element[field]];
                }
            });
        }
        function subtract(value, array, index){
            if (value <= array[index].percent){
                array[index].percent = utilService.round(array[index].percent - value);
                return array;
            } else {
                var newVal = utilService.round(value - array[index].percent);
                array[index].percent = 0;
                return subtract(newVal, array, ++index);
            }
        }
        function add(value, array, index){
            array[index].percent = utilService.round(array[index].percent + value);
            return array
        }
        this.getItems(1);
    }])
    .factory('itemsService', ['$q', '$timeout', function($q, $timeout){
        // The sum of variants 3, 5 is more than 100, variant 4 - less than 100
        var variants = {
            1:  [{Name: 'item1', Percent: 18}],
            2:  [
                    {Name: 'item1', Percent: 65.33},
                    {Name: 'item2', Percent: 34.67}
                ],
            3:  [
                    {Name: 'item1', Percent: 26},
                    {Name: 'item2', Percent: 57},
                    {Name: 'item3', Percent: 38}
                ],
            4:  [
                    {Name: 'item1', Percent: 78.15},
                    {Name: 'item2', Percent: 1.17},
                    {Name: 'item3', Percent: 6.24},
                    {Name: 'item4', Percent: 7.55}
                ],
            5:  [
                    {Name: 'item1', Percent: 207},
                    {Name: 'item2', Percent: 55.37},
                    {Name: 'item3', Percent: 301.99},
                    {Name: 'item4', Percent: 101},
                    {Name: 'item5', Percent: 3}
                ]
        };
        function getItems(count){
            var deferred = $q.defer();
            $timeout(function(){
                if (!isNaN(count)){
                    if(count && count < 6){
                        deferred.resolve(variants[count]);
                    } else {
                        deferred.resolve(new Array());
                    }

                } else {
                    deferred.reject();
                }
            }, 200);
            return deferred.promise
        }
        return {
            getItems: getItems
        }
    }])
    .factory('utilService', [function(){
        function lowercaseProperty(item){
            var newItem = {};
            for (var prop in item){
                if (item.hasOwnProperty(prop)){
                    newItem[prop.charAt(0).toLowerCase() + prop.slice(1)] = item[prop]
                }
            }
            return newItem;
        }
        function arrToObj(array, name, value){
            var obj = {};
            array.forEach(function(element){
                obj[element[name]] = element[value];
            });
            return obj;
        }
        function round(val){
            return Math.round(val *100) / 100;
        }
        return{
            lowercaseProperty: lowercaseProperty,
            arrToObj: arrToObj,
            round: round
        };
    }])
    .filter('decl', function(){
        function declOfNum(number, titles) {
            var cases = [2, 0, 1, 1, 1, 2];
            return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
        }
        return function(input, titles, withoutNumber){
            var text = declOfNum(input, titles);
            return  withoutNumber ? text : input + ' ' + text;
        };

    });