module.exports = function(Tag) {

  Tag.remoteMethod ('capture', {
    description: 'Captures a tag',
    accepts: [
      {
        arg: 'id',
        description: [
          'The id of the tag to capture.'
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
      description: 'TODO Write description'
    },
    http: {
      path: '/:id/capture',
      verb: 'post'
    }
  });

  Tag.capture = function (id, data, cb) {

    Tag.findById (
      id, {include:'game'},
      function (err, tag) {
        if (err) {
          return cb(err);
        }
        if (!tag) {
          return cb(new Error('Tag with id ' + id + 'not found'));
        }
      }
    );
  };

};
