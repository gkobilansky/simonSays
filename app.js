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
            this.scoreBoard.draw(this.round);
        },

        setElement: function (element) {
            this.element = element;
            this.document = this.element.ownerDocument;
            this.window = this.document.defaultView;
        },

        start: function () {
            this.round = 0;
            this.simonPlays = [];
            this.simonPlay();
        },

        humanPlay: function (event) {
            const move = Number($(event.target).attr('id'));

            this.stopListen();
            this.humanPlays.push(move);
            this.board.play(this.humanPlays.slice(-1));
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

            //wait for buttons to finish playing b4 listening for user clicks
            setTimeout(this.listen, 500 * this.simonPlays.length);

        },

        comparePlays: function (move) {

            //  Should I be calling game.board and game.simonPlay here?
            // TODO: Refactor

            const gameCheck = move === this.simonPlays[this.humanPlays.length - 1];

            this.stopListen();

            if (!gameCheck) { // You screwed up
                this.humanPlays = [];
                this.scoreBoard.woops();

                if (this.strict) { // Restart the game, it was set to strict mode
                    setTimeout(game.start, 1000);
                } else {
                    setTimeout(function () {
                        game.board.play(game.simonPlays);
                        game.scoreBoard.update(game.round);
                        setTimeout(game.listen, 500 * game.simonPlays.length); // wait for playback to finish before listening for clicks
                    }, 1000);
                }
            } else if (this.humanPlays.length === this.simonPlays.length) { // You did it right

                if (this.round >= 20) { // 20 round win condition
                    return this.scoreBoard.win();
                } else {

                    setTimeout(function () { // Take a breather and then Simon goes again
                        game.simonPlay();
                    }, 1000);
                }
            } else { // Listen after each human click, unless it's simons turn
                this.listen();
            }
        }

    };


    // Board
    SimonSays.Board = function () {
        this.buttonCount = 4;
        this.boardHtml = document.createElement('div');
        this.buttons = [];
        this.colors = ['red', 'green', '#cca707', 'blue']; // default yellow looked too much like the board
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
        },

        play: function (moves) {
            game.stopListen(); // no clicks while playing the moves


            // When Simon plays full array of his plays is passed, when human plays, just the last play is passed. Each move is mapped to the button element
            const nodes = $.map(moves, function (id) {
                return document.getElementById(id);
            });

            $(nodes).each(function (i, el) { //fade button in and out and play sound
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
        this.buttonHtml = document.createElement('div');
    };

    SimonSays.Button.prototype = {
        draw: function (board) {
            this.buttonHtml.className = 'square ' + this.color;
            $(this.buttonHtml).prop("id", this.num);
            this.buttonHtml.style.backgroundColor = this.color;
            board.appendChild(this.buttonHtml);
        }
    };

    // Scoreboard

    SimonSays.Scoreboard = function () {};

    SimonSays.Scoreboard.prototype = {

        // creates an element in board div that tracks rounds
        draw: function (round) {
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