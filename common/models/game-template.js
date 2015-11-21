module.exports = function(GameTemplate) {

  GameTemplate.remoteMethod ('createGame', {
    description: 'Creates a new game using this game template',
    accepts: [
      {
        arg: 'id',
        type: 'string',
        require: true,
        'http': {
          source: 'path'
        }
      }
    ],
    returns: {
      arg: 'result',
      root: true,
      description: 'The new game'
    },
    http: {
      path: '/:id/createGame',
      verb: 'post'
    }
  });
};
