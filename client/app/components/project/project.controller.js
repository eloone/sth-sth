(function(angular){
	angular.module('folio.components.project.controller', [
		'ui.router',
		'ui.tinymce',
		'folio.components.project.resource',
		'folio.components.tag.resource',
		'folio.components.alert.directive',
		'ngFileUpload',
		'ui.sortable'
	])
	.controller('ProjectCtrl', [
		'$scope',
		'$state',
		'Project',
		'Tag',
		'Upload',
		'$http',
		'$log',
		'Upload',
		'$timeout',
		ProjectCtrl]);

	function ProjectCtrl($scope, $state, Project, Tag, Upload, $http, $log, Upload, $timeout){
		$scope.$state = $state;
		$scope.message = {};
		$scope.project = {};
		$scope.allTags = [];
		$scope.selectedMedias = [];
		$scope.selectedDrafts = [];
		$scope.selectedPublished = [];

		$scope.sortableOptions = {
			connectWith: '.connectedLists .list-inline'
		};

		$scope.$watch('freshlySelectedMedias', function(newVal){
			if(!newVal) return;

			$scope.selectedMedias = newVal.concat($scope.selectedMedias);
		});

		$scope.$watch('projectThumb', function(newVal){
			if(!newVal) return;

			$scope.thumbToUpload = newVal[0];
		});

		if($state.params.id) {
			Project.get({id: $state.params.id}, function(project){
				$scope.project = project[0];
				$scope.project.date = new Date($scope.project.date);

				Tag.get(function(tags){
					$scope.allTags = tags;
					$scope.project.tags = _.filter($scope.project.tags, function(tag){
						return _.find($scope.allTags, {name: tag});
					});
				});

			}, function(e) {
				if(e.status === 404) {
					$state.go('root.404');
					return;
				}

				if(e.status !== 200) {
					$state.go('root.error');
				}
			});
		}

		$scope.suggestedTags = [];
		$scope.tagSearch = '';

		$scope.addSuggestedTag = function(tag) {
			uniqPushTo($scope.project.tags, tag);
			_.remove($scope.suggestedTags, function(suggestedTag){
				return suggestedTag === tag;
			});
		};

		$scope.removeTag = function(removedTag) {
			_.remove($scope.project.tags, function(tag){
				return removedTag === tag;
			});
		};

		function uniqPushTo(array, value){
			if(_.includes(array, value)) return;

			array.push(value);
		}

		$scope.$watch('tagSearch', function(newVal){

			if(_.isUndefined(newVal)) return;
			if(_.isEmpty(newVal)) {
				$scope.suggestedTags = [];
				return;
			}

			if(newVal.length > 2) {
				$scope.allTags.map(function(tag){
					if(s(tag.name).startsWith(newVal)) {
						uniqPushTo($scope.suggestedTags,tag.name);
						$scope.suggestedTags = _.filter($scope.suggestedTags, function(tag){
							return !_.includes($scope.project.tags, tag);
						});
					}
				});
			}

		});

		$scope.tinymceOptions = {
	        theme: "modern",
	        plugins: [
	            "advlist autolink lists link image charmap preview hr anchor pagebreak",
	            "searchreplace wordcount visualblocks visualchars code fullscreen",
	            "insertdatetime media nonbreaking save table contextmenu directionality",
	            "emoticons template paste textcolor"
	        ],
	        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
	        toolbar2: "print preview media | forecolor backcolor emoticons",
	        image_advtab: true,
	        height: "200px"
    	};

    	$scope.cancelReplaceThumbnail = function(){
    		$scope.thumbToUpload = null;
    	};

    	$scope.deleteThumb = function(){
    		$scope.project.thumbLink = null;
    	};

    	$scope.removeDraftMedia = function(index){
    		$scope.project.draftMedias.splice(index, 1);
    	};

    	$scope.removePublishedMedia = function(index){
    		$scope.project.publishedMedias.splice(index, 1);
    	};

    	$scope.selectDraftMedia = function(index){
    		// Toggle selection
    		$scope.project.draftMedias[index].selected = !$scope.project.draftMedias[index].selected;
    		if(_.contains($scope.selectedDrafts, index)){
    			_.pull($scope.selectedDrafts, index);
    		}else{
    			$scope.selectedDrafts.push(index);
    		}
    	};

    	$scope.selectPublishedMedia = function(index){
    		// Toggle selection
    		$scope.project.publishedMedias[index].selected = !$scope.project.publishedMedias[index].selected;
    		if(_.contains($scope.selectedPublished, index)){
    			_.pull($scope.selectedPublished, index);
    		}else{
    			$scope.selectedPublished.push(index);
    		}
    	};

    	$scope.removeMediasFromProject = function(){
    		addToCollection('selectedPublished', 'publishedMedias', 'draftMedias');
    	};

    	$scope.selectAllPublishedMedias = function(){
    		_.forEach($scope.project.publishedMedias, function(media, index){
    			media.selected = true;
    			$scope.selectedPublished.push(index);
    		});
    	};

    	$scope.selectAllDraftMedias = function(){
    		_.forEach($scope.project.draftMedias, function(media, index){
    			media.selected = true;
    			$scope.selectedDrafts.push(index);
    		});
    	};

    	$scope.addMediasToProject = function(){
    		addToCollection('selectedDrafts', 'draftMedias', 'publishedMedias');
    	};

    	function addToCollection(indexArrayPty, fromProjectPty, toProjectPty){
    		$scope[indexArrayPty].sort();

    		_.forEach($scope[indexArrayPty], function(selectedIndex){
    			var selectedDraft = _.chain($scope.project[fromProjectPty].slice(selectedIndex, selectedIndex + 1))
    				.first()
    				.omit('selected')
    				.value();

    			if(!_.isArray($scope.project[toProjectPty])){
    				$scope.project[toProjectPty] = [];
    			}

    			$scope.project[toProjectPty].push(selectedDraft);
    		});

    		$scope.project[fromProjectPty] = _.filter($scope.project[fromProjectPty], function(media, i){
    			return !media.selected;
    		});

    		$scope[indexArrayPty] = [];
    	}

    	$scope.uploadSelectedMedias = function(){
    		var medias = $scope.selectedMedias;

    		if (medias !== null) {
	            for (var i = 0; i < medias.length; i++) {
	                $scope.errorMsg = null;
	                (function (media) {
	                    uploadMedia(media);
	                })(medias[i]);
	            }
        	}
    	};

    	function uploadMedia(file){
    		var filename = _.snakeCase($scope.project.title) + '_' + file.name;

	    	file.upload = Upload.upload({
	            url: '/api/upload/medias',
	            method: 'POST',
	            fields: {
	            	filename: filename
	            },
	            file: file,
	        });

	        file.upload.then(function (res) {
	            $timeout(function () {

	                ($scope.project.draftMedias = $scope.project.draftMedias || []).unshift({
	                	publicLink: res.data.publicLink,
	                	caption: ''
	                });

	                // Remove media from selected medias if successfully uploaded
	                $scope.selectedMedias = _.filter($scope.selectedMedias, function(media){
	                	var reg = new RegExp(media.name + '$');
	                	return !reg.test(res.data.name);
	                });

	                saveProject();

	            });
	        }, function (response) {
	            if (response.status > 0)
	                $scope.errorMsg = response.status + ': ' + response.data;
	        });

	        file.upload.progress(function (evt) {
	            // Math.min is to fix IE which reports 200% sometimes
	            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
	        });
    	}

    	$scope.submit = function(){

			// If there is a thumb to upload
	    	if($scope.thumbToUpload){
	    		var originalName = $scope.thumbToUpload.name;
	    		var filename = _.snakeCase($scope.project.title) + '_thumb_' + originalName;

	    		Upload.upload({
	    			url: '/api/upload/thumb',
	    			fields: {
	    				filename: filename
	    			},
	    			file: $scope.thumbToUpload
	    		}).success(function(thumbMetadata){
	    			$scope.project.thumbLink = thumbMetadata.publicLink;
	    			$scope.thumbToUpload = null;
	    			saveProject();
	    		}).error(function(err){
	    			$log.error(err);
	    		});
	    	}else{
	    		saveProject();
	    	}

    	};

    	function saveProject(){
    		$scope.project.tags = $scope.project.tags.map(function(tag){
				return tag.trim();
			});

			_.forEach($scope.project.draftMedias, function(media){
				delete media.selected;
			});

    		var project = new Project($scope.project);

    		if($state.current.name === 'root.project.create'){
	    		project.$save().then(function(result){
	    			$state.go('root.project.edit', {id: result.id});

	    			$scope.message.success = 'Project successfully created !';
	    		}, function(e) {
	    			$scope.message.error = 'Project not created. ' + e.statusText;
	    		});
    		}

    		if($state.current.name === 'root.project.edit'){
	    		project.$update().then(function(result){
	    			$scope.project = result;
	    			$scope.project.date = new Date(result.date);

	    			$scope.message.success = 'Project successfully updated !';
	    		}, function(e){
	    			$scope.message.error = 'Project not updated. ' + e.statusText;
	    		});
    		}
    	}

	}

})(window.angular);