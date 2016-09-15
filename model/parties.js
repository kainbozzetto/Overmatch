// parties collection + helpers

Parties = new Mongo.Collection('parties');

PartiesHelpers = {
	$leader() {
		return Users.findOne({ _id: this.leader.id });
	},

	$members() {
		var ids = this.members.map(function(member) {
			return member.id;
		});
		return Users.find({ _id: { $in: ids } }).fetch();
	},

	$invites() {
		return Users.find({ _id: { $in: this.invites } }).fetch();
	},

	$suggestedInvites() {
		return Users.find({ _id: { $in: this.suggestedInvites } }).fetch();
	},
};

Parties.helpers(PartiesHelpers);

// client party-related collections + helpers

ScrimmingParties = new Meteor.Collection('scrimmingParties');

ScrimmingParties.helpers(PartiesHelpers);

SuggestedScrimmingParties = new Meteor.Collection('suggestedScrimmingParties');

SuggestedScrimmingParties.helpers(PartiesHelpers);

InvitedScrimmingParties = new Meteor.Collection('invitedScrimmingParties');

InviteeScrimmingParties = new Meteor.Collection('inviteeScrimmingParties');

// meteor methods

Meteor.methods({
	'party.create': function() {
		let party = Parties.findOne({ 'members.id': { $in: [this.userId] } });

		let leader = Users.findOne({ _id: this.userId });

		if (!party) {
			return Parties.insert({
				undeletable: true,
				leader: { 
					id: this.userId,
					leaderSince: new Date()
				},
				members: [
					{
						id: this.userId,
						dateJoined: new Date()
					}
				],
				invites: [],
				suggestedInvites: [],
				partySize: 1,
				chat: [Chats.insert({
					message: leader.profile.battletag.full + ' created a party',
					dateSent: new Date()
				})]
			});
		}
	},

	'party.invite': function(userId) {
		check(userId, String);

		let party = Parties.findOne({ 'members.id': { $in: [this.userId] } });

		let thisUser = Users.findOne({ _id: this.userId });
		let invitedUser = Users.findOne({ _id: userId });

		if (!party) {
			Meteor.call('party.create', function(error, partyId) {
				party = Parties.findOne({ _id: partyId });
			});
		}

		if (party) {
			if (party.leader.id === this.userId) {
				Parties.update(party._id, {
					$unset: { undeletable : '' },
					$pull: { suggestedInvites: { id: userId } },
					$addToSet: { 
						invites: {
							id: userId,
							dateSent: new Date()
						},
						chat: Chats.insert({
							message: invitedUser.profile.battletag.full + ' has been invited to the party',
							dateSent: new Date()
						})
					}
				});
			} else {
				Parties.update(party._id, {
					$addToSet: { 
						suggestedInvites: {
							id: userId,
							dateSent: new Date()
						},
						chat: Chats.insert({
							message: thisUser.profile.battletag.full + ' has suggested ' + invitedUser.profile.battletag.full + ' to be invited to the party',
							dateSent: new Date()
						})
					}
				});
			}
		}
	},

	'party.kick': function(userId) {
		check(userId, String);

		if (userId === this.userId) {
			throw new Meteor.Error('InviteException', 'Cannot kick self.');
		}

		let party = Parties.findOne({ 'members.id': { $in: [userId] } });

		if (!party) {
			// da fk
		}

		let kickedUser = Users.findOne({ _id: userId });

		if (party.leader.id === this.userId) {
			Parties.update(party._id, { $pull: { members: { id: userId } } });

			Parties.update(party._id, { 
				$addToSet: {
					chat: Chats.insert({
						message: kickedUser.profile.battletag.full + ' has been kicked from the party',
						dateSent: new Date()
					})
				}
			});
		}
	},

	'party.uninvite': function(userId) {
		check(userId, String);

		let party = Parties.findOne({ 'invites.id': { $in: [userId] } });

		if (!party) {
			// da fk
		}

		let uninvitedUser = Users.findOne({ _id: userId });

		// should this check be placed on all functions?
		if (party.leader.id === this.userId) {
			Parties.update(party._id, { $pull: { invites: { id: userId } },
				$addToSet: {
					chat: Chats.insert({
						message: uninvitedUser.profile.battletag.full + ' has been uninvited to the party',
						dateSent: new Date()
					})
				}
			});
		}
	},

	'party.acceptInvite': function(partyId) {
		check(partyId, String);

		let party = Parties.findOne({ $and: [ { 'invites.id': { $in: [this.userId] } }, { _id: partyId } ] });

		if (!party) {
			// da fak
		}

		// consider making the server do this then the client
		if (party.members.length === 1) {
			Meteor.call('party.removeAllInvites', party.leader.id);			
		}

		let thisUser = Users.findOne({ _id: this.userId });

		Parties.update(party._id, { $pull: { invites: { id: this.userId } },
			$addToSet: {
				members: { id: this.userId, dateJoined: new Date() },
				chat: Chats.insert({
					message: thisUser.profile.battletag.full + ' has joined the party',
					dateSent: new Date()
				})
			}
		});

		Meteor.call('party.removeAllInvites');
	},

	'party.rejectInvite': function(partyId) {
		check(partyId, String);

		let party = Parties.findOne({ $and: [ { 'invites.id': { $in: [this.userId] } }, { _id: partyId } ] });

		if (!party) {
			// da fak
		}

		let thisUser = Users.findOne({ _id: this.userId });

		Parties.update(party._id, { $pull: { invites: { id: this.userId } },
			$addToSet: {
				chat: Chats.insert({
					message: thisUser.profile.battletag.full + ' has rejected the party invitation',
					dateSent: new Date()
				})
			}
		});
	},

	'party.removeSuggestedInvite': function(userId) {
		check(userId, String);

		let party = Parties.findOne({ 'leader.id': this.userId });

		if (!party) {
			// da fk
		}

		let suggestedUser = Users.findOne({ _id: userId });

		Parties.update(party._id, { $pull: { suggestedInvites: { id: userId } },
			$addToSet: {
				chat: Chats.insert({
					message: suggestedUser.profile.battletag.full + ' has been removed as a suggested invite',
					dateSent: new Date()
				})
			}
		});
	},

	'party.promoteToLeader': function(userId) {
		check(userId, String);

		let party = Parties.findOne({ 'leader.id': this.userId });

		if (!party) {
			// da fk
		}

		let newLeader = Users.findOne({ _id: userId });

		Parties.update(party._id, { $set: { leader: { id: userId, leaderSince: new Date() } },
			$addToSet: {
				chat: Chats.insert({
					message: newLeader.profile.battletag.full + ' is now the leader of the party',
					dateSent: new Date()
				})
			}
		} );
	},

	'party.leaveParty': function() {
		let party = Parties.findOne({ 'members.id': { $in: [this.userId] } });

		if (!party) {
			// da fk
		}

		if (party.leader.id === this.userId && party.members.length > 1) {
			var memberToPromote;
			
			party.members.some(function(member) {
				if (member.id !== party.leader.id) {
					memberToPromote = member.id;
					return true;
				}
			});

			Meteor.call('party.promoteToLeader', memberToPromote);
		}

		let thisUser = Users.findOne({ _id: this.userId });

		Parties.update(party._id, { $pull: { members: { id: this.userId } },
			$addToSet: {
				chat: Chats.insert({
					message: thisUser.profile.battletag.full + ' has left the party',
					dateSent: new Date()
				})
			}
		});
	},

	'party.removeAllInvites': function(userId) {
		if (!userId) {
			userId = this.userId;
		}
		let thisUser = Users.findOne({ _id: userId });

		Parties.update({ 'invites.id': { $in: [userId] } }, { $pull: { invites: { id: userId } },
			$addToSet: {
				chat: Chats.insert({
					message: thisUser.profile.battletag.full + ' has joined another party',
					dateSent: new Date()
				})
			}
		}, { multi: true });
		Parties.update({ 'suggestedInvites.id': { $in: [userId] } }, { $pull: { suggestedInvites: { id: userId } },
			$addToSet: {
				chat: Chats.insert({
					message: thisUser.profile.battletag.full + ' has joined another party',
					dateSent: new Date()
				})
			}
		}, { multi: true });
	},

	'party.sendChatMessage': function(chatId, message) {
		check(message, String);

		let thisUser = Users.findOne({ _id: this.userId });

		var party = Parties.findOne({ 'members.id': { $in: [this.userId] } });

		Parties.update({ 'members.id': { $in: [this.userId] } }, { 
			$addToSet: {
				chat: Chats.insert({
					from: thisUser.profile.battletag.full,
					leader: party.leader.id === this.userId ? true : false,
					message: message,
					dateSent: new Date()
				})
			}
		});
	},

	'party.findScrim': function(scrim) {
		check(scrim, Object);

		let party = Parties.findOne({ 'leader.id': this.userId });
		let leader = Users.findOne({ _id: this.userId });

		var partyId, partySize;

		var scrimDetails = {
			dateCreated: new Date(),
			maps: scrim.maps,
			regions: scrim.regions,
			minTeamSize: scrim.minTeamSize,
			invites: []
		}

		if (scrim.message) {
			scrimDetails.message = scrim.message;
		}

		var updateParty = function(partyId) {
			var a = Parties.update(partyId, {
				$unset: { undeletable : '' },
				$set: {
					scrim: scrimDetails
				},
				$addToSet: {
					chat: Chats.insert({
						message: leader.profile.battletag.full + ' started searching for a scrim',
						dateSent: new Date()
					})
				}
			});
		};

		if (!party) {
			Meteor.call('party.create', function(error, partyId) {
				updateParty(partyId);
			});
		} else {
			updateParty(party._id);
		}
	},

	'party.cancelScrim': function() {
		let party = Parties.findOne({ 'leader.id': this.userId });

		let leader = Users.findOne({ _id: this.userId });

		if (party && party.scrim) {
			Parties.update(party._id, { $unset: { scrim: '' }, 
				$addToSet: {
					chat: Chats.insert({
						message: leader.profile.battletag.full + ' stopped searching for a scrim',
						dateSent: new Date()
					})
				}
			});
		}
	},

	'party.inviteScrimmingParty': function(partyId) {
		let party = Parties.findOne({ _id: partyId });

		// can do a thorough search to determine whether this party can be invited
		if (party && party.scrim) {
			Parties.update({ 'leader.id': this.userId }, {
				$addToSet: {
					'scrim.invites': {
						id: partyId,
						dateSent: new Date()
					}
				}
			});
		}
	},

	'party.uninviteScrimmingParty': function(partyId) {
		let party = Parties.findOne({ _id: partyId });

		// can do a thorough search to determine whether this party can be invited
		if (party && party.scrim) {
			Parties.update({ 'leader.id': this.userId }, {
				$pull: {
					'scrim.invites': {
						id: partyId
					}
				}
			});
		}
	}
});