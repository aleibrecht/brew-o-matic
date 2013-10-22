(function() {


    var index = angular.module('index', [
                                'ngResource',
                                'ngRoute',
                                'ngSanitize',
                                'data',
                                'resources',
                                'helper',
                                'login',
                                'comments',
                                'googlechart',
                                'brew-o-module.controller']);

    index.constant("version",'0.12');
 
    index.
        config(['$routeProvider', function($routeProvider) {
            $routeProvider.
                when('/recipe', {templateUrl: 'partial/recipe-list.html',   controller: 'RecipeListCtrl'}).
                when('/recipe/edit/:recipeId', {templateUrl: 'partial/recipe-detail.html', controller: 'RecipeDetailCtrl'}).
                when('/recipe/clone/:recipeId', {templateUrl: 'partial/recipe-detail.html', controller: 'RecipeDetailCtrl'}).
                when('/recipe/new', {templateUrl: 'partial/recipe-detail.html', controller: 'RecipeDetailCtrl'}).
                //when('/stats', {templateUrl: 'partial/user/user-stats.html', controller: 'UserStatsCtrl'}).
                when('/settings', {templateUrl: 'partial/user/user-settings.html', controller: 'UserSettingsCtrl'}).
                when('/notification', {templateUrl: 'partial/user/user-notification.html', controller: 'NotificationsCtrl'}).
                otherwise({redirectTo: '/recipe'});
    }]);

    index.controller("NotificationsCtrl",function($scope,Notification,$rootScope) {


        $scope.updateCount = function(notifications) {
            $scope.countUnread = 0;
            $scope.countNew = 0;
            angular.forEach(notifications, function(not) {
                if ( not.status == 'new') {
                    $scope.countNew++;
                } else if ( not.status == 'unread') {
                    $scope.countUnread++;
                }
            });
        };

        $scope.$watch('user',function() {
            $scope.notifications = Notification.query($scope.updateCount);
        });


        $rootScope.breadcrumbs = [{
            link: '#',
            title: 'Home'
        },{
            link: '#',
            title: 'Notificaciones'
        }];
        
        $scope.markAsRead = function(notification) {
            if ( notification.status != 'read' ) {
                notification.status = 'read';
                notification.$save();
                $scope.updateCount($scope.notifications);
            }
        };
        
        $scope.statusClass = function(notification) {
            if ( notification.status == 'unread') { 
                return 'gt-notification-unread';
            } else if ( notification.status == 'new') {
                return 'gt-notification-new';
            }
            return '';
        };
        
        $rootScope.notificationCount = 0;
        
    });
    
    
    
    index.controller("UserSettingsCtrl",function($scope,User,$rootScope) {
        $scope.disconnectUser = function() {
            var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
                gapi.auth.getToken().access_token;
            // Realiza una solicitud GET asíncrona.
            $.ajax({
                type: 'GET',
                url: revokeUrl,
                async: false,
                contentType: "application/json",
                dataType: 'jsonp',
                success: function(nullResponse) {
                    //document.getElementById('signinButton').setAttribute('style', 'display: block');
                    $rootScope.user = undefined;
                    $scope.$apply();
                },
                error: function(e) {
                    // Gestiona el error
                    // console.log(e);
                    // Puedes indicar a los usuarios que se desconecten de forma manual si se produce un error
                    // https://plus.google.com/apps
                }
            });
        };

        $rootScope.breadcrumbs = [{
            link: '#',
            title: 'Home'
        },{
            link: '#',
            title: 'Configuracion'
        }];
        
        $scope.notifications = [];
        $scope.save = function() {
            //$scope.user.settings.defaultValues = $scope.dv;      
            User.updateSettings($scope.user, function() {
                $scope.notifications.push({
                    type:'success',
                    title:'Configuracion guardada!',
                    text:'Tus cambios han sido guardados con exito!'
                });    
            });
            
        };
    });
    
    //index.controller("UserStatsCtrl",function($scope,User,$rootScope) {
    //    $scope.$watch('user',function() {
    //        $scope.stats = User.findStats();
    //    });
    //    
    //    $rootScope.breadcrumbs = [{
    //        link: '#',
    //        title: 'Home'
    //    },{
    //        link: '#',
    //        title: 'Estadisticas'
    //    }];
    //});
    
    index.controller("ShareController", function($scope) {
        $scope.recipe = Recipe.get({id:$routeParams.recipeId});
    });

    index.controller("MainController",function($scope,$rootScope) {
        $rootScope.breadcrumbs = [];
        
        $scope.login = function() {
            var button = $($($("#signinButton").children()[0]).children()[0])
            button.click();
        };
    });
    
    


    
    index.run(function($rootScope,version,$filter,$location,BrewCalc) {

        $rootScope.BrewCalc = BrewCalc;

        $rootScope.version = version;

        $rootScope.encodeName = function(name) {
            return encodeURIComponent(name);
        };
        
        $rootScope.sharedUrl = function(_id) {
            return 'http://'+$location.host() + ":" + $location.port() + '/share.html#/' + _id;
        };
        
        $rootScope.formatDate = function(date) {
            date = new Date(date);
            //Fecha de hoy en segundos
            var today = new Date().getTime()/1000;
            //Fecha del comentario en segundos
            var dateSec = date.getTime()/1000;
            
            //Diferencia en segundos
            var diffSec = today-dateSec;
            
            if (diffSec<60) { // Si es menos de un minuto
                return "Hace menos de un minuto"
            } if (diffSec < (60*60)) { // Si es menos de una hora
                return "Hace " + Math.round(diffSec/60) + " minutos";
            } if (date.getDate() == new Date().getDate()) { //si aun es el mismo dia
                return "Hoy" + " hace " + Math.round(diffSec/60/60) + " horas";
            } if (date.getDate() == new Date().getDate()-1 ) { // Si fue durane el dia de ayer
                return "Ayer " + $filter('date')(date,'HH:mm');
            } else {
                return $filter('date')(date,'dd/MM/yyyy HH:mm');
            }
        };
    });

})();