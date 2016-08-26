'use strict';

var config = {sex: 'male', rest: 53, max: 190}
var Trimp = require('./index.js')(config);

var trimp = Trimp.calculate(process.argv[2], function (err, workout) {
    console.log("        Name: ", workout.name);
    console.log("        Date: ", workout.date.toString());
    console.log("       TRIMP: ", workout.total.trimp.toFixed(2));
    console.log("    Duration: ", workout.total.seconds);
    console.log("    Distance: ", workout.total.miles);
});
