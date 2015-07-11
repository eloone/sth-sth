(function(angular){
	angular.module('folio.components.tagList.controller', [
		'ui.router',
		'folio.components.tag.resource',
		'folio.components.alert.directive'
	])
	.controller('TagListCtrl', ['$scope', '$state', 'Tag', TagListCtrl]);

	function TagListCtrl($scope, $state, Tag) {
		$scope.tags = Tag.get();
	}

})(window.angular);