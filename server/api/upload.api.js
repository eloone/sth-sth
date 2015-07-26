
var fs = require('fs');
var path = require('path');
var apiRouter = require('./api.router');
var projectId = process.env.GAE_LONG_APP_ID || process.env.DATASET_ID || 'portfolio-997';
var formidable = require('formidable');
var config = require('../config.json');

var gcloud = require('gcloud')({
  projectId: 'portfolio-997',
  // Specify a path to a keyfile.
  keyFilename: path.resolve(__dirname, '..', '..', 'key.json')
});

var storage = gcloud.storage();
// Reference an existing bucket.
var bucketThumbs = storage.bucket('folio-assets');
var thumbFolder = 'thumbs';
var mediasFolder = 'medias';

module.exports = {
	setApiRouter: function(api){
		api.post('/upload/thumb', uploadThumb);
		api.post('/upload/medias', uploadMedias);
	}
};

function uploadMedias(req, res){
	var settings = {
		bucketPath: mediasFolder,
		onComplete: function(metadata){
			metadata.publicLink = [config.storageUrl, metadata.bucket, metadata.name].join('/');
		}
	};

	uploadToGCS(req, res, settings);
}

function uploadThumb(req, res){
	var settings = {
		bucketPath: thumbFolder,
		onComplete: function(metadata){
			metadata.publicLink = [config.storageUrl, metadata.bucket, metadata.name].join('/');
		}
	};

	uploadToGCS(req, res, settings);
}

function uploadToGCS(req, res, settings){
	var form = new formidable.IncomingForm();
	var filename;

	form.parse(req, function(err/*, fields, files*/){
		if(err) res.send(err);
	});

	form.on('error', function(err){
		res.send(err);
	});

	form.onPart = function(multipartStream) {

		if(multipartStream.name === 'filename'){
			multipartStream.on('data', function(data){
				filename = data.toString();
			});
		}

		if(multipartStream.name === 'file'){
			if(!filename) {
				return res.status(500)
				.send({error: 'File upload: filename is missing for Google Cloud Storage'});
			}

			var bucketFile = bucketThumbs.file([settings.bucketPath, filename].join('/'));

			multipartStream.pipe(bucketFile.createWriteStream())
			.on('error', function(err){
				res.status(500).send(err);
			})
			.on('complete', function(metadata){
				console.log('metedata', metadata);

				settings.onComplete(metadata);

				bucketFile.makePublic(function(err){
					if(err){
						console.log('GCS: Failed to make file public', err);
					}

					res.send(metadata);

				});

			});
		}
	};
}

/*function uploadThumb(req, res){
  	var form = new formidable.IncomingForm();
	var filename;

	form.parse(req, function(err, fields, files){
		if(err) res.send(err);
	});

	form.on('error', function(err){
		res.send(err);
	});

	form.onPart = function(multipartStream) {

		if(multipartStream.name === 'filename'){
			multipartStream.on('data', function(data){
				filename = data.toString();
			});
		}

		if(multipartStream.name === 'file'){
			if(!filename) {
				return res.status(500)
				.send({error: 'File upload: filename is missing for Google Cloud Storage'});
			}

			var bucketFile = bucketThumbs.file([thumbFolder, filename].join('/'));

			multipartStream.pipe(bucketFile.createWriteStream())
			.on('error', function(err){
				res.status(500).send(err);
			})
			.on('complete', function(metadata){
				console.log('metedata', metadata);

				metadata.publicLink = [config.storageUrl, metadata.bucket, metadata.name].join('/');

				bucketFile.makePublic(function(err){
					if(err){
						console.log('GCS: Failed to make file public', err);
					}

					res.send({ data: metadata });

				});

			});
		}
	};
}*/
