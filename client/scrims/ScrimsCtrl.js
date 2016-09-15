app.controller('ScrimsCtrl', function($scope, ReactiveVar, filterFilter, $timeout) {

	// all scrims

	$scope.scrimsList = {
		pageNumber: 1,
		perPage: 6
	};

	$scope.autorun(function() {
		$scope.scrimsOptions = {
			skip: ($scope.getReactively('scrimsList.pageNumber') - 1) * ($scope.scrimsList.perPage),
			limit: $scope.scrimsList.perPage,
			sort: { partySize: -1, 'scrim.dateCreated': 1 }
		};
	});

	$scope.subscribe('scrimmingPartiesWithUsers', function() { return [ $scope.getReactively('scrimsOptions') ]; });
	$scope.subscribe('scrimmingPartiesCount');

	$scope.scrims = ReactiveVar.ReactiveArray(ScrimmingParties.find({}, { sort: { partySize: -1, 'scrim.dateCreated': 1 } }),
		[
			{
				name: 'leader',
				fields: ['leader'],
				method: function(self) {
					self._leader = ReactiveVar.User({ _id: self.leader.id });
				}
			},
			{
				name: 'members',
				fields: ['members'],
				method: function(self) {
					self._members = self.members.map(function(member) {
						return ReactiveVar.User({ _id: member.id });
					});
				}
			}
		]
	);

	// suggested scrims

	$scope.suggestedScrimsList = {
		pageNumber: 1,
		perPage: 2
	};

	$scope.autorun(function() {
		$scope.suggestedScrimsOptions = {
			skip: ($scope.getReactively('suggestedScrimsList.pageNumber') - 1) * ($scope.suggestedScrimsList.perPage),
			limit: $scope.suggestedScrimsList.perPage,
			sort: { partySize: -1, 'scrim.dateCreated': 1 }
		};
	});

	$scope.mapList = [
		{
			name: 'Dorado',
			imageUrl: '/images/maps/600px-Dorado_map.jpg',
			selected: false
		},
		{
			name: 'Hollywood',
			imageUrl: '/images/maps/600px-Hollywood.jpg',
			selected: false
		},
		{
			name: 'King\'s Row',
			imageUrl: '/images/maps/600px-Kings_row_map.jpg',
			selected: false
		},
		{
			name: 'Numbani',
			imageUrl: '/images/maps/600px-Numbani_map.jpg',
			selected: false
		},
		{
			name: 'Hanamura',
			imageUrl: '/images/maps/600px-Hanamura_map.jpg',
			selected: false
		},
		{
			name: 'Temple of Anubis',
			imageUrl: '/images/maps/600px-Temple_of_anubis_map.jpg',
			selected: false
		},
		{
			name: 'Volskaya Industries',
			imageUrl: '/images/maps/600px-Volskaya_industries_map.jpg',
			selected: false
		},
		{
			name: 'Watchpoint: Gibraltar',
			imageUrl: '/images/maps/watchpoint.jpg',
			selected: false
		},
		{
			name: 'Lijiang Tower',
			imageUrl: '/images/maps/lijiang.png',
			selected: false
		},
		{
			name: 'Nepal',
			imageUrl: '/images/maps/nepal.jpg',
			selected: false
		},
		{
			name: 'Ilios',
			imageUrl: '/images/maps/ilios.jpg',
			selected: false
		},
		{
			name: 'Route 66',
			imageUrl: '/images/maps/route66.jpg',
			selected: false
		}
	];

	$scope.regionList = [
		{
			name: 'NA',
			position: {
				left: '13%',
				top: '32%'
			},
			selected: false
		},
		{
			name: 'EU',
			position: {
				left: '44%',
				top: '30%'
			},
			selected: false
		},
		{
			name: 'OCE',
			position: {
				left: '91%',
				top: '77%'
			},
			selected: false
		},
		{
			name: 'KR',
			position: {
				left: '82%',
				top: '36%'
			},
			selected: false
		},
		{
			name: 'SEA',
			position: {
				left: '77%',
				top: '59%'
			},
			selected: false
		}
	];

	$scope.autorun(function() {
		if ($scope.getReactively('party.scrim')) {
			// query to run new subscriptions
			var query = {
				$and: [
					{
						scrim: {
							$exists: true
						}
					},
					{
						_id: {
							$ne: $scope.party._id
						}
					},
					{
						'scrim.maps': {
							$in: $scope.party.scrim.maps
						}
					},
					{
						'scrim.regions': {
							$in: $scope.party.scrim.regions
						}
					},
					// {
					// 	$where: 'this.members.length >= ' + $scope.party.scrim.minTeamSize
					// }
					{
						partySize: {
							$gte: $scope.party.scrim.minTeamSize
						}
					},
					{
						'scrim.minTeamSize': {
							$lte: $scope.party.partySize
						}
					}
				]
			};

			$scope.subscribe('suggestedScrimmingPartiesWithUsers', function() { return [ query, $scope.getReactively('suggestedScrimsOptions') ]; });
			$scope.subscribe('suggestedScrimmingPartiesCount', function() { return [ query ]; });

			// scrim variable to update view on current scrim details
			$scope.scrim = {
				maps: $scope.party.scrim.maps.map(function(map) {
					for (var i = 0; i < $scope.mapList.length; i++) {
						var mapListing = $scope.mapList[i];

						if (map === mapListing.name) {
							return mapListing;
						}
					}
					
				}),
				regions: $scope.party.scrim.regions.map(function(region) {
					for (var i = 0; i < $scope.regionList.length; i++) {
						var regionListing = $scope.regionList[i];

						if (region === regionListing.name) {
							return regionListing;
						}
					}
				}),
				minTeamSize: $scope.party.scrim.minTeamSize,
			}

			if ($scope.party.scrim.message) {
				$scope.scrim.message = $scope.party.scrim.message;
			}

			$scope.subscribe('invitedScrimmingParties');
		};
	});

	$scope.suggestedScrims = ReactiveVar.ReactiveArray(SuggestedScrimmingParties.find({}, { sort: { partySize: -1, 'scrim.dateCreated': 1 } }),
		[
			{
				name: 'leader',
				fields: ['leader'],
				method: function(self) {
					self._leader = ReactiveVar.User({ _id: self.leader.id });
				}
			},
			{
				name: 'members',
				fields: ['members'],
				method: function(self) {
					self._members = self.members.map(function(member) {
						return ReactiveVar.User({ _id: member.id });
					});
				}
			}
		]
	);

	$scope.invitedScrims = ReactiveVar.ReactiveArray(InvitedScrimmingParties.find({}),
		[
			{
				name: 'leader',
				fields: ['leader'],
				method: function(self) {
					self._leader = ReactiveVar.User({ _id: self.leader.id });
				}
			},
			{
				name: 'members',
				fields: ['members'],
				method: function(self) {
					self._members = self.members.map(function(member) {
						return ReactiveVar.User({ _id: member.id });
					});
				}
			}
		]
	);

	$scope.inviteeScrims = ReactiveVar.ReactiveArray(InviteeScrimmingParties.find({}),
		[
			{
				name: 'leader',
				fields: ['leader'],
				method: function(self) {
					self._leader = ReactiveVar.User({ _id: self.leader.id });
				}
			},
			{
				name: 'members',
				fields: ['members'],
				method: function(self) {
					self._members = self.members.map(function(member) {
						return ReactiveVar.User({ _id: member.id });
					});
				}
			}
		]
	);

	// helpers

	$scope.helpers({
		scrimsCount: function() {
			return Counts.get('numberOfScrimmingParties');
		},
		suggestedScrimsCount: function() {
			return Counts.get('numberOfSuggestedScrimmingParties');
		},
	});

	

	$scope.findScrim = {
		tooltipDisplay: 0
	}

	// might have to pass minTeamSize as it may not recognise updates to $scope.minTeamSize
	$scope.findScrims = function() {
		var maps = filterFilter($scope.mapList, { selected: true }).map(function(map) {
			return map.name;
		});

		var regions = filterFilter($scope.regionList, { selected: true }).map(function(region) {
			return region.name;
		});

		var errorMessage = '';

		if (maps.length === 0) {
			errorMessage += 'At least one map';
		}
		if (regions.length === 0) {
			if (errorMessage !== '') {
				errorMessage += ' and at least one region';
			} else {
				errorMessage += 'At least one region';
			}
		}
		if (errorMessage !== '') {
			errorMessage += ' must be selected';

			$scope.findScrim.tooltipError = errorMessage;
			$scope.findScrim.tooltipDisplay += 1;
			$timeout(function() {
				if( $scope.findScrim.tooltipDisplay > 0) {
					$scope.findScrim.tooltipDisplay -= 1;
				}
			}, 2000);

			return;
		} else {
			$scope.findScrim.tooltipDisplay = 0;
		}

		var scrim = {
			maps: maps,
			regions: regions,
			minTeamSize: $scope.minTeamSize
		};

		if ($scope.scrimMessage && $scope.scrimMessage.text) {
			scrim.message = $scope.scrimMessage.text;
		}

		Meteor.call('party.findScrim', scrim);
	};

	$scope.cancelScrimSearch = function() {
		Meteor.call('party.cancelScrim');

		// need to set the selected maps and regions to $scope.scrim values (as well as message and minTeamSize)
		$scope.mapList.forEach(function(map) {
			$scope.scrim.maps.forEach(function(scrimMap) {
				if (map.name === scrimMap.name) {
					map.selected = true;
				}
			});
		});

		$scope.regionList.forEach(function(region) {
			$scope.scrim.regions.forEach(function(scrimRegion) {
				if (region.name === scrimRegion.name) {
					region.selected = true;
				}
			});
		});

		$scope.minTeamSize = $scope.scrim.minTeamSize;

		if ($scope.scrim.message) {
			$scope.scrimMessage = {
				text: $scope.scrim.message
			};
		}
	}

	$scope.sendScrimChallenge = function(partyId) {
		Meteor.call('party.inviteScrimmingParty', partyId);
	};

	$scope.removeScrimChallenge = function(partyId) {
		Meteor.call('party.uninviteScrimmingParty', partyId);
	};

	$scope.setScrimsPageNumber = function(number) {
		$scope.scrimsList.pageNumber = number;
	}

	$scope.setSuggestedScrimsPageNumber = function(number) {
		$scope.suggestedScrimsList.pageNumber = number;
	}

	$scope.loadMoreScrims = function() {
		$scope.scrimsOptions.limit += 1;
		console.log($scope.scrimsOptions.limit);
	};

	var tick = function() {
		$scope.nowDate = new Date().getTime();
		$timeout(tick, 1000);
	}

	$scope.nowDate = new Date().getTime();
	$timeout(tick, 1000);

	$scope.getDate = function(date) {
		var newDate = $scope.nowDate - date.getTime();

		if (newDate < 0) {
			newDate = 0;
		}

		var days = Math.floor(newDate / (24*60*60*1000));
		var hours = Math.floor((newDate - days * (24*60*60*1000)) / (60*60*1000));
		var minutes = Math.floor((newDate - days * (24*60*60*1000) - hours * (60*60*1000)) / (60*1000));

		var string = '';

		string += days > 0 ? days + 'd ' : '';
		string += days > 0 || hours > 0 ? hours + 'h ' : '';
		string += days > 0 || hours > 0 || minutes > 0 ? minutes + 'm' : '< 1m';

		return string;
	};

	$scope.isInScrimInvites = function(partyId) {
		if ($scope.party && $scope.party.scrim) {
			var invites = $scope.party.scrim.invites;
			for (var i = 0; i < invites.length; i++) {
				var invite = invites[i]
				if (invite.id === partyId) {
					return true;
				}
			};

		}

		return false;
	};

	$scope.isInScrimInvitees = function(partyId) {
		if ($scope.party && $scope.party.scrim) {
			var invitees = $scope.inviteeScrims;
			for (var i = 0; i < invitees.length; i++) {
				var invitee = invitees[i]
				if (invitee._id === partyId) {
					return true;
				}
			};
		}

		return false;
	};

});