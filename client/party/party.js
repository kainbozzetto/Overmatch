app.directive('party', function() {
	return {
		restrict: 'E',
		templateUrl: 'client/party/party.html',
		controller: 'PartyCtrl'
	};
});