Users = Meteor.users;

Users.helpers({
	$presence() {
		return Presences.findOne({ userId: this._id });
	}
});