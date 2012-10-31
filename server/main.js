/*jshint es5:true, node:true*/
var http, fs, express, path, host, port, app;

http = require('http');
fs = require('fs');
express = require('express');

path = process.env.PWD + '/client';
host = '127.0.0.1';
port = 8000; // 7261

app = express();

app.configure(function() {
	app.use(app.router);
	app.use(express.static(path));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});


app.param('secureRandom', function (req, res, next, val, param) {
	// TODO: translate secureRandom value into file system path
	if (/^[a-f0-9]{8,}$/.test(val)) {
		req.params['securePath'] = val;
		next();
	}
	else {
		next('route');
	}
});


/*
 * GET http://localhost:7261/
 *
 * Scripted hello world, overview
 */
// handled by `client/app/index.html`


/*
 * GET http://localhost:7261/resources/**
 *
 * Static resources, shared across all projects
 */
// handled by `app.use(express.static(path));` but with /app for custom code and /lib for libraries


/*
 * GET http://localhost:7261/{secureRandom}/{filePath}
 *
 * Bootstrap page for the project editor
 *
 * Path segments:
 * - secureRandom: unguessable token that maps to a location on the file system
 * - filePath: [optional] file within the project to open by default
 *
 * Response Codes:
 * - 200: the editor bootstrap
 * - 403: the secure random is unknown/untrusted
 */
app.get('/:secureRandom/:filePath(*)', function (req, res) {
	var securePath, filePath;
	securePath = req.params.securePath;
	filePath = '/' + req.params.filePath;
	res.end('Editor: ' + filePath + ' within ' + securePath);
});


/*
 * GET http://localhost:7261/files/{secureRandom}/{filePath}
 *
 * Load a file resource
 *
 * Path segments:
 * - secureRandom: unguessable token that maps to a location on the file system
 * - filePath: the path on the file system relative to it's container
 *
 * Content-Types:
 * - application/vnd.scripted.raw: raw file content
 * - application/vmc.scripted.directory: directory listing
 * - application/vnd.scripted.lint: linter output for the resource
 * - application/vnd.scripted.dependencies: list of dependent resources
 *
 * Response Codes:
 * - 200: file content
 * - 403: secure random is unknown/untrusted
 * - 404: file does not exsist
 * - 406: not acceptable
 */
 app.get('/files/:secureRandom/:filePath(*)', function (req, res) {
	var secureRandom, filePath;
	secureRandom = req.params.secureRandom;
	filePath = '/' + req.params.filePath;
	fs.stat(filePath, function (err, stats) {
		if (err || (!stats.isDirectory() && !stats.isFile())) {
			// TODO inspect error code before assuming a 404
			// TODO determine impact of soft/hard links, sockets, etc
			res.status(404);
			res.end();
		}
		else if (stats.isDirectory()) {
			fs.readdir(filePath, function (err, files) {
				res.set('Content-Type', 'application/vnd.scripted.directory');
				// TODO include stats/isDirectory/isFile for each file
				res.end(JSON.stringify(files));
			});
		}
		else if (req.accepts('application/vnd.scripted.raw')) {
			res.set('Content-Type', 'application/vnd.scripted.raw');
			res.sendfile(filePath);
		}
		else if (req.accepts('application/vnd.scripted.lint')) {
			res.end('Lint: ' + filePath + ' within ' + secureRandom);
		}
		else if (req.accepts('application/vnd.scripted.dependencies')) {
			res.end('Deps: ' + filePath + ' within ' + secureRandom);
		}
		else {
			// not acceptable
			res.status(406);
			res.end();
		}
	});
});


//PUT http://localhost:7261/files/{secureRandom}/{filePath}
//
//  Save a file resource
//
//  Path segments:
//  - secureRandom: unguessable token that maps to a location on the file system
//  - filePath: the path on the file system relative to it's container
//
//  Content-Types:
//  - application/vnd.scripted.raw: the raw file content
//
//  Response Codes:
//  - 201: file saved
//  - 403: secure random is unknown/untrusted
//  - 409: file has changed on disk since it was loaded


//DELETE http://localhost:7261/files/{secureRandom}/{filePath}
//
//  Delete a file within a project
//
//  Response Codes:
//  - 204: deleted
//  - 403: secure random is unknown/untrusted
//  - 404: file does not exsist
//  - 409: file has changed on disk since it was loaded


//GET http://localhost:7261/preferences/{secureRandom}
//
//  The project preferences
//
//  Path segments:
//  - secureRandom: unguessable token that maps to a location on the file system
//
//  Content-Types:
//  - application/vnd.scripted.preferences: scripted preferences
//
//  Response Codes:
//  - 200: preferences
//  - 403: secure random is unknown/untrusted


//GET http://localhost:7261/commands/{secureRandom}
//
//  List of available commands to run for the project
//
//  Path segments:
//  - secureRandom: unguessable token that maps to a location on the file system
//
//  Content-Types:
//  - application/vnd.scripted.commands: project commands list
//
//  Response Codes:
//  - 200: commands
//  - 403: secure random is unknown/untrusted


//POST http://localhost:7261/commands/{secureRandom}/{command}
//
//  Execute the desired command.  The response should be chunked to give the user the most up to date console output.  WebSockets may also be appropriate.
//
//  Path segments:
//  - secureRandom: unguessable token that maps to a location on the file system
//  - command: the command to execute
//
//  Content-Types:
//  - application/vnd.scripted.console: console output from the command execution
//
//  Response Codes:
//  - 200: commands
//  - 403: secure random is unknown/untrusted
//  - 404: the command is undefined


//(http|ws)://localhost:7261/events/{secureRandom}
//
//  Reserved for future use
//
//  Possible uses:
//  - presence detection
//  - notification of file system changes
//  - realtime peer collaberation
//
//  Path segments:
//  - secureRandom: unguessable token that maps to a location on the file system



console.log("Serving @ " + host + ":" + port + " (" + path + ")");
app.listen(port, host);
