// DOF
'use strict'

/*************************************************************************
// 
// CONFIGURATION
// User editable options (global variables)
//
// ***********************************************************************/

var MAPBOX_ID           = 'codeforamerica.map-wzcm8dk0',
	MAPBOX_ID_RETINA    = 'codeforamerica.map-dfs3qfso'

var MAP_INIT_LATLNG     = [36.1665, -115.1479],
	MAP_INIT_ZOOM       = 16,
	MAP_FIT_PADDING     = 0.25,
	MAP_MAX_PADDING     = 6

var DEBUG_ALLOW         = true



/*************************************************************************
// 
// INITIALIZE APP
//
// ***********************************************************************/

var SECTION_ORDER = ['start', '10', '12', '15', '20', '30', '31', '39', '39b', '40', '41', '45', '50', '70']


/*
Eventually remove all of this and let Angular do all of it
var hash = window.location.hash;

hash = hash.split('#/')[1]



String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

// Hacky, but takes us to the section we were on
if (hash) {
	
	$('#start').hide()
	$('#' + hash).show()

	if ($('section:visible').attr('class').endsWith('-map')) {
		$('#main').removeClass('fullscreen').addClass('partscreen')
	}
}
*/

var propertyAddress = '495 S. Main Street',
	businessType = 'Beer Garden'

/*************************************************************************
// 
// INITIALIZE MAP
// Sets initial location, view, attribution, marker types
//
// ***********************************************************************/
/*
var map = L.mapbox.map('map', MAPBOX_ID, {
	minZoom: MAP_INIT_ZOOM,
	maxZoom: MAP_INIT_ZOOM
})*/
var map = L.mapbox.map('map', MAPBOX_ID, {
	doubleClickZoom: false
}).setView(MAP_INIT_LATLNG, MAP_INIT_ZOOM) 
	// This will be overridden later when map bounds are set based on available markers.

// Use normal map
/*
map.addLayer(L.mapbox.tileLayer(MAPBOX_ID, {
	detectRetina: true,
	retinaVersion: MAPBOX_ID_RETINA
}))
*/

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

var vendorMarker = L.icon({
	iconUrl: 'img/pin-food-on.png',

	iconSize:     markerIconSize,
	iconAnchor:   markerIconAnchor,
	popupAnchor:  markerPopupAnchor
})

var vendorMarkerOff = L.icon({
	iconUrl: 'img/pin-food-off.png',

	iconSize:     markerIconSize,
	iconAnchor:   markerIconAnchor,
	popupAnchor:  markerPopupAnchor
})

// Not used - currently using Mapbox version of this icon.
var hereMarker = L.icon({
	iconUrl: 'img/pin-here.png',

	iconSize:     markerIconSize,
	iconAnchor:   markerIconAnchor,
	popupAnchor:  markerPopupAnchor
});

