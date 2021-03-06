// init Namespace
var XtrOnemap = XtrOnemap || {};

// module namespace
XtrOnemap.UIComponents = function( customSetting ) {

	// module-scoped vars
	var OneMap; // main map
	var mashup; // overlay
	var themeGraphicsLayer; // overlay layer
	var gra; // graphic utilities
	var shapefileData;

	// overwrite default settings
	var settings = $.extend( {
	}, 
	customSetting || {});

	this.init = function() {

		// init main map from API
		initOneMap();

		// load shapefile data
		loadShapefile();

		// draw overlay on top of main map
		drawOverlay();
	}

	// method to initialize map by calling API
	var initOneMap = function() {

		// Check if container exist
		if ($('#map-container').length) {
			OneMap = new GetOneMap('map-container', 'sm', {level:2});
		} 
	}

	// method to load shapefile data
	var loadShapefile = function() {

		shp('data/DengueClusterSample.zip').then(function(data){
			//do stuff with data
			if (data) {
				shapefileData = data;
				console.log("Data loaded.");
				console.log(shapefileData);
			} else {
				console.log('Wrong shapefile data.');
			}
		});
	}

	// method to draw overlay on top of created map
	var drawOverlay = function() {

		// Check if map is ready
		if (OneMap.overlayKML && shapefileData != undefined) {
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

					// using API's formatter
					// var formattedResults = mashup.formatResultsEnhanced(results);
					// using custom formatter
					var formattedResults = customFormatResultsEnhanced(results);
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
		mashup.GetMashupData(overlayData);
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
		var results = shapefileData;

		if (results == "No results") {
			alert("Theme not found. Please check theme name.");
			return
		}

		console.log(mashupResults);

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
			for (i = 0; i < shapefileData.features.length; i++) {
				if (shapefileData.features[i].properties.Color != undefined && shapefileData.features[i].properties.Color != "") {
					var polyColor = shapefileData.features[i].properties.Color;
					var r = hexToRgb(polyColor).r;
					var g = hexToRgb(polyColor).g;
					var b = hexToRgb(polyColor).b;
				}
				else {
					var polyColor = '#E600A9';
					var r = hexToRgb(polyColor).r;
					var g = hexToRgb(polyColor).g;
					var b = hexToRgb(polyColor).b;
				}
				pntArr = [];
				polygon = new esri.geometry.Polygon(new esri.SpatialReference({wkid:3414}));

				var baseUrl = 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project?inSR=4326&outSR=3414';
				var geometries = '';
				var returnFormat = '&f=pjson';

				for (var j = 0; j < shapefileData.features[i].geometry.coordinates[0].length; j++) {
					xCord = shapefileData.features[i].geometry.coordinates[0][j][0];
					yCord = shapefileData.features[i].geometry.coordinates[0][j][1];

					geometries += '&geometries='+xCord+'%2C'+yCord;
				}

				var fullUrl = baseUrl + geometries + returnFormat;

				console.log(fullUrl);

				$.ajax({
					url: fullUrl,
					dataType: 'jsonp',
					success:function(data){
						for (var j = 0; j < data.geometries.length; j++) {
							var newXCord = data.geometries[j].x;
							var newYCord = data.geometries[j].y;

							var PointLocation = new esri.geometry.Point(newXCord, newYCord, new esri.SpatialReference({ wkid: 3414 }));
							pntArr.push(PointLocation);
						}

						polygon.addRing(pntArr);

						gra = new esri.Graphic;
						gra.geometry = polygon;
						gra.attributes = shapefileData.features[0].properties;

						var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
							  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
							  new dojo.Color([0, 0, 0]), 2), new dojo.Color([r, g, b, 0.8]));

						gra.symbol = sfs;
						themeGraphicsLayer.add(gra);
					},
					error:function(){
						alert("Error");
					}
				});
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

	// method to format result object into html-ready format
	var customFormatResultsEnhanced = function(resultObject) {

		var parsedObject = { oLocality:"undefined", oCaseSize:-999, oClusterID:-999, oDate:"undefined", oRO:"undefined", oStatus:"undefined"};

		try {
			parsedObject.oLocality = resultObject[0].Locality;
		} catch (err) {
			console.log("Locality undefined");
		}
		try {
			parsedObject.oCaseSize = resultObject[0].Case_size;
		} catch (err) {
			console.log("Case size undefined");
		}
		try {
			parsedObject.oClusterID = resultObject[0].Cluster_ID;
		} catch (err) {
			console.log("Cluster ID undefined");
		}
		try {
			parsedObject.oDate = resultObject[0].Date;
		} catch (err) {
			console.log("Date undefined");
		}
		try {
			parsedObject.oRO = resultObject[0].RO;
		} catch (err) {
			console.log("RO undefined");
		}
		try {
			parsedObject.oStatus = resultObject[0].Status;
		} catch (err) {
			console.log("Status undefined");
		}

		var resultMarkup = "<div class='tab-head-wrap'>";
		resultMarkup += "<a href='#' onclick ='switchTab(1,this,event)' class='active tab-head' data-target='#basic-info'>Dengue Cluster</a>";
		resultMarkup += "<a href='#' onclick ='switchTab(2,this,event)' class='tab-head' data-target='#breakdown-info'>Breakdown</a>";
		resultMarkup += "</div>"
		resultMarkup += "<div id='basic-info'>";
			resultMarkup += "<p class='info-title'>"+parsedObject.oLocality+"</p>";
			resultMarkup += "<table>";
			resultMarkup += "<tr><td>Cases with onset in last 2 weeks</td><td><strong>3</strong></td></tr>";
			resultMarkup += "<tr><td>Cases since start of cluster</td><td><strong>"+parsedObject.oCaseSize+"</strong></td></tr>";
			resultMarkup += "</table>";
		resultMarkup += "</div>";
		resultMarkup += "<div id='breakdown-info'>";
			resultMarkup += "<p class='info-title'>"+parsedObject.oLocality+"</p>";
			resultMarkup += "<table>";
			resultMarkup += "<thead>";
			resultMarkup += "<tr><th>Location</th><th>No of cases</th></tr>";
			resultMarkup += "</thead>";
			resultMarkup += "<tbody>";
			resultMarkup += "<tr><td>Location 1</td><td><strong>"+1+"</strong></td></tr>";
			resultMarkup += "<tr><td>Location 2</td><td><strong>"+2+"</strong></td></tr>";
			resultMarkup += "<tr><td>Location 3</td><td><strong>"+3+"</strong></td></tr>";
			resultMarkup += "<tr><td>Location 4</td><td><strong>"+4+"</strong></td></tr>";
			resultMarkup += "</tbody>";
			resultMarkup += "</table>";
		return resultMarkup;
	}
}

function switchTab(target,elm,e) {
	e.preventDefault();
	if (target == 1) {
		$('#breakdown-info').css('display','none');
		$('#basic-info').css('display','block');
	}
	else {
		$('#breakdown-info').css('display','block');
		$('#basic-info').css('display','none');
	}
	$('.tab-head').removeClass('active');
	$(elm).addClass('active');
}