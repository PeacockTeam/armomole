var ctx;
var music;

var samples;
var next_beat;
var next_onset;

$().ready(function () {
    initVK();
    initSoundManager();
    initCanvas();
});

function initVK() {
    VK.init({
        apiId: 2748274
    });
    VK.UI.button('login_button');
    $('#login_button').click(function() {
        VK.Auth.login(onLogin, 8); // Access to audio
    });
}

function initSoundManager() {
    soundManager.flashVersion = 9;
    soundManager.flash9Options.useEQData = true;
    soundManager.flash9Options.useWaveformData = true;
    soundManager.flash9Options.usePeakData = true;
    soundManager.useHighPerformance = true;
    soundManager.useFastPolling = true;
    soundManager.flashLoadTimeout = 3000;
    soundManager.waitForWindowLoad = true;
    soundManager.debugMode = false;
}

function initCanvas() {
    ctx = $('#canvas')[0].getContext("2d");
    $('#canvas').click(function() {
        if (music) {
            music.togglePause();
        }
    });
}

function onLogin(r) {
    if (r.session) {
        console.log('User has logged in:', r.session.mid);
        toggleMainView();
        getSongs();
    }
    else {
        console.log('auth failed');
        alert('Sorry, authentification failed');
    }
}

function getSongs() {
    VK.Api.call('audio.get', {
        count: 20
    }, function(r) {
        r.response.forEach(function(song) {
            addToPlaylist(song);
        });

        onPlaylistClicked(function(song) {
            resetState();
            getSamples(song.url);
        });
    });
}

function resetState() {
    if (music) {
        music.destruct();
    }
    resetCanvas();
};

function resetCanvas() {
    next_beat = 0;
    next_onset = 0;
    fillBG('#ffffff');
}

function getSamples(url) {
    toggleSpinner();

    $.ajax({
        type: 'POST',
        url: "/getsamples/",
        data: { url: url },
        success: function(r) {
            toggleSpinner();
            
            if (r.error) {
                console.log('Error: ', r.error);
            } else {
                samples = r.samples;
                playSong(url);
            }
        }
    });
}

function playSong(url) {
    music = soundManager.createSound({
        id: 'music',
        url: url,
        volume: 100,
        autoLoad: true,
        stream: false,
        autoPlay: true,
        whileplaying: whilePlaying,
        onfinish: function() {
            resetCanvas();
        }
    });
}

function whilePlaying() {
    var now = this.position / 1000;

    function randomColor() {
        return "#"+((1<<24)*Math.random()|0).toString(16);
    }
   
    while (samples.beats[next_beat][0] < now) {
        var color = randomColor();
        //for (var i = 0; i < 1; i++) {
        //    drawRandomCircle(300, color);
        //}
        //fillBG(color);
        drawRandomCircle(300, color);
        next_beat++;
    }
    
    var color = randomColor();
    while (samples.onsets[next_onset][0] < now) {
        //for (var i = 0; i < 5; i++) {
        //    drawRandomCircle(100, color);
        //}
        drawRandomCircle(100, color);
        next_onset++;
    }
}

function drawRandomCircle(radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(40 + 920*Math.random(), 40 + 520*Math.random(), radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

function fillBG(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1000, 600);
}

