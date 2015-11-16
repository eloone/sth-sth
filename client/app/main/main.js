(function(angular){
	angular.module('folio.main', [
		'folio.main.auth',
		'folio.main.login',
		'folio.main.routes',
		'folio.main.navbar.directive'
	]);
})(window.angular);