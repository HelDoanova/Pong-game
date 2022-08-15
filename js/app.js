//GLOBAL VARIABLES
var camrea;
var scene;
var renderer;

var gameBoardWidth = 7.5;
var gameBoardHeight = 3.5;
var gameBoardDepth = 0.2;

var wallWidth = gameBoardWidth;
var wallHeight = 0.07;
var walldDepth = 0.6;

var ballRadius = 0.1;

var paddleWidth = 0.1;
var paddleHeight = 0.8;
var paddleDepth = 0.3;
var paddleSpaceBoard = 0.1;

//promenné, ktere meni behem hry pozici
// ball variables
var ball;
var startBallSpeed = 0.07;
var ballSpeed = 0;
//var maxBallSpeed = 0.14;
var maxBallSpeed = 0.12;
var ballAngle = get_random_angle();

//promenna, ktera hlida, zda se micek po resetu dotkl pálky nebo ne
//slouzi k tomu aby se micek respawnoval na spravnou stranu
var touch = false;

var paddleRight;
var paddleLeft;
var paddleSpeed = 0.09;
var paddleSpeedAI = 0.05;

var playerLeftScore = 0;
var playerRightScore = 0;
var finalScore = 5;

var start = false;
var playerAI = false;
var gameMusic = document.getElementById("myAudio");
var musicOff = false;
//pomocná proměnná, která uchovává stav hry
//když je hra u once míček se nadále nepohybuje
var end = false;
//gameMusic.volume = 0.5;


//GAME FUNCTIONS
window.onload = function () {
    setRenderer();
    setCamera();
    setScene();
    setLight();

    //Nakloneni kamery
    //camera.position.set(0, -3, 5); 
    camera.position.set(0, -2, 5);
    camera.lookAt(scene.position);

    createGameBoard();

    //createWall(edge) => edge: top / bottom
    createWall("top")
    createWall("bottom")

    createBall();

    //createPlayerPaddle(side) => side: right / left
    createPlayerPaddle("right");
    createPlayerPaddle("left");

    //Pisnicka ke hre
    playGameMusic();

    animate();
}


function setRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function setCamera() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
}

function setScene() {
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x20B2AA); //barva v hexa codu
}

function setLight() {
    var light = new THREE.DirectionalLight(0xE5F6F8);
    light.position.set(0, 1, 3).normalize();
    scene.add(light);
}

//OBJECTS-----------------------------------------------------------------
//Metoda která vytvoří hrací desku
function createGameBoard() {
    var width = gameBoardWidth;
    var height = gameBoardHeight;
    var depth = gameBoardDepth;
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var material = new THREE.MeshBasicMaterial({ color: 0x00FA9A });
    var gameBoard = new THREE.Mesh(geometry, material);

    var position_x = 0;
    var position_y = 0;
    var position_z = 0;
    var image = "textures/board_texture.jpg";
    loadTexture(geometry, image, position_x, position_y, position_z);
    scene.add(gameBoard);
}

//Metoda, která vytvoří zdi(dolní a horní)
function createWall(edge) {
    var width = wallWidth;
    var height = wallHeight;
    var depth = walldDepth;
    var color = 0x2F4F4F
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var wall = new THREE.Mesh(geometry, material);
    wall.position.x = 0;
    wall.position.z = 0.1;
    if (edge == "top") {
        var wallTop = wall;
        wallTop.position.y = gameBoardHeight / 2 + height / 2;
        var position_x = 0;
        var position_y = gameBoardHeight / 2 + height / 2;
        var position_z = 0.1;
        var image = "textures/blue_texture.jpg";
        loadTexture(geometry, image, position_x, position_y, position_z);
        scene.add(wallTop);
    } else {
        var wallBottom = wall;
        wallBottom.position.y = -gameBoardHeight / 2 - height / 2;
        var position_x = 0;
        var position_y = -gameBoardHeight / 2 - height / 2;
        var position_z = 0.1;
        var image = "textures/blue_texture.jpg";
        loadTexture(geometry, image, position_x, position_y, position_z);
        scene.add(wallBottom);
    }
}

//Metoda, která vytvoří míček
function createBall() {
    var radius = ballRadius
    var geometry = new THREE.SphereGeometry(radius, 32, 32);
    var material = new THREE.MeshPhongMaterial({ color: 0x4f0c40, specular: 0x555555, shininess: 18, emissive: 0x700377 });
    ball = new THREE.Mesh(geometry, material);
    ball.position.z = gameBoardDepth / 2 + radius;
    scene.add(ball);
}

