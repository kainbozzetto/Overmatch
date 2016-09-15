app.directive('navBar', function() {
	return {
		restrict: 'E',
		templateUrl: 'client/navbar/navbar.html',
		controller: 'NavbarCtrl'
	};
});