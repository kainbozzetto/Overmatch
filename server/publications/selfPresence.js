Meteor.publish('selfPresence', function() {
	return Presences.find({ $and: [ { userId: { $exists: true } }, { userId: this.userId } ] }, { fields: { state: 1, userId: 1 } });
});