//Metoda, která vytvoří pálky(levou a pravou)
function createPlayerPaddle(side) {
    var width = paddleWidth;
    var height = paddleHeight;
    var depth = paddleDepth;
    var geometry = new THREE.BoxGeometry(width, height, depth);
    //var material = new THREE.MeshBasicMaterial({ color: 0x061F65 }); ------------------
    var material = new THREE.MeshNormalMaterial({ color: 0x970F93 });
    var paddle = new THREE.Mesh(geometry, material);
    paddle.position.z = gameBoardDepth + paddleSpaceBoard;

    if (side == "left") {
        paddleLeft = paddle;
        paddleLeft.position.x = -gameBoardWidth / 2 - width / 2;
        scene.add(paddleLeft);
    } else {
        paddleRight = paddle;
        paddleRight.position.x = +gameBoardWidth / 2 + width / 2;
        scene.add(paddleRight);
    }
}

// Vytvooření objektu, který je pokryt texturou
function loadTexture(geometry, image, position_x, position_y, position_z) {
    // Instantiate a loader
    var loader = new THREE.TextureLoader();
    // Load a resource
    loader.load(
        // URL of texture
        image,
        // Function when resource is loaded
        function (texture) {
            // Create objects using texture
            var tex_material = new THREE.MeshBasicMaterial({
                map: texture
            });

            textured_object = new THREE.Mesh(geometry, tex_material);

            textured_object.position.x = position_x;
            textured_object.position.y = position_y;
            textured_object.position.z = position_z;

            scene.add(textured_object);

            // Call render here, because loading of texture can
            // take lot of time
            render();
        },
        // Function called when download progresses
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Function called when download errors
        function (xhr) {
            console.log('An error happened');
        }
    );
}

//PHYSIC AND MOVEMENT--------------------------------------------------
//Metoda, která se stará o vlastnosti, které míček má mít
function ballPhysics() {
    ballBounceWall();
    ballBouncePaddle();
    missBall();
}

//Metoda, která se stará o pohyb míčku
function ballMovement() {

    if(end){
        ballSpeed = 0;
    }

    // update ball position over time
    ball.position.x += ballSpeed * Math.cos(ballAngle);
    ball.position.y += ballSpeed * Math.sin(ballAngle);


}

//Metoda, která se stará o odrážení míčku od stěn
function ballBounceWall() {
    //Odraz od horni stěny
    if (ball.position.y >= gameBoardHeight / 2 - ballRadius) {
        ballAngle = -ballAngle;
    }
    //Odraz od dolni steny
    if (ball.position.y <= -gameBoardHeight / 2 + ballRadius) {
        ballAngle = -ballAngle;
    }
}

//Metoda, která se stará o odraz míčku od pálky
function ballBouncePaddle() {
    //odraz míčku od levé pálky
    if (ball.position.x < paddleLeft.position.x + paddleWidth / 2 + ballRadius &&
        ball.position.y < paddleLeft.position.y + paddleHeight / 2 &&
        ball.position.y > paddleLeft.position.y - paddleHeight / 2) {
        //zvyšuju rychlost po odrazu pálkou 
        if (ballSpeed < maxBallSpeed) {
            ballSpeed = maxBallSpeed;
        }
        ball.position.x = paddleLeft.position.x + (paddleWidth / 2) + ballRadius;
        ballSpeed = ballSpeed;
        ballAngle = get_random_angle();
        //micek se dotkl palky
        touch = true;
        //přehraje zvuk
        var sound = new Audio('sounds/ball_bounce.mp3');
        sound.play();
    }
    //odraz míčku od pravé pálky
    if (ball.position.x > paddleRight.position.x - paddleWidth / 2 - ballRadius &&
        ball.position.y < paddleRight.position.y + paddleHeight / 2 &&
        ball.position.y > paddleRight.position.y - paddleHeight / 2) {
        //zvyšuju rychlost po odrazu pálkou 
        if (ballSpeed < maxBallSpeed) {
            ballSpeed = maxBallSpeed;
        }
        
        ball.position.x = paddleRight.position.x - (paddleWidth / 2) - ballRadius;
        ballSpeed = -ballSpeed;
        ballAngle = get_random_angle();
        //micek se dotkl palky
        touch = true;
        //přehraje zvuk
        var sound = new Audio('sounds/ball_bounce.mp3');
        sound.play();
    }
}

