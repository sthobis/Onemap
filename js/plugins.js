// init Namespace
var Xtremap = Xtremap || {};

// module namespace
Xtremap.UIComponents = function( customSetting ) {

	// Onemap module-scoped variable
	var OneMap;
	var mashup;
	var themeGraphicsLayer;
	var gra;

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
			//drawOverlay();
		} 
	}

	// method to draw overlay on top of created map
	var drawOverlay = function() {

		// Check if map is ready
		if (OneMap.overlayKML) {
			//OneMap.overlayKML('data/dengue.kml');
			OverlayTheme();
		} else {
			setTimeout(drawOverlay, 100);
		}
	}


	var OverlayTheme = function() {
	//debugger;

		var themeName = "Museum";

		if (themeName == "") {
			alert('Please provide theme name')
			return
		}

		mashup = new MashupData();
		mashup.themeName = themeName;
		mashup.extent = OneMap.map.extent.xmin + "," + OneMap.map.extent.ymin + "," + OneMap.map.extent.xmax + "," + OneMap.map.extent.ymax;

		//add graphic layer
		themeGraphicsLayer = new OneMap.GraphicsLayer(); ; //OneMap.GraphicsLayer();
		themeGraphicsLayer.id = themeName;
		OneMap.map.addLayer(themeGraphicsLayer);

		mashup.GetMashupData(overlayData);

		//resize info widnow
		OneMap.map.infoWindow.resize(300, 200);
		OneMap.map.infoWindow.hide();
		OneMap.onOneMapExtentChange(OverlayThemeOnExtentChnage)
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

	var OverlayThemeOnExtentChnage = function(extent) {
	//debugger

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
				polygon = new OneMap.Polygon(new OneMap.SpatialReference({ wkid: 3414 }));

				for (var x = 0; x < results[i].XY.split("|").length; x++) {
					xCord = results[i].XY.split("|")[x].split(",")[0];
					yCord = results[i].XY.split("|")[x].split(",")[1];

					var PointLocation = new OneMap.Point(xCord, yCord, new OneMap.SpatialReference({ wkid: 3414 }))
					pntArr.push(PointLocation);
				}
				polygon.addRing(pntArr);

				gra = new OneMap.Graphic;
				gra.geometry = polygon;
				gra.attributes = results[i];

				var sfs = new OneMap.SimpleFillSymbol(OneMap.SimpleFillSymbol.STYLE_SOLID,
					  new OneMap.SimpleLineSymbol(OneMap.SimpleLineSymbol.STYLE_SOLID,
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
				pLine = new OneMap.Geometry.Polyline(new OneMap.SpatialReference({ wkid: 3414 }));

				for (var x = 0; x < results[i].XY.split("|").length; x++) {
					xCord = results[i].XY.split("|")[x].split(",")[0];
					yCord = results[i].XY.split("|")[x].split(",")[1];

					var PointLocation = new OneMap.Point(xCord, yCord, new OneMap.SpatialReference({ wkid: 3414 }))
					pntArr.push(PointLocation);
				}
				pLine.addPath(pntArr);

				gra = new OneMap.Graphic;
				gra.geometry = pLine;
				gra.attributes = results[i];

				var sfs = new OneMap.SimpleLineSymbol(OneMap.SimpleLineSymbol.STYLE_SOLID,
					  new dojo.Color([r, g, b]), 2);
				gra.symbol = sfs;
				themeGraphicsLayer.add(gra);
			}
		}

		//var aa = themeGraphicsLayer;
	}

}