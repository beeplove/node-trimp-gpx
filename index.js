'use strict';

var fs = require('fs'),
    moment = require('moment'),
    Trimp = require('trimp'),
    Xml2Js = require('xml2js');


var greatCircleRadius = {
    km: 6378.137
};

if (!Number.prototype.toRad) {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

function calculateDistance (lat1, lon1, lat2, lon2) {
    var dLat = (lat2 - lat1).toRad(),
        dLon = (lon2 - lon1).toRad();

    lat1 = lat1.toRad();
    lat2 = lat2.toRad();

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return greatCircleRadius.km * c;
};

var getDuration = function (millis) {
    var dur = {};
    var units = [
        { label:"millis",    mod:1000 },
        { label:"seconds",   mod:60   },
        { label:"minutes",   mod:60   },
        { label:"hours",     mod:24   },
        { label:"days",      mod:30   },
        { label:"years",     mod: 365 }
    ];
    // calculate the individual unit values...
    units.forEach(function (u){
        millis = (millis - (dur[u.label] = (millis % u.mod))) / u.mod;
    });
    // convert object to a string representation...
    dur.toString = function () {
        return units.reverse().map(function (u) {
            if (dur[u.label] === 0) {
                return null;
            }

            return dur[u.label] + " " + (dur[u.label]==1?u.label.slice(0,-1):u.label);
        }).filter( function (item) {
            return item;
        }).join(', ');
    };

    return dur;
};

module.exports = function (config) {
    var sex = config.sex;
    var rest = config.rest;
    var max = config.max;


    function fromData(data, callback) {
        var parser = new Xml2Js.Parser();

        parser.parseString(data, function (err, xml) {
            if (err) {
                console.log(err);
            }

            var date = moment(xml.gpx.metadata[0].time[0]);

            xml.gpx.trk.forEach(function (track) {
                var time, hr = null;
                var summary = {};
                var lat1, lon1 = null;
                var kilometers = 0;
                var name = track.name[0];

                track.trkseg.forEach(function (segment) {
                    segment.trkpt.forEach(function (trackPoint) {
                        var hr1 = -1;

                        var lat2 = parseFloat(trackPoint.$.lat);
                        var lon2 = parseFloat(trackPoint.$.lon);


                        if (lat2 === 0) lat2 = null;
                        if (lon2 === 0) lon2 = null;


                        if (trackPoint.extensions && trackPoint.extensions[0]) {
                            if (trackPoint.extensions[0]['ns3:TrackPointExtension'] && trackPoint.extensions[0]['ns3:TrackPointExtension'][0]) {
                                if (trackPoint.extensions[0]['ns3:TrackPointExtension'][0]['ns3:hr']) {
                                    hr1 = trackPoint.extensions[0]['ns3:TrackPointExtension'][0]['ns3:hr'][0];
                                }
                            }
                        }


                        var time1 = moment(trackPoint.time[0]);


                        if (time && hr) {
                            if (hr === -1) {
                                hr = hr1;
                            }

                            if (!summary[hr]) {
                                summary[hr] = 0;
                            }

                            summary[hr] = summary[hr] + (time1 - time);
                        }

                        if (lat1 && lon1 && lat2 && lon2) {
                            kilometers = kilometers + calculateDistance(lat1, lon1, lat2, lon2);
                        };

                        time = time1;
                        hr = hr1;
                        lat1 = lat2;
                        lon1 = lon2;
                    });
                });

                var totalTrimp = 0;
                var duration = 0;
                Object.keys(summary).forEach(function (hr) {
                    var seconds = summary[hr] / 1000;
                    var minutes = seconds / 60;
                    var trimp = Trimp({sex: sex, rest: rest, max: max});
                    
                    totalTrimp = totalTrimp + trimp.calculate(hr, minutes);
                    duration = duration + summary[hr];
                });

                var result = {
                    name: name,
                    date: date.toString(),
                    total: {
                        trimp: totalTrimp,
                        seconds: duration/1000,
                        miles: kilometers / 1.609344,
                        kilometers: kilometers
                    }
                };

                callback(null, result);
            });
        });
    }

    function calculate (filename, callback) {
        fs.readFile(filename, function (err, data) {
            if (err) {
                console.log(err);
                callback("Error: couldn't read file", null);
            }

            fromData(data, callback);
        });
    }

    return {
        calculate: calculate
    };
};
