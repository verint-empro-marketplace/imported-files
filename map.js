
// fix map legend on mobile issue
  $(window).resize(function(e) {
		if($(window).width() <= 775){

			KDF.showWidget('spr_legend_1');
			KDF.showWidget('spr_legend_2');
			KDF.showWidget('spr_legend_3');
		} else if($(window).width() >= 775){

			KDF.hideWidget('spr_legend_1');
			KDF.hideWidget('spr_legend_2');
			KDF.hideWidget('spr_legend_3');
		}
    });

var streetid_object = {};

var singleAsset = true;
var faultReportingSearchResults = new Object();
var streetAddress='';

var noMapSelected = false;
var sx_customer_id='';

var site_name_temp = '';

 function parseRSMarker(response){
	
 var xmax = esrimap.extent['xmax'];
 var ymax = esrimap.extent['ymax'];
 var xmin = esrimap.extent['xmin'];
 var ymin = esrimap.extent['ymin'];
 

     require([ "esri/graphic", "esri/Color", "esri/InfoTemplate", "esri/symbols/PictureMarkerSymbol", "dojo/domReady!" ],
        function(Graphic,  Color, InfoTemplate, PictureMarkerSymbol) {
            caseLayer = new esri.layers.GraphicsLayer({id:"case_marker_layer"});
			
			var template = new InfoTemplate(' ', 'Placeholder');
		    template.setContent('');
		    
		    caseLayer.setInfoTemplate(template);
					
              $.each(response.data, function(i, result ) {
                  
                     var point = new Point(Number(result.longitude), Number(result.latitude), new esri.SpatialReference({ wkid: 27700 }));
    				 var markerSymbol = new PictureMarkerSymbol(result.icon, 42, 42);
    			
    				 markerSymbol.setOffset(0, 0);
    				 var caseGraphic = new Graphic(point, markerSymbol);
    				 //caseGraphic.setAttributes({"title":'', "description": result.description, "caseid": result.title, "latitude": result.latitude, "longitude": result.longitude});
    				 caseGraphic.setAttributes({"title":'', "description": result.description});
                     caseLayer.add(caseGraphic);
					 
					 esrimap.addLayer(caseGraphic);

             });
			 /*
               caseLayer.on('click', function(event) {
                     esrimap.infoWindow.hide();
                      //log(event.graphic.attributes.latitude)
                        
                       esrimap.setInfoWindowOnClick(false);
                    
                      KDF.setVal('txt_case_id_subscribe', event.graphic.attributes.caseid)
                	  if (typeof esrimap.getLayer("graphicsLayer2") !== 'undefined') {
                           esrimap.getLayer("graphicsLayer2").hide();
                       }
                           
                       var lan = event.graphic.attributes.latitude ;
                       var long =  event.graphic.attributes.longitude ;
                       
                       //var centerpoint = new Point(parseInt(long), parseInt(lan), new esri.SpatialReference({wkid: 27700}));
		               // esrimap.centerAndZoom(centerpoint, 6);
                           
                       if (luthfan) luthfancallInfoWindow2(parseInt(lan), parseInt(long));
                       
                     });
                           */
            	esrimap.addLayer(caseLayer);
       }); 
             //log(esrimap)
}

$(document).off('keypress','#dform_widget_txt_postcode').on('keypress','#dform_widget_txt_postcode',function() {
  if (event.keyCode == 13) {
    event.preventDefault();
    searchBegin();
  }
});

$(document).on('click','#dform_widget_button_but_grit_bin_issue, #dform_widget_button_but_continue_sign_type ,#dform_widget_button_but_9MB43U68, #dform_widget_button_but_TZT3QJA7',function() {
    
    if (typeof esrimap !== 'undefined'){
		clearPreviousLayer();
		esrimap.infoWindow.hide();
        drawBaseLayer();
        //esrimap.setZoom(2);
        var centerpoint = new Point(325375, 673865, new esri.SpatialReference({wkid: 27700}));
		esrimap.centerAndZoom(centerpoint, 2);
    }
 
});
function keatonHighlightMissingAsset(globalX, globalY) {
    
    clearPreviousLayer();
    showLoading();
            
	var newlayer = new GraphicsLayer();
	var xcoord = parseInt(globalX);
	var ycoord = parseInt(globalY);
	log('ini geometry x ' + xcoord);

	var url = getMapParams().addressSearchService.base;
	url += '&location='+xcoord+'%2C+'+ycoord;//KS is the + within the string suposed to be there?
	
	log(url);

	$.ajax({url: url,  crossDomain: true}).done(function(result) {
		streetAddress = result.address;
		log(result.address);

		hideLoading();
		log(streetAddress.Address);
		 var content = streetAddress.Address + '</br></br>'
		 + '<button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm Location</button></div>' ;

		 var centerpoint = new Point(xcoord, ycoord, new esri.SpatialReference({wkid: getMapParams().WKID}));

		var markerSymbol = new PictureMarkerSymbol('/dformresources/content/map-blue.png', 64, 64);
		markerSymbol.setOffset(0, 32);
		var marker = new Graphic(centerpoint, markerSymbol);
		marker.setAttributes({"value1": '1', "value2": '2', "value3": '3'});
		newlayer.add(marker);
		newlayer.on('click', function(event) {
			setInfoWindowContent(content,xcoord,ycoord);
		});
		esrimap.addLayer(newlayer);

		setInfoWindowContent(content,xcoord,ycoord);
	}).fail(function() {
		KDF.showError('It looks like the connection to our mapping system has failed, please try to log the fault again');
	});
		
}

function singleAssetDrawAssetLayer(){//TODO update URL
    if (getMapParams().selectQueueSize > 1){return;/*KS: quick fix for multiselect*/}
    
    KDF.hideMessages();
    
    var esriAssetUrl='';
    
    var xmaxE = esrimap.extent.xmax;
    var ymaxE = esrimap.extent.ymax;
    var xminE = esrimap.extent.xmin;
    var yminE = esrimap.extent.ymin;
    
    var infoWindowContent;
    
    if (KDF.getVal('txt_formname')){
        if (KDF.getVal('txt_formname') === 'road_sign'){
            esriAssetUrl = 'https://edinburghcouncilmaps.info/arcgis/rest/services/CouncilAssets/ConfirmAssets2/MapServer/7/query?f=pjson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryEnvelope&inSR=27700&outFields=*&outSR=27700&transformForward=false' + '&geometry=%7B%22xmin%22%3A' + xminE + '%2C%22ymin%22%3A' + yminE + '%2C%22xmax%22%3A' + xmaxE + '%2C%22ymax%22%3A' + ymaxE + '%2C%22spatialReference%22%3A%7B%22wkid%22%3A27700%7D%7D';
        } else if (KDF.getVal('txt_formname') === 'litter_flytipping'){ 
            esriAssetUrl = 'https://edinburghcouncilmaps.info/arcgis/rest/services/CouncilAssets/ConfirmAssets2/MapServer/26/query?f=pjson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryEnvelope&inSR=27700&outFields=*&outSR=27700&transformForward=false' + '&geometry=%7B%22xmin%22%3A' + xminE + '%2C%22ymin%22%3A' + yminE + '%2C%22xmax%22%3A' + xmaxE + '%2C%22ymax%22%3A' + ymaxE + '%2C%22spatialReference%22%3A%7B%22wkid%22%3A27700%7D%7D';   
        } else if (KDF.getVal('txt_formname') === 'grit_bin'){
        	esriAssetUrl = getCommunalAssetURl() + '&geometry=%7B%22xmin%22%3A' + xminE + '%2C%22ymin%22%3A' + yminE + '%2C%22xmax%22%3A' + xmaxE + '%2C%22ymax%22%3A' + ymaxE + '%2C%22spatialReference%22%3A%7B%22wkid%22%3A'+getMapParams().WKID+'%7D%7D';
        }
    } else if (KDF.getVal('asset_layer')){ // communal bin spesific
        //KS asset layer NUMBER defined on form TODO check it's number and 'continue' if not to avoid assigning invalid assetURL, might still be possible to use an excisting one
        esriAssetUrl = 'https://edinburghcouncilmaps.info/arcgis/rest/services/CouncilAssets/ConfirmAssets2/MapServer/' + KDF.getVal('asset_layer') + '/query?f=pjson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryEnvelope&inSR=27700&outFields=*&outSR=27700&transformForward=false' + '&geometry=%7B%22xmin%22%3A' + xminE + '%2C%22ymin%22%3A' + yminE + '%2C%22xmax%22%3A' + xmaxE + '%2C%22ymax%22%3A' + ymaxE + '%2C%22spatialReference%22%3A%7B%22wkid%22%3A27700%7D%7D';;
    }

	//If has no assets - ensure it has no URL
	if ((KDF.getVal('rad_problem_option_OSM') && (KDF.getVal('rad_problem_option_OSM') === 'OS03' || KDF.getVal('rad_problem_option_OSM') === 'OS02')) || (KDF.getVal('rad_sign_type') && KDF.getVal('rad_sign_type') === 'unlit')) {
		esriAssetUrl='';
	} 

  if (esriAssetUrl != ''){
    $.ajax({url: esriAssetUrl, dataType: 'json'}).done(function(response) {
	    log(response);

	    require([ "esri/symbols/SimpleMarkerSymbol", "esri/graphic", "esri/Color", "dojo/domReady!" ],
        function(SimpleMarkerSymbol,  Graphic,  Color) {

		assetLayer = new esri.layers.GraphicsLayer({id:"asset_layer"});
		
		  var template = new InfoTemplate(' ', 'Placeholder');
		    template.setContent('');
		    
		    assetLayer.setInfoTemplate(template);
    
        var redColor = Color.fromArray([0, 204, 153]);
			    //KS: use defind object to create marker
				sms = new SimpleMarkerSymbol(specifics.markerSymbol);
		    
        var sms;
			if (specifics.markerSymbol){}else{
			    //KS: use default marker
				sms = new SimpleMarkerSymbol({
                  color: redColor,
                  size: "12",
                  outline: {
                    color: [0, 153, 255],
                    width: "5px",
                  }
                });
		    }
		   sms.setOffset(0, 0);
        
	    $.each(response.features, function( key, value ) {
	        //log(value.geometry.x); 
	        
	        infoWindowContent = '';
	        
	        if (KDF.getVal('asset_layer')) {
	            infoWindowContent = '</br><b>Location : </b>' + 
								value.attributes.feature_location + '</br><b>Site name : </b>' + value.attributes.site_name
								 + '</br></br><button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm location</button></div>';
	        } else {
	            //log('litter')
	         infoWindowContent = '</br><b>Location : </b>' + 
								value.attributes.LOCATION + '</br><b>Site name : </b>' + value.attributes.SITE_NAME 
								 + '</br></br><button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm location</button></div>';
         
	        }
	        
	        var point = new Point(Number(value.geometry.x), Number(value.geometry.y), new esri.SpatialReference({ wkid: 27700 }));
	        var graphic = new esri.Graphic(point, sms);  
	        
	         if (KDF.getVal('asset_layer')) {
			 graphic.setAttributes({"title": '', "description": infoWindowContent, "latitude":value.geometry.y, "longitude":value.geometry.x, "site_code": value.attributes.site_code, "ASSET_ID": value.attributes.ASSET_ID, "SITE_NAME": value.attributes.site_name});
	        } else {
                 graphic.setAttributes({"title": '', "description": infoWindowContent,"latitude":value.geometry.y, "longitude":value.geometry.x, "site_code": value.attributes.SITE_CODE, "ASSET_ID": value.attributes.ASSET_ID, "SITE_NAME": value.attributes.SITE_NAME});
	        }
		    assetLayer.add(graphic);
	    });
			/*
	         // assign the click event to the graphic layer
    	     assetLayer.on('click', function(event) {
    	         log(event.graphic.attributes)
    	         //esrimap.setInfoWindowOnClick(false);
    	    esrimap.infoWindow.hide();
    		   if (typeof esrimap.getLayer("graphicsLayer2") !== 'undefined') {
                        esrimap.getLayer("graphicsLayer2").hide();
                    }
                    
                    var lan = event.graphic.attributes.latitude ;
                    var long =  event.graphic.attributes.longitude ;
					

					var lan2 = lan + 5;
					var long2 = long - 1;

                    KDF.setVal('le_gis_lon', long2);
                    KDF.setVal('le_gis_lat', lan2);
                    
                     //KDF.customdata('reverse-geocode-edinburgh', 'create', true, true, {'longitude': long.toString() , 'latitude' : lan.toString()});
                     //KDF.unlock();
                    
                    if (typeof KDF.getVal('txt_confirm_lat') != 'undefined' && KDF.getVal('txt_confirm_lon') != 'undefined') {
                        KDF.setVal('txt_confirm_lat', lan.toString());
                        KDF.setVal('txt_confirm_lon', long.toString());
                    }
					
					KDF.setVal('le_title', event.graphic.attributes.SITE_NAME);
                    
                    if (typeof KDF.getVal('txt_confirm_sitecode') != 'undefined') {
                        KDF.setVal('txt_confirm_sitecode', event.graphic.attributes.site_code);
                    }
                    
                    KDF.setVal('txt_confirm_assetid', event.graphic.attributes.ASSET_ID);
                    
                   // esrimap.centerAndZoom(new Point(long, lan, new esri.SpatialReference({ wkid: 27700 })), 6);
                  //assetLayer.redraw();
                  luthfancallInfoWindow(event.graphic.attributes.description, lan, long);
                   
    		});*/

        	 esrimap.addLayer(assetLayer);
		 
		 //log(esrimap);
			
		  for (var i = 0; i < esrimap.graphics.graphics.length -1; i++){
                  //KS Remove all but last layer
                  log(esrimap.graphics.graphics[i])
                  esrimap.graphics.remove(esrimap.graphics.graphics[i]);
                  }
		
        });
		
	}).fail(function() {
	    KDF.showError('It looks like the connection to our mapping system has failed, please try to log the fault again');
	});	
  }else if(esrimap.getLayer('case_marker_layer') !== undefined){esrimap.removeLayer(esrimap.getLayer('case_marker_layer'));}
}

