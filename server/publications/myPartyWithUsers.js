Meteor.publishComposite('myPartyWithUsers', {
	find: function() {
		return Parties.find({
			'members.id': { $in: [this.userId] }
		},
		{
			fields: {
				leader: 1,
				members: 1,
				invites: 1,
				suggestedInvites: 1,
				chat: 1,
				partySize: 1,
				scrim: 1
			}
		});
	},
	children: [
		{
			find: function(party) {
				return Users.find({ _id: party.leader.id }, { fields: { profile: 1 } });
			},
			children: [
				{
					find: function(user) {
						return Presences.find({ userId: user._id }, { fields: { userId: 1, state: 1} });
					}
				}
			]
		},
		{
			find: function(party) {
				var ids = party.members.map(function(member) {
					return member.id;
				});
				return Users.find({ _id: { $in: ids } }, { fields: { profile: 1 } });
			},
			children: [
				{
					find: function(user) {
						return Presences.find({ userId: user._id }, { fields: { userId: 1, state: 1} });
					}
				}
			]
		},
		{
			find: function(party) {
				var ids = party.invites.map(function(invite) {
					return invite.id;
				});
				return Users.find({ _id: { $in: ids } }, { fields: { profile: 1 } });
			},
			children: [
				{
					find: function(user) {
						return Presences.find({ userId: user._id }, { fields: { userId: 1, state: 1} });
					}
				}
			]
		},
		{
			find: function(party) {
				var ids = party.suggestedInvites.map(function(suggestedInvite) {
					return suggestedInvite.id;
				});
				return Users.find({ _id: { $in: ids } }, { fields: { profile: 1 } });
			},
			children: [
				{
					find: function(user) {
						return Presences.find({ userId: user._id }, { fields: { userId: 1, state: 1} });
					}
				}
			]
		},
		{
		 	find: function(party) {
				var dateJoined;
				party.members.forEach(function(member) {
					if (member.id === this.userId) {
						dateJoined = member.dateJoined;
						return;
					}
				}.bind(this));

				var user = Users.findOne({ _id: this.userId });

		 		return Chats.find({ $and: [ { _id: { $in: party.chat } }, { dateSent: { $gte: dateJoined } } ] }, { sort: { dateSent: 1 } });
			}
		}
	]
});