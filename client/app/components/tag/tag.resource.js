(function(angular){
	angular.module('folio.components.tag.resource', ['ngResource'])
	.factory('Tag', ['$resource', TagResource]);

	function TagResource($resource) {
		return $resource('/api/tags/:id', {id: '@id'}, {
			get: { method : 'GET', isArray: true},
			update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' }}
		});
	}

})(window.angular);