//Metoda, která se stará o situaci, kdy hráč pustí míček do brány
function missBall() {
    if (ball.position.x < -gameBoardWidth / 2) {
        var side = "left";
        updateScore(side);
        resetBall(side);
        //přehraje zvuk
        var sound = new Audio('sounds/miss_ball.mp3');
        sound.play();
        if(!end){
            checkScore(end);
        }
    }

    if (ball.position.x > gameBoardWidth / 2) {
        var side = "right";
        updateScore(side);
        resetBall(side);
        //přehraje zvuk
        var sound = new Audio('sounds/miss_ball.mp3');
        sound.play();
        if(!end){
            checkScore(end);
        }
    }
}

//Metoda, která se stará o aktualizaci skore
function updateScore(side) {
    if (side == "left") {
        playerRightScore++;
        document.getElementById("score").innerHTML = playerLeftScore + ":" + playerRightScore;
    } else {
        playerLeftScore++;
        document.getElementById("score").innerHTML = playerLeftScore + ":" + playerRightScore;
    }
}

//Metoda, která resetuje míček na základní pozici
function resetBall(side) {
    ball.position.x = 0;
    ball.position.y = 0;
    ballAngle = get_random_angle();

    if (side == "left") {
        if (touch) {
            tempBallSpeed = - startBallSpeed;
        } else {
            tempBallSpeed = startBallSpeed;
        }
    } else {
        if (touch) {
            tempBallSpeed = startBallSpeed;
        } else {
            tempBallSpeed = -startBallSpeed;
        }
    }
    touch = false;
    //po gólu se na 1 vteřinu hra zastaví, než se míček dá zase do pohybu
    ballSpeed = 0;
    setTimeout(function () { ballSpeed = tempBallSpeed; }, 1000);
}

//Metoda, která nám vrátí náhodný úhel pro odraz míčku
function get_random_angle() {
    var minimum = -Math.PI / 4;
    var maximum = Math.PI / 4;
    var randomnumber = Math.random() * (maximum - minimum) + minimum;
    return randomnumber;
}


//Metoda, která má na starost rezizování okna
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

//Metoda, která  se stará o pohyb levé pálky - reaguje na stisknutí tlačítek W a S
function paddleMovementLeft() {
    //zablokování kláves - aby se nepohybovala stránka nahoru a dolu,
    //když mačkáme Šipky
    if ([37, 38, 39, 40].indexOf(Key.keyCode) > -1) {
        Key.preventDefault();
    }
    // move up paddleLeft
    if (Key.isDown(Key.W)) {
        if (paddleLeft.position.y < gameBoardHeight / 2 - paddleHeight / 2) {
            paddleLeft.position.y += paddleSpeed;
        } else {
            paddleLeft.position.y += 0;
        }
    }
    // move down paddleLeft
    else if (Key.isDown(Key.S)) {
        if (paddleLeft.position.y > - gameBoardHeight / 2 + paddleHeight / 2) {
            paddleLeft.position.y += -paddleSpeed;
        } else {
            paddleLeft.position.y += 0;
        }
    }
}

//Metoda, která  se stará o pohyb pravé pálky - reaguje na stisknutí tlačítek ↑ a ↓
function paddleMovementRight() {
    //zablokování kláves - aby se nepohybovala stránka nahoru a dolu,
    //když mačkáme 3ipky
    if ([37, 38, 39, 40].indexOf(Key.keyCode) > -1) {
        Key.preventDefault();
    }
    //move up paddleRight
    if (Key.isDown(Key.ARROW_UP)) {

        if (paddleRight.position.y < gameBoardHeight / 2 - paddleHeight / 2) {
            paddleRight.position.y += paddleSpeed;
        } else {
            paddleRight.position.y += 0;
        }
    }
    // move down paddleRight
    else if (Key.isDown(Key.ARROW_DOWN)) {
        if (paddleRight.position.y > - gameBoardHeight / 2 + paddleHeight / 2) {
            paddleRight.position.y += -paddleSpeed;
        } else {
            paddleRight.position.y += 0;
        }
    }
}


//Metoda, která se stará o pohyb AI protivníka
function movementAI() {
    if (paddleRight.position.y <= (ball.position.y - paddleSpeed)) {
        if (paddleRight.position.y < gameBoardHeight / 2 - paddleHeight / 2) {
            paddleRight.position.y += paddleSpeedAI;
        }
    }
    if (paddleRight.position.y > ball.position.y) {
        if (paddleRight.position.y > - gameBoardHeight / 2 + paddleHeight / 2) {
            paddleRight.position.y += -paddleSpeedAI;
        }
    }
}

