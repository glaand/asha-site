// window onload
window.onload = function() {
    let KEY_SPACE = false; // 32
    let KEY_UP = false; // 38
    let KEY_DOWN = false; // 40
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let backgroundImage = new Image();
    let factor = window.innerWidth / 1920

    window.hitUfos = 0;

    function resizeCanvas() { 
        factor =  window.innerWidth / 1920
        canvas.height = parameters.television.height * factor;
        canvas.width = parameters.television.width * factor;
        canvas.style.height = parameters.television.height * factor + 'px';
        canvas.style.width = parameters.television.width * factor + 'px';
        canvas.style.top = parameters.television.y * factor + 'px';
        canvas.style.left = parameters.television.x * factor + 'px';
    }
    resizeCanvas();
    window.onresize = function() {
        resizeCanvas();
    }

    let rocket = {
        ...parameters.rocket,
        isOverheated: false,
        overheatedSince: null,
        countShots: 0
    };

    let gameover = {
        ...parameters.gameover,
        img: new Image()
    };
    gameover.img.src = gameover.src;

    let ufos = [];
    let shots = [];

    let isGameOver = false;


    document.onkeydown = function(e) {
        if (e.keyCode == 32) { // Leertaste gedrückt
            KEY_SPACE = true;
        }

        if (e.keyCode == 38) { // Nach oben gedrückt
            KEY_UP = true;
        }

        if (e.keyCode == 40) { // Nach unten gedrückt
            KEY_DOWN = true;
        }
    }

    document.onkeyup = function(e) {
        if (e.keyCode == 32) { // Leertaste losgelassen
            KEY_SPACE = false;
        }


        if (e.keyCode == 38) { // Nach oben losgelassen
            KEY_UP = false;
        }

        if (e.keyCode == 40) { // Nach unten losgelassen
            KEY_DOWN = false;
        }
    }

    window.fontLoaded = false;
    function setupFont() {
        var myFont = new FontFace('RetroGaming', 'url(assets/RetroGaming.ttf)');
        myFont.load().then(function(font){
            document.fonts.add(font);
            window.fontLoaded = true;
        });
    }

    function startGame(){
        setupFont();
        loadImages();
        setInterval(update, 500 / 25);
        setInterval(createUfos, 800);
        setInterval(checkForShoot, 800 / 10);
        draw(); // Spiel zeichnen

    }

    function checkForCollision(ufo) {
        // Kontrollieren, ob UFO mit Rakete kollidiert
        if(rocket.x + rocket.width > ufo.x 
            && rocket.y + rocket.height > ufo.y
            && rocket.x < ufo.x
            && rocket.y < ufo.y + ufo.height
            ) {
            rocket.img.src = 'assets/boom.png';
            console.log('Rocket got hit!');
            rocket.hit = true;
            ufos = ufos.filter(u => u != ufo);
        }

        shots.forEach(function(shot) {
            // Kontrollieren, ob Laser mit Rakete kollidiert
            if (shot.x + shot.width >= ufo.x 
                && shot.y + shot.height >= ufo.y 
                && shot.x <= ufo.x + ufo.width 
                && shot.y <= ufo.y + ufo.height
                ) {
                if (ufo.hit) {
                    return;
                }
                window.hitUfos++;
                ufo.hit = true;
                ufo.img.src = 'assets/boom.png';
                console.log('Ufo got hit!');

                shots = shots.filter(s => s != shot)

                setTimeout(() => {
                    ufos = ufos.filter(u => u != ufo);
                }, 2000);
            }
        });
    }


    function createUfos() {
        let ufo = {
            ...parameters.ufo,
            y: Math.random() * 500, // Ufo an zufälligem Ort starten auf der y Axis
            speed: Math.floor(Math.random() * 15) + 2,
            img: new Image(),
        };
        ufo.img.src = ufo.src; // Ufo-Bild wird geladen
        ufos.push(ufo)
    }

    function update() {
        if (KEY_UP) {
            rocket.y -= 7; // XYpx runter beim runter klicken
        }

        if (KEY_DOWN) {
            rocket.y += 7; // XYpx rauf beim rauf klicken
        }

        ufos.forEach(function (ufo) {
            checkForCollision(ufo);
            if (!ufo.hit && !rocket.hit) {
                ufo.x -= ufo.speed;
            }
            if (ufo.x + ufo.width < 0) {
                ufos = ufos.filter(u => u != ufo);
            }
        });

        shots.forEach(function(shot) {
            if (!rocket.hit) {
                shot.x += shot.speed;
            }
            if (shot.x > ctx.width) {
                shots = shots.filter(s => s != shot);
            }
        });

        if (rocket.hit && !isGameOver) {
            isGameOver = true;
        }
    }

    function checkForShoot() {
        if (KEY_SPACE) {
            if (rocket.overheatedSince != null) {
                console.log(Date.now() - rocket.overheatedSince)
                if (Date.now() - rocket.overheatedSince > 3000) {
                    rocket.overheatedSince = null;
                    rocket.isOverheated = false;   
                }
            }
            else {
                rocket.isOverheated = false;
                rocket.overheatedSince = null;
                // 2% chance to overheat in ever shot
                if (Math.random() < 0.02) {
                    rocket.overheatedSince = Date.now();
                    rocket.isOverheated = true;
                }
            }
            if (rocket.isOverheated) {
                // only shoot every 5 shots
                rocket.countShots++;
                if (rocket.countShots < 5) {
                    return;
                }
                else {
                    rocket.countShots = 0;
                }
            }
            let shot = {
                ...parameters.shot,
                x: rocket.x + parameters.shot.relative_x,
                y: rocket.y + parameters.shot.relative_y,
                img: new Image()
            };
            shot.img.src = shot.src; // Laser-Bild wird geladen.

            shots.push(shot);
        }
    }

    function loadImages(){
        backgroundImage.src = 'assets/background.png';
        rocket.img = new Image();
        rocket.img.src = rocket.src;
    }

    function showText() {
        if (window.fontLoaded) {
            ctx.font = 30 * factor + "px RetroGaming";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(window.hitUfos, canvas.width/2, 50 * factor);
        }
    }

    function showOverheated() {
        if (rocket.isOverheated) {
            ctx.font = 20 * factor + "px RetroGaming";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText("OVERHEATED!", (rocket.x + 80) * factor, (rocket.y - 20) * factor);
        }
    }

    function draw() {
        ctx.drawImage(backgroundImage, 0, 0);
        ctx.drawImage(
            rocket.img, 
            rocket.x * factor, 
            rocket.y * factor, 
            rocket.width * factor, 
            rocket.height * factor
        );
        showOverheated();

        ufos.forEach(function(ufo){
            ctx.drawImage(
                ufo.img, 
                ufo.x * factor, 
                ufo.y * factor,
                ufo.width * factor, 
                ufo.height * factor
            );
        });

        shots.forEach(function(shot) {
            ctx.drawImage(
                shot.img, 
                shot.x * factor, 
                shot.y * factor, 
                shot.width * factor, 
                shot.height * factor
            );
        });

        showText();

        if (isGameOver) {
            ctx.drawImage(
                gameover.img, 
                gameover.x * factor, 
                gameover.y * factor, 
                gameover.width * factor, 
                gameover.height * factor
            );
        }

        requestAnimationFrame(draw);
    }
    startGame();
}