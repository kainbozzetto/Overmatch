app.controller('NavbarCtrl', function($scope, $state) {

	$scope.$state = $state;

	$scope.loggingIn = false;

	$scope.navLogin = function() {
		$scope.loggingIn = true;
		Meteor.loginWithPassword(
			$scope.userLogin.email,
			$scope.userLogin.password,
			function(error) {
				if (error) {
					console.log('Error logging in', error);
				}
				$scope.loggingIn = false;
			}
		)
	};

	$scope.navLogout = function() {
		Meteor.logout();
	};
});