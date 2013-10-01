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

// google.maps.event.addDomListener(window, 'load', mapInitialize);

/*************************************************************************
// 
// UI
//
// ***********************************************************************/

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
