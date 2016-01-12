'use strict';

var config = {sex: 'male', rest: 55, max: 190}
var Trimp = require('./index.js')(config);

var trimp = Trimp.calculate("activity_996461234.gpx", function (err, workout) {
    console.log(workout.name);
    console.log(workout.date.toString());
    console.log(workout.total.trimp.toFixed(2));
    console.log(workout.total.seconds);
    console.log(workout.total.miles);
    console.log(workout.total.kilometers);
});
