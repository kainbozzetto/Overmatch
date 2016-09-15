Meteor.publishComposite('invitedScrimmingParties', function(options) {
	return {
		find: function() {
			return Parties.find({
				'members.id': { $in: [this.userId] }
			},
			{
				fields: {
					scrim: 1
				}
			});
		},
		children: [
			{
				collectionName: 'invitedScrimmingParties',
				find: function(party) {
					var ids = party.scrim.invites.map(function(invite) {
						return invite.id;
					});
					return Parties.find(
						{ _id: { $in: ids } },
						{ 
							fields: {
								leader: 1,
								members: 1,
								partySize: 1,
								scrim: 1
							}
						}
					);
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
					}
				]
			},
			{
				collectionName: 'inviteeScrimmingParties',
				find: function(party) {
					return Parties.find(
						{
							'scrim.invites.id': {
								$in: [party._id]
							}
						},
						{
							fields: {
								leader: 1,
								members: 1,
								partySize: 1,
								scrim: 1
							}
						}
					);
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
					}
				]
			}
		]
	};
});