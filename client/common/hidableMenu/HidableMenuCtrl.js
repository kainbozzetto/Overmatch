app.controller('HidableMenuCtrl', function($scope) {
	$scope.isVisible = true;

	$scope.toggle = function() {
		$scope.isVisible = !$scope.isVisible;
		$scope.$apply();
	};
});