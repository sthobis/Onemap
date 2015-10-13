// init Namespace
var Xtremap = Xtremap || {};

// module namespace
Xtremap.UIComponents = function( customSetting ) {

	// overwrite default settings
	var settings = $.extend( {

	}, 
	customSetting || {});

	this.init = function() {

		// init main map from API
		initOneMap();
	}

	// method to initialize map by calling API
	var initOneMap = function() {

		var OneMap = new GetOneMap('map-container', 'sm');
	}
}