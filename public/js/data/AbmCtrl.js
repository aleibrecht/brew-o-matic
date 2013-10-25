(function() {
    
    var abm = angular.module("abm",[]);
    
    var config = {
        Style:  {
            name: "Estilos",
            singular: "Estilo",
            orderBy: "name",
            headers: [
                {
                    field:'name',
                    caption: 'Nombre'
                },{
                    field:'OG_Min',
                    caption: 'OG min'
                },{
                    field:'OG_Max',
                    caption: 'OG max'
                },{
                    field:'FG_Min',
                    caption: 'FG min'
                },{
                    field:'FG_Max',
                    caption: 'FG max'
                },{
                    field:'IBU_Min',
                    caption: 'IBU min'
                },{
                    field:'IBU_Max',
                    caption: 'IBU max'
                },{
                    field:'Colour_Min',
                    caption: 'Color min'
                },{
                    field:'Colour_Max',
                    caption: 'Color max'
                },{
                    field:'ABV_Min',
                    caption: '%Alc min'
                },{
                    field:'ABV_Max',
                    caption: '%Alc max'
                //},{
                //    field:'link',
                //    caption: 'BJCP'
                },{
                    field:'co2_min',
                    caption: 'CO2 min'
                },{
                    field:'co2_max',
                    caption: 'CO2 max'
                //},{
                //    field:'related',
                //    caption: 'RateBeer.com'
                }
            ]
        },
        Yeast:  {
            name: "Levaduras",
            pageSize: 10,
            singular: "Levadura",
            orderBy: "name",
            headers: [
                {
                    field:'name',
                    caption: 'Nombre',
                    width:70
                },{
                    field:'aa',
                    caption: 'Atenuacion',
                    width:20
                }
            ]
        },
        Misc:  {
            name: "Miscs",
            singular: "Misc",
            orderBy: "name",
            headers: [
                {
                    field:'name',
                    caption: 'Nombre'
                },{
                    field:'type',
                    caption: 'Tipo'
                },{
                    field:'use',
                    caption: 'Uso'
                }
            ]
        },
        Bottle:  {
            name: "Botellas",
            singular: "Botella",
            orderBy: "size",
            headers: [
                {
                    field:'_id',
                    caption: 'ID',
                    width: 25
                },{
                    field:'name',
                    caption: 'Nombre',
                    width: 25
                },{
                    field:'size',
                    caption: 'Tamaño',
                    width: 25
                },{
                    field:'colour',
                    caption: 'Color',
                    width: 25
                }
            ]
        },
        Grain: {
            name: "Granos",
            singular: "Grano",
            orderBy: "name",
            headers: [
                {
                    field:'name',
                    caption: 'Nombre',
                    width: 50
                },{
                    field:'type',
                    caption: 'Tipo',
                    width: 15
                },{
                    field:'colour',
                    caption: 'Color',
                    width: 15
                },{
                    field:'potential',
                    caption: 'Potencial',
                    width: 15
                }
            ]
        },
        Hop: {
            name: "Lupulos",
            singular: "Lupulo",
            orderBy: "name",
            headers: [
                {
                    field:'name',
                    caption: 'Nombre',
                    width: 70
                },{
                    field:'alpha',
                    caption: 'AA%',
                    width: 25
                }
            ]
        }
    };

    var PAGE_SIZE = 10;

    abm.filter("pageFilter",function() {
        return function(rows,page) {
            var from = (page-1)*PAGE_SIZE;
            var to = from + PAGE_SIZE;
            return rows.slice(from,to);
        };
    });

    abm.controller("AbmCtrl",function($scope,$rootScope,$routeParams,Grain, Hop, Bottle, Misc,Yeast,Style,sortData) {

        $scope.allConfigs = config;
        
        $scope.entity = $routeParams.entity;
        
        $scope.config = config[$scope.entity];

        $scope.sort = sortData($scope.config.orderBy,"");
        
        $rootScope.breadcrumbs = [{
            link: '#',
            title: 'Home'
        },{
            link: '#',
            title: $scope.config.name
        }];        
        
        $scope.data = {
            Grain: Grain,
            Hop: Hop,
            Bottle: Bottle,
            Misc: Misc,
            Yeast: Yeast,
            Style: Style
        };
        
        $scope.getActiveClass = function(tab) {
            if (tab == $scope.entity) {
                return 'active';
            } else {
                return '';
            }
        };
        
        $scope.edit_id = null;
        
        $scope.edit = function(row) {
            $scope.edit_id = row._id;
        };
        
        $scope.copy = function(row) {
            return angular.copy(row);
        };
        
        $scope.remove = function(row) {
            var clean = function() {
                util.Arrays.remove($scope.rows,row);
            };
            if (!row.$delete) {
                $scope.data[$scope.entity].delete(row,clean);
            } else {
                row.$delete(clean);    
            }
        };
        
        $scope.cancel = function (row,value) {
            if (row._draft){
                util.Arrays.remove($scope.rows,row);
            } else {
                angular.forEach($scope.config.headers,function(h) {
                    value[h.field] = row[h.field];
                });                
            }
            $scope.edit_id = null;
        };
        
        $scope.save = function(value,row) {
            angular.forEach($scope.config.headers,function(h) {
                row[h.field] = value[h.field];
            });
            if ( row._id ) {
                if (!row.$save) {
                    $scope.data[$scope.entity].save(row);
                } else {
                    row.$save();    
                }
                $scope.edit_id = null;
            } else {
                $scope.data[$scope.entity].save(row, function(n) {
                    row._id = n._id;
                });
            }
            
            
        };

        $scope.$watch("searchCriteria",function() {
            $scope.page = 1;
            var pageSize = $scope.config.pageSize || 10;

            var pagesCount = Math.floor($scope.rows.length/pageSize)+1;
            $scope.pages = [];
            for ( var i=1; i <= pagesCount; i++ ) {
                $scope.pages.push({
                    page: i
                });
            }
        });

        $scope.page = 1;
        $scope.rows = $scope.data[$scope.entity].query(function() {
            var pageSize = $scope.config.pageSize || 10;
            var pagesCount = Math.floor($scope.rows.length/pageSize)+1;
            $scope.pages = [];
            for ( var i=1; i <= pagesCount; i++ ) {
                $scope.pages.push({
                    page: i
                });
            }
        });

        $scope.toPage = function(page) {
            $scope.page = page;
        }
        
    });
    
})();