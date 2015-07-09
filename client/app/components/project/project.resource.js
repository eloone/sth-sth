(function(angular){
	angular.module('folio.components.project.resource', ['ngResource'])
	.factory('Project', ['$resource', ProjectResource]);

	function ProjectResource($resource) {
		return $resource('/api/projects/:id', {id: '@id'}, {
			get: { method : 'GET', isArray: true},
			update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' }}
		});
	}

})(window.angular);