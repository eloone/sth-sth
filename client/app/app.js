(function(angular){
	angular.module('folio', [
		'ui.router',
		'folio.main.routes',
		'folio.components'
	])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){
		 $locationProvider.html5Mode(true);
	});
})(window.angular);