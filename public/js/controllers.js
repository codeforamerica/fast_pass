'use strict';

/* Controllers */

angular.module('dof.controllers', []).
	controller('ehhh', [function ($scope) {


	}])
	.controller('MyCtrl2', [function() {

	}]);


var AdditionalBusinessCtrl = function ($scope, $http) {
	$http.get('/data/additional-business.json').success( function (data) {
		$scope.additionalBusiness = data;
	});
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