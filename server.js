require('dotenv').config();
const express = require('express');
const routes = require("./Route/route");
const bp = require('body-parser');
const cors = require('cors');
const app = express()

const os = require('os');
const path = require("path");
const nodemailer = require('nodemailer');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*" );
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); 
  });
app.use(bp.json());    
app.use(bp.urlencoded({ extended: false }));
app.use("*",cors())


app.use('/public/movie_img', express.static("public/movie_img"));

app.use("/api/v2",routes);

app.use(express.static(path.join(__dirname,'../upload/')));

app.use((req, res, next) => {
  const error = new Error('URL Not Valid...');
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  return res.status(error.status || 500);
 return res.json({
        error: {
              message: error.message
        }
  });
}); 

// console.log(pool);
// server
port = process.env.PORT || 8080;
app.listen(port, () => { console.log(`Server is running on:${port}`); });