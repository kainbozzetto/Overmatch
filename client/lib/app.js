app = angular.module('app', ['angular-meteor', 'ui.router', 'ui.bootstrap', 'luegg.directives']);

app.run(function($rootScope, $timeout, ReactiveVar) {
	var wasConnected = false;

	Tracker.autorun(function() {
		$rootScope.connected = Meteor.status().connected;

		if (Meteor.status().connected) {
			console.log('connected');
			wasConnected = true;
		} else {
			console.log('disconnected');
			if (wasConnected) {
				$timeout(function() {
					Meteor.reconnect();
				}, 3000);
			}
		}

		$rootScope.$apply();
	});

	Tracker.autorun(function() {
		$rootScope.CurrentUser = ReactiveVar.User({ _id: Meteor.userId() }, {}, { presence: 1 });
		console.log('userId: ', Meteor.userId());
	});

	// should this be in the tracker
	$rootScope.subscribe('selfPresence');
});