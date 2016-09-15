Meteor.startup(function() {
	// remove all parties when server starts up
	Parties.remove({});
	Chats.remove({});

	// handles when party should be deleted
	Parties.find({ 
		$or: [
			{ 
				$and: [
					{ members: { $size: 1 } },
					{ invites: { $size: 0 } },
					{ scrim: { $exists: false } },
					{ undeletable: { $exists: false } }
				]
			},
			{
				members: { $size: 0 }
			} 
		] 
	}).observeChanges({
		added: function(id, fields) {
			// this adds in enough delay for the update after party creation to allow invites, scrims etc to be added to party
			// var party = Parties.findOne({ _id: id });
			// if ((party.members.length === 1 && party.invites.length === 0 && !party.scrim) || party.members.length === 0) {
				Parties.remove({ _id: id });
				Chats.remove({_id: { $in: fields.chat } });
			//}
		}
	});

	Parties.find({}, { fields: { members: 1 } }).observeChanges({
		changed: function(id, fields) {
			if (fields.members) {
				Parties.update({ _id: id }, { $set: { partySize: fields.members.length } });
			}
		}
	})

	// handles when party size is full (remove all invites)
	Parties.find({
		members: { $size: 6 }
	}).observeChanges({
		added: function(id, fields) {
			Parties.update(id, { 
				$set: { 
					invites: [],
					suggestedInvites: []
				}
			});
		}
	});

	// handles removing party on presence loss
	Presences.find({ userId: { $exists: true } }).observe({
		removed: function(removedPresence) {
			if (removedPresence.userId) {
				var numberOfConnections = Presences.find({ userId: removedPresence.userId }).count();
				if (numberOfConnections === 0) {
					var party = Parties.findOne({ 'leader.id': removedPresence.userId });
					if (party && party.members.length > 1) {	
						var memberToPromote;
						party.members.some(function(member) {
							if (member.id !== party.leader.id) {
								memberToPromote = member.id;
								return true;
							}
						});
						Parties.update(party._id, { $set: { leader: { id: memberToPromote, leaderSince: new Date() } } } );
					}

					let dcedUser = Users.findOne({ _id: removedPresence.userId });

					Parties.update({ 'members.id': { $in: [removedPresence.userId] } }, { $pull: { members: {id: removedPresence.userId } },
						$addToSet: {
							chat: Chats.insert({
								message: dcedUser.profile.battletag.full + ' has disconnected',
								dateSent: new Date()
							})
						}
					}, { multi: true });
					Parties.update({ 'invites.id': { $in: [removedPresence.userId] } }, { $pull: { invites: { id: removedPresence.userId } },
						$addToSet: {
							chat: Chats.insert({
								message: dcedUser.profile.battletag.full + ' has disconnected',
								dateSent: new Date()
							})
						}
					}, { multi: true });
					Parties.update({ 'suggestedInvites.id': { $in: [removedPresence.userId] } }, { $pull: { suggestedInvites: { id: removedPresence.userId } },
						$addToSet: {
							chat: Chats.insert({
								message: dcedUser.profile.battletag.full + ' has disconnected',
								dateSent: new Date()
							})
						}
					}, { multi: true });
				}
			}
		}
	});
});