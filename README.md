# node-trimp-gpx
TRIMP calculation from GPX (the GPS Exchange Format)

# Usage Example

```javascript
var Trimp = require('trimp-gxp')({sex: 'male', rest: 55, max: 196});
var workout = Trimp.calculate(xml);
// {
//     name: 'Foundation Run',
//     trimp: 65,
//     duration: 45 // minutes
// }
console.log(workout.name);
console.log("Trimp: " + workout.trimp);
console.log("Duration: " + workout.duration + " minute(s)");
```