function keatonDrawAssetLayer(layersToKeep){
    //log('layersToKeep:')
    //log(layersToKeep)
    //KS: layersToKeep e.g. [esrimap.Graphics.graphics[0], esrimap.Graphics.graphics[1]]
	//    should be the recreated each time
	
	//KS: if layers to keep is array - use it otherwise define as array
	var activeLayers;
	if (layersToKeep !== null && Array.isArray(layersToKeep)){
	    activeLayers=layersToKeep
	}else {
	    activeLayers=[]
	}
	
	KDF.hideMessages();
	
	//KS: calculate windoiw size
	var xy = getWindowDrawBounds({
	    xMax:esrimap.extent.xmax,
	    yMax:esrimap.extent.ymax,
	    xMin:esrimap.extent.xmin,
	    yMin:esrimap.extent.ymin,
	});
	
	
	//KS maybe use multiplyer to expand search radius
	var eachPoints=[];
	
	//KS call url builder - can't assume it's in specified format in the future
	var esriAssetUrl = getCommunalAssetURl() + '&geometry=%7B%22xmin%22%3A' + xy['xMin'] + '%2C%22ymin%22%3A' + xy['yMin'] + '%2C%22xmax%22%3A' + xy['xMax'] + '%2C%22ymax%22%3A' + xy['yMax'] + '%2C%22spatialReference%22%3A%7B%22wkid%22%3A'+getMapParams().WKID+'%7D%7D';
	//log('RestURL: '+esriAssetUrl)
	$.ajax({url: esriAssetUrl, dataType: 'jsonp', crossDomain: true}).done(function(response) {
		//log('response: ');log(response);log('getMapParams().selectStorage.length:');log(getMapParams().selectStorage.length);
		//getMapParams().selectStorage[0].points = [];getMapParams().selectStorage[1].points = [];if(getMapParams().selectStorage.length=3)getMapParams().selectStorage.splice(2,1);
		response.features.forEach(function(point){
		    //if (point.attributes['FEATURE_ID']=='RHD05'){log('RHD05 '+point.attributes['OBJECTID']);log(point);}
		    var notUsed = true;
		    getMapParams().selectStorage.forEach(function(filter){
		        if (filter.selectedAssets.includes(point.attributes[filter.uniqueField])){
		            filter.points.push([point.geometry.x, point.geometry.y]);
		            notUsed=false;
		        }
		    })
		    if (notUsed){
		        eachPoints.push([point.geometry.x, point.geometry.y]);
		    }
		    /*if (getMapParams().selectStorage.selectedAssets.includes(point.attributes[getMapParams().selectStorage.uniqueField])){
		        log(point.attributes[getMapParams().selectStorage.uniqueField])
		        selectedPoints.push([point.geometry.x, point.geometry.y]);
		    }else{
		        eachPoints.push([point.geometry.x, point.geometry.y]);
		    }*/
			//KS using ~OBJECTID must be used here - since that information gets stripped out when added
		    //replaceSymbol(graphic, getMapParams().selectStorage.uniqueField, getMapParams().selectStorage.selectedAssets, getMapParams().selectStorage.selectSymbol)
		
		});
		
		var sms;
		if (getMapParams().markerSymbol){
			//KS: use defind object to create marker
			sms = getMapParams().markerSymbol;
		}else{
			//KS: use default marker
			sms = {	color: [0, 204, 153],
				size: "12",
				outline: {color: [0, 153, 255],width: "5px",}
			}
		}
		
		var featureFilters = JSON.parse(JSON.stringify(getMapParams().selectStorage));
		featureFilters.push({//KS: assets that didn't have a filter applied
		    points:eachPoints,
            uniqueField:false,
        	selectedAssets:true,
        	selectSymbol:sms,
        	wkid:getMapParams().WKID,
		});
		
		getMapParams().selectStorage.forEach(function(filter){
		    //KS: clean up getMapParams().selectStorage
		    filter.points = [];
		});
		
		//log('featureFilters:');log(featureFilters);
		
		featureFilters.forEach(function(filter){
		    //KS BUG and old layer is kept! Doubles assets on select!
		    filter.points=new esri.geometry.Multipoint({"points":filter.points,"spatialReference":({"wkid":filter.wkid})});
		    filter.selectSymbol=new SimpleMarkerSymbol(filter.selectSymbol);
		    filter.graphic=new esri.Graphic(filter.points, filter.selectSymbol);
		    filter.graphic.setAttributes({"title": new Date().getTime()})
		    //log('Before activeLayers.unshift:');log(activeLayers);
		    activeLayers.unshift(filter.graphic);
		    //log('After activeLayers.unshift:');log(activeLayers);
		    if(filter.graphic.geometry.points.length > 0){
			    esrimap.graphics.add(filter.graphic);
		    }
		});
		
		removeLayers(esrimap.graphics, activeLayers);
		
		//KS: attempt to match luthfans work. Seems like it creates way too many triggers.
		esrimap.getLayer(esrimap.graphicsLayerIds[2]).on('click',assetLayerClick(event));
		
	}).fail(function() {
		KDF.showError('It looks like the connection to our mapping system has failed, please try to log the fault again');
	});	
}

function assetLayerClick(event){
	//KS: attempt to seperate event from draw asset function
	log(event.graphic.attributes)

	if (typeof esrimap.getLayer("graphicsLayer2") !== 'undefined') {
		esrimap.removeLayer(esrimap.getLayer("graphicsLayer2"));
	}

	var lan = event.graphic.attributes.latitude;
	var long =  event.graphic.attributes.longitude;

	KDF.customdata('reverse-geocode-edinburgh', 'create', true, true, {'longitude': long.toString() , 'latitude' : lan.toString()});
	KDF.unlock();

	if (typeof KDF.getVal('txt_confirm_lat') != 'undefined' && KDF.getVal('txt_confirm_lon') != 'undefined') {
		KDF.setVal('txt_confirm_lat', lan.toString());
		KDF.setVal('txt_confirm_lon', long.toString());
	}

	if (typeof KDF.getVal('txt_confirm_sitecode') != 'undefined') {
		KDF.setVal('txt_confirm_sitecode', event.graphic.attributes.site_code);
	}

	KDF.setVal('txt_confirm_assetid', event.graphic.attributes.ASSET_ID);
}

//KS: use this to get status
var mapScriptStatus = jQuery.Deferred();

var Map, Point, SimpleMarkerSymbol, PictureMarkerSymbol, Graphic, GraphicsLayer, InfoWindow, Circle, Units, GeometryService, SpatialReference, Color, Popup, Geocoder, OverviewMap, Identify, Find, InfoTemplate, PictureMarkerSymbol, Dom, On, Config, WebMercatorUtils, Connect;

require(["esri/map", "esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic", "esri/layers/GraphicsLayer", "esri/dijit/InfoWindow", "esri/geometry/Circle", "esri/units", "esri/tasks/GeometryService", "esri/SpatialReference", "esri/Color", "esri/dijit/Popup", "esri/dijit/Geocoder", "esri/dijit/OverviewMap", "esri/tasks/identify", "esri/tasks/find", "esri/InfoTemplate", "esri/symbols/PictureMarkerSymbol", "dojo/dom", "dojo/on", "esri/config", "esri/geometry/webMercatorUtils", 'dojo/_base/connect', "dojo/domReady!"],
	function(classMap, classPoint, classSimpleMarkerSymbol, classPictureMarkerSymbol, classGraphic, classGraphicsLayer, classInfoWindow, classCircle, classUnits, classGeometryService, classSpatialReference, classColor, classPopup, classGeocoder, classOverviewMap, classIdentify, classFind, classInfoTemplate, classPictureMarkerSymbol,classDom, classOn, classConfig, classWebMercatorUtils, classMapView, classConnect) {
		Map=classMap; Point=classPoint; SimpleMarkerSymbol=classSimpleMarkerSymbol; PictureMarkerSymbol=classPictureMarkerSymbol; Graphic=classGraphic; GraphicsLayer=classGraphicsLayer; InfoWindow=classInfoWindow; Circle=classCircle; Units=classUnits; GeometryService=classGeometryService; SpatialReference=classSpatialReference; Color=classColor; Popup=classPopup; Geocoder=classGeocoder; OverviewMap=classOverviewMap; Identify=classIdentify; Find=classFind; InfoTemplate=classInfoTemplate; PictureMarkerSymbol=classPictureMarkerSymbol; Dom=classDom; On=classOn; Config=classConfig; WebMercatorUtils=classWebMercatorUtils; Connect=classConnect;
		/*MapView=classMapView;*/
	
		mapScriptStatus.resolve();//KS allows you to identify when classes are loaded
		//Trig: When all the classes are loaded. A better method that can be used in a function is mapScriptStatus.done()
		$(formName()).trigger('_map_classesLoaded');
	}
);


var mapParams = {
    //KS: normally would be empty (maybe a few empty properties), but it being populated simulates adding global varables that would've been added by an extra script
    extent: [334905.5753111506, 310733.193633054, 680181.2782575564, 663544.2449834899],// minX, maxX, minY, maxY
	WKID: 27700,
	WKIDProj4: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs',
	geolocateButton: true,
	geolocateAuto: false,
	geolocateWKID: 4326,
	geolocateWKIDProj4:'+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',//likely is the proj4 for 4326
	centerLonLat: {x:325226.83303699945, y:673836.5572347812},
	centerZoom: 1,
	geometryServer: 'https://edinburghcouncilmaps.info/arcgis/rest/services/Utilities/Geometry/GeometryServer',
	drawWindowMultiplier:1.25,
	selectMultiple:true, //Default is false
	selectStorage:[/*{
            points:[],
            uniqueField:'OBJECTID',
    	    selectedAssets:[11888935,12144406,12144405,12144948,12144862],
    	    selectSymbol:{color:[25, 135, 6], size:"12", outline:{color: [6, 6, 89],width: "1"}},
    	    wkid:27700,
        },*/{
            points:[],
            //uniqueField:'FEATURE_ID',
            uniqueField:'ASSET_ID',
        	selectedAssets:['RHF12','RHF10','RHF24'],
        	selectSymbol:{color:[4, 4, 100], size:"5", outline:{color: [100, 6, 6],width: "1"}},
        	wkid:27700,
    }],
	searchURL:{base: window.location.origin+'/locatorhub/arcgis/rest/services/CAG/POSTCODE/GeocodeServer/findAddressCandidates?&SingleLine=&Fuzzy=true&outFields=*&maxLocations=2000&f=pjson&outSR=27700',varParams:['LH_POSTCODE']},
	baseLayerService: window.location.origin+'/arcgis/rest/services/Basemaps/BasemapColour/MapServer/find',
	backgroundMapService: window.location.origin+'/arcgis/rest/services/Basemaps/BasemapColour/MapServer',
	addressSearchService:{base: window.location.origin+'/arcgis/rest/services/CAG/ADDRESS/GeocodeServer/reverseGeocode?distance=300&outSR=27700&f=json'},
	//processResultURL: window.location.origin+'/ci/AjaxCustom/cagSearch',
	processResultURL:{base: window.location.origin+'/locatorhub/arcgis/rest/services/CAG/STREET/GeocodeServer/findAddressCandidates?SingleLine=&Fuzzy=true&outFields=*&maxLocations=2000&outSR=27700&f=pjson',varParams:['LH_STREET']},
	cecNotManaged: 'Sorry, we aren\'t able to identify this location on the map. Please report without the map below.</callInfoWindowbr></br></br>'
	
};

function getMapParams(){return mapParams;}//KS accessor to give a level of abstraction when we need it
function deleteMapParam(propertyName){
	var noRefCopy = JSON.parse(JSON.stringify(getMapParams()[propertyName]))
	var isDeleted = delete getMapParams()[propertyName];
	//Trig[propDeleted, isDeleted, copyOfContents]: lets you know if something from mapParams was deleted and if so, what it was
	$(formName()).trigger('_map_paramDeleted',[propertyName, isDeleted, noRefCopy]);
}
function setMapParams(obj){
	//KS Overwrites properties
	for(var property in obj){
		getMapParams()[property] = obj[property];
	}
	
}
var specifics = mapParams;function setSpecifics(obj){setMapParams(obj);}function getSpecifics(){getMapParams();}
function drawAssetLayer(layersToKeep){
	if (getMapParams().selectQueueSize > 1){
		singleAssetDrawAssetLayer();
		//keatonDrawAssetLayer(layersToKeep);
	}else{
		singleAssetDrawAssetLayer();
	}
}

