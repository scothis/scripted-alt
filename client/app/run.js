/*global curl:true*/
(function(curl) {

	var config = {
		baseUrl: '',
		pluginPath: 'curl/plugin',
		packages: [
			{ name: 'curl', location: 'lib/curl', main: './src/curl' },
			{ name: 'rest', location: 'lib/rest', main: 'rest' },
			{ name: 'when', location: 'lib/when', main: 'when' }
		]
		//paths: {
			// Configure paths here
		//}
	};

	curl(config, ['app/main']);

})(curl);