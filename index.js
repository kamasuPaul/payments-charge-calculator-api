const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

//create index route
app.get('/', (req, res) => {
    res.send('Hello there!');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});