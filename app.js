//with help from http://codereview.stackexchange.com/questions/66719/structuring-a-html5-game-without-a-framework

/*jshint esnext: true */

const SimonSays = {};

(function () {

    "use strict";

    SimonSays.Game = function (element) {
        this.setElement(element);
        // this.start = this.start.bind(this);

        this.board = new SimonSays.Board();
        this.button = new SimonSays.Button();
        this.scoreBoard = new SimonSays.Scoreboard();
        //    this.input = new SimonSays.Input();
        this.background = new SimonSays.Background();
        //    this.simon = new SimonSays.Simon();
        this.humanPlays = [];
        this.humanPlay = function (event) {

            this.humanPlays.push($(event.target).attr('id'));
            console.log('hello', this.humanPlays);

        };

    };

    SimonSays.Game.prototype = {

        title: 'simonSays',

        document: null,

        element: null,

        input: null,

        paused: false,

        oldTime: 0,

        simonPlays: [],

        player: null,

        round: 0,

        userInterface: null,

        window: null,

        constructor: SimonSays.Game,

        draw: function () {

            this.background.draw(this.element);
            this.board.draw(this.document);
            //this.button.draw();
            this.scoreBoard.draw(this.round, this.board);
        },

        pause: function () {
            this.paused = true;
            // ...
        },

        setElement: function (element) {
            this.element = element;
            this.document = this.element.ownerDocument;
            this.window = this.document.defaultView;
        },

        start: function () {
            this.draw();
            this.player = 'simon';
        },

        unpause: function () {
            this.paused = false;
            this.onAnimate(this.round);
        },

        update: function () {

            // create a random play for each round and send to board object
            this.simonPlays.push(Math.floor(Math.random() * 4));
            this.board.play(this.simonPlays);
            this.round++;
            this.scoreBoard.update(this.round);

        },

    };


    // Board
    SimonSays.Board = function () {
        this.buttonCount = 4;
        this.boardHtml = document.createElement('div');
        this.buttons = [];
        this.colors = ['red', 'green', 'yellow', 'blue'];
        this.sounds = ['https://s3.amazonaws.com/freecodecamp/simonSound1.mp3',
                   'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3',
                   'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3',
                   'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'];

    };

    SimonSays.Board.prototype = {

        draw: function (element) {

            element.body.appendChild(this.boardHtml);
            this.boardHtml.className = 'board';

            for (var i = 0; i < this.buttonCount; i++) {

                this.buttons[i] = new SimonSays.Button();
                this.buttons[i].color = this.colors[i];
                this.buttons[i].sound = this.sounds[i];
                this.buttons[i].num = i;
                this.buttons[i].draw(this.boardHtml);
            }

            console.log(this);
        },

        play: function (simonPlays) {

            const buttonHtmlArr = [],
                buttons = this.buttons;

            simonPlays.forEach(function (e) {
                buttonHtmlArr.push($(buttons[e].buttonHtml));
            });

            $(buttonHtmlArr).each(function (i, el) {
                window.setTimeout(function () {
                    $(el)
                        .animate({
                            opacity: 0.25
                        }, 300)
                        .animate({
                            opacity: 1
                        }, 300);
                }, 500 * i);

            });
        }
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
            this.scoreboardHtml = document.createElement('div');
            this.scoreboardHtml.className = 'scoreboard';
            this.scoreboardHtml.innerHTML = round;
            board.boardHtml.appendChild(this.scoreboardHtml);

        },

        update: function (round) {
            this.scoreboardHtml.innerHTML = round;
        }

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