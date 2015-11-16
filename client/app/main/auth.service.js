(function(angular){
	angular.module('folio.main.auth', [])
	.factory('Auth', ['$http', '$rootScope', '$state', '$log', Factory]);

	function Factory($http, $rootScope, $state, $log) {
		function Service(){
			this.authenticate = function(){
				return $http.get('/api/login');
			};

			this.logout = function(){
				return $http.get('/api/logout');
			};
		}

		return new Service();
	}

})(window.angular);