var propertyMarker
var popupOpen = false
map.on('click', function (e) {
    var containerPoint = e.containerPoint.toString()
    var clickLatLng = e.latlng

    // add a marker on the point someone just clicked

    var markerHTML = document.getElementById('markerHTML').innerHTML

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


$(document).ready(function () {

/*
	$('#property-address-form').on('keyup', function (e) {
		propertyAddress = $('#property-address-input').val()
		if (propertyAddress != '') {
			$('.property-address').text(propertyAddress)
			$('#property-address-next').prop('disabled', false)
		}
		if (propertyAddress == '') {
			$('#property-address-next').prop('disabled', true)
		}
	})

	$('#primary-business-next').on('click', function (e) {
		businessType = $('#primary-business-input').val()
		if (businessType != '') {
			$('.primary-business').text(businessType)
			$('#primary-business-next').prop('disabled', false)
		}
		if (businessType == '') {
			$('#primary-business-next').prop('disabled', true)
		}
	})
*/

	$('.leaflet-popup-pane').on('click', '#marker-more-info', function (e) {
		e.preventDefault()
		if ($('#section40').is(':visible') || $('#section45').is(':visible')) {
			$('#section40').fadeOut(SECTION_TRANSITION_OUT_TIME)
			$('#section45').fadeOut(SECTION_TRANSITION_OUT_TIME)
			$('#section50').fadeOut(SECTION_TRANSITION_OUT_TIME)
			$('#section50').fadeIn(SECTION_TRANSITION_IN_TIME)
			//window.location.hash = '/section50'
		}
	})

	// BUTTONS
	// External links - the rest should be in angular
	$('#main').on('click', 'button', function (e) {
		e.preventDefault()

//		var url = $(this).data('externalLink')

//		if (url) {
//			_openExternalLink(url)
//		}
	})

	$('#main').on('click', 'a.disabled', function (e) {
		// Disabled 'a' tags should behave like a disabled button
		e.preventDefault()
	})

	// SECTION 10: Business search related jQueries
	$('#main').on('submit', '#primary-business-form', function (e) {
		_doNAICSSearch()
	})
	$('#main').on('click', '.naics-result button', function (e) {
		// Select a business from the list
		$('#primary-business-results p.replace').text($(this).parent().find('span').text())
		$('#primary-business-results a.next').removeClass('disabled')
	})

	// Scrollfixed elements
	var scrollTemp
	$(window).scroll(function () {

		if (document.body.scrollTop > $('.scrollfix').offset().top - 40) {
			scrollTemp = $('.scrollfix').offset().top - 40
	        $('.scrollfix').css('position', 'fixed').css('top', '40px').css('margin-left', '10px');
		}
		else if (document.body.scrollTop < scrollTemp) {
			$('.scrollfix').css('position', 'relative').css('top', '0').css('margin-left', '7px');
		}
	});


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

	// TYPEAHEAD
	$('#primary-business-input').typeahead({
		name: 'business-types',
		valueKey: 'name',
		prefetch: 'data/business-types.json'
	});
});


/*************************************************************************
// 
// FUNCTIONS
//
// ***********************************************************************/

function _openExternalLink (url) {

/*	if ($(clicked).attr('id') == 'external-pre-app') {
		url = encodeURI(url + '?ProjectAddress=' + propertyAddress + '&Parcel=002-02-119&Ward=(unknown)&ProposedUse=' + businessType +'')
		window.open(url, '_blank')
		return true
	}
*/
	window.open(url, '_blank')
	return true

}

function _changeSection (clicked) {

	if ($(clicked).val() == 'next') {
		$targetSection = $thisSection.next('section')
	}

	if ($(clicked).val() == 'back') {
		$targetSection = $thisSection.prev('section')
	}

	if ($(clicked).data('section')) {
		$targetSection = $(document).find('#' + $(clicked).data('section'))
	}

	if ($targetSection) {
		$thisSection.fadeOut(SECTION_TRANSITION_OUT_TIME, function () {

			$targetSection.fadeIn(SECTION_TRANSITION_IN_TIME)

		})
	}
}

function _closeModal() {
	if ($('#modal').is(':visible')) {
		$('#modal').hide()
	}
}

function _doNAICSSearch () {
	// Show loader and clear search results area
	$('#search-results').text('')
	$('#search-results').show()
	$('.loading-small').show()

	// Do a search
	var searchAPI   = 'http://api.naics.us/v0/s?year=2012&collapse=1&terms='
	var searchTerms = $('#primary-business-input').val()
	var searchURL   = searchAPI + encodeURIComponent(searchTerms)
	var searchResults

	var naicsXHR = $.get(searchURL, function(data) {
		searchResults = data
	}).done( function () {

		// Hide loader
		$('.loading-small').hide()

		// Message for no results
		if (searchResults.length == 0) {
			$('#search-results').text('Nothing found for those search terms.')
			return
		}

		// Format data & display
		for (var i = 0; i < searchResults.length; i++) {
			searchResults[i].id = searchResults[i].code
			$('#search-results').append('<div class=\'naics-result\'><span>' + searchResults[i].title + '</span><button>Select</button></div>')
		}

		// Show selection box
		$('#primary-business-results').show()

	}).fail( function () {

		$('#search-results').text('Error performing search for NAICS business categories')
	
	})
}


