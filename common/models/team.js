module.exports = function(Team) {

  Team.remoteMethod ('join', {
    description: 'Joins this team',
    accepts: [
      {
        arg: 'id',
        description: [
          'The id of the team to join.'
        ],
        type: 'string',
        require: true,
        'http': {
          source: 'path'
        }
      },
      {
        arg: 'data',
        description: 'TODO Write description',
        type: 'object',
        required: true,
        'http': {
          source: 'body'
        }
      }
    ],
    returns: {
      arg: 'result',
      root: true,
      description: 'The updated team including game and members relations'
    },
    http: {
      path: '/:id/join',
      verb: 'post'
    }
  });

  Team.join = function (id, data, cb) {

    Team.findById (
      id, {include: ['game', 'members']},
      function (err, team) {
        if (err) {
          return cb(err);
        }
        if (!team) {
          return cb(new Error('Team with id ' + id + ' not found'));
        }

        var game = team.game();
        var userId = data.userId;
        // Get player where gameId and userId match
        Team.app.models.Player.findOne(
          {
              where: {
                'gameId': game.id,
                'userId': userId
              }
          },
          function (err, player) {

            if (err) {
              return cb(err);
            }

            if (player) {
              var error = new Error(
                'User ' + userId +
                ' is already a member of team ' + player.teamId
              );
              error.status = '409';
              return cb(error);
            }

            // Create a new player pbject
            createPlayer(game, team, userId, function (err, player) {

              if (err) {
                return cb(err);
              }

              if (!player) {
                return cb(new Error('Creating player failed'));
              }

              // Return the updated team including the game and member relations
              Team.findById(id, {include: ['game', 'members']}, cb);
            });
          }
        );
      }
    );
  };


  Team.remoteMethod ('leave', {
    description: 'Leaves this team',
    accepts: [
      {
        arg: 'id',
        description: [
          'The id of the team to leave.'
        ],
        type: 'string',
        require: true,
        'http': {
          source: 'path'
        }
      },
      {
        arg: 'data',
        description: 'TODO Write description',
        type: 'object',
        required: true,
        'http': {
          source: 'body'
        }
      }
    ],
    returns: {
      arg: 'result',
      root: true,
      description: 'The updated team including game and members relations'
    },
    http: {
      path: '/:id/leave',
      verb: 'post'
    }
  });

  Team.leave = function (id, data, cb) {

    var userId = data.userId;
    if (!userId) {
      var error = new Error('userId not set');
      error.status = '400';
      return cb(error);
    }

    // Get player where teamId and userId match
    Team.app.models.Player.destroyAll(
      {
        'teamId': id,
        'userId': userId
      },
      function (err, info) {

        if (err) {
          return cb(err);
        }

        // Return the updated team including the game and member relations
        Team.findById(id, {include: ['game', 'members']}, cb);
      }
    );
  };


  /**
   * Creates a new player using the given game, team and userId.
   */
  function createPlayer (game, team, userId, cb) {

    var player = {
      gameId: game.id,
      teamId: team.id,
      userId: userId
    };

    Team.app.models.Player.create(player, cb);
  }
};
