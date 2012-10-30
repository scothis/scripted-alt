/*global curl:true*/
(function(curl) {

	var config = {
		baseUrl: '',
		pluginPath: 'curl/plugin',
		packages: [{"name":"curl","location":"lib/curl","main":"./src/curl"}]
		//paths: {
			// Configure paths here
		//}
	};

	curl(config, ['app/main']);

})(curl);