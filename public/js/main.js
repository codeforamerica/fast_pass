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