function getWindowDrawBounds(xyMinMax){
    var scale = 1;
    if (getMapParams().drawWindowMultiplier !== null){
        scale = getMapParams().drawWindowMultiplier 
    }
    return {
        //KS it expands the two xy points by the scale: 1 = normal area; 1.5 = 4*normal area; 2 = 9*normal area;
        xMax:xyMinMax['xMax']+((scale-1)*(xyMinMax['xMax']-xyMinMax['xMin'])),
        yMax:xyMinMax['yMax']+((scale-1)*(xyMinMax['yMax']-xyMinMax['yMin'])),
        xMin:xyMinMax['xMin']-((scale-1)*(xyMinMax['xMax']-xyMinMax['xMin'])),
        yMin:xyMinMax['yMin']-((scale-1)*(xyMinMax['yMax']-xyMinMax['yMin'])),
    }
}
function removeLayers(esriGraphics, layersToKeep){
	for (var i = 0; i < esriGraphics.graphics.length; i++){
		var remove = true;
		layersToKeep.forEach(function(layer){
		    ///KS for timestamp of creation/id log(layer.attributes['title'])
			if (esriGraphics.graphics[i]==layer)remove = false;
		});
		if (remove) esriGraphics.remove(esriGraphics.graphics[i]);
	}
}
function replaceSymbol(graphicLayer, fieldID, selectArray, selectSymbol){
	//KS select
}
function removeSelectedAssets(graphicLayer){
	
}
function getAssetInfoFromCoord(point){
    
}
$('#dform_container').on('_KDF_mapReady', function(event, kdf, type, name, map, positionLayer, markerLayer, marker, projection) {
	//KS currently not working with map like _KDF_search is in style-4.js is
	
	
	if($(window).width() <= 775){
			log($(window).width());

			KDF.showWidget('spr_legend_1');
			KDF.showWidget('spr_legend_2');
			KDF.showWidget('spr_legend_3');
		}
	log('Script side _KDF_mapReady tiggered');
	if (getMapParams().geolocateButton){
		addGeolocateButton($("[data-type='gis']"));
	}
	if (getMapParams().geolocateAuto){
		setTimeout(function(){geolocate()}, 1);
	}
	hardcodeLegend();//KS won't work unless legend is defined in map params
	//KS to avoid the bug with customerFeilds not being constructed at _KDF_ready
	/*if (typeof regexSearch = 'function')*/ 
	//regexSearch("[0-9A-Za-z ]{2,}");
	//KS Show 'May take longer' message based on user journey	
	
	
});
$('#dform_container').on('click','#dform_widget_button_but_no_map',function(){
	KDF.showWidget('hrd_investigate_longer');
});
$('#dform_container').on('click','.mapConfirm',function(){
	KDF.hideWidget('hrd_investigate_longer');
});
var faultReportingSearchResults = new Object();
var streetAddress='';
 
$(document).on('click','#dform_widget_button_but_search',function() {
	
  if (!$('#dform_widget_txt_postcode').hasClass('dform_fielderror')){//KS: prevent search if it has an error
	searchBegin();  
  }
});

function getCommunalAssetURl() {
    //KS now supports a url asset code defined on an element called 'asset_layer' and a URL defined in the scriting tab within 'getMapParams().assetURL'. If none is found then return false (since no reasonable default can be supplied)
    if (KDF.getVal('asset_layer')){ //Returns true if defined
        //KS asset layer NUMBER defined on form TODO check it's number and 'continue' if not to avoid assigning invalid assetURL, might still be possible to use an excisting one
        getMapParams().assetURL = 'https://edinburghcouncilmaps.info/arcgis/rest/services/CouncilAssets/ConfirmAssets2/MapServer/' + KDF.getVal('asset_layer') + '/query?f=pjson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryEnvelope&inSR=27700&outFields=*&outSR=27700&transformForward=false';
        //log(getMapParams().assetURL)
        return getMapParams().assetURL;
    }//KS else statement avoided due to return above - TODO allows block above to continue if number is invalid
    //KS no asset_layer defined on form
    if (getMapParams().assetURL){
        //KS assetURL defined in object - assume it's the entire URL
        return getMapParams().assetURL;
    }
    if (getMapParams().formName){//LB
        if (getMapParams().formName === 'road_sign'){
	    if (KDF.getVal('rad_problem_type') === 'unlit' ){
		getMapParams().assetURL = 'https://edinburghcouncilmaps.info/arcgis/rest/services/CouncilAssets/ConfirmAssets2/MapServer/7/query?f=pjson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryEnvelope&inSR=27700&outFields=*&outSR=27700&transformForward=false';
		return getMapParams().assetURL;
	    } else if (KDF.getVal('rad_problem_type') === 'lit' ){
		getMapParams().assetURL = 'https://edinburghcouncilmaps.info/arcgis/rest/services/CouncilAssets/ConfirmAssets2/MapServer/3/query?f=pjson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryEnvelope&inSR=27700&outFields=*&outSR=27700&transformForward=false';
		return getMapParams().assetURL;
	    }   
        }else if (specifics.formName === 'litter_flytipping'){
	     specifics.assetURL = 'https://edinburghcouncilmaps.info/arcgis/rest/services/CouncilAssets/ConfirmAssets2/MapServer/26/query?f=pjson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryEnvelope&inSR=27700&outFields=*&outSR=27700&transformForward=false';
	     return specifics.assetURL;
	}
        
    }
    else{
        //KS no URL specified - since no resonable default can be used - assign false to aid with error handaling
        return false;
    }
}

function postcodeSearch(searchInput) {
	//KS perhaps we could apply a regex to seperate searches into difffrent rest api
    var esriServiceURL = getMapParams().searchURL.base
    esriServiceURL += '&LH_POSTCODE='+searchInput;
	
    var xcoord;
    var ycoord;
    var USRN;
    var desc;
    
	$.ajax({url: esriServiceURL, dataType: 'json', crossDomain: true}).done(function(response) {
        //log('Response below:')
        log(response.candidates.length)
        
        if (response.candidates.length !== 0){
        
           $.each(response.candidates, function( key, value ) {
                 xcoord=value.location.x;
                 ycoord=value.location.y;
                 USRN=value.attributes.USRN;
		 desc = value.address;
           });
           
           if (typeof KDF.getVal('txt_confirm_sitecode') !== 'undefined') {
            	     KDF.setVal('txt_confirm_sitecode', USRN);
            	   }
           
			hideLoading();
			var popCenterpoint = new Point(xcoord, ycoord, new esri.SpatialReference({wkid: getMapParams().WKID}));
    		var centerpoint = new Point(xcoord, ycoord, new esri.SpatialReference({wkid: getMapParams().WKID}));
    		esrimap.centerAndZoom(centerpoint, 6);
    		
		canContinueWithoutMap = true;
		/*
		try{
		$([document.documentElement, document.body]).animate({
			scrollTop: $("[data-name='le_gis']").parent('.box').offset().top
		}, 1000);
		}catch(error){
			log('Unable to scroll to GIS widget')
		}*/
		KDF.hideWidget('ahtm_no-map_message');
		noMapConfirm(USRN, desc, xcoord, ycoord, _lastStreetSearched, 'nomap');
        } else {
            KDF.showWidget('html_nosearchfound');
		    hideLoading();
        }
	}).fail(function() {
		KDF.showError('We where unable to complete a postcode search - please ensure a valid postcode was used');
	});
        
    
}

// grit bin get 100 meters requirement
function getAssetInfo(objdesc, globalX, globalY) {
	var assetRadius = 15;
	
	if (KDF.getVal('rad_issue_WINT') == 'RW16') {
		assetRadius = 100;		
 	}
	
   var point = new Point([globalX, globalY]);
   var centerpoint = new Point(globalX, globalY, new esri.SpatialReference({wkid: getMapParams().WKID}));

	var circleGeometry = new Circle(centerpoint,{"radius": assetRadius, "numberOfPoints": 4, "radiusUnit": Units.METERS, "type": "extent"});
	var esriServiceURL = '';
	var content = '';

	showLoading();

	var xmaxE = circleGeometry.getExtent().xmax;
	var ymaxE = circleGeometry.getExtent().ymax;
	var xminE = circleGeometry.getExtent().xmin;
	var yminE = circleGeometry.getExtent().ymin;

		esriServiceURL = getCommunalAssetURl() + '&geometry=%7B%22xmin%22%3A' + xminE + '%2C%22ymin%22%3A' + yminE + '%2C%22xmax%22%3A' + xmaxE + '%2C%22ymax%22%3A' + ymaxE + '%2C%22spatialReference%22%3A%7B%22wkid%22%3A'+getMapParams().WKID+'%7D%7D';

			$.ajax({url: esriServiceURL,  dataType: 'json'}).done(function(response) {
			
				hideLoading();
				
				log('Actual responce (we should implement the closest one soon):');
				log(response.features);
		
				if (response.features.length == 0 ){
					
					callInfoWindow(objdesc, 'no asset', centerpoint, esrimap)
				} else {
					
					callInfoWindow(objdesc, 'asset', centerpoint, esrimap)
				}

				
		}).fail(function() {
		KDF.showError('Was unable to get asset details at this time, please try again');
	});
}    

function callInfoWindow(objdesc, assetExist, marker, map){

	var content = "";
	
	var edinburghExtentMinX = 310733.193633054;
	var edinburghExtentMaxX = 330005.5753111506;
	var edinburghExtentMaxy = 680181.2782575564;
	var edinburghExtentMiny = 663544.2449834899;
	
	var xcoord = marker.x;
	var ycoord = marker.y;
	
	if (objdesc == '') {
		if (xcoord <= edinburghExtentMaxX && xcoord >= edinburghExtentMinX && ycoord <= edinburghExtentMaxy && ycoord >= edinburghExtentMiny) {
		   content = getMapParams().cecNotManaged;
	 } else {
		 content = 'This location is outside the City of Edinburgh Council boundary.';
	 }
	} else {
		if(assetExist == 'no asset') {
			content = '<p class="paragraph-normal">Valid new grit bin location</p><button id="mapConfirm" class="mapConfirm btn-continue" data-asset_id="">Confirm new location</button>'
		} else if (assetExist == 'asset') {
			content = '<p class="paragraph-normal">You are unable to request a new grit bin at this location because an existing grit bin is within 100m of this location</p>';
		}	
	}
	   
	map.infoWindow.setTitle('');
	map.infoWindow.setContent(content);
	map.infoWindow.anchor = "right";
	map.infoWindow.show(marker);
	
	if (esrimap.getLevel() != '6') {
    	esrimap.centerAndZoom(new Point(marker.x, marker.y, new esri.SpatialReference({ wkid: 27700 })), 6);
    } else {
    	esrimap.centerAt(new Point(marker.x, marker.y, new esri.SpatialReference({ wkid: 27700 })));
    }
	
	 if (typeof esrimap.getLayer("graphicsLayer2") !== 'undefined') {
           esrimap.getLayer("graphicsLayer2").show();
       }
	
}


function zoomChanged(evt){
	//drawAssetLayer();
	if (evt['levelChange']==true) {log('Zoom: '+evt.lod.level);}
	//KS won't be implemented due to demo
	//Should we prevent clicking?
	if (getMapParams().assetMaxDrawZoom){
	    //log('has level defined');
	    //KS implement user specified zoom extent 
	    if (evt.lod.level >= getMapParams().assetMaxDrawZoom){
		    //log('Zoom at or less');
	        drawAssetLayer();
	    }else{
		    //log('Zoom is more');
	        //KS remove assets if above extent - aesthetic only
	        esrimap.graphics.clear();
	    }
	}else{
		//log(' level undefined');
	    //KS implement default zoom extent
	    if (evt.lod.level >= 6){
		    //log('zoom under default');
	    //KS zoom is at or more magnified than max level - so draw it

		if (typeof esrimap.getLayer("asset_layer") !== 'undefined') {
        	esrimap.removeLayer(esrimap.getLayer("asset_layer"));
    	}
    
    	if (typeof esrimap.getLayer("case_marker_layer") !== 'undefined') {
        	esrimap.removeLayer(esrimap.getLayer("case_marker_layer"));
    	}
	    
	        drawAssetLayer();

			if (singleAsset) {
				if(esrimap.getLayer('case_marker_layer') !== undefined){esrimap.removeLayer(esrimap.getLayer('case_marker_layer'))}
				
				var xmaxE = esrimap.extent.xmax;
				var ymaxE = esrimap.extent.ymax;
				var xminE = esrimap.extent.xmin;
				var yminE = esrimap.extent.ymin;
	
				getOpenCaseMarker(xmaxE, xminE, ymaxE, yminE);
	
			}
	    }else{
	        //KS remove assets if above extent - aesthetic only
		//esrimap.graphics.clear();
		clearPreviousLayer();
	    }
	}
	
}


$(document).on('change','#dform_widget_fault_reporting_search_results' , function() {
 
  var selectResult = $('select#dform_widget_fault_reporting_search_results option:checked').val();
  $("select option:contains('Please select')").attr("disabled","disabled");
  
  //log(faultReportingSearchResults);
   if (selectResult !== "") {
          $.each(faultReportingSearchResults, function(
            key,
            faultReportingSearchResults
          ) {
        if (selectResult == faultReportingSearchResults.site_name) {
                esrimap.centerAndZoom(new Point(faultReportingSearchResults.xCoord, faultReportingSearchResults.yCoord, new esri.SpatialReference({ wkid: 27700 })), 6);
                noMapConfirm(faultReportingSearchResults.USRN, faultReportingSearchResults.site_name, faultReportingSearchResults.xCoord, faultReportingSearchResults.yCoord, _lastStreetSearched, 'nomap');
				canContinueWithoutMap = true;
		/*
		$([document.documentElement, document.body]).animate({
			scrollTop: $("[data-name='le_gis']").parent('.box').offset().top
		}, 1000);
		*/
		KDF.hideWidget('ahtm_no-map_message');
                
                   if (typeof KDF.getVal('txt_confirm_sitecode') !== 'undefined') {
            	     KDF.setVal('txt_confirm_sitecode', faultReportingSearchResults.USRN);
            	   }
            	   KDF.setVal('txt_street_id', '');
    	              KDF.setVal('txt_set_title', '');
    	             KDF.setVal('txt_confirm_lon', '');
    	              KDF.setVal('txt_confirm_lat', '');
    	              KDF.setVal('txt_confirm_assetid', '');
		       KDF.setVal('txt_confirm_featureid', '');
            	   
            	   //KDF.setStreetID(faultReportingSearchResults.LOCATOR_DESCRIPTION,false,'');
               }
          });
        }
});


