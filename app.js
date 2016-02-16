//with help from http://codereview.stackexchange.com/questions/66719/structuring-a-html5-game-without-a-framework

/*jshint esnext: true */

const SimonSays = {};

(function () {

    "use strict";

    SimonSays.Game = function (element) {
        this.setElement(element);
        this.start = this.start.bind(this);

        this.board = new SimonSays.Board();
        this.scoreBoard = new SimonSays.Scoreboard();
        this.background = new SimonSays.Background();

    };


    SimonSays.Game.prototype = {
        title: 'simonSays',
        document: null,
        element: null,
        simonPlays: [],
        humanPlays: [],
        strict: false,
        round: 0,
        userInterface: null,
        window: null,
        constructor: SimonSays.Game,

        toggleStrict: function () {
            $('.mode').toggleClass('on');
            this.strict = !this.strict;
        },

        listen: function () {
            $("body").one('click', '.square', boundHumanPlay);
        },

        stopListen: function () {
            $("body").off('click', '.square');
        },

        draw: function () {
            this.background.draw(this.element);
            this.board.draw(this.document);
            this.scoreBoard.draw(this.round, this.board);
        },

        setElement: function (element) {
            this.element = element;
            this.document = this.element.ownerDocument;
            this.window = this.document.defaultView;
        },

        start: function () {
            this.round = 0;
            this.simonPlays = [];
            console.log(this.simonPlays);
            this.simonPlay();
        },

        humanPlay: function (event) {
            const move = Number($(event.target).attr('id'));

            this.stopListen();
            this.humanPlays.push(move);
            this.board.play(this.humanPlays.slice(-1));
            console.log(this.humanPlays, this.simonPlays);
            this.comparePlays(move);
        },


        simonPlay: function () {
            this.stopListen();
            this.round++;
            this.humanPlays = [];

            // create a random play for each round and send to board object
            this.simonPlays.push(Math.floor(Math.random() * 4));
            this.board.play(this.simonPlays);
            this.scoreBoard.update(this.round);
            setTimeout(this.listen, 500 * this.simonPlays.length);

        },

        comparePlays: function (move) {

            //  Should I be calling game.board and game.simonPlay here?

            const gameCheck = move === this.simonPlays[this.humanPlays.length - 1];

            this.stopListen();

            if (!gameCheck) {
                console.log('compare', gameCheck);
                this.humanPlays = [];
                this.scoreBoard.woops();

                if (this.strict) {
                    setTimeout(game.start, 1000);
                } else {
                    setTimeout(function () {
                        game.board.play(game.simonPlays);
                        game.scoreBoard.update(game.round);
                        setTimeout(game.listen, 500 * game.simonPlays.length);
                    }, 1000);
                }
            } else if (this.humanPlays.length === this.simonPlays.length) {

                if (this.round >= 20) {
                    return this.scoreBoard.win();
                } else {

                    console.log('compare', gameCheck);
                    setTimeout(function () {
                        game.simonPlay();
                    }, 1000);
                }
            } else {
                this.listen(); // eventlistenr?
            }
        }

    };


    // Board
    SimonSays.Board = function () {
        this.buttonCount = 4;
        this.boardHtml = document.createElement('div');
        this.buttons = [];
        this.colors = ['red', 'green', '#cca707', 'blue'];
        this.sounds = ['https://s3.amazonaws.com/freecodecamp/simonSound1.mp3',
                   'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3',
                   'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3',
                   'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'];

    };

    SimonSays.Board.prototype = {

        draw: function (element) {

            element.body.appendChild(this.boardHtml);
            this.boardHtml.className = 'board';

            let i;
            for (i = 0; i < this.buttonCount; i++) {

                this.buttons[i] = new SimonSays.Button();
                this.buttons[i].color = this.colors[i];
                this.buttons[i].sound = this.sounds[i];
                this.buttons[i].num = i;
                this.buttons[i].draw(this.boardHtml);
            }

            console.log(this);
        },

        play: function (moves) {

            game.stopListen();

            const nodes = $.map(moves, function (id) {
                return document.getElementById(id);
            });

            console.log(nodes);

            $(nodes).each(function (i, el) {
                setTimeout(function () {
                    $(el)
                        .animate({
                            opacity: 0.25
                        }, 300, playSound)
                        .animate({
                            opacity: 1
                        }, 300);
                }, 500 * i);

            });

            //            setTimeout(game.listen, 500 * nodes.length);

            function playSound() {
                const val = $(this).val();
                const id = this.id;
                const soundUrl = game.board.buttons[id].sound;
                const a = new Audio(soundUrl);

                a.play();
            }
        },

    };

    //Buttons

    SimonSays.Button = function () {
        this.color = null;
        this.sound = null;
        this.num = null;
        // this.side = '100px';     -- moved to css
        this.buttonHtml = document.createElement('div');
    };

    SimonSays.Button.prototype = {
        draw: function (board) {
            this.buttonHtml.className = 'square ' + this.color;
            $(this.buttonHtml).prop("id", this.num);
            this.buttonHtml.style.backgroundColor = this.color;
            //    this.squareHtml.style.width = this.side;   -- moved to css
            //    this.squareHtml.style.height = this.side;    
            board.appendChild(this.buttonHtml);
        }
    };

    // Scoreboard

    SimonSays.Scoreboard = function () {
        this.round = null;
    };

    SimonSays.Scoreboard.prototype = { // creates an element in board div that tracks rounds NOTE: update not working yet
        draw: function (round, board) {
            //            this.round = round;
            this.scoreboardHtml = document.createElement('div');
            this.scoreboardHtml.className = 'scoreboard';
            $(".scoreboardContainer").append(this.scoreboardHtml);

        },

        update: function (round) {
            $(this.scoreboardHtml).html("<h2>Scoreboard</h2><p>round: " + round + "</p>");
        },

        woops: function () {
            $(this.scoreboardHtml).html("<h2>WOOPS!</h2>");

        },

        win: function () {
            $(this.scoreboardHtml).html("<h2>YOU WIN!</h2><p>Click restart to play again</p>");

        },

    };

    // Background
    SimonSays.Background = function () {
        this.backgroundUrl = "url('img/retina_wood.png')";
    };

    SimonSays.Background.prototype = {
        draw: function (gameBoard) {
            gameBoard.style.backgroundImage = this.backgroundUrl;
        }
    };

}());