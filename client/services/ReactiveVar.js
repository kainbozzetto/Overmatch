app.factory('ReactiveVar', function($rootScope, $timeout) {
	var ReactiveVar = {
		User: function(selector, options, dependencies) {
			return _User(selector, options, dependencies);
		},
		Users: function(selector, options, dependencies) {
			return _Users(selector, options, dependencies);
		},
		Party: function(selector, options, dependencies) {
			return _Party(selector, options, dependencies);
		},
		Parties: function(selector, options, dependencies) {
			return _Parties(selector, options, dependencies);
		},
		ReactiveObject: function(cursor, dependencies) {
			return ReactiveObject(cursor, dependencies);
		},
		ReactiveArray: function(cursor, dependencies) {
			return ReactiveArray(cursor, dependencies);
		}
	};

	var UserDependencies = [
		{
			name: 'presence',
			method: function(self) {
				self._presence = ReactiveObject(Presences.find({ userId: self._id }));
			}
		}
	];

	var _User = function(selector, options, dependencies) {
		if (!(this instanceof _User)) {
			return new _User(selector, options, dependencies);
		}

		var _dependencies = dependencies ? [] : UserDependencies;

		if (dependencies) {
			for (key in dependencies) {
				if (dependencies.hasOwnProperty(key)) {
					UserDependencies.forEach(function(dependency) {
						if (dependency.name === key && dependencies[key] == 1) {
							_dependencies.push(dependency);
						}
					});
				}
			}
		}

		var cursor = Users.find(selector, options);

		return ReactiveObject.call(this, cursor, _dependencies);
	};

	var _Users = function(selector, options, dependencies) {
		if (!(this instanceof _Users)) {
			return new _Users(selector, options, dependencies);
		}

		var _dependencies = dependencies ? [] : UserDependencies;

		if (dependencies) {
			for (key in dependencies) {
				if (dependencies.hasOwnProperty(key)) {
					UserDependencies.forEach(function(dependency) {
						if (dependency.name === key && dependencies[key] == 1) {
							_dependencies.push(dependency);
						}
					});
				}
			}
		}

		var cursor = Users.find(selector, options);

		return ReactiveArray.call(this, cursor, _dependencies);
	};

	// is it better to bind 'this' to these fncs somehow?
	var PartyDependencies = [
		{
			name: 'leader',
			fields: ['leader'],
			method: function(self) {
				self._leader = ReactiveVar.User({ _id: self.leader.id });
			}
		},
		{
			name: 'members',
			fields: ['members'],
			method: function(self) {
				self._members = self.members.map(function(member) {
					return ReactiveVar.User({ _id: member.id });
				});
			}
		},
		{
			name: 'invites',
			fields: ['invites'],
			method: function(self) {
				self._invites = self.invites.map(function(invite) {
					return ReactiveVar.User({ _id: invite.id });
				});
			}
		},
		{
			name: 'suggestedInvites',
			fields: ['suggestedInvites'],
			method: function(self) {
				self._suggestedInvites = self.suggestedInvites.map(function(suggestedInvite) {
					return ReactiveVar.User({ _id: suggestedInvite.id });
				});
			}
		},
		{
			name: 'chat',
			fields: ['chat'],
			method: function(self) {
				self._chat = ReactiveArray(Chats.find({ _id: { $in: self.chat } }));
			}
		}
	];

	var _Party = function(selector, options, dependencies) {
		if (!(this instanceof _Party)) {
			return new _Party(selector, options, dependencies);
		}

		var _dependencies = dependencies ? [] : PartyDependencies;

		if (dependencies) {
			for (key in dependencies) {
				if (dependencies.hasOwnProperty(key)) {
					PartyDependencies.forEach(function(dependency) {
						if (dependency.name === key && dependencies[key] == 1) {
							_dependencies.push(dependency);
						}
					});
				}
			}
		}

		var cursor = Parties.find(selector, options);

		return ReactiveObject.call(this, cursor, _dependencies);
	};

	var _Parties = function(selector, options, dependencies) {
		if (!(this instanceof _Parties)) {
			return new _Parties(selector, options, dependencies);
		}

		var _dependencies = dependencies ? [] : PartyDependencies;

		if (dependencies) {
			for (key in dependencies) {
				if (dependencies.hasOwnProperty(key)) {
					PartyDependencies.forEach(function(dependency) {
						if (dependency.name === key && dependencies[key] == 1) {
							_dependencies.push(dependency);
						}
					});
				}
			}
		}

		var cursor = Parties.find(selector, options);

		return ReactiveArray.call(this, cursor, _dependencies);
	};

	var ReactiveObject = function(cursor, dependencies) {
		if (!(this instanceof ReactiveObject)) {
			return new ReactiveObject(cursor, dependencies);
		}

		cursor.observeChanges({
			added: function(id, fields) {
				this._id = id;

				for (var key in fields) {
					if (fields.hasOwnProperty(key)) {
						this[key] = fields[key];

						if (dependencies) {
							dependencies.forEach(function(dependency) {
								if (dependency.fields && dependency.fields.indexOf(key) > -1) {
									dependency.method(this);
								}
							}.bind(this));
						}
					}
				}

				if (dependencies) {
					dependencies.forEach(function(dependency) {
						if (!dependency.fields) {
							dependency.method(this);
						}
					}.bind(this));
				}

				$timeout(function() { $rootScope.$apply() });
			}.bind(this),

			changed: function(id, fields) {
				for (var key in fields) {
					if (fields.hasOwnProperty(key)) {
						if (fields[key] === undefined) {
							delete this[key];
							// need to delete dependencies too?
						} else {
							this[key] = fields[key];

							if (dependencies) {
								dependencies.forEach(function(dependency) {
									if (dependency.fields && dependency.fields.indexOf(key) > -1) {
										dependency.method(this);
									}
								}.bind(this));
							}
						}
					}
				}

				if (dependencies) {
					dependencies.forEach(function(dependency) {
						if (!dependency.fields) {
							dependency.method(this);
						}
					}.bind(this));
				}

				$timeout(function() { $rootScope.$apply() });
			}.bind(this),

			 removed: function(id) {
			 	for (var key in this) {
			 		if (this.hasOwnProperty(key)) {
			 			delete this[key];
			 		}
			 	}

			 	$timeout(function() { $rootScope.$apply() });
			 }.bind(this)
		});

		return this;
	};

	// ReactiveObject.prototype = {
	// 	constructor: ReactiveObject
	// };

	// _Party.prototype = Object.create(ReactiveObject.prototype);

	// angular.extend(_Party.prototype, {
	// 	constructor: _Party
	// });

	var ReactiveArray = function(cursor, dependencies) {
		if(!(this instanceof ReactiveArray)) {
			return new ReactiveArray(cursor, dependencies);
		}

		this.$list = [];

		cursor.observeChanges({
			addedBefore: function(id, fields, before) {
				var obj = {};
				obj._id = id;

				for (var key in fields) {
					if (fields.hasOwnProperty(key)) {
						obj[key] = fields[key];

						if (dependencies) {
							dependencies.forEach(function(dependency) {
								if (dependency.fields && dependency.fields.indexOf(key) > -1) {
									dependency.method(obj);
								}
							}.bind(this));
						}
					}
				}

				if (dependencies) {
					dependencies.forEach(function(dependency) {
						if (!dependency.fields) {
							dependency.method(obj);
						}
					}.bind(this));
				}

				if (before === null) {
					this.$list.push(obj)
				} else {
					var index = 0;

					this.$list.forEach(function(object, i) {
						if (object._id === before) {
							index = i;
							return;
						}
					});

					this.$list.splice(index, 0, obj);
				}

				$timeout(function() { $rootScope.$apply() });
			}.bind(this),

			movedBefore: function(id, before) {
				var index_id, index_before;

				this.$list.forEach(function(object, i) {
					if (object._id === id) {
						index_id = i;
					}

					if (object._id === before) {
						index_before = i;
					}

					if (!!index_id && !!index_before) {
						return;
					}
				});

				this.$list.splice(index_before, 0, this.$list.splice(index_id, 1)[0]);

				$timeout(function() { $rootScope.$apply() });
			}.bind(this),

			// added is not neccessary as we are running addedBefore

			// added: function(id, fields) {
			// 	var obj = {};
			// 	obj._id = id;

			// 	for (var key in fields) {
			// 		if (fields.hasOwnProperty(key)) {
			// 			obj[key] = fields[key];

			// 			if (dependencies) {
			// 				dependencies.forEach(function(dependency) {
			// 					if (dependency.fields && dependency.fields.indexOf(key) > -1) {
			// 						dependency.method(obj);
			// 					}
			// 				}.bind(this));
			// 			}
			// 		}
			// 	}

			// 	if (dependencies) {
			// 		dependencies.forEach(function(dependency) {
			// 			if (!dependency.fields) {
			// 				dependency.method(obj);
			// 			}
			// 		}.bind(this));
			// 	}

			// 	this.$list.push(obj);

			// 	$timeout(function() { $rootScope.$apply() });
			// }.bind(this),

			changed: function(id, fields) {
				var obj;
				this.$list.forEach(function(object) {
					if (object._id === id) {
						obj = object;
						return;
					}
				});

				for(var key in fields) {
					if (fields.hasOwnProperty(key)) {
						if (fields[key] === undefined) {
							delete obj[key];
							// need to delete dependencies too?
						} else {
							obj[key] = fields[key];

							if (dependencies) {
								dependencies.forEach(function(dependency) {
									if (dependency.fields && dependency.fields.indexOf(key) > -1) {
										dependency.method(obj);
									}
								}.bind(this));
							}
						}
					}
				}

				if (dependencies) {
					dependencies.forEach(function(dependency) {
						if (!dependency.fields) {
							dependency.method(obj);
						}
					}.bind(this));
				}

				$timeout(function() { $rootScope.$apply() });
			}.bind(this),

			 removed: function(id) {
			 	for (var i = 0; i < this.$list.length; i++) {
			 		if (this.$list[i]._id === id) {
			 			this.$list.splice(i, 1);
			 			break;
			 		}
			 	}

			 	$timeout(function() { $rootScope.$apply() });
			 }.bind(this)
		});

		return this.$list;
	};

	return ReactiveVar;
});