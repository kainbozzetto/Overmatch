Meteor.publishComposite('self', {
	find: function() {
		return Users.find({ _id: this.userId }, { fields: { profile: 1 } });
	},
	children: [
		{
			find: function(user) {
				return Presences.find({ $and: [ { userId: { $exists: true } }, { userId: user._id } ] }, { fields: { state: 1, userId: 1 } });		
			}
		}
	]	
});