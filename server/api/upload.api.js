
var fs = require('fs');
var path = require('path');
var apiRouter = require('./api.router');
var projectId = process.env.GAE_LONG_APP_ID || process.env.DATASET_ID || 'portfolio-997';
var formidable = require('formidable');
/*var gcloud = require('gcloud')({
  projectId: projectId,
  credentials: require('../../key.json')
});
console.log(gcloud);
*/


var gcloud = require('gcloud')({
  projectId: 'portfolio-997',
  // Specify a path to a keyfile.
  keyFilename: path.resolve(__dirname, '..', '..', 'key.json')
});
console.log(path.resolve(__dirname, '..', '..', 'key.json'));
var storage = gcloud.storage();
// Reference an existing bucket.
var bucketThumbs = storage.bucket('portfolio-thumbs');

// Download a remote file to a new local file.
//bucket.file('photo.jpg').createReadStream().pipe(fs.createWriteStream('/local/photo.jpg'));

module.exports = {
	setApiRouter: function(api){
		api.post('/upload/thumb', function(req, res) {
	  		var form = new formidable.IncomingForm();
 
form.onPart = function(part) {
  part.pipe(bucketThumbs.file('ok').createWriteStream())
		.on('error', function(err){
			res.send(err);
		})
		.on('complete', function(metadata){
			console.log('metedata', metadata);
			res.end(require('util').inspect({fields: fields, files: files}));
		});
}

    form.parse(req, function(err, fields, files) {
      //res.writeHead(200, {'content-type': 'text/plain'});
      //res.write('received upload:\n\n');
      

/*fs.createReadStream(files.file.path+'/'+files.file.name)
		.pipe(bucketThumbs.file(files.file.name).createWriteStream())
		.on('error', function(err){
			res.send(err);
		})
		.on('complete', function(metadata){
			console.log('metedata', metadata);
			res.end(require('util').inspect({fields: fields, files: files}));
		});*/

    });
	  		//uploadThumb(req.body, apiRouter.handleApiResponse(res, 201));
		});
	}
};

function uploadThumb(reqBody, callback) {
	var filePath = reqBody.filePath;
	var filename = reqBody.filename;
	// Upload a local file to a new file to be created in your bucket.
	fs.createReadStream(filePath)
		.pipe(bucketThumbs.file(filename).createWriteStream())
		.on('error', function(err){
			callback(err);
		})
		.on('complete', function(metadata){
			console.log('metedata', metadata);
			callback(null, metadata);
		});
}