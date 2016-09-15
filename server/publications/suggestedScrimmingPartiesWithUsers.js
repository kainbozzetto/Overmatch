Meteor.publishComposite('suggestedScrimmingPartiesWithUsers', function(query, options) {
	return {
		collectionName: 'suggestedScrimmingParties',
		find: function() {
			// can always merge the fields with the other options on the client
			var newOptions = Object.assign({ fields: { leader: 1, members: 1, partySize: 1, scrim: 1 } }, options);
			return Parties.find(query, newOptions);
		},
		children: [
			{
				find: function(party) {
					return Users.find({ _id: party.leader }, { fields: { profile: 1 } });
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
	};
});