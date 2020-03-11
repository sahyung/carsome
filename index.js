require('datejs')
require('dotenv').config()
const body_parser = require('body-parser');
const db = require('diskdb');
const express = require('express');
const fs = require('file-system');
const path = require('path');
const app = express();
const host = process.env.HOST ? process.env.HOST : '127.0.0.1';
const port = process.env.PORT ? process.env.PORT : 4000;

// connect to db file
db.connect('./data', ['slots']);

app.use(express.urlencoded({ extended: true }));
app.use(body_parser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Include controllers
fs.readdirSync("controllers").forEach(function (file) {
  if(file.substr(-3) == ".js") {
    let route = require("./controllers/" + file)
    route.controller(app, db)
  }
})

// set /slots as home
app.use(function(req, res, next) {
  if (req.path == '/'){
    res.redirect('/slots')
  }else next();
});

app.listen(port, function() {
  console.log(`listening on ${host}:${port}`);
});
