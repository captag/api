var async = require('async');
var Chance = require('chance'), chance = new Chance();


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

          Game.create(game, function (err, newGame) {
            if (err) {
              return cb(err, null);
            } else {

              async.waterfall(
                [
                  // Create tags from the locations related to the game template
                  // and relate the created tags to the game
                  function (cb) {

                    var tags = [];
                    var createTagCallback = function (err, newTag) {
                      tags.push(newTag);
                    };
                    var locations = gameTemplate.locations();
                    locations.forEach(function (location) {
                      createTag(location, newGame, createTagCallback);
                    });

                    cb(null, tags);
                  },
                  // Create teams
                  function (tags, cb) {

                    var teams = [];
                    var createTeamCallback = function (err, newTeam) {
                      teams.push(newTeam);
                    };
                    for (var i = 0; i < teamCount; i++) {
                        createTeam(newGame, createTeamCallback);
                    }

                    cb(null, tags, teams);
                  },
                  // Create scores
                  function (tags, teams, cb) {

                    var createScoreCallback = function (err, newScore) {};
                    tags.forEach(function (tag) {
                      teams.forEach(function (team) {
                        createScore(tag, team, createScoreCallback);
                      });
                    });

                    cb(null, 'done');
                  }
                ],
                function (err, result) {
                  console.log('tags, teams and scores created');
                }
              );

              return cb(null, newGame);
            }
          }
        );
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

    Game.app.models.Tag.create(tag, cb);
  }


  /**
   * Creates a new team using the given game. The team name and color is random.
   */
  function createTeam (game, cb) {

    var teamName = chance.province({
      full: true
    });

    var teamColor = chance.color({
      format: 'hex',
      casing: 'upper'
    });

    var team = {
      name: teamName,
      color: teamColor,
      gameId: game.id
    };

    Game.app.models.Team.create(team, cb);
  }


  /**
   * Creates a new score using the given tag and team.
   */
  function createScore (tag, team, cb) {

    var score = {
      tagId: tag.id,
      teamId: team.id
    };

    Game.app.models.Score.create(score, cb);
  }
};