function highlightMissingAsset(globalX, globalY) {
	if (getMapParams().selectQueueSize > 1){
		keatonHighlightMissingAsset(globalX, globalY)
	}else{
		debugHighlightMissingAsset(globalX, globalY)
	}
}

function processResult(searchInput){
    KDF.hideMessages();
	
	var resultCount = 0;
	
	var resultAssetArray = new Object();
	
	var esriServiceURL = getMapParams().processResultURL.base
    esriServiceURL += '&LH_STREET='+searchInput+'*';

	$.ajax({url: esriServiceURL, dataType: 'json', crossDomain: true, method: 'GET'
	}).done(function(response) {
	    //log(response);
	   if(response.candidates.length == 0){
    		KDF.showWidget('html_nosearchfound');
    		hideLoading();
	    } else {
	        $.each(response.candidates, function( key, value ) {
	        	//log(key)
                //resultAssetArray[value.attributes.STREET_DESCRIPTOR] = new Object();
                
				resultAssetArray[key] = new Object();
                resultAssetArray[key]['site_name'] = value.attributes.LOCATOR_DESCRIPTION;
                resultAssetArray[key]['xCoord'] = value.location.x;
                resultAssetArray[key]['yCoord'] = value.location.y;
				resultAssetArray[key]['USRN']= value.attributes.USRN;
          
	         });
	        
	       // log(resultAssetArray);
    		
	    } 
	        
	          $.each(response.candidates, function( key, value ) {
	             resultCount++;
	          });
	         
	          log(resultCount);
	         
	          
	          if(resultCount == 1){
	              
	              $.each(resultAssetArray, function(key, resultAssetArray ) {
					if (typeof KDF.getVal('txt_confirm_sitecode') !== 'undefined') {
    	                  KDF.setVal('txt_confirm_sitecode', resultAssetArray.USRN);
    	              }
    	              
    	              KDF.setVal('txt_street_id', '');
    	              KDF.setVal('txt_set_title', '');
    	             KDF.setVal('txt_confirm_lon', '');
    	              KDF.setVal('txt_confirm_lat', '');
    	               KDF.setVal('txt_confirm_assetid', '');
			KDF.setVal('txt_confirm_featureid', '');
    	              
    	              //KDF.setStreetID(resultAssetArray.LOCATOR_DESCRIPTION,false,'');
    	              esrimap.centerAndZoom(new Point(resultAssetArray.xCoord, resultAssetArray.yCoord, new esri.SpatialReference({ wkid: 27700 })), 6);
		      noMapConfirm(resultAssetArray.USRN, resultAssetArray.site_name, resultAssetArray.xCoord, resultAssetArray.yCoord, _lastStreetSearched, 'nomap');
        
			      canContinueWithoutMap = true;
			      /*$([document.documentElement, document.body]).animate({
					scrollTop: $("[data-name='le_gis']").parent('.box').offset().top
				}, 1000);*/
			      KDF.hideWidget('ahtm_no-map_message');
	              });
				  
	               // centreOnEsriResult('', '', xmax, xmin, ymax, ymin, '', '');
	          }  else {
	               $('label[for=dform_widget_fault_reporting_search_results]').html('<label for="dform_widget_fault_reporting_search_results">Multiple results, please select one:</label>');
	               $('#dform_widget_fault_reporting_search_results').append($('<option value="Please select a location">Please select</option>'))
	               log(resultAssetArray)
	               $.each(resultAssetArray, function(index, resultAssetArray2 ) {
	                   log(resultAssetArray2.site_name);
	                   log(index);

    		    	   $('#dform_widget_fault_reporting_search_results').append($('<option>', {value: resultAssetArray2.site_name,text: resultAssetArray2.site_name}))
    		        	

    		           KDF.showWidget('fault_reporting_search_results');
	               });
	          }
	    faultReportingSearchResults = resultAssetArray;
	    
	   
	    	hideLoading();

	    }).fail(function() {
	        KDF.showError('It looks like request blocked by the CROSS Origin Policy, contact the system administrator');
	        hideLoading();
	    });
}
	
	
function setInfoWindowContent(content, xcoord, ycoord) {
    if (esrimap === undefined || esrimap.infoWindow === undefined) {
        KDF.showError('Unable to populate case details, popup does not exist.');
    } else {
        //map.infoWindow.setContent(content);
		var popCenterpoint = new Point(xcoord, ycoord, new esri.SpatialReference({wkid: getMapParams().WKID}));
		esrimap.infoWindow.setTitle('Please confirm street address.');
		esrimap.infoWindow.setContent(content);
		esrimap.infoWindow.show(popCenterpoint);
		var centerpoint = new Point(xcoord, ycoord, new esri.SpatialReference({wkid: getMapParams().WKID}));
		esrimap.centerAndZoom(centerpoint, esrimap.getLevel());//KS:herts update
	}
}

function searchBegin(){
        
       //KDF.showWidget('ahtm_report_without_map');
      
	canContinueWithoutMap = false;
       KDF.hideMessages();
       searchInput = KDF.getVal('txt_postcode');
       $('#dform_widget_fault_reporting_search_results').empty();
       KDF.hideWidget('fault_reporting_search_results');
       KDF.hideWidget('html_nosearchfound');
  
       showLoading();
  
       if (searchInput.toUpperCase().charAt(0) === 'E' && searchInput.toUpperCase().charAt(1) === 'H'){
           
           postcodeSearch(searchInput);
       } else {
       	
           processResult(searchInput);
       }
       
}

function changeAllLayersOpacity(opacity){
    var layerIds = esrimap.layerIds;
    var len = layerIds.length;
	
	
	esrimap.getLayer("layer0").setOpacity(opacity);
	/*
    for (var i = 0; i < len; i++) {
        var layer = esrimap.getLayer(layerIds[i]);
        console.log(layer)
       // layer.setOpacity(opacity);
    }*/
}

function drawBaseLayer(){
    var backgroundMapService = getMapParams().backgroundMapService;
    bglayer = new esri.layers.ArcGISTiledMapServiceLayer(backgroundMapService,{opacity:1, id: "bglayer"});
    esrimap.addLayer(bglayer);
}

function clearPreviousLayer(){
      esrimap.graphics.clear();
      var graphicLayerIds = esrimap.graphicsLayerIds;
      var len = graphicLayerIds.length;
     //log('length before: '+len);
                
     var gLayer = esrimap.getLayer(graphicLayerIds[len-1]);
	 gLayer.clear();   
     for (var i = 0; i<len; i++) {
     var gLayer = esrimap.getLayer(graphicLayerIds[i]);
     gLayer.clear();
    }
                
}


function centreOnEsriResult(geometryX, geometryY, xmax, xmin, ymax, ymin, north, east){
    
    if (geometryY!=''){
		var newlayer = new GraphicsLayer();
		var xcoord = geometryX;
		var ycoord = geometryY;
		log(xcoord);
		var centerpoint = new Point(xcoord, ycoord, new esri.SpatialReference({wkid: getMapParams().WKID}));
		esrimap.centerAndZoom(new Point(xcoord, ycoord), esrimap.getLevel());
		var markerSymbol = new PictureMarkerSymbol('/dformresources/content/map-red.png', 64, 64);
		markerSymbol.setOffset(0, 32);
		var marker = new Graphic(centerpoint, markerSymbol);
		marker.setAttributes({"value1": '1', "value2": '2', "value3": '3'});
		newlayer.add(marker);
		esrimap.addLayer(newlayer);
		
		log('geometryY!=')
    } else if (ymin!='') {
		  var spatialref = new esri.SpatialReference({ wkid: getMapParams().WKID }); //ref to British national grid projected coordinates
		  var selectedExtent = new esri.geometry.Extent(xmax,ymax,xmin,ymin,spatialref);
            log('ymin!=')
		  esrimap.setExtent(selectedExtent);
		  if (parseInt(esrimap.getZoom()) !== 6){
		      log('helo')
		        esrimap.setZoom(6);
		  }
		
    } else if (north != '') {
		  var e = parseInt(east);
		  var n = parseInt(north);
		  var spatialref = new esri.SpatialReference({ wkid: getMapParams().WKID }); //ref to British national grid projected coordinates
		  var selectedExtent = new esri.geometry.Extent(e - 250, n - 250, e + 250 , n + 250, spatialref);

		  esrimap.setExtent(selectedExtent);
		  log('north !=')
    }
    
}

