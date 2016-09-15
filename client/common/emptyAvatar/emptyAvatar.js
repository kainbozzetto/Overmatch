app.directive('emptyAvatar', function() {
	return {
		restrict: 'E',
		replace: 'true',
		templateUrl: 'client/common/emptyAvatar/emptyAvatar.html'
	};
});