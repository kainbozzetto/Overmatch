app.controller('RegisterCtrl', function($scope) {
	$scope.register = function() {
		Accounts.createUser({
			email: $scope.register.email,
			password: $scope.register.password,
			profile: {
				battletag: {
					name: $scope.register.battletag.name,
					number: $scope.register.battletag.number,
					full: $scope.register.battletag.name + '#' + $scope.register.battletag.number
				}
			}
		}, function(error) {
			if (error) {
				console.log('Error creating user', error);
			}
		});
	}
});