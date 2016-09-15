app.directive('groupSearch', function() {
	return {
		restrict: 'E',
		templateUrl: 'client/groupSearch/groupSearch.html',
		controller: 'GroupSearchCtrl',
		scope: false
	};
});