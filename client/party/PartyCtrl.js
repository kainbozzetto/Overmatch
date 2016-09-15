app.controller('PartyCtrl', function($scope, $timeout, ReactiveVar) {

	
	$scope.subscribe('myPartyWithUsers');
	$scope.subscribe('relatedPartiesWithUsers');

	$scope.autorun(function() {
		$scope.party = ReactiveVar.Party({ 'members.id': { $in: [Meteor.userId()] } });
		$scope.invitedParties = ReactiveVar.Parties({ 'invites.id': { $in: [Meteor.userId()] } });
	});
	
	$scope.partyInvite = {
		userBattletag: ''
	};

	$scope.partyInvite.tooltipDisplay = 0;

	$scope.inviteUserByBattletag = function() {
		if ($scope.partyInvite.inviting) {
			return;
		}

		$scope.partyInvite.inviting = true;

		Meteor.call('party.inviteByBattletag', $scope.partyInvite.userBattletag, function(error, result) {
			$scope.partyInvite.inviting = false;
			if (error && error.error && error.error === 'InviteException') {
				$scope.partyInvite.tooltipError = error.reason;
				$scope.partyInvite.tooltipDisplay += 1;
				$timeout(function() {
					if( $scope.partyInvite.tooltipDisplay > 0) {
						$scope.partyInvite.tooltipDisplay -= 1;
					}
				}, 2000);
			}
			if (!error) {
				$scope.partyInvite.tooltipDisplay = 0;
			}
			$scope.$apply();
		});

		$scope.partyInvite.userBattletag = '';
	};

	$scope.uninvite = function(userId) {
		Meteor.call('party.uninvite', userId);
	};

	$scope.kick = function(userId) {
		Meteor.call('party.kick', userId);
	}

	$scope.acceptInvite = function(partyId) {
		Meteor.call('party.acceptInvite', partyId);
	};

	$scope.rejectInvite = function(partyId) {
		Meteor.call('party.rejectInvite', partyId);
	};

	$scope.inviteSuggestedUser = function(userId) {
		Meteor.call('party.removeSuggestedInvite', userId);
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

	$scope.range = function(n) {
		return new Array(n);
	};

	$scope.sendChatMessage = function() {
		if (!$scope.partyChatMessage || $scope.partyChatMessage === '') {
			return;
		}
		Meteor.call('party.sendChatMessage', $scope.party.chat, $scope.partyChatMessage);
		$scope.partyChatMessage = '';
	};
});