//Metoda, která kontroluje, zda některý z hráčů nedosáhl maximálního skóre
function checkScore() {

    if (playerLeftScore >= finalScore) {
        var winner = "Player 1 "
        ballSpeed = 0;
        document.getElementById("winner").innerHTML = winner + "wins!";
        document.getElementById("win").style.visibility = "visible";
        gameMusic.pause();
        hideGameButtons();
        var sound = new Audio('sounds/winning_music.mp3');
        sound.play();
        end = true;
    } else if ((playerRightScore >= finalScore) && !playerAI) {
        var winner = "Player 2 "
        ballSpeed = 0;
        document.getElementById("winner").innerHTML = winner + "wins!";
        document.getElementById("win").style.visibility = "visible";
        gameMusic.pause();
        hideGameButtons();
        var sound = new Audio('sounds/winning_music.mp3');
        sound.play();
        end = true;
    } else if ((playerRightScore >= finalScore) && playerAI) {
        var winner = "Computer  "
        ballSpeed = 0;
        document.getElementById("winner").innerHTML = winner + "wins!";
        document.getElementById("win").style.visibility = "visible";
        gameMusic.pause();
        hideGameButtons();
        var sound = new Audio('sounds/sad_music.mp3');
        sound.play();
        sound.play();
        end = true;
    }
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    ballPhysics();
    if (start) {
        ballMovement()
    }

    if (!playerAI) {
        paddleMovementLeft();
        paddleMovementRight();

    } else {
        paddleMovementLeft();
        movementAI();
    }
    //checkScore();
    onWindowResize();
}

//Metoda, která zajišťuje start hry po zmáčknutí tlačítka PLAY
function startPong() {
    if (!start) {
        start = true;
        ballSpeed = startBallSpeed;
        hideStartMenu();
        showGameButtons();
    }
}

//Metoda, která zapne AI protivníka, pokud je v Menu zvolen
function chosenAI() {
    if (document.getElementById("1vsComputer").checked) {
        playerAI = true;
    } else {
        playerAI = false;
    }
}

//Metoda, která zajistí novou hru po zmáčknutí tlačítka NEW GAME (resetuje se skore)
function newGame() {
    document.getElementById("buttonStart").style.visibility = "visible";
    document.getElementById("buttonPlayer").style.visibility = "visible";
    document.getElementById("buttonMusic").style.visibility = "visible";
    document.getElementById("win").style.visibility = "hidden";
    playerLeftScore = 0;
    playerRightScore = 0;
    document.getElementById("score").innerHTML = playerLeftScore + ":" + playerRightScore;
    start = false;
    end = false;
    //playerAI = false;
    //pisnicka ke hre
    playGameMusic();
    hideGameButtons();
}

//Metoda, která skryje Menu(tlacitka)
function hideStartMenu() {
    document.getElementById("buttonStart").style.visibility = "hidden";
    document.getElementById("buttonPlayer").style.visibility = "hidden";
    document.getElementById("buttonMusic").style.visibility = "hidden";   
}

function showGameButtons(){
    document.getElementById("buttonMusicOffOn2").style.visibility = "visible";
    document.getElementById("buttonNewGame2").style.visibility = "visible";
}

function hideGameButtons(){
    document.getElementById("buttonMusicOffOn2").style.visibility = "hidden";
    document.getElementById("buttonNewGame2").style.visibility = "hidden";
}

//Metoda, která zapne písničkuke hře
function playGameMusic() {
    if (!musicOff) {
        gameMusic.play();
    }
}

//Metoda, který vyplne/zapne písničku ke hře, podle hráčovi volby(tlačítko Music OFF/ON)
function turnMusicOnOff() {
    if (!musicOff) {
        musicOff = true;
        document.getElementById("buttonMusicOffOn").innerHTML = "-Music " + "ON-";
        document.getElementById("buttonMusicOffOn2").innerHTML = "-Music " + "ON-";
        gameMusic.pause();
        gameMusic.currentTime = 0;
    } else {
        musicOff = false;
        document.getElementById("buttonMusicOffOn").innerHTML = "-Music " + "OFF-";
        document.getElementById("buttonMusicOffOn2").innerHTML = "-Music " + "OFF-";
        playGameMusic();
    }
}


//Knihovna, která zajišťuje ovládání pomocí kláves
window.addEventListener('keyup', function (event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function (event) { Key.onKeydown(event); }, false);
//Knihovna, která uajišťuje 
var Key = {
    _pressed: {},

    A: 65,
    W: 87,
    D: 68,
    S: 83,
    SPACE: 32,
    ARROW_UP: 38,
    ARROW_DOWN: 40,

    isDown: function (keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function (event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function (event) {
        delete this._pressed[event.keyCode];
    }
}
