//***************************************** */
//CODE HEADER 
//CODE DATE: 26th Dec'2023
//DEVELOPER NAME: RAHUL KUMAR
//PURPOSE: APIs to support the frontend. This file containd ADD, DELETE, UPDATE, LOGIN, LIST BY ID, LIST API routes   
//GIT REPO NAME: Tactical_Edge_AI_API
//COMMITTED ON:30/Dec/2023
//TESTED ON:26/dec/2023
//**************************************** */


const exp = require('express');
const {checkTcken}=require('../services/auth.middleware');
const userController=require('../Controller/auth_controller')
const rout=exp.Router();
const multer = require("multer");


multer({ dest: process.env.Movie_IMG_PATH });
// multer({dest:process.env.NEWS_BANNER_PATH});
const MOVIE_fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        cb(null, false);
        console.log(`file Extension could not supportable. only support extension(.jpge, .png , .jpg)`);
    }
}
const movie_storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, './' + process.env.Movie_IMG_PATH); },
    filename: function (req, file, cb) { cb(null, new Date() / 10 + 'news_' + file.originalname); }
}); 
const movieFile = multer({ storage: movie_storage, fileFilter: MOVIE_fileFilter, });
//===========complete mariaDb===========================
//==========================Auth_api============================
rout.post('/user-login',userController.userlogin);

//=========================Movie insert with image api==============================================
rout.post("/add_movie", movieFile.fields([{ name: 'image', maxCount: 1 }]), userController.AddMovieImage);

//=========================Movie update with image api==============================================
rout.patch("/update_movie/", movieFile.fields([{ name: 'image', maxCount: 1 }]), userController.UpdateMovies);

//=========================Movie List api==============================================
rout.get("/movie_list", userController.MovieList);

//=========================Movie List by Movie_id api==============================================
rout.get("/movie_detail", userController.movieDetail);


//=========================Movie delete by Movie_id api==============================================
rout.delete("/delete_movie_img/:movie_id", userController.Deletemovie_img);

module.exports=rout; 
