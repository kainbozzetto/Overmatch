var connections = {};

var expire = function(id) {
  Presences.remove(id);
  delete connections[id];
};

var unset = function(id) {
  Presences.update(id, { $set: { inactive: true } });
  connections[id].idle = true;
};

var set = function(id) {
  Presences.update(id, { $unset: { inactive: 1 } });
  connections[id].idle = {};
  tick(id);
};

var tick = function(id) {
  connections[id].lastSeen = Date.now();
};

Meteor.startup(function() {
  Presences.remove({});
});

Meteor.onConnection(function(connection) {
  // console.log('connectionId: ' + connection.id);
  Presences.insert({ _id: connection.id });

  connections[connection.id] = {};
  tick(connection.id);

  connection.onClose(function() {
    // console.log('connection closed: ' + connection.id);
    expire(connection.id);
  });
});

Meteor.methods({
  presenceTick: function() {
    check(arguments, [Match.Any]);
    if (this.connection && connections[this.connection.id])
      tick(this.connection.id);
  }
});

Meteor.setInterval(function() {
  _.each(connections, function(connection, id) {
    if (!connection.idle && connection.lastSeen < (Date.now() - 10000))
      unset(id);
    if (!!connection.idle && connection.lastSeen >= (Date.now() - 10000))
      set(id);
  });
}, 5000);
