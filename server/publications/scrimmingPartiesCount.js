Meteor.publish('scrimmingPartiesCount', function() {
	Counts.publish(this, 'numberOfScrimmingParties', Parties.find({ scrim: { $exists: true } }), { noReady: true });
});