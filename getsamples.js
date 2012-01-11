var csv = require('csv'),
    sys = require('sys'),
    fs = require('fs'),
    path = require('path'),
    parseUrl = require('url').parse,
    exec = require('child_process').exec,
    storage = require('./storage.js');

var version = 1.0;

exports.getAudioSamples = function(url, result) {
   
    storage.getSamples({
        url: url,
        version: version
    }, function(samples) {
        
        if (samples) {
            result(samples);
        } else {
            // Calculate samples...
            processAudio(url, function(samples) {
                // ...and save them to storage
                storage.saveSamples({
                    url: url,
                    version: version,
                    samples: samples
                });

                result(samples);
            });
        }
    });
};

function makeCommand(url) {
    return "./sonic-annotator -d vamp:qm-vamp-plugins:qm-barbeattracker:beats -w csv --csv-force " + url;
}

function makeCsvPath(url) {
    var pathname = parseUrl(url).pathname;
    if (path.extname(pathname) != '.mp3') {
        throw new Error('invalid url');
    }
    var hash = path.basename(pathname, '.mp3');
    return __dirname + '/' + hash + '_vamp_qm-vamp-plugins_qm-barbeattracker_beats.csv';
}

function processAudio(url, result) {
    
    var command = makeCommand(url);
    var csvFile = makeCsvPath(url);

    console.log(command);
    console.log(csvFile);

    exec(command, function (error) {
        if (error !== null) {
            result();
        } else {
            parseFile(csvFile, function(samples) {
                removeFile(csvFile);
                result(samples);
            });
        }
    });
}

function parseFile(path, result) {
    var samples = [];
    csv()
    .fromPath(path)
    .on('data', function(sample) {
        samples.push(sample);
    })
    .on('error', function(error) {
        console.log("CSV parsing: " + error.message);
    })
    .on('end',function() {
        result(samples);
    });
}

function removeFile(path) {
    fs.unlink(path, function (err) {
        if (err) throw err;
    });
}

