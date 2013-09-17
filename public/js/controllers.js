'use strict';

/* Controllers */

angular.module('dof.controllers', [])

	// SECTION 12 - CONFIRM BUSINESS CATEGORY
	.controller('BusinessCategoryConfirmCtrl', function ($scope, $http) {

		var dataURL = '/data/business-types-desc.json';
//		var dataURL = '/data/business-types.json';
//		Note: these are coming from different sources, and seems to have different categories. Need to confirm.

		// Get a matched business type
		$http.get(dataURL).success( function (data) {

			// DEMO - grab a random business type from the array.
			$scope.primaryBusiness = data[Math.floor(Math.random() * data.length)];

		});

	})

	// SECTION 20 - ADDITIONAL BUSINESS
	.controller('AdditionalBusinessCtrl', function ($scope, $http) {

		var dataURL = '/data/additional-business.json'

		// Display additional businesses
		$http.get(dataURL).success( function (data) {
			$scope.additionalBusiness = data;
		});
	
	})

	.controller('MyCtrl2', function() {

	});


function CollapseDemoCtrl($scope) {
  $scope.isCollapsed = false;
}

var ModalDemoCtrl = function ($scope, $modal, $log) {

	$scope.items = ['item1', 'item2', 'item3'];

	$scope.open = function () {

		var modalInstance = $modal.open({
			templateUrl: '/partials/_modal.html',
			controller: ModalInstanceCtrl,
			resolve: {
				items: function () {
					return $scope.items;
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
};

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

	$scope.items = items;
	$scope.selected = {
		item: $scope.items[0]
	};

	$scope.ok = function () {
		$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
};