function distanceBetweenPoints(lat1, lon1, lat2, lon2){
	//KS: converted from https://verint-lagan01.squiz.co.uk/generator/form/map_dist_betw_2_points
	//KS: I don't know how well it'll work with diffrent WKID so may need to convert to WKID:4326 for actual M
	// Uses the Haversine formula to calculate the distance between two lat/longs 
	var pi = Math.PI;   
	var R = 6371e3; // metres
	var φ1 = lat1*(pi/180);
	var φ2 = lat2*(pi/180);
	var Δφ = (lat2-lat1)*(pi/180);
	var Δλ = (lon2-lon1)*(pi/180);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		Math.cos(φ1) * Math.cos(φ2) *
		Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;

	return d; 
}
function isPointInPolygon(point, polygon){
	//KS: must be same wkid - and it's a tiny bit off at the edges
	//KS e.g. isPointInPolygon([1.5,1.5],[[1,1],[1,2],[2,2],[2,1]]);
	// ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0], yi = polygon[i][1];
        var xj = polygon[j][0], yj = polygon[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function isPointWithinSquare(lonXLatY, extent){
	//KS: lonXLatY should be in the format lonX, LatY
	//    extent should be in the formant minLonX, maxLonX, minLatY, maxLatY
	return isPointInPolygon(
		[lonXLatY[0], lonXLatY[1]], 
		[[extent[0],extent[2]],[extent[1],extent[2]],[extent[1],extent[3]],[extent[0],extent[3]]]
	);
}

function popupOrZoomTo(aMap, aPoint){
	var location = aPoint;//new Point(lon, lat, wkid);
	if (getMapParams().assetMaxDrawZoom){
		if (getMapParams().assetMaxDrawZoom > aMap.getLevel()){//KS: center and zoom
			aMap.centerAndZoom(location, getMapParams().assetMaxDrawZoom);
			return false;
		}else{//KS: popup window
			return true;
		}
	} else {
		if (6 > aMap.getLevel()){//KS: center and zoom
			aMap.centerAndZoom(location, 6);
			return false;
		}else{//KS: popup window
			return true;
		}
	}
}

function convertLonLat(lonLatArray, inputSR, outputSR, callbackFunction){
	if (inputSR.type && inputSR.type == 'Proj4'){
		//E.G. convertLonLat([0,0],{},{},)
		//KS is there anyway to convert the Proj4 projection to a SpatialReference? then we could drop the outputSR.wkid
		var conversion = proj4(inputSR.projection, outputSR.projection, lonLatArray);
		callbackFunction({
			x:conversion[0],
			y:conversion[1],
			WKID:outputSR.WKID
		});
	}else {
		//KS: the callback function is the name (no ()) of the function the return value should call
		var inLon = lonLatArray[0];//Y
		var inLat = lonLatArray[1];//X
		var inSR = new SpatialReference({wkid: inputSR});
		var outSR = new SpatialReference({wkid: outputSR});

		var outPoint;

		var requestURL = getMapParams().geometryServer+'/project?f=pjson&inSR='
			+inputSR+'&outSR='
			+outputSR+'&geometries=%7B%22geometryType%22%3A%22esriGeometryPoint%22%2C%22geometries%22%3A%5B%7B%22x%22%3A'
			+inLon+'%2C%22y%22%3A'
			+inLat+'%7D%5D%7D';

		$.ajax({url: requestURL, dataType: 'jsonp', crossDomain: true}).done(function(response){
			return callbackFunction({
				x:response.geometries[0].x,
				y:response.geometries[0].y,
				WKID:outSR
			});
		}).fail(function(response){
			return callbackFunction(false);
		});
	}
	
}

function geolocate(){
	if( navigator.geolocation ) { 
		navigator.geolocation.getCurrentPosition(function(pos){
			log(pos)
			//convertLonLat([pos.coords.longitude, pos.coords.latitude],4326,getMapParams().WKID,geolocateLogic)//callback function
			convertLonLat(
				[pos.coords.longitude, pos.coords.latitude],
				{WKID:getMapParams().geolocateWKID, projection:getMapParams().geolocateWKIDProj4, type:'Proj4'},
				{WKID:getMapParams().WKID, projection:getMapParams().WKIDProj4, type:'Proj4'},
				geolocateLogic//callback function
			);
		});
		log("geolocate working")
	}else{
		log("navigator.geolocation undefined")
	}
}

function geolocateLogic(lonLatWkid){
	if (lonLatWkid){
		var point = new Point(lonLatWkid.x, lonLatWkid.y, new SpatialReference(lonLatWkid.WKID));
		log(point)
		var withinExtent = isPointWithinSquare([point.x, point.y], getMapParams().extent);
		if (KDF.kdf().form.readonly) { /*add U mode */
				log('masuk R mode');

				if (KDF.getVal('txt_confirm_assetid').length > 1) {
					var centerpoint = new Point(parseInt(KDF.getVal('txt_confirm_lon')), parseInt(KDF.getVal('txt_confirm_lat')), new esri.SpatialReference({
					wkid: 27700
					}));
					esrimap.getLayer("graphicsLayer2").show();
					esrimap.centerAndZoom(centerpoint, 9);
				}
				else {
					log('non asset')
					KDF.hideWidget('txt_assetid_viewmode');
					KDF.hideWidget('txt_featureid_viewmode');
					var centerpoint = new Point(parseInt(KDF.getVal('le_gis_lon')), parseInt(KDF.getVal('le_gis_lat')), new esri.SpatialReference({
						wkid: 27700
					}));
					
					esrimap.getLayer("graphicsLayer2").show();
					esrimap.centerAndZoom(centerpoint, 9);
				}

			} else {

			if (withinExtent){
				//KS: zoom to where assets are beginning to be drawn
				esrimap.centerAndZoom(point, (getMapParams().assetMaxDrawZoom) ? getMapParams().assetMaxDrawZoom : 6).then(drawAssetLayer())
			}else{
				var centerPoint = new Point(getMapParams().centerLonLat.x, getMapParams().centerLonLat.y, new SpatialReference(getMapParams().WKID));
				esrimap.centerAndZoom(centerPoint, getMapParams().centerZoom);
			}
			//Trig[longitude, latitude, WKID, withinExtent]: Only if successful, provides location and if it's within the maps extent
			$(formName()).trigger('_map_geolocated',[point.x, point.y, withinExtent]);
    	}
	} else {
		log("Couldn't geolocate - point was undefined")	
	}
}



function addGeolocateButton(le_gis){
	var locateCharacter = (getMapParams().locateChar) ? getMapParams().locateChar : '⌕';
	var parent = le_gis.find('> .esriMapContainer')
	var content = '<div class="esriSimpleSlider esriLocateButton" style="z-index: 30;top: 82px;left: 20px;"><div title="Locate"><span>'+ locateCharacter +'</span></div></div>'
	
	parent.prepend(content);
	
	//KS add (and remove excisitng) event listener
	$('.esriLocateButton').off('click').on('click',function(){
		geolocate();
	});
	
	$(formName()).trigger('_map_geolocateButtonAdded',[parent.find('.esriLocateButton'), content]);
}

function getOpenCaseMarker(xmax, xmin, ymax, ymin){
	if (KDF.kdf().form.readonly) {
			return;
    	} 
	
       if (KDF.getVal('txt_eventcode')) { 
                 
                 //log('mantap')
                 //log(KDF.getVal('txt_customer_id'))
                 if (typeof KDF.getVal('txt_customer_id') !== undefined && KDF.getVal('txt_customer_id') !== "") {
                   sx_customer_id = KDF.getVal('txt_customer_id'); 
                    //log('asdf')
                 } else if (KDF.getVal('txt_customer_id') === "") {
                    sx_customer_id = '999999999'; 
                     //log('assdf11df')
                 }
                 //log(sx_customer_id);
               KDF.customdata('open_case_marker', 'create', true, true, {'eventcode': KDF.getVal('txt_eventcode'),'customerid': sx_customer_id, 'xmax': xmax.toString(), 'xmin':xmin.toString(), 'ymax': ymax.toString(), 'ymin': ymin.toString(), 'asset_layer': KDF.getVal('asset_layer')});
                //KDF.customdata('get_open_case_marker', 'create', true, true, {'eventcode': KDF.getVal('txt_eventcode')});
                KDF.unlock();
             }   
}

function formName(){
	//KS: I want triggers to work same way as api.js, so need this to get name
	
	if (KDF.hasOwnProperty('kdf()')){
//        if (KDF.kdf().name){
		return '#dform_'+KDF.kdf().name;
	}else{
		//KS: just incase, this will work in most cases (it's what was used before)
		return '#dform_container';
	}
}

function hardcodeLegend(){
	$('#legendRoot').remove()
	//KS: this is a quick hardcoded version found in cpe_test. Use that one, we just needed something we could garentee would work for the demo - the other is dynamic and is made to be future proof.
	
	var legend = getMapParams().legend;

	if (legend != undefined){
		if ($('#dform_widget_le_gis_header').length < 1){
			$('#dform_widget_gis_le_gis').prepend('<div class="headerGIS" id="dform_widget_le_gis_header"></div>');
		}
		
		var items = 0;
		if (legend.assetIcon != undefined) items++;
		if (legend.selectedIcon != undefined) items++;
		if (legend.openCase != undefined) items++;
		if (legend.activeCase != undefined) items++;
		
		
		var root = $('#dform_widget_le_gis_header');
		
		var html = '<div id="legendRoot" style="position: relative"><div class="templatePicker" id="GISLegend" widgetid="GISLegend"><div hidefocus="hidefocus" role="grid" dojoattachevent="onmouseout:_mouseOut" tabindex="0" class="dojoxGrid grid" id="dojox_grid_DataGrid_0" align="left" widgetid="dojox_grid_DataGrid_0" aria-readonly="true" style="height: auto; width: '+items*80+'px; user-select: none;"><div class="dojoxGridMasterHeader" dojoattachpoint="viewsHeaderNode" role="presentation" style="display: block; height: 0px;"><div class="dojoxGridHeader" dojoattachpoint="headerNode" role="presentation" style="display: none; width: 284px; left: 1px; top: 0px;"><div dojoattachpoint="headerNodeContainer" style="width:9000em" role="presentation"><div dojoattachpoint="headerContentNode" role="row"><table class="dojoxGridRowTable" border="0" cellspacing="0" cellpadding="0" role="presentation"><tbody><tr><th tabindex="-1" aria-readonly="true" role="columnheader" id="dojox_grid_DataGrid_0Hdr0" class="dojoxGridCell dojoDndItem " idx="0" style="width:6em;" dndtype="gridColumn_dojox_grid_DataGrid_0"><div class="dojoxGridSortNode">cell0</div></th><th tabindex="-1" aria-readonly="true" role="columnheader" id="dojox_grid_DataGrid_0Hdr1" class="dojoxGridCell dojoDndItem " idx="1" style="width:6em;" dndtype="gridColumn_dojox_grid_DataGrid_0"><div class="dojoxGridSortNode">cell1</div></th><th tabindex="-1" aria-readonly="true" role="columnheader" id="dojox_grid_DataGrid_0Hdr2" class="dojoxGridCell dojoDndItem " idx="2" style="width:6em;" dndtype="gridColumn_dojox_grid_DataGrid_0"><div class="dojoxGridSortNode">cell2</div></th><th tabindex="-1" aria-readonly="true" role="columnheader" id="dojox_grid_DataGrid_0Hdr3" class="dojoxGridCell dojoDndItem " idx="3" style="width:6em;" dndtype="gridColumn_dojox_grid_DataGrid_0"><div class="dojoxGridSortNode">cell3</div></th></tr></tbody></table></div></div></div></div><div class="dojoxGridMasterView" dojoattachpoint="viewsNode" role="presentation" style="height: 62px;"><div class="dojoxGridView" role="presentation" id="dojox_grid__View_2" widgetid="dojox_grid__View_2" style="width: 284px; left: 1px; top: 0px;"><input type="checkbox" class="dojoxGridHiddenFocus" dojoattachpoint="hiddenFocusNode" role="presentation"><input type="checkbox" class="dojoxGridHiddenFocus" role="presentation"><div class="dojoxGridScrollbox" dojoattachpoint="scrollboxNode" role="presentation"><div class="dojoxGridContent" dojoattachpoint="contentNode" hidefocus="hidefocus" role="presentation" style="height: 62px; width: 284px;"><div role="presentation" style="position: absolute; left: 0px; top: 0px;"><div class="dojoxGridRow" role="row" style=""><table class="dojoxGridRowTable" border="0" cellspacing="0" cellpadding="0" role="presentation"><tbody><tr>';
		
		
		if (KDF.getVal('rad_problem_option_OSM')) {
			if ((KDF.getVal('rad_problem_option_OSM') !== 'OS02') && (KDF.getVal('rad_problem_option_OSM') !== 'OS03')) {
				if (legend.assetIcon != undefined){
					var name = (legend.assetIcon.name != undefined) ? legend.assetIcon.name : 'Asset';
				
				html += '<td tabindex="-1" role="gridcell" class="dojoxGridCell" idx="0" style="width:6em;"><div class="item" style="text-align: center;" id="tpick-surface-0" widgetid="tpick-surface-0"><div class="itemSymbol" dojoattachpoint="_surfaceNode"><svg overflow="hidden" width="30" height="30"><defs></defs><circle fill="rgb(240, 234, 239)" fill-opacity="1" stroke="rgb(109, 52, 101)" stroke-opacity="1" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" cx="0" cy="0" r="5.333333333333333" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid" transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)"></circle></svg></div><div class="itemLabel">'+name+'</div></div></td>';
				}
			}
		} else {
			if (legend.assetIcon != undefined){
				var name = (legend.assetIcon.name != undefined) ? legend.assetIcon.name : 'Asset';
				
				html += '<td tabindex="-1" role="gridcell" class="dojoxGridCell" idx="0" style="width:6em;"><div class="item" style="text-align: center;" id="tpick-surface-0" widgetid="tpick-surface-0"><div class="itemSymbol" dojoattachpoint="_surfaceNode"><svg overflow="hidden" width="30" height="30"><defs></defs><circle fill="rgb(240, 234, 239)" fill-opacity="1" stroke="rgb(109, 52, 101)" stroke-opacity="1" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" cx="0" cy="0" r="5.333333333333333" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid" transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)"></circle></svg></div><div class="itemLabel">'+name+'</div></div></td>';
			}
		
		}
		
		if (legend.selectedIcon != undefined){
			var name = (legend.selectedIcon.name != undefined) ? legend.selectedIcon.name : 'Selected';
			
			html += '<td tabindex="-1" role="gridcell" class="dojoxGridCell " idx="1" style="width:6em;"><div class="item" style="text-align: center;" id="tpick-surface-1" widgetid="tpick-surface-1"><div class="itemSymbol" dojoattachpoint="_surfaceNode"><svg overflow="hidden" width="30" height="30"><defs></defs><path fill="rgb(109, 52, 101)" fill-opacity="1" stroke="rgb(109, 52, 101)" stroke-opacity="1" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" path="M -6.666666666666666,0 L 0,-6.666666666666666 L 6.666666666666666,0 L 0,6.666666666666666 L -6.666666666666666,0 E" d="M-6.6667 0L 0-6.6667L 6.6667 0L 0 6.6667L-6.6667 0" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid" transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)"></path></svg></div><div class="itemLabel">'+name+'</div></div></td>';
		}
		if (legend.openCase != undefined){
			var name = (legend.openCase.name != undefined) ? legend.openCase.name : 'Open issue';
			var url = (legend.openCase.url != undefined) ? legend.openCase.url : 'https://cpe-edinburghcc.squiz.co.uk/dformresources/content/map-green.png';
			
			html += '<td tabindex="-1" role="gridcell" class="dojoxGridCell " idx="2" style="width:6em;"><div class="item" style="text-align: center;" id="tpick-surface-2" widgetid="tpick-surface-2"><div class="itemSymbol" dojoattachpoint="_surfaceNode"><svg overflow="hidden" width="30" height="30"><defs></defs><image fill-opacity="0" stroke="none" stroke-opacity="0" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" x="-32" y="-32" width="64" height="64" preserveAspectRatio="none" xlink:href="'+url+'" transform="matrix(0.39062500,0.00000000,0.00000000,0.39062500,15.00000000,15.00000000)"></image></svg></div><div class="itemLabel">'+name+'</div></div></td>';
		}
		if (legend.activeCase != undefined){
			var name = (legend.activeCase.name != undefined) ? legend.activeCase.name : 'Subscribed issue';
			var url = (legend.activeCase.url != undefined) ? legend.activeCase.url : 'https://cpe-edinburghcc.squiz.co.uk/dformresources/content/map-blue.png';
			
			html += '<td tabindex="-1" role="gridcell" class="dojoxGridCell " idx="3" style="width:6em;"><div class="item" style="text-align: center;" id="tpick-surface-3" widgetid="tpick-surface-3"><div class="itemSymbol" dojoattachpoint="_surfaceNode"><svg overflow="hidden" width="30" height="30"><defs></defs><image fill-opacity="0" stroke="none" stroke-opacity="0" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" x="-32" y="-32" width="64" height="64" preserveAspectRatio="none" xlink:href="'+url+'" transform="matrix(0.39062500,0.00000000,0.00000000,0.39062500,15.00000000,15.00000000)"></image></svg></div><div class="itemLabel">'+name+'</div></div></td>';
		}
		
		html += '</tr></tbody></table></div></div></div></div></div></div><div class="dojoxGridMasterMessages" style="display: none;" dojoattachpoint="messagesNode"></div><span dojoattachpoint="lastFocusNode" tabindex="0"></span></div></div></div></div></div>';
		
		root.html(html+root.html());
	}
}

/**************Code from street light - Start******************/
var canContinueWithoutMap = false;

//KS: a garenteed way to implement _KDF_mapReady
var _KDF_ready = jQuery.Deferred();
var _KDF_mapReady = jQuery.Deferred();

_KDF_ready.done(function(){
	//KS: will be called when _KDF_ready is resolved - please define content of functions elseware (no function(){} within here)
	//regexSearch("[0-9A-Za-z ]{2,}");
	
	
});
_KDF_mapReady.done(function(){
	//KS: will be called when _KDF_mapReady is resolved - please define content of functions elseware (no function(){} within here)
	addLoadingWidget()
	addSelectedAssetWidget()
	if (getMapParams().geolocateButton) addGeolocateButton($("[data-type='gis']"));
	if (getMapParams().geolocateAuto) setTimeout(function(){geolocate()}, 10);
	log('triggerFunction:');log(triggerFunction);
	
	esrimap.infoWindow.customShow = 
	
	$(formName()).on('_map_selectQueueInteraction', function(event, assetID, type, queueMax, queueSize, queueWithAsset){
		log('_map_selectQueueInteraction triggered')
		var selectLeft = queueMax - queueSize;
		//alert('Can choose '+selectLeft+ ' more');
		if (queueSize > 0){
			$('#dform_widget_button_but_continue_selected').text('Continue with '+/*queueSize+*/' selected');
			selectedAssetsJSONDump('selected_assets_json');
			log('queueWithAsset');log(queueWithAsset);
			KDF.showWidget('but_continue_selected');
		} else {
			KDF.hideWidget('but_continue_selected');
		}
	});
	$(document).on('click', '.queueButton', function(){
		log('click .queueButton triggered')
		var assetId = $(this).attr('data-asset_id');
		if (assetId){
			//KS remove graphics without assets (i.e. reporting locations only)
			removeConfirmNonAssets(_selectedAssetGraphics);
			
			addToQueue(assetId);
			
			_latestGraphic = parseGraphicJSON($(this));
			assetGraphicQueueInteraction(_selectedAssetGraphics, _latestGraphic);
			
			esrimap.infoWindow.hide();
			drawAssetLayer();
		}
	});
	
	esrimap.infoWindow.show = (function(_super) {
	//KS: for referance https://stackoverflow.com/a/49862009
        return function() {
            // Extend it to log the value for example that is passed
            var width = $('#dform_widget_gis_le_gis').width();
            if (width > 720){//KS desktop

            }else{//KS mobile
                setTimeout(function() {//KS: needs to be called after the return - and we don't have much time left. Otherwise will cause infinite loop
                    esrimap.infoWindow.maximize();
                }, 10);
            }
            //esrimap.infoWindow.maximize();
            return _super.apply(this, arguments);
        };         
    })(esrimap.infoWindow.show);
});

var triggerFunction = {
	'_map_selectQueueInteraction':function(event, assetID, type, queueMax, queueSize, queueWithAsset){
		log('_map_selectQueueInteraction triggered')
		var selectLeft = queueMax - queueSize;
		//alert('Can choose '+selectLeft+ ' more');
		if (queueSize > 0){
			$('#dform_widget_button_but_continue_selected').text('Continue with '+/*queueSize+*/' selected');
			selectedAssetsJSONDump('selected_assets_json');
			log('queueWithAsset');log(queueWithAsset);
			KDF.showWidget('but_continue_selected');
		} else {
			KDF.hideWidget('but_continue_selected');
		}
	},
	'click .queueButton':function(){
		log('click .queueButton triggered')
		var assetId = $(this).attr('data-asset_id');
		if (assetId){
			//KS remove graphics without assets (i.e. reporting locations only)
			removeConfirmNonAssets(_selectedAssetGraphics);
			
			addToQueue(assetId);
			
			_latestGraphic = parseGraphicJSON($(this));
			assetGraphicQueueInteraction(_selectedAssetGraphics, _latestGraphic);
			
			esrimap.infoWindow.hide();
			drawAssetLayer();
		}
	},
	
};


var infoTemplates = {
    default:function(graphic){
        /*Example:
        On show, for maximizing
        require(["dojo/_base/connect", ... ], function(connect, ... ) {
          connect.connect(popup,"onShow",function(){
            log('info window is showing');
            if (functionIfMobile()){
                popup.maximize();
            } else {
                popup
            }});});*/
        
        log('graphic');log(graphic);
        log('graphic.attributes');log(graphic.attributes);
        log('graphic.attributes.description');log(graphic.attributes['description']);
        var content = '';
		
	if (graphic.attributes['description'] === undefined){//KS Not the case marker journey - likely assets/location
		content += infoTemplates.popupFields(graphic);

		if (getMapParams().popupConfirmText){
			if (getMapParams().popupConfirmText instanceof Function){
				//KS it is a function, call it and display what the results of the function is - need to pass assetid
				content += getMapParams().popupConfirmText(graphic);
			}else{
				content += '</br><button id="" class="mapConfirm btn-continue" data-asset_id="">'+getMapParams().popupConfirmText+'</button></div>';
			}
		}else{
			//KS default text
			content += '</br><button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm</button></div>';
		}

		if(getMapParams().confirmIntergration != undefined){
				getMapParams().confirmIntergration = {
				    lat:graphic.geometry['y'],
				    lon:graphic.geometry['x'],
				    sitecode:graphic.attributes['SITE_CODE'],
				    assetid:graphic.attributes['ASSET_ID'],
				    featureid:graphic.attributes['FEATURE_ID'],
				}
			}
		content += '<p id="jsonAsset" class="dform_hidden">'+JSON.stringify({
			attributes:graphic.attributes,
			geometry:graphic.geometry,
			symbol:graphic.symbol,
		})+'</p>';
	}else{//KS Case marker journey
		content += infoTemplates.caseMarkerTemplate(graphic);
	}
	    
	log(content)

        return content;
    },
    caseMarkerTemplate:function(graphic){
    	var content = graphic.attributes.description;
		return content;
    },
	singleAsset:function(graphic){
		var content= graphic.attributes.description;
		
			 if (typeof esrimap.getLayer("graphicsLayer2") !== 'undefined') {
                        esrimap.getLayer("graphicsLayer2").hide();
                    }
		
		if (graphic.attributes.latitude){
                    
                    var lan = graphic.attributes.latitude ;
                    var long =  graphic.attributes.longitude ;
					

					lan = lan + 5;
					long = long - 1;

                    KDF.setVal('le_gis_lon', long);
                    KDF.setVal('le_gis_lat', lan);
					
					 KDF.setVal('txt_confirm_assetid', graphic.attributes.ASSET_ID);
                    
                     //KDF.customdata('reverse-geocode-edinburgh', 'create', true, true, {'longitude': long.toString() , 'latitude' : lan.toString()});
                     //KDF.unlock();
                    
                    if (typeof KDF.getVal('txt_confirm_lat') != 'undefined' && KDF.getVal('txt_confirm_lon') != 'undefined') {
                        KDF.setVal('txt_confirm_lat', lan.toString());
                        KDF.setVal('txt_confirm_lon', long.toString());
                    }
					
					KDF.setVal('le_title', graphic.attributes.SITE_NAME);
                    
                    if (typeof KDF.getVal('txt_confirm_sitecode') != 'undefined') {
                        KDF.setVal('txt_confirm_sitecode', graphic.attributes.site_code);
                    }
                    
                   
		}
		
		return content;
	},
    searchRadius:function(graphic, radius){
        var point = graphic.geometry;
        
        var circleGeometry = new Circle(centerpoint,{"radius": radius, "numberOfPoints": 4, "radiusUnit": Units.METERS, "type": "extent"});
    
    	var xmaxE = circleGeometry.getExtent().xmax;
    	var ymaxE = circleGeometry.getExtent().ymax;
    	var xminE = circleGeometry.getExtent().xmin;
    	var yminE = circleGeometry.getExtent().ymin;
    	
    	var esriAssetUrl = getCommunalAssetURl() + '&geometry=%7B%22xmin%22%3A' + circleGeometry.getExtent().xmin + '%2C%22ymin%22%3A' + circleGeometry.getExtent().ymin + '%2C%22xmax%22%3A' + circleGeometry.getExtent().xmax + '%2C%22ymax%22%3A' + circleGeometry.getExtent().ymax + '%2C%22spatialReference%22%3A%7B%22wkid%22%3A'+getMapParams().WKID+'%7D%7D';
    	log(esriAssetUrl)
    	$.ajax({url: esriAssetUrl, dataType: 'jsonp', crossDomain: true}).done(function(response) {
    	    return response;
    	}).fail(function() {
    		KDF.showError('It looks like the connection to our mapping system has failed, please try to log the fault again');
    		return false;
    	});
	
	
	    /*log(response);
		var defaultSymbol = new SimpleMarkerSymbol(getMapParams().markerSymbol)
		
		response.features.forEach(function(asset){
		    var graphic = new Graphic(new Point(Number(asset.geometry.x), Number(asset.geometry.y), new esri.SpatialReference(getMapParams().WKID)), defaultSymbol, asset.attributes);
		    var notUsed = true;
		    if (notUsed){ eachPoints.push(graphic); }
		});
	}*/
        
    },
    assetsWithinRange:function(graphic, radius){
        //KS: will be used to prevent assets being displayed if within range of other assets.
        var content = '';
        if (radius == undefined) radius = 100;
        content += infoTemplates.popupFields(graphic);
        if (infoTemplates.searchRadius(graphic, radius).features > 0){
            content += '<p>Another asset is within '+radius+'m, so you cannot report here</p>'
        }else{
            content += '</br><button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm</button></div>';
        }
    },
    /*queue:function(graphic){
        var content = '';
        var assetId = graphic.attributes.FEATURE_ID;
        content += infoTemplates.popupFields(graphic);
        
        if (isAssetSelected(assetId).length > 0){
    		//KS display remove from select
    		content += '</br><button id="queueRemove" class="btn-orange queueButton queueRemove" data-asset_id="'+assetId+'">Deselect '+assetId+'</button></div>';
    	}else{
    		content += '</br><button id="queueAdd" class="btn-continue queueButton queueAdd" data-asset_id="'+assetId+'">Select '+assetId+'</button></div>';
    		//KS display add to queue
    	}
        
		//Trig[content, esriServiceURL]: provides the content of the asset response and the url used to return it.
		//$(formName()).trigger('_map_assetInfoReturned',[content, esriServiceURL]);
        if(getMapParams().confirmIntergration != undefined){
			getMapParams().confirmIntergration = {
			    lat:graphic.geometry['y'],
			    lon:graphic.geometry['x'],
			    sitecode:graphic.attributes['SITE_CODE'],
			    assetid:graphic.attributes['ASSET_ID'],
			}
		}
	    content += '<p id="jsonAsset" class="dform_hidden">'+JSON.stringify(graphic)+'</p>';
        return content;
    },*/
    
    popupFields:function(graphic){
        var content = '';
        if(getMapParams().popupFields){//KS object is defined (test with empty object, will return true but we might want that, considering default is null)
    		getMapParams().popupFields.forEach(function(field){
    			content += '<b>'+field[0]+'</b>'+ graphic.attributes[field[1]]+"</br>";
    	    });
        }
        return content;
    },
};


$(document).on('click','#dform_widget_button_but_no_map',function() {
	noMapSelected = true;
	if(canContinueWithoutMap){
		KDF.hideWidget('ahtm_no-map_message');
		if (typeof KDF.getVal('txt_confirm_sitecode') !== 'undefined') {
			
	        KDF.customdata('get_streetid_usrn', 'report-without-map', true, true, {'USRN': KDF.getVal('txt_confirm_sitecode')});
		}
		
		KDF.setVal('le_title', '');
		KDF.gotoNextPage();
		if (getMapParams().selectQueueSize > 1){//KS needed for multiple select
			_selectedAssetGraphics = [];
			_latestGraphic = {};

			esrimap.infoWindow.hide()

			getSelectFilter('userSelect', true, true).forEach(function(assetFilter){
				assetFilter.selectedAssets = [];
			});
			KDF.hideWidget('but_continue_selected');

			try{refreshAssets(prepareConfirmObject(_lastStreetSearched));}catch(error){log(error)}
			//Should I clear the other selected?
			KDF.setVal('le_title', '');	
			drawAssetLayer();
		}
	}else{
		log('canContinueWithoutMap != true');
		KDF.showWidget('ahtm_no-map_message');
		/*KS: for smoother scrolling, but focus causes issues
		
		$([document.documentElement, document.body]).animate({
			scrollTop: $("[data-name='ahtm_no-map_message']").offset().top
		}, 1000);*/
		$('#dform_widget_txt_postcode').focus()
	}
});

function addToQueue(assetID, optAssetField, assetObj){
    if (optAssetField === undefined) optAssetField = getMapParams().selectQueueAssetAttribute;
	var assetFields = isAssetSelected(assetID, optAssetField);
	var queueMax = getMapParams().selectQueueSize;
	var queueSize = 0;
	var selectQueues = getSelectFilter('userSelect', true, true);
	selectQueues.forEach(function(queue){
		queueSize += queue.selectedAssets.length;
	});

	if (assetFields.length > 0){
	    log(assetFields)
		//KS within select, must remove
		assetFields.forEach(function(queueWithAsset){//KS remove element
			queueWithAsset.selectedAssets.splice(queueWithAsset.selectedAssets.indexOf(assetID),1);
			
			queueSize -= 1;
			
			$(formName()).trigger('_map_selectQueueInteraction',[assetID, 'removed', queueMax, queueSize, queueWithAsset]);
		});
	}else{
		//KS not selected, add to select queue (if can add more)
		if (queueMax >= queueSize +1){
			//KS: can  add
			log(selectQueues);
			selectQueues[0].selectedAssets.push(assetID);
			
			$(formName()).trigger('_map_selectQueueInteraction',[assetID, 'pushed', queueMax, queueSize+1, selectQueues[0]]);
		}else{
			//KS queue is full, remove last (may be from other form)
			if (selectQueues[0].selectedAssets.length > 0){
				//KS can remove to make room for new asset
				selectQueues[0].selectedAssets.shift()
				selectQueues[0].selectedAssets.push(assetID);
				
				$(formName()).trigger('_map_selectQueueInteraction',[assetID, 'shiftThenPushed', queueMax, queueSize, selectQueues[0]]);
			} else{
				log('No room in primary selectStorage to add asset as there are to many secondary assets');
				
				/*$(formName()).trigger('_map_selectQueueInteraction',[assetID, 'secondaryFull', selectQueues[0]]);*/
			}
		}
	}
}

function isAssetSelected(asset, optSpecificField){
	//KS the =true means match all if none is supplied
	//KS to identify if we should add or remove asset from select list
	var userSelectedAssets = getSelectFilter('userSelect', true);//KS get the user selected assets
	log('asset');log(asset);
	var arraysContaining = [];//KS need to do returnParam.length to check in response
	userSelectedAssets.forEach(function(selectedAssetFilter){
	    if (selectedAssetFilter.selectedAssets.indexOf(asset) > -1){
	        if ((optSpecificField && optSpecificField==selectedAssetFilter.uniqueField) || !optSpecificField){
	            arraysContaining.push(selectedAssetFilter);
	        }
	    }
	    //log(selectedAssetFilter.selectedAssets);
	    //if ((!optSpecificField && optSpecificField==selectedAssetFilter.uniqueField) || !optSpecificField){
	    //    arraysContaining.push(selectedAssetFilter);
	    //}
	});
	return arraysContaining;
}


function selectedAssetsJSONDump(optTable, optInsert){
    if (optInsert === undefined) optInsert = false;
	var selectedAssets = JSON.stringify(getSelectFilter('userSelect', true));
	if (optTable){
		//KS: 
		if (optInsert){
			log('TODO insert json data dump into table');
			log(selectedAssets);
		}else{
			KDF.setVal('selected_assets_json', selectedAssets);
			log(selectedAssets);
		}
	}else{
		return selectedAssets;
	}
}

function getSelectFilter(type, isAssumedThere, optCreateIfNot, outputAsArray){
    if (isAssumedThere === undefined) isAssumedThere = false;
    if (optCreateIfNot === undefined) optCreateIfNot = false;
    if (outputAsArray === undefined) outputAsArray = false;
	//KS the type we're looking for explicitly - if assumed there then will presume if there is any, it's either has the type or is the first one - returns empty if there are none in this case. If not assumed then it will only return when type:val=type
	var storage = getMapParams().selectStorage;
	var caseSelects = [];
	if (storage.length > 0){
		storage.forEach(function(filter){
			if (filter.type && filter.type == type) caseSelects.push(filter);
		});
		if (caseSelects.length == 0 && isAssumedThere){
			caseSelects.push(storage[0]);
		}
	}else{
		if (optCreateIfNot){
			log('There was no filters within the getMapParams().selectStorage, but you will create one');
			storage.push(JSON.parse(JSON.stringify(getMapParams().selectStorageDefaultUserSelect)))
			caseSelects.push(getMapParams().selectStorage[0])
			log(storage)
		} else {
			log('There was no filters within the getMapParams().selectStorage, and you will not create one');
		}
		
	}
	if (outputAsArray){
	    var caseArray = [];
	    caseSelects.forEach(function(select){
	        caseArray = caseArray.concat(select.selectedAssets);
	        //KS TODO ensure there are no duplicates
	        //log(caseArray)
	    });
	    return caseArray;
	}else{
	    return caseSelects;
	}
	
}

function showLoading(){
    //log('call a')
	//KDF.showWidget('ahtm_cool_loading_gif');
	$('.map-buffer').removeClass('visibility-hidden');
	changeAllLayersOpacity('0.2');
	esrimap.disableMapNavigation();
	esrimap.hideZoomSlider();
}
function hideLoading(error){
    //log('call b')
	//KDF.hideWidget('ahtm_cool_loading_gif');
	$('.map-buffer').addClass('visibility-hidden');
	changeAllLayersOpacity('0.9');
	esrimap.enableMapNavigation();
	esrimap.showZoomSlider();
}
function addLoadingWidget(){
    var element = '<div class="map-buffer lds-spinner visibility-hidden"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
    var parent = $('[data-type="gis"] .esriMapContainer').first();
    if (parent.find('.map-buffer').length < 1){//KS only adds one
        parent.prepend(element)
    }
}
function addSelectedAssetWidget(){
    var element = $('<div data-type="textarea" data-name="selected_assets_json" data-active="false" data-agentonly="false" class="container dform_widget  dform_widget_field dform_widget_type_textarea dform_widget_selected_assets_json dform_widget_ dform_hidden txta-gov"><div><label for="dform_widget_selected_assets_json">Selected assets JSON</label></div><div class="txta-length"><textarea id="dform_widget_selected_assets_json" name="selected_assets_json" class="dform_persist" rows="10" cols="100" data-customalias="selected_assets_json"></textarea><div class="txta-length-message"></div></div></div>');
    var sibling = $('[data-type="gis"]').first().parent();
    if (sibling.parent().find('.dform_widget_selected_assets_json').length < 1){
        element.insertAfter(sibling);
    } else {
        log("Didn't insert a 'selected asset json widget' as there already was one there");
    }
}

function applyAssetListener(){
	//KS: pretty sure this is unused, since thre is one being used just like it
    $('.queueButton').off().on('click',function(){
        //alert('.queueButton triggered')
        //convert to the one which looks at parent element and filters 
    	var assetId = $(this).attr('data-asset_id');
    	if (assetId){
		//KS remove graphics without assets (i.e. reporting locations only)
		removeConfirmNonAssets(_selectedAssetGraphics);
		
    		addToQueue(assetId);
		
		_latestGraphic = parseGraphicJSON($(this));
		assetGraphicQueueInteraction(_selectedAssetGraphics, _latestGraphic);
    		
		esrimap.infoWindow.hide();
    		drawAssetLayer();
    	}
    	//KS triger redraw
    });
}

var _selectedAssetGraphics = [];
var _latestGraphic = {};
var _lastStreetSearched = {};

function assetGraphicQueueInteraction(selectedAssetGraphics, aGraphic){
    var graphicUniqueID = aGraphic['attributes']['FEATURE_ID'];
    var isDuplicate = [];
    selectedAssetGraphics.forEach(function(currentGraphic){
        var currentGraphicUniqueID = currentGraphic['attributes']['FEATURE_ID'];
        if (graphicUniqueID === currentGraphicUniqueID){
            isDuplicate.push(currentGraphic);
        }
    });
    if (isDuplicate.length > 0){
        //KS Remove graphic(s)
        isDuplicate.forEach(function(currentGraphic){
            selectedAssetGraphics.splice(selectedAssetGraphics.indexOf(currentGraphic),1);
        });
    }else{
        //KS add graphic
        selectedAssetGraphics.push(aGraphic);
    }
}

function parseGraphicJSON(closestElement){
    var jsonHTML = closestElement.parent().parent().find('#jsonAsset');
    var jsonText = jsonHTML.text();
    var parsedJSON = JSON.parse(jsonText);
    //KS: TODO validate is a varable
    return parsedJSON;
}

function prepareConfirmObject(selectedAssetGraphics){
    var params = [selectedAssetGraphics];
    var mapping = {
        'txt_confirm_lat_c':['geometry','y'],
        'txt_confirm_lon_c':['geometry','x'],
        'txt_confirm_assetid_c':['attributes','ASSET_ID'],
	'txt_confirm_featureid_c':['attributes','FEATURE_ID'],
        'txt_confirm_sitecode_c':['attributes','SITE_CODE'],
        'txt_sitename_c':['attributes','SITE_NAME'],
    }
    params.push(mapping);
    return params;
}

$(document).on('click','.mapConfirm',function() {
    KDF.setVal('txt_issuestreet',KDF.getVal('le_gis_rgeo_desc'));
	//KS making the confirm values populate when location is confirmed
    if(getMapParams().confirmIntergration != undefined){
	    var confirm = getMapParams().confirmIntergration;
	    if (confirm.lon != undefined && confirm.lat != undefined && confirm.assetid != undefined && confirm.sitecode != undefined){
		    KDF.setVal('txt_confirm_lon', confirm.lon);
		    KDF.setVal('txt_confirm_lat', confirm.lat);
		    KDF.setVal('txt_confirm_assetid', confirm.assetid);
		    KDF.setVal('txt_confirm_featureid', confirm.featureid);
		    KDF.setVal('txt_confirm_sitecode', confirm.sitecode);
	    }else{
		log('getMapParams().confirmIntergration defined but one of the values within is not')    
	    }
    } else {
	    if (KDF.getVal('txt_confirm_assetid') != '') {
				
				KDF.customdata('reverse-geocode-edinburgh', 'create', true, true, {'longitude': KDF.getVal('txt_confirm_lon') , 'latitude' : KDF.getVal('txt_confirm_lat')});
				KDF.unlock();
		}
	}
	if ($(this).hasClass('noMap')){
		    try{
			_latestGraphic = parseGraphicJSON($(this));
			_selectedAssetGraphics = [_latestGraphic];
			var confirmParams = prepareConfirmObject(_selectedAssetGraphics);
			var selectedAssetArrays = getSelectFilter('userSelect', true, true);
			selectedAssetArrays.forEach(function(assetFilter){
				assetFilter.selectedAssets = [];
			});
			KDF.hideWidget('but_continue_selected');
			//KS TODO Daire's function call here eg - compileConfirmOne-to-many(confirmParams[0]/*, confirmParams[1]*/);
		    }catch(error){
			console.groupCollapsed('Confirm error');
			log(error)
			log('$(this)');log($(this));
			log('_latestGraphic');log(_latestGraphic.toString());
			log('_selectedAssetGraphics');log(_selectedAssetGraphics.toString());
			console.groupEnd()
		    }
	}
    //KS: calling Daire's function
	noMapSelected = false;
	try{refreshAssets(prepareConfirmObject(_selectedAssetGraphics));}catch(error){log(error)}
    
    KDF.gotoNextPage();
    drawAssetLayer()
 });

function writeLocationAsGraphic(lon, lat, sitecode, desc){
    var graphicTemplate = {
    	attributes:{
    		ASSET_ID: "",
    		FEATURE_ID: "",
    		SITE_CODE: sitecode,
    		SITE_NAME: desc,
    	},
    	geometry: {
    		type: "point", 
    		x: lon, 
    		y: lat, 
    		spatialReference: new SpatialReference(27700),
    	}
    };
    var json = JSON.stringify(graphicTemplate);
    $("#jsonAsset").text(json);
}

function removeConfirmNonAssets(selectedAssetGraphics, optAssetFieldName){
    if (optAssetFieldName === undefined){optAssetFieldName = 'FEATURE_ID';}
    var graphicsToRemove = [];
    selectedAssetGraphics.forEach(function(aGraphic){
        if (aGraphic['attributes'][optAssetFieldName] === undefined || aGraphic['attributes'][optAssetFieldName] === ''){
            graphicsToRemove.push(aGraphic)
        }
    });
    graphicsToRemove.forEach(function(aGraphic){
        selectedAssetGraphics.splice(selectedAssetGraphics.indexOf(aGraphic),1);
    });
}

function addAssets(selectedAssetDetails) {
    const millDrive = {attributes: {OBJECTID: 14689644, SITE_NAME: "Granton Mill Drive", NUMBER: 100015, FEATURE_ID: "GRJ15", SITE_CODE: "ABC123"}, geometry: {x: 12345, y: 54321}, symbol: {} };
    const millPlace = {attributes: {OBJECTID: 14689826, SITE_NAME: "Granton Mill Place", NUMBER: 100008, FEATURE_ID: "GRP08", SITE_CODE: "ABC124"}, geometry: {x: 12344, y: 54320}, symbol: {} };
    const mapping = {
        txt_confirm_assetid_c: ["attributes", "FEATURE_ID"],
        txt_confirm_lat_c: ["geometry", "y"],
        txt_confirm_lon_c: ["geometry", "x"],
        txt_confirm_sitecode_c: ["attributes", "SITE_CODE"],
        txt_sitename_c: ["attributes", "SITE_NAME"]
	//KS: retrived from reverse-geocode not the asset  txt_street_id_c:["attributes", "SITE_NAME"]
    };
    selectedAssetDetails = [[millDrive, millPlace], mapping];
    noMapSelected = false; 
    refreshAssets(selectedAssetDetails);
}

function removeAssets() {
    $('.otom_delete').click();
}

function refreshAssets(selectedAssetDetails) {
    var arr_sitecode = [];    
    removeAssets();
    selectedAssetDetails[0].forEach(function(item, index) {
        if (index === 0) {
            Object.keys(selectedAssetDetails[1]).forEach(function(key) {
                var fieldName = key.substring(0, key.lastIndexOf('_c'));
                log(fieldName);
                mappingItem = selectedAssetDetails[1][key];
                KDF.setVal(fieldName, item[mappingItem[0]][mappingItem[1]]);
            });
        }
        $('#dform_widget_button_but_add_asset').click();
        Object.keys(selectedAssetDetails[1]).forEach(function(key) {
            mappingItem = selectedAssetDetails[1][key];
            log('otom_assetdetails['+index+']['+key+']');
            KDF.setVal('otom_assetdetails['+index+']['+key+']', item[mappingItem[0]][mappingItem[1]]);
	    if (key === 'txt_confirm_sitecode_c') {
		arr_sitecode.push(item[mappingItem[0]][mappingItem[1]]);
	    }
        });
    });
	log(arr_sitecode);
	var unique_arr_sitecode = uniq(arr_sitecode);
	hitLaganForStreetID(unique_arr_sitecode);
	log(unique_arr_sitecode);
}

function uniq(a) {
   //return Array.from(new Set(a));
   var i = 0;
   var result = [];

   for (i=0; i<a.length; i++) {
	if (result.length === 0) {
		result.push(a[i]);
	}

	if (result.indexOf(a[i]) < 0 ) {
		result.push(a[i]);		
	}
   }
   return result;
}

function hitLaganForStreetID(arr_object) {
	log('hit lagan');
	var i = 0;
	var streetid_payload = {};
	for (i=0; i< arr_object.length; i++) {
		streetid_payload['usrn_' + i] = arr_object[i];
	}
	log(JSON.stringify(streetid_payload));
	
	KDF.customdata('get_multiple_streetid', KDF.kdf().name, true, true, streetid_payload);
}

function noMapConfirm(SITE_CODE, SITE_NAME, x, y, optLastStreetSearched, optSource){
	if (optSource === undefined){log('noMapConfirm(..., optSource) undefined'), optSource='nomap'}
	if (optSource === undefined){log('noMapConfirm(..., optSource) undefined'), optLastStreetSearched=_lastStreetSearched}
	
	optLastStreetSearched = [{
			attributes:{
				ASSET_ID: "",
				FEATURE_ID: "",
				SITE_CODE: SITE_CODE,
				SITE_NAME: SITE_NAME,
			},
			geometry: {
				type: "point", 
				x: x, 
				y: y, 
				spatialReference: new SpatialReference(27700),
			}
	}];
	
	_lastStreetSearched = optLastStreetSearched;
	
	return optLastStreetSearched;
}
/**************Code from street light - End********************/

// Function for set associated object within case.
// Req: 1. le_associated_obj_type widget, 2. le_associated_obj_id widget
function setAssociatedObj(type, id) {
    // Check if the case already created; If yes - then update case. Otherwise, prepare associated object for case creation.
    log('Updating associated object');
	if(KDF.getParams().caseid) {
        KDF.customdata('update_case', 'create', true, true, {
            'caseid': KDF.getParams().caseid,
            'final_title': KDF.getVal('le_title'),
            'final_desc': KDF.getVal('le_description'),
            'obj_type': type,
            'obj_id': id
        });
    }
    else {
        KDF.setVal('le_associated_obj_type', type);
        KDF.setVal('le_associated_obj_id', id);   
    }
}

/*
FUNCTION FOR VOLUNTARY AND CASE CREATED SUBSCRIPTION WITH ADDITIONAL SUBJECT CODE PARAM
Sample parameter (Type : Object) :

var input_param = {
	    'caseid'    :   KDF.kdf().form.caseid, 
	    'email_address' :   email_subscriber,
	    'subscription_type' :   'enquiry_raised',
	    'customerid':   KDF.getVal('txt_customerid_subscriber'),
	    'eventcode' :   KDF.getVal('txt_eventcode'),
	    'subject_code'  :   KDF.getVal('rad_issue_RDSL')
	};
 
*/

function subscription(subs_obj) {
 /* 
   KDF.customdata('subscription', KDF.kdf().name, true, true, subs_obj);
    
    $('#dform_'+KDF.kdf().name).on('_KDF_custom', function(event, kdf, response, action) {
	   if (action === 'subscription') {
	       if (response.data['output_log'] === 'Subscribed') {
	           log('Subscribed');
	       }
	   } 
	}); */
}

/*set customer details to confirm (Object)*/

function setCustomerIntegrationObject(payload) {
    KDF.setVal('txt_confirm_firstname',payload['first_name']);
    KDF.setVal('txt_confirm_lastname',payload['last_name']);
    KDF.setVal('eml_confirm_email',payload['email']);
    KDF.setVal('tel_confirm_phone',payload['phone']);
    KDF.setVal('txt_confirm_addressno',payload['address_number']);
    KDF.setVal('txt_confirm_addressname',payload['address_name']);
    KDF.setVal('txt_confirm_town',payload['town']);
    KDF.setVal('txt_confirm_postcode',payload['postcode']);
    
    KDF.setVal('txta_confirm_fulladdress',(KDF.getVal('txt_confirm_addressno') +' '+ KDF.getVal('txt_confirm_addressname') +', '+ KDF.getVal('txt_confirm_town')+', '+KDF.getVal('txt_confirm_postcode')).substring(0, 60));
}

function setConfirmUPRN(uprn) {
	KDF.setVal('txt_confirm_uprn', uprn);
}

function applyStreetIDtoWidget(payload) {
    /*Set Maaster Case Associate Object*/
    if (noMapSelected) {
	KDF.setVal('le_title', '');	
    }  else {
	KDF.setVal('le_title',KDF.getVal('txt_sitename'));
    } 
    log('reach this function');
    log('wew : ' + getStreetIDBasedOnUSRN(payload, KDF.getVal('txt_confirm_sitecode')));
  //  KDF.setVal('le_title', KDF.getVal('txt_sitename'));
    KDF.setVal('txt_street_id', getStreetIDBasedOnUSRN(payload, KDF.getVal('txt_confirm_sitecode')));
    //KDF.setVal('le_associated_obj_id', getStreetIDBasedOnUSRN(payload, KDF.getVal('txt_confirm_sitecode')));
   /*Alvin here*/
	setAssociatedObj('D4', KDF.getVal('txt_street_id'));
    $( ".onetomany-otom_assetdetails" ).each(function( index ) {
      log( index + ": " + $( this ).attr('id') );
      log(KDF.getVal('otom_assetdetails[' + index + '][txt_confirm_sitecode_c]'));
      //log();
      KDF.setVal('otom_assetdetails[' + index + '][txt_street_id_c]', getStreetIDBasedOnUSRN(payload, KDF.getVal('otom_assetdetails[' + index + '][txt_confirm_sitecode_c]')));
    });
}

function getStreetIDBasedOnUSRN(payload, usrn) {
	log('mantap', payload);
	var index = -1; 
        for (var i=0; i<payload.length; i++) {
                if (payload[i]['label'] === usrn) {
                        index = i;
                        break;
                }       
        }
	log('payload[index].value : ' + payload[index].value);
        return payload[index].value;
}

function generateAddress(addressno, addressname, town, postcode) {
   	String.prototype.toProperCase = function () {
    		return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	};	 
	return addressno.toProperCase() +' '+ addressname.toProperCase() + ', ' + town.toProperCase() + ', ' + postcode;
}


function voluntarySubscription(caseid, emailSubscriber, customerid) {
    var url = 'https://pmgt-edinburghcc.squiz.co.uk/processes/public/subscription?';
    var param = 'caseid=' + caseid + '&eventcode=' + KDF.getVal('txt_eventcode') + '&subscription_type=voluntary&email_subscriber=' + emailSubscriber + '&customerid=' + customerid + '&subject_code=All';
    KDF.lock();
    
     $.ajax({url: url+param, dataType: 'json', method: 'GET'}).done(function(response) {
            log(response.output_log)
        if (response.output_log === 'Already subscribed') {
             KDF.showInfo('You\'ve already subscribed to case ' + KDF.getVal('txt_case_id_subscribe'));
        } else if (response.output_log === 'Subscribed') {
               KDF.showPage('page_subscription_complete');
               KDF.gotoPage('page_subscription_complete', true, true, true);
        }
        KDF.unlock();
	});
}

/* Set debug to false in order to remove all logging for development. */
var debug = true;
function log(message) {
    if(debug) {
        console.log(message);
    }
}

function cecNotManage(desc, xcoord, ycoord) {
	var content;
	hideLoading();
	var edinburghExtentMinX = 310733.193633054;
	var edinburghExtentMaxX = 330005.5753111506;
	var edinburghExtentMaxy = 680181.2782575564;
	var edinburghExtentMiny = 663544.2449834899;

	if(KDF.getVal('bin_type_WAST')) {
		
		//communal bin
	   if (desc === '') {

			   content = getMapParams().cecNotManaged;
		 
          } else {
			  
			  switch (KDF.getVal('bin_type_WAST')) { 
                				case 'WS53': 
                				    content='No food (grey lid) bin found';
                				break;
                				case 'WS56': 
                				    content='No packaging (green lid) bin found';
                				break;
                				case 'WS67': 
                				    content='No general waste (no wheels, side loading lid) bin found';
                				break;
                				case 'WS62': 
                				    content='No paper (blue lid or blue bin) bin found';
                				break;
                				case 'WS63': 
                				    content='No textiles bin found';
                				break;
                				case 'WS59': 
                				    content='No all glass bin found';
                				break;
                				case 'WS51': 
                				    content='No general waste (communal) bin found';
                				break;
                    	}             
                        content = '<p class="paragraph-normal">' + content + '</p></callInfoWindowbr></br></br>' +
                            '<button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm Location</button></div>';
                     }
	} else if (KDF.getVal('rad_sign_type')) {
			
			// road sign
			if (KDF.getVal('rad_sign_type') === 'unlit' ) {
				
				
				if (desc === '') {

						   content = getMapParams().cecNotManaged;
			
				}  else {
				   content = 'Nearest property: ' + desc + '</callInfoWindowbr></br></br>' + '<button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm Location</button></div>';
				}
			} else {
				if (desc === '') {
						   content = getMapParams().cecNotManaged;
				} else {
					content = '<p class="paragraph-normal">No road sign found</p><button id="mapConfirm" class="mapConfirm btn-continue" data-asset_id="">Confirm anyway</button>';
				}
			}
		
	} else if (KDF.getVal('rad_problem_option_OSM')) {
			
			// litter
			 if (KDF.getVal('rad_problem_option_OSM') == 'OS03' || KDF.getVal('rad_problem_option_OSM') == 'OS02'){
				 if (desc === '') {
				   
							KDF.customdata('city_plots', 'create', true, true, {'longitude': xcoord , 'latitude' : ycoord}); 
							return;

				} else {
						content = 'Nearest property: ' + desc + '</callInfoWindowbr></br></br>' + '<button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm Location</button></div>';
				}
			 } else {
				 if (desc === '') {
							KDF.customdata('city_plots', 'create', true, true, {'longitude': xcoord , 'latitude' : ycoord}); 
							return;
				} else {
					content = '<p class="paragraph-normal">No Litter bin found</p><button id="mapConfirm" class="mapConfirm btn-continue" data-asset_id="">Confirm anyway</button>';
						
				}
			 }
		
	} else if (KDF.getVal('rad_issue_WINT')) {
			// grit bin
			// for requirement get asset within 100 meters is stored in getassetinfo function
				if (desc === '') {

						   content = getMapParams().cecNotManaged;
					  
				} else {
						content = '<p class="paragraph-medium">No grit bin found</p><button id="mapConfirm" class="mapConfirm btn-continue" data-asset_id="">Confirm anyway</button>'
				}
			
	} else if (KDF.getVal('rad_issues_RDGU')) {
			//gully
			
				if (desc === '') {
	
						   content = getMapParams().cecNotManaged;
					
				} else {
						content = '<p class="p-m">No gully found.</p><p class="p-n">Any previously selected gullies will be unselected.</p><button id="mapConfirm" class="mapConfirm noMap btn-continue" data-asset_id="">Confirm anyway</button><p id="jsonAsset" class="dform_hidden"></p>';
				}
	} else if (KDF.getVal('rad_issue')) {
			//street light
			
				if (desc === '') {
				
						   content = getMapParams().cecNotManaged;
				
				} else {
						content = '<p class="paragraph-normal">No streetlight found.</p><p class="paragraph-normal">Any previously selected street lights will be deselected</p><button id="mapConfirm" class="mapConfirm noMap btn-continue" data-asset_id="">Confirm anyway</button><p id="jsonAsset" class="dform_hidden"></p>';
				}
	} 

	if (KDF.getVal('txt_eventcode') == '4010300' || KDF.getVal('txt_eventcode') == '4010407' || KDF.getVal('txt_eventcode') == '4010304' || KDF.getVal('txt_eventcode') == '4010403') {
			//foliage, graffiti, road defect, dog fouling
			
				if (desc === '') {
					if (KDF.getVal('txt_eventcode') == '4010403' || KDF.getVal('txt_eventcode') == '4010407') {

							KDF.customdata('city_plots', 'create', true, true, {'longitude': xcoord.toString() , 'latitude' : ycoord.toString()}); 
							return;
						   } else if (KDF.getVal('txt_eventcode') == '4010304') {
							   content = '<button id="" class="mapConfirmRoad btn-continue" data-asset_id="">Confirm Location</button></div>';
							   
						   } else {
						   
							content = getMapParams().cecNotManaged;
						   }
				} else {
					if (KDF.getVal('txt_eventcode') == '4010304') {
						content = 'Nearest property: ' + desc + '</callInfoWindowbr></br></br>' +
							'<button id="" class="mapConfirmRoad btn-continue" data-asset_id="">Confirm Location</button></div>';
					} else {
						 	 content = 'Nearest property: ' + desc + '</callInfoWindowbr></br></br>' +
							'<button id="" class="mapConfirm btn-continue" data-asset_id="">Confirm Location</button></div>';
					}
				}
	}
	   
	   return content;
}

function checkAnyBinsChecked() {
    var checked = false;
	    var type = '';
	if (KDF.kdf().form.name === 'gw_bin_removal') {
		type = 'radio';
	}
	else {
		type = 'checkbox';
	}
    
	$('.'+KDF.kdf().form.name).find('input[type="'+type+'"]:checked').each(function ()  {
		var bin_name = $(this).attr('id').replace('dform_widget_chk_','');
		if (bin_name != 'other_table') {
			checked = true;
		}
	});
	
    return checked;
}

function hideCustomerDetails() {
    KDF.hideSection('area_customer_name');
    KDF.hideSection('area_customer_contacts');
    KDF.hideWidget('hrd_customerdetails');
    KDF.hideWidget('but_continue_selectindividual');
    KDF.hideWidget('but_individual_address');
}

function showCustomerDetails() {
     KDF.showSection('area_customer_name');
     KDF.showSection('area_customer_contacts');
     KDF.showWidget('but_continue_selectindividual');
     KDF.showWidget('but_individual_address');
     KDF.showWidget('hrd_customerdetails');
}
