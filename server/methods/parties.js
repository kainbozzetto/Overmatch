Meteor.methods({
	'party.inviteByBattletag': function(battletag) {
		check(battletag, String);

		let user = Meteor.users.findOne({ 'profile.battletag.full': battletag }, { _id: 1 });

		if (!user) {
			throw new Meteor.Error('InviteException', 'User does not exist');
		}

		if (user._id === this.userId) {
			throw new Meteor.Error('InviteException', 'Cannot invite yourself');
		}

		let presence = Presences.findOne({ userId: user._id }, { state: 1 });

		if (!presence || presence.state !== 'online') {
			throw new Meteor.Error('InviteException', 'User is not online');
		}

		let memberParties = Parties.find({ 'members.id': { $in: [user._id] } }, { _id: 1, limit: 1 }).count();

		if (memberParties > 0) {
			throw new Meteor.Error('InviteException', 'User already in a party');
		}

		let checkParty = Parties.find({ $and: [ { 'members.id': { $in: [this.userId] } }, {$or: [ { 'invites.id': { $in: [user._id] } }, { 'suggestedInvites.id': { $in: [user._id] } } ] } ] }, { limit: 1 }).count();

		if (checkParty > 0) {
			throw new Meteor.Error('InviteException', 'User already been invited');
		}

		Meteor.call('party.invite', user._id);
	}
});