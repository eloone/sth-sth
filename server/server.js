'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var app = module.exports.app = express();
var api = module.exports.api = express();
var apiRouter = require('./api/api.router');
var documentApi = require('./api/document.api');
var uploadApi = require('./api/upload.api');
var projectsApi = documentApi({
  kind: 'Portfolio',
  kindName: 'projects',
  entity: 'project'
});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');

var tagsApi = documentApi({
  kind: 'Portfolio',
  kindName: 'tags',
  entity: 'tag'
});

var usersApi = documentApi({
  kind: 'Portfolio',
  kindName: 'users',
  entity: 'user'
});

api.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'overwhelmed cat'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done){
  usersApi.get(username, function(err, res){
    var user = res[0];
    if(user.password === password){
      return done(null, { authenticated: true });
    } else{
      return done(null, false, { message: 'Incorrect credentials' });
    }
  });
}));

app.use('/api', api);

app.use('/assets', serveStatic(path.join(__dirname, '..', 'client', 'assets')));
app.use('/assets/components', serveStatic(path.join(__dirname, '..', 'bower_components')));
app.use('/app', serveStatic(path.join(__dirname, '..', 'client', 'app')));

apiRouter.setApiRouter('projects', api, projectsApi);
apiRouter.setApiRouter('tags', api, tagsApi);
uploadApi.setApiRouter(api);

app.post('/api/login', passport.authenticate('local'), function(req, res){
  res.send({
    authenticated: true
  })
});

app.get('/api/login', function(req, res){
  res.send(req.user);
});

app.get('/api/logout', function(req, res){
  req.logout();
  res.send({ authenticated: false });
});

// Respond to the App Engine health check
app.get('/_ah/health', function(req, res) {
  res.status(200)
    .set('Content-Type', 'text/plain')
    .send('ok');
});
//test
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});
