Meteor.publishComposite('user', function(userId) {
	return {
		find: function() {
			return Users.find({ _id: userId }, { fields: { profile: 1 } });
		},
		children: [
			{
				find: function(user) {
					var filter = { $and: [ { userId: { $exists: true } }, { userId: user._id } ] };

					return Presences.find(filter, { fields: { state: 1, userId: 1 } });		
				}
			}
		]
	}
});