(function(angular){
	angular.module('folio.components.projectList.controller', [
		'ui.router',
		'folio.components.project.resource',
		'folio.components.alert.directive'
	])
	.controller('ProjectListCtrl', ['$scope', '$state', 'Project', ProjectListCtrl]);

	function ProjectListCtrl($scope, $state, Project) {
		$scope.projects = Project.get();
	}


})(window.angular);