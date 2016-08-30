var pictionary = function() {
  var canvas, context;
  var socket = io();
  var role;

  var draw = function(position) {
    socket.emit('draw', position);

    context.beginPath();
    context.arc(position.x, position.y,
                  6, 0, 2 * Math.PI);
    context.fill();
  };

  canvas = $('canvas');
  context = canvas[0].getContext('2d');
  canvas[0].width = canvas[0].offsetWidth;
  canvas[0].height = canvas[0].offsetHeight;
  canvas.on('mousemove', function(event) {
    if (drawing) {
      var offset = canvas.offset();
      var position = {x: event.pageX - offset.left,
                      y: event.pageY - offset.top};
      draw(position);
    }
  });

  var drawing = false;
  canvas.on('mousedown', function(event) {
    if (role == 'drawing') {
      drawing = true;
    }
  });
  canvas.on('mouseup', function(event) {
    drawing = false;
  });

  socket.on('draw', draw);

  var guessBox;

  var onKeyDown = function(event) {
    if (event.keyCode != 13) {
      return;
    }
    var guess = guessBox.val();
    postGuess(guess);
    socket.emit('guess', guess);
    console.log(guess);
    guessBox.val('');
  };

  guessBox = $('#guess input');
  guessBox.on('keydown', onKeyDown);

  var postGuess = function(guess) {
    var lastGuess = $('#lastGuess');
    lastGuess.text(guess);
  };

  socket.on('guess', postGuess);

  var setRole = function(clientRole) {
    role = clientRole;
    $('#role').text(clientRole);
    if (clientRole == 'drawing') {
      $('#guess').hide();
    }
  };

  socket.on('role', setRole);

  var setWord = function(word) {
    $('#word').text(': ' + word);
  };
  socket.on('word', setWord);
};

$(document).ready(function() {
  pictionary();
});
