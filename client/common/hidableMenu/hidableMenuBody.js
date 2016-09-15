app.directive('hidableMenuBody', function() {
	return {
		restrict: 'A',
		scope: true,
		transclude: true,
		template: "<div ng-show='isVisible'><ng-transclude></ng-transclude></div>"
	};
});