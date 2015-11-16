var server = require('./server/server');
var app = server.app;
var appEnv = process.env.APP_ENV || 'development';
var PORT = appEnv === 'production' ? 8080 : 8081;

app.listen(PORT, function(){
	console.log('Server running on ' + PORT);
});
