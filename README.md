# up-api.js
An (incomplete) implementation of the Up Banking API in JavaScript.

## Contributions
Feel free to contribute to this project. This is the first time I've ever written something like this so it's very rough around the edges and probably breaks many different conventions. 

## Usage
```javascript
const upApi = require("./upApi.js");
const Up = new upApi.Client(token);

Up.getTransactions().then(res => console.log(res));
```