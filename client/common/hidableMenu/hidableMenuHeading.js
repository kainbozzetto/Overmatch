app.directive('hidableMenuHeading', function() {
	return {
		restrict: 'A',
		scope: true,
		transclude: true,
		template: "<span class='glyphicon' ng-class='{\"glyphicon-chevron-down\": isVisible, \"glyphicon-chevron-right\": !isVisible}' style='font-size:60%;vertical-align:middle'></span> <ng-transclude></ng-transclude>",
		link: function(scope, element, attribute) {
			element.addClass('clickable');

			element.bind('click', function() {
				scope.toggle();
				scope.$apply();
			});
		}
	};
});