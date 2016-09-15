Meteor.publish('suggestedScrimmingPartiesCount', function(query) {
	Counts.publish(this, 'numberOfSuggestedScrimmingParties', Parties.find(query), { noReady: true });
});