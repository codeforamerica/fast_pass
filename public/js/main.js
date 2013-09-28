// DOF
'use strict'

/*************************************************************************
// 
// CONFIGURATION
// User editable options (global variables)
//
// ***********************************************************************/

var DEBUG_ALLOW         = true



/*************************************************************************
// 
// INITIALIZE APP
//
// ***********************************************************************/

// String.capitalize() that does the equivalent of text-transform: capitalize
// Works on strings that begin as all caps
String.prototype.capitalize = function() {
	var string = this.toLowerCase().split(' ')
	for (var i = 0; i < string.length; i++) {
		string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1)
	}
    return string.join(' ')
}

// Array.clean() removes from the array all values that are 'falsy'
// e.g. undefined, null, 0, false, NaN and '' (empty string)
Array.prototype.clean = function() {
	for (var i = 0; i < this.length; i++) {
		if (!this[i]) {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};



/*************************************************************************
// 
// INITIALIZE MAP
// Sets initial location, view, attribution, marker types
//
// ***********************************************************************/



function mapInitialize() {

/*

	// Create infowindow instance
	infowindow = new google.maps.InfoWindow({
		content: 'This is content that needs to be shown',
		position: map.getCenter()
	})

	google.maps.event.addListener(map, 'click', function (e) {
		_output('Clicked: ' + e.latLng.toUrlValue())

		// Output to debug input thing for now.
	    document.getElementById('mapServiceLat').value = e.latLng.lat()
		document.getElementById('mapServiceLng').value = e.latLng.lng()

		_deleteMarkers()
		var marker = _addMarker(e.latLng)

		map.panTo(e.latLng)
		infowindow.open(map, marker)

	})
*/
}


function _addMarker (latlng) {
	// Create marker instance
	var marker = new google.maps.Marker({
		position: latlng,
		map: map
	})

	// Have to manually keep track of them
	markers.push(marker)

	return marker
}

// Deletes all markers in the array by removing references to them
function _deleteMarkers () {
	if (markers) {
		for (var i in markers) {
			markers[i].setMap(null)
		}
		markers.length = 0
	}
}

google.maps.event.addDomListener(window, 'load', mapInitialize);

/*************************************************************************
// 
// INITIALIZE MAP
// Sets initial location, view, attribution, marker types
//
// ***********************************************************************/
/*
var map = L.mapbox.map('map', MAPBOX_ID, {
	doubleClickZoom: false
}).setView(MAP_INIT_LATLNG, MAP_INIT_ZOOM) 
	// This will be overridden later when map bounds are set based on available markers.

// Use normal map

// Map imagery attribution
// Note that mapbox.js provides its own separate attribution, which I don't 
// know how to edit, so I've hidden it with CSS (super hacky!) 
var control = L.control.attribution({
	prefix: 'Map imagery by <a href=\'http://www.mapbox.com/about/maps/\' target=\'_blank\'>MapBox</a>. Data &copy; <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>.'
}).addTo(map)

// Set up icons for markers
var markerIconSize =    [36, 62], // size of the icon
	markerIconAnchor =  [18, 50], // point of the icon which will correspond to marker's location
	markerPopupAnchor = [0, -55]  // point from which the popup should open relative to the iconAnchor

var propertyMarker
var popupOpen = false

map.on('click', function (e) {
    var containerPoint = e.containerPoint.toString()
    var clickLatLng = e.latlng

    document.getElementById('mapServiceLat').value = e.latlng.lat
	document.getElementById('mapServiceLng').value = e.latlng.lng

    // add a marker on the point someone just clicked

    // var markerHTML = document.getElementById('markerHTML').innerHTML
/*
	if (popupOpen == true) {
//		propertyMarker.closePopup()
		popupOpen = false
		return
	}
	if (propertyMarker) {
		map.removeLayer(propertyMarker)
		propertyMarker = ''
	}
	
	propertyMarker = L.marker(clickLatLng).addTo(map)
/*
	propertyMarker.bindPopup(markerHTML, {
		closeButton: false
	})
	map.panTo(clickLatLng)
	propertyMarker.openPopup()
	popupOpen = true

    // bind a popup with some fake info in it

    // open popup

    // clicking the popup brings up the parcel info.
});

/*
map.markerLayer.setGeoJSON({
    type: 'FeatureCollection',
    features: features
});
*/
/*************************************************************************
// 
// UI
//
// ***********************************************************************/

/*
var SECTION_TRANSITION_OUT_TIME = 175,
	SECTION_TRANSITION_IN_TIME = 350

var ZONE_URL = '/data/zones.json'
var ZONE_DATA

$.when( $.ajax({
	url: ZONE_URL,
	cache: false,
	dataType: 'json',
	success: function (i) {
		ZONE_DATA = i
	},
	error: function (x) {
	}
})).then( function () {
	var markers = L.geoJson(ZONE_DATA, {
    style: function (feature) {
        return {color: feature.properties.color};
    },
    onEachFeature: function (feature, layer) {
//        layer.bindPopup(feature.properties.description);
    }
})
//}).addTo(map);

//	console.log(ZONE_DATA)
})
*/

$(document).ready(function () {

	// BUTTONS

	// Disabled 'a' tags should behave like a disabled button
	$('#main').on('click', 'a.disabled', function (e) {
		e.preventDefault()
	})

	// MODAL
	// Opens modal
	$('#main').on('click', 'a.modal', function (e) {
		e.preventDefault()
		$('#modal').show()
		$('.modal-title').text($(this).data('title'))
		$('.modal-text').text($(this).data('content'))
	})

	// Various ways of closing it
	// by close link
	$('.modal-close a').on('click', function (e) {
		e.preventDefault()
		_closeModal()
	})
	// by close hit area
	$('.modal-close').on('click', _closeModal)
	// by hitting the background area around the modal
	$('.modal-background').on('click', _closeModal)
	// by pressing ESC
	$(document).keyup( function (e) {
		if ((e.keyCode === 13 || e.keyCode === 27) && $('#modal').is(':visible')) { 
			_closeModal()
		}
	})

	// PILLS
	$('.clickable.pill').on('click', function (e) {
		var link = $(this).parents().filter(function() {
			return $(this).css("display") === "block";
		}).first().find('a')
 		link.click()
	})

});


/*************************************************************************
// 
// FUNCTIONS
//
// ***********************************************************************/


function _closeModal() {
	if ($('#modal').is(':visible')) {
		$('#modal').hide()
	}
}
