app.directive('userAvatar', function() {
	return {
		restrict: 'E',
		scope: {
			user: '=',
			party: '=',
			myParty: '=',
			dropDown: '='
		},
		replace: true,
		templateUrl: 'client/common/userAvatar/userAvatar.html',
		controller: function($scope, $rootScope) {
			// susbscribe to publication and find the currentUser as it's lost through isolate scope
			// $scope.subscribe('self');
			// $scope.autorun(function() {
			// 	$scope.currentUser = Users.findOne({ _id: Meteor.userId() });
			// });

			//console.log('user -->', $scope.user)
			//console.log('party -->', $scope.party)
			

			

			// need to fix flicker --> think it has to do with new object of user being passed through on every $scope.$digest()
			// $scope.$watch('user', function() {
			// 	console.log('user ->', $scope.user);
			// });


			// we watch the rootScope currentUser and set the scope currentUser to it when it changes
			// probably a better way to do this?
			$rootScope.$watch('currentUser', function() {
				$scope.currentUser = $rootScope.currentUser;
			});

			// dropdown related

			$scope.dropdown = {
				open: false,
				full: false
			};

			$scope.mouseOver = false;
			$scope.mouseClick = false;

			$scope.mouseEnterFnc = function() {
				$scope.mouseOver = true;

				$scope.dropdown.open = true;
			};

			$scope.mouseLeaveFnc = function() {
				$scope.mouseOver = false;

				if (!$scope.mouseClick) {
					$scope.dropdown.open = false;
				}
			};

			$scope.mouseClickFnc = function() {
				if ($scope.mouseClick) {
					$scope.mouseClick = false;
					$scope.dropdown.full = false;
					$scope.dropdown.open = false;
				} else {
					$scope.mouseClick = true;
					$scope.dropdown.full = true;
					$scope.dropdown.open = true;
				}
			};

			$scope.toggle = function() {
				if (!$scope.mouseOver && $scope.mouseClick) {
					$scope.dropdown.open = false;
					$scope.dropdown.full = false;
					$scope.mouseClick = false;
				}
			};

			$scope.uninvite = function(userId) {
				Meteor.call('party.uninvite', userId);
			};

			$scope.kick = function(userId) {
				Meteor.call('party.kick', userId);
			};

			$scope.inviteSuggestedUser = function(userId) {
				Meteor.call('party.invite', userId);
			};

			$scope.removeSuggestedUser = function(userId) {
				Meteor.call('party.removeSuggestedInvite', userId);
			};

			$scope.promoteToLeader = function(userId) {
				Meteor.call('party.promoteToLeader', userId);
			};

			$scope.leaveParty = function() {
				Meteor.call('party.leaveParty');
			};

			$scope.isMember = function(id) {
				var members = $scope.party.members;
				for (var i = 0; i < members.length; i++) {
					if (members[i].id === id) {
						return true;
					}
				}
				return false;
			};

			$scope.isInvite = function(id) {
				var invites = $scope.party.invites;
				for (var i = 0; i < invites.length; i++) {
					if (invites[i].id === id) {
						return true;
					}
				}
				return false;
			};

			$scope.isSuggestedInvite = function(id) {
				var suggestedInvites = $scope.party.suggestedInvites;
				for (var i = 0; i < suggestedInvites.length; i++) {
					if (suggestedInvites[i].id === id) {
						return true;
					}
				}
				return false;
			};
		}
	};
});