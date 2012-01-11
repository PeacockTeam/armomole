var ctx;

var next_beat = 0;
var beats;

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
}

function onLogin(r) {
    if (r.session) {
        console.log('User has logged in:', r.session.mid);
        $('#login_button').css('display', 'none');
        getSong();
    }
    else {
        console.log('auth failed');
        alert('Sorry, authentification failed');
    }
}

function getSong() {
    VK.Api.call('audio.get', {
            count: 1,
            uid: 1070976
        }, function(r) {
            if (r.response && r.response.length > 0) {
                // first song
                getSamples(r.response[0].url);
            }
        });
}

function getSamples(url) {
    var spinner = new Spinner().spin($('#spinner').get(0));

    $.ajax({
        type: 'POST',
        url: "/getsamples/",
        data: { url: url },
        success: function(r) {
            
            spinner.stop();
            $('#spinner').css('display', 'none');
            
            if (r.error) {
                console.log('Error: ', r.error);
            } else {
                beats = r.samples;
                playSong(url);
            }
        }
    });
}

function playSong(url) {
    var music = soundManager.createSound({
        id: 'music',
        url: url,
        volume: 100,
        autoLoad: true,
        stream: false,
        autoPlay: true,
        whileloading: function() {
            //console.log('Loading: ' + this.bytesLoaded + '/' + this.bytesTotal);
        },
        whileplaying: whilePlaying
    });
    
    $('#canvas').click(function() {
        music.togglePause();
    }).css('display', 'block');
}

function whilePlaying() {
    var now = this.position / 1000;

    function randomColor() {
        return "#"+((1<<24)*Math.random()|0).toString(16);
    }
    
    while (beats[next_beat][0] < now) {
        var color = randomColor();
        for (var i = 0; i < 1; i++) {
            drawRandomCircle(300, color);
        }
        next_beat++;
    }
}

function drawRandomCircle(radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(40 + 920*Math.random(), 40 + 520*Math.random(), radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
};

function fillBG(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1000, 600);
}

