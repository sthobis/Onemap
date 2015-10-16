// init Namespace
var XtrOnemap = XtrOnemap || {};

// module namespace
XtrOnemap.UIComponents = function( customSetting ) {

	// module-scoped vars
	var OneMap; // main map
	var mashup; // overlay
	var themeGraphicsLayer; // overlay layer
	var gra; // graphic utilities

	// overwrite default settings
	var settings = $.extend( {
	}, 
	customSetting || {});

	this.init = function() {

		// init main map from API
		initOneMap();

		// draw overlay on top of main map
		drawOverlay();
	}

	// method to initialize map by calling API
	var initOneMap = function() {

		// Check if container exist
		if ($('#map-container').length) {
			OneMap = new GetOneMap('map-container', 'sm');
		} 
	}

	// method to draw overlay on top of created map
	var drawOverlay = function() {

		// Check if map is ready
		if (OneMap.overlayKML) {
			// using custom file
			//OneMap.overlayKML('data/dengue.kml');

			// using OneMap mashup/theme data API
			overlayTheme("DENGUE_CLUSTER");
		} else {
			setTimeout(drawOverlay, 100);
		}
	}

	var overlayTheme = function(inputTheme) {

		// init theme
		var themeName = inputTheme;
		mashup = new MashupData();
		mashup.themeName = themeName;
		mashup.extent = OneMap.map.extent.xmin + "," + OneMap.map.extent.ymin + "," + OneMap.map.extent.xmax + "," + OneMap.map.extent.ymax;

		//add graphic layer
		themeGraphicsLayer = new esri.layers.GraphicsLayer();
		themeGraphicsLayer.id = themeName;
		OneMap.map.addLayer(themeGraphicsLayer);
		mashup.GetMashupData(overlayData);

		//resize info widnow
		OneMap.map.infoWindow.resize(300, 200);
		OneMap.map.infoWindow.hide();
		OneMap.onOneMapExtentChange(overlayThemeOnExtentChange)
		
		try {
			//set graphic onclick event
			dojo.connect(themeGraphicsLayer, "onClick", function (evt) {//debugger
				mashup.GetDataForCallout(evt.graphic, "", function (results) {//debugger
					var formattedResults = mashup.formatResultsEnhanced(results); //mashup.formatResults(results);
					OneMap.map.infoWindow.setTitle(themeName);
					OneMap.map.infoWindow.setContent(formattedResults);
					OneMap.map.infoWindow.show(evt.screenPoint, OneMap.map.getInfoWindowAnchor(evt.screenPoint));
				});
			})
		}
		catch (err) { 

		}
	}

	var overlayThemeOnExtentChange = function(extent) {
		mashup.extent = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
		mashup.GetMashupData(overlayData)
	}

	var overlayData = function(mashupResults) {
		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}
		var results = mashupResults.results;

		if (results == "No results") {
			alert("Theme not found. Please check theme name.");
			return
		}

		var featcount = mashupResults.count;
		var iconPath = mashupResults.iconPath
		var featType = mashupResults.featType;
		themeGraphicsLayer.clear();
		var i;
		var xPnt;
		var yPnt;
		var xCord;
		var yCord;

		var pntArr = new Array();

		if (results.length == 0) {
			return
		}

		if (featType == "Point") {
			//process all the results
			for (i = 0; i < results.length; i++) {

				//create point graphic on map using generatePointGraphic function
				var PointGraphic = generatePointGraphic(results[i].XY, results[i].ICON_NAME, iconPath)
				//set graphic attributes
				PointGraphic.attributes = results[i]
				//add newly created graphic in graphiclayer
				themeGraphicsLayer.add(PointGraphic);
			}
		}
		else if (featType == "Polygon") {
			var polygon;
			for (i = 0; i < results.length; i++) {
				if (mashupResults.results[i].SYMBOLCOLOR != undefined && mashupResults.results[i].SYMBOLCOLOR != "") {
					var polyColor = mashupResults.results[i].SYMBOLCOLOR;
					var r = hexToRgb(polyColor).r;
					var g = hexToRgb(polyColor).g;
					var b = hexToRgb(polyColor).b;
				}
				else if (mashupResults.results[i].SYMBOLCOLOR == "") {
					var r = 0;
					var g = 0;
					var b = 0;
				}
				pntArr = [];
				polygon = new esri.geometry.Polygon(new esri.SpatialReference({wkid:3414}));

				for (var x = 0; x < results[i].XY.split("|").length; x++) {
					xCord = results[i].XY.split("|")[x].split(",")[0];
					yCord = results[i].XY.split("|")[x].split(",")[1];

					var PointLocation = new esri.geometry.Point(xCord, yCord, new esri.SpatialReference({ wkid: 3414 }))
					pntArr.push(PointLocation);
				}
				polygon.addRing(pntArr);

				gra = new esri.Graphic;
				gra.geometry = polygon;
				gra.attributes = results[i];

				var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
					  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
					  new dojo.Color([0, 0, 0]), 2), new dojo.Color([r, g, b, 0.8]));

				gra.symbol = sfs;
				themeGraphicsLayer.add(gra);
			}
		}
		else if (featType == "Line") {
			var pLine;
			for (i = 0; i < results.length; i++) {
				if (mashupResults.results[i].SYMBOLCOLOR != undefined && mashupResults.results[i].SYMBOLCOLOR != "") {
					var polyColor = mashupResults.results[i].SYMBOLCOLOR;
					var r = hexToRgb(polyColor).r;
					var g = hexToRgb(polyColor).g;
					var b = hexToRgb(polyColor).b;
				}
				else if (mashupResults.results[i].SYMBOLCOLOR == "") {
					var r = 0;
					var g = 0;
					var b = 0;
				}
				pntArr = [];
				pLine = new esri.geometry.Polyline(new esri.SpatialReference({wkid:3414}));

				for (var x = 0; x < results[i].XY.split("|").length; x++) {
					xCord = results[i].XY.split("|")[x].split(",")[0];
					yCord = results[i].XY.split("|")[x].split(",")[1];

					var PointLocation = new esri.geometry.Point(xCord, yCord, new esri.SpatialReference({ wkid: 3414 }))
					pntArr.push(PointLocation);
				}
				pLine.addPath(pntArr);

				gra = new esri.Graphic;
				gra.geometry = pLine;
				gra.attributes = results[i];

				var sfs = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
					  new dojo.Color([r, g, b]), 2);
				gra.symbol = sfs;
				themeGraphicsLayer.add(gra);
			}
		}

	}

}