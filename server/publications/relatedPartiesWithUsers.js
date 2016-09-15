Meteor.publishComposite('relatedPartiesWithUsers', {
	find: function() {
		return Parties.find({
			//$or: [
				// {
				// 	'members.id': { $in: [this.userId] }
				// },
				//{
					'invites.id': { $in: [this.userId] }
				//},
				// {
				// 	'suggestedInvites.id': { $in: [this.userId] }
				// }
			//]
		},
		{
			fields: {
				leader: 1,
				members: 1,
				invites: { $elemMatch: { id: this.userId } },
				partySize: 1
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
		}
	]
});