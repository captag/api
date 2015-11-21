module.exports = function(Game) {

  Game.remoteMethod ('createFromTemplate', {
    description: 'Creates a new game using the game template with the given id',
    accepts: [
      {
        arg: 'gameTemplateId',
        description: [
          'The id of the game template which should be used to create the game.'
        ],
        type: 'string',
        require: true,
        'http': {
          source: 'path'
        }
      },
      {
        arg: 'teamCount',
        description: 'The number of teams to create',
        type: 'number',
        required: true
      }
    ],
    returns: {
      arg: 'result',
      root: true,
      description: 'The new game'
    },
    http: {
      path: '/createFromTemplate/:gameTemplateId',
      verb: 'post'
    }
  });

  Game.createFromTemplate = function (gameTemplateId, teamCount, cb) {

    Game.app.models.GameTemplate.findById (
      gameTemplateId, {include:'locations'},
      function (err, gameTemplate) {

          if (err) {
            return cb(err);
          }

          if (!gameTemplate) {
            return cb(new Error('Argument gameTemplateId is invalid'));
          }

          if (!gameTemplate.locations) {
            return cb(new Error('GameTemplate has no locations'));
          }

          var game = {
            name: gameTemplate.name,
            image: gameTemplate.image,
            status: 'new'
          };

          Game.create(game, function (err, data) {
            if (err) {
              return cb(err, null);
            } else {
              // Create tags from the locations related to the game template
              // and relate the created tags to the game
              var locations = gameTemplate.locations();
              locations.forEach(function (location) {
                createTag(location, data, cb);
              });

              return cb(null, data);
            }
          });
      }
    );
  };


  /**
   * Creates a new tag using the given location and game.
   */
  function createTag (location, game, cb) {

    var tag = {
      name: location.name,
      country: location.country,
      city: location.city,
      zipCode: location.zipCode,
      geoPoint: location.geoPoint,
      gameId: game.id
    };

    Game.app.models.Tag.create(tag, function (error, data) {
      if (error) {
        return cb(error, null);
      }
    });
  }


  function createTeam (game, cb) {

    
  }
};
