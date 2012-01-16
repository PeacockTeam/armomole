var csv = require('csv'),
    sys = require('sys'),
    fs = require('fs'),
    path = require('path'),
    parseUrl = require('url').parse,
    exec = require('child_process').exec,
    storage = require('./storage.js');

var version = "1.0.1";

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
    return "./sonic-annotator -T transforms.txt -w csv --csv-force " + url;
}

function makeCsvPaths(url) {
    var pathname = parseUrl(url).pathname;
    if (path.extname(pathname) != '.mp3') {
        throw new Error('invalid url');
    }
    var hash = path.basename(pathname, '.mp3');
    return { 
        onsets: __dirname + '/' + hash + '_vamp_vamp-aubio_aubioonset_onsets.csv',
        beats:  __dirname + '/' + hash + '_vamp_vamp-aubio_aubiotempo_beats.csv'
    };
}

function processAudio(url, result) {
    
    var command = makeCommand(url);
    var csvFiles = makeCsvPaths(url);

    console.log(command);
    console.log(csvFiles);

    exec(command, function (error) {
        if (error !== null) {
            result();
        } else {
            parseFile(csvFiles.onsets, function(onsets) {
                removeFile(csvFiles.onsets);

                parseFile(csvFiles.beats, function(beats) {
                    removeFile(csvFiles.beats);
                    result({
                        'onsets': onsets,
                        'beats': beats
                    });
                });
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

