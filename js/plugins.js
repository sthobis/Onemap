// init Namespace
var Xtremap = Xtremap || {};

// module namespace
Xtremap.UIComponents = function( customSetting ) {

	// Onemap module-scoped variable
	var OneMap;

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

		// Check if container exist
		if ($('#map-container').length) {
			OneMap = new GetOneMap('map-container', 'sm');
			drawOverlay();
		} 
	}

	// method to draw overlay on top of created map
	var drawOverlay = function() {

		// Check if map is ready
		if (OneMap.overlayKML) {
			OneMap.overlayKML('data/dengue.kml');
		} else {
			setTimeout(drawOverlay, 100);
		}
	}
}