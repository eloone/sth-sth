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
		'$sce',
		ProjectCtrl]);

	function ProjectCtrl($scope, $state, Project, Tag, Upload, $http, $log, Upload, $timeout, $sce){
		$scope.$state = $state;
		$scope.message = {};
		$scope.project = {};
		$scope.allTags = [];
		$scope.selectedMedias = [];
		$scope.selectedDrafts = [];
		$scope.selectedPublished = [];
		$scope.insertedHtmlMedia = '';
		$scope.$sce = $sce;

		$scope.$on('$stateChangeSuccess', function(){
			$scope.message = {};

			if($state.current.name === 'root.project.create') {
				$scope.project = {};
			}
		});

		$scope.sortableOptions = {
			connectWith: '.connectedLists .list-inline'
		};

		$scope.xcenterPositions = [{name: 'center'}, {name: 'left'}, {name: 'right'}];

		$scope.minWidth = 994;
		$scope.minHeight = 500;
		$scope.$watch('freshlySelectedMedias', function(newVal){
			if(!newVal) return;
			var file = newVal[0];
			var fr = new FileReader;
            fr.onload = function () { // file is loaded
                var img = new Image;
                img.onload = function () {
					// image is loaded; sizes are available
                    if(img.width >= $scope.minWidth && img.height >= $scope.minHeight) {
                    	$scope.selectedMedias = newVal.concat($scope.selectedMedias);
                	} else {
                		alert('Image dimensions must be '+ $scope.minWidth +' x '+ $scope.minHeight +' px at minimum.' +
                		 ' Uploaded image is ' + img.width + ' x ' + img.height + '.');
                	}
                };

                img.src = fr.result; // is the data URL because called with readAsDataURL
            };

            fr.readAsDataURL(file);
		});

		$scope.$watch('projectThumb', function(newVal){
			if(!newVal) return;

			$scope.thumbToUpload = newVal[0];
		});

		$scope.cancelUpload = function(){
			$scope.selectedMedias = [];
		};

		if($state.params.id) {
			Project.get({id: $state.params.id}, function(project){
				$scope.project = project[0];
				$scope.project.date = new Date($scope.project.date);
console.log($scope.project)
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
		}else{
			Tag.get(function(tags){
					$scope.allTags = tags;
					$scope.project.tags = [];
				});
		}

		$scope.suggestedTags = [];
		$scope.tagSearch = '';

		$scope.addSuggestedTag = function(tag) {
			$scope.project.tags = $scope.project.tags || [];

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
	        theme: 'modern',
	        plugins: [
	            'advlist autolink lists link image charmap preview hr anchor pagebreak',
	            'searchreplace wordcount visualblocks visualchars code fullscreen',
	            'insertdatetime media nonbreaking save table contextmenu directionality',
	            'emoticons template paste textcolor'
	        ],
	        toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
	        toolbar2: 'print preview media | forecolor backcolor emoticons',
	        image_advtab: true,
	        height: '200px'
    	};

    	$scope.tinymceVideoOptions = {
    		format: 'raw',
    		trusted: true,
    		theme: 'modern',
	        plugins: ['media'],
	        toolbar1: 'media | bold italic | alignleft aligncenter alignright alignjustify',
	        height: '200px',
	        width: '500px',
	        extended_valid_elements : 'iframe[src|frameborder|style|scrolling|class|width|height|name|align|allowfullscreen]'
   		};

    	$scope.$watch('htmlMedia', function(newVal){
			if(!tinyMCE.activeEditor) return;

			$scope.insertedHtmlMedia = tinyMCE.activeEditor.getContent();
			$scope.previewHtmlMedia = $sce.trustAsHtml($scope.insertedHtmlMedia);
    	});

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

    	$scope.removeSelectedMedia = function(index){
    		$scope.selectedMedias.splice(index, 1);
    	};

    	$scope.addHtmlMedia = function(){
    		var media = {
    			caption: '',
    			html: $scope.insertedHtmlMedia,
    			type: 'html'
    		};

    		$scope.project.draftMedias.unshift(media);

    		$scope.htmlMedia = null;
    		$scope.showHtmlMedia = false;
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
	                	caption: '',
	                	//image/png, image/jpg
	                	type: res.data.contentType.split('/')[0]
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
    		$scope.message = {};

    		$scope.project.tags = $scope.project.tags.map(function(tag){
				return tag.trim();
			});

			var hasType = _.find($scope.project.tags, function(tag){
				return /app-type/.test(tag);
			});

			if(!hasType) {
				alert('Project is missing a type !');
				return;
			}

			_.forEach($scope.project.draftMedias, function(media){
				delete media.selected;
			});

			_.forEach($scope.project.publishedMedias, function(media){
				delete media.selected;
			});

    		var data = _.map($scope.project, function(value, key){

    			if(key === 'fullText'){
    				return {
    					name: key,
    					value: value,
    					excludeFromIndexes: true
    				};
    			}

    			return {
    				name: key,
    				value: value
    			};
    		});

    		//var project = new Project({id: $scope.project.id, data: data});
    		var params = {id: $scope.project.id, data: data};
    		if($state.current.name === 'root.project.create'){
	    		Project.save(params).$promise.then(function(res){
	    			var id = _.find(res, { name: 'id' });

	    			$state.go('root.project.edit', { id: id ? id.value : res.id });

	    			$scope.message.success = 'Project successfully created !';
	    		}, function(e) {
	    			$scope.message.error = 'Project not created. ' + e.statusText;
	    		});
    		}

    		if($state.current.name === 'root.project.edit'){
	    		Project.update(params).$promise.then(function(res){
	    			$scope.message.success = 'Project successfully updated !';
	    		}, function(e){
	    			$scope.message.error = 'Project not updated. ' + e.statusText;
	    		});
    		}
    	}

	}

})(window.angular);