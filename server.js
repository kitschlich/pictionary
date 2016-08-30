var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var users = {};
var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

var chooseRandomWord = function(wordList) {
  var min = 0;
  var max = wordList.length - 1;
  var index = Math.floor(Math.random() * (max - min + 1) + min);
  return wordList[index];
};

var currentWord;

io.on('connection', function(socket){

  if (Object.keys(users).length === 0) {
    users[socket.id] = 'drawing';
    currentWord = chooseRandomWord(WORDS);
    socket.emit('word', currentWord);
  }
  else {
    users[socket.id] = 'guessing';
  }
  console.log(users[socket.id]);
  socket.emit('role', users[socket.id]);

  socket.on('draw', function(position) {
    socket.broadcast.emit('draw', position);
  });

  socket.on('guess', function(guess) {
    socket.broadcast.emit('guess', guess);
  });

// on disconnect, if the drawer disconnected, assign the next user as the drawer
  socket.on('disconnect', function() {
    var disconnectedUserRole = users[socket.id];
    delete users[socket.id];
    if ((disconnectedUserRole == 'drawing') && (Object.keys(users).length > 0)) {
      var newDrawer = Object.keys(users)[0];
      console.log('new drawer is: ' + newDrawer);
      users[newDrawer] = 'drawing';
      socket.broadcast.to(newDrawer).emit('role', 'drawing');
      socket.broadcast.to(newDrawer).emit('word', currentWord);
    }
  });

});

server.listen(8080);
