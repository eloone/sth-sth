'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var app = module.exports.app = express();
var api = module.exports.api = express();
var setApiRouter = require('./api/api.router');
var documentApi = require('./api/document.api');
var projectsApi = documentApi({
  kind: 'Portfolio',
  kindName: 'projects',
  entity: 'project'
});

var tagsApi = documentApi({
  kind: 'Portfolio',
  kindName: 'tags',
  entity: 'tag'
});

api.use(bodyParser.json());

app.use('/api', api);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.use('/assets', serveStatic(path.join(__dirname, '..', 'client', 'assets')));
app.use('/assets/components', serveStatic(path.join(__dirname, '..', 'bower_components')));

setApiRouter('projects', api, projectsApi);
setApiRouter('tags', api, tagsApi);

// Respond to the App Engine health check
app.get('/_ah/health', function(req, res) {
  res.status(200)
    .set('Content-Type', 'text/plain')
    .send('ok');
});
