app.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
			url: '/',
			views: {
				'': {
					templateUrl: 'client/home/home.html'
				}
			}
		})

		.state('register', {
			url: '/register',
			views: {
				'': {
					templateUrl: 'client/register/register.html',
					controller: 'RegisterCtrl'
				}
			}
		})

		.state('skirmish', {
			url: '/skirmish',
			views: {
				'': {
					templateUrl: 'client/skirmish/skirmish.html',
					controller: 'SkirmishCtrl'
				}
			},
		})

		.state('skirmish.scrims', {
			url: '/scrims',
			views: {
				'': {
					templateUrl: 'client/scrims/scrims.html',
					controller: 'ScrimsCtrl'
				}
			}
		});

	$urlRouterProvider.otherwise('/');
});
