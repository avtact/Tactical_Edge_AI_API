require('dotenv').config();
const pool = require('../dbconfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const date = require('date-and-time');
const now = new Date();
var Buffer = require('buffer/').Buffer
const selectmovie=`SELECT * FROM movie`;
const selectuser=`SELECT * FROM user`
const delmovie=`DELETE FROM movie`
const updatemovie=`UPDATE movie SET`


exports.userlogin = (request, response) => {
   var email_id = request.body.email_id;
   var sql = `SELECT * FROM user WHERE email_id = '${email_id}'`;
   pool.query(sql, (err, results) => {
      if (err) {
         response.status(404).json({
            status: 404,
            message: err
         });
      } else {
         if (results.length == 1 && results[0].status === 'active') {
            bcrypt.compare(request.body.password, results[0].password).then(function (result) {
               if (result == true) {
                  if (result == true && results[0]?.isVerify == 1) {
                     results.password = undefined;
                     let token = jwt.sign({
                        email_id: results[0].email_id,
                        user_id: results[0].user_id,
                     }, process.env.JWT_KEY,
                        { expiresIn: "8h" }
                     );
                     response.status(200).json({
                        status: 200,
                        success: true,
                        message: 'Logged In !',
                        data: {
                           user_id: results[0].user_id,
                           email_id: results[0].email_id,
                           isVerify: results[0].isVerify,
                           name: results[0].name
                        },
                        token: token
                     })
                  } 
                  
                
               } else {
                  response.status(401).json({
                     status: 401,
                     // success: false,
                     message: 'Invalid credentials'
                  })
               }
            });
         } 
         else {
            response.status(400).json({
               status: 400,
               // success: false,
               data: err,
               message: 'Unauthorized user'
            });
         }
         
      }
   });
}

exports.AddMovieImage = (req, res) => {
    const created_date = date.format(now, 'YYYY-MM-DD HH:mm:ss');
    if (req?.files?.image) {
        var binary_image = req?.files?.image[0].filename;
    }
    else {
        return res.status(400).json({ status: 400, message: 'Please upload valid files (.jpeg, .png, .jpg).' });
    }
    if (req?.body?.tittle!='') {
        const Rowmovie = {
            'tittle': (req?.body?.tittle).toString().replace(/\\"/g, '"').replace(/"/g, '\\"'),
            'publish_year': (req?.body?.publish_year).toString().replace(/\\"/g, '"').replace(/"/g, '\\"'),
            'image': (binary_image) ? binary_image : '',
            'created_dt': created_date,
        }
      
        let keys = [];
        let insertValues = [];
        Object.keys(Rowmovie).forEach(key => { 
            keys.push('`' + key + '`');
            let inVal =  `"${Rowmovie[key]}"`;
            insertValues.push(inVal);
        })
        
        var sql = `insert into movie (${keys.join()}) values (${insertValues.join()})`;
      //   console.log(sql)
      //   return
        pool.query(sql, (err, result) => {
            if (err) { return res.status(500).json({ status: 500, error: err }); }
            if (result?.affectedRows > 0) {
                return res.status(201).json({
                    status: 201,
                    movie_id: parseInt(result.insertId),
                    insertrow: result.affectedRows,
                    message: 'movie_img added successfully.',
                });
            } else {
                return res.status(400).json({ status: 400, message: 'Data not inserted please try again.' });
            }
        });
    }
    else {
        return res.status(404).json({ status: 404, message: 'Values required.' });
    }
}



exports.MovieList = (req, res, next) => {
   var sql = `${selectmovie}`;
   pool.query(sql, (err, result) => {
       if (err) { return res.status(500).json({status:500, error: err }); }
       if (result?.length > 0) {
           return res.status(200).json({
               status: 200,
               count: result?.length,
               data: result.map(data => {
                   var imageurl = `${process.env.SERVER_ROOT_PATH}/${process.env.Movie_IMG_PATH}/${data?.image}`;
                //    var buffer = new Buffer(data.description, 'binary');
                //    var bufferBase64 = buffer.toString('base64');
                //    let buff = new Buffer(bufferBase64, 'base64');
                //    let text = buff.toString('ascii');
                   return {
                       movie_id: data.movie_id,
                       tittle: (data?.tittle) ? data?.tittle : 'NA',
                        image: (imageurl) ? imageurl : 'NA',
                       created_dt: (data.created_dt) ? date.format(data.created_dt, 'MM/DD/YYYY HH:mm:ss') : 'NA'
                     
                   }
               }),
               message: 'Movie_img list.'
           });
       } else {
           return res.status(200).json({
               status: 200,
               count: 0,
               data: [],
               message: 'movie not avilable.'
           });
       }
   });
}


exports.movieDetail = (req, res, next) => {
    if (!req?.query?.movie_id) { res.status(404).json({ status: 404, message: "Please provide valid movie_id." }); }
    const id = req?.query?.movie_id ;
    var sql = `${selectmovie} WHERE  movie_id=${id}`;
    pool.query(sql, (err, result) => {
        if (err) { return res.status(500).json({status:500, error: err }); }
        // if (err) { return res.status(500).json({ error: err }); }
        if (result?.length > 0) {
            return res.status(200).json({
                status: 200,
                count: result?.length,
                data: result.map(data => {
                    var imageurl = `${process.env.SERVER_ROOT_PATH}/${process.env.NEWS_IMG_PATH}/${data?.image}`;
                    return {
                        movie_id:data.movie_id ,
                        tittle: (data?.tittle) ? data?.tittle : 'NA',
                        image: (imageurl) ? imageurl : 'NA',
                        created_dt: (data.created_dt) ? date.format(data.created_dt, 'MM/DD/YYYY HH:mm:ss') : 'NA'
                     
                    }
                }),
                message: `Movie_img detail for id ${id}.`
            })
        } else {
            return res.status(404).json({
                status: 404,
                count: 0,
                message: `Movie not found for id ${id}.`
            })
        }
    });
}




exports.UpdateMovies = (req, res, next) => {
    const created_date = date.format(now, 'YYYY-MM-DD HH:mm:ss');
    if (req?.body?.tittle != '') {
        if (!req?.body?.movie_id) { res.status(404).json({ message: "movie_id  missing." }); }
        const movie_id  = req?.body?.movie_id ;
        const Rowmovie = {
            'tittle': (req?.body?.tittle).toString().replace(/\\"/g, '"').replace(/"/g, '\\"'),
            'publish_year': (req?.body?.publish_year).toString().replace(/\\"/g, '"').replace(/"/g, '\\"'),
            'updated_dt': created_date,
        }
        if (req?.files?.image) {
            var binary_image = req?.files?.image[0].filename;
            Rowmovie['image'] = binary_image;
        }
        let update_set = Object.keys(Rowmovie).map(value => {
            let cols = (toString.call(Rowmovie[value]) == "[object Number]") ? `${Rowmovie[value]}` : `"${Rowmovie[value]}"` ;
            return ` ${'`' + value + '`'}  = ${cols}`;
        });
        
        let update_query = `${updatemovie} ${update_set.join(" ,")} WHERE movie_id = ${movie_id}`;
        pool.query(update_query, (err, result) => {
            if (err) { return res.status(500).json({status:500, error: err }); }
            if (result?.affectedRows > 0) {
                return res.status(200).json({
                    status: 200,
                    movie_id: req?.body?.movie_id,
                    updatedrow: result.affectedRows,
                    message: 'Movie updated successfully.',
                })
            } else {
                return res.status(400).json({
                    status: 400,
                    message: 'Data Could not updated.',
                })

            }
        });
    } else {
        return res.status(404).json({ status: 404, message: 'Values required.' });
    }
}



exports.Deletemovie_img = (req,res,next)=>{
    if (!req.params.movie_id) {  return res.status(404).json({ message: "Please provide valid movie_id." }); }
    const id = req.params.movie_id ;
    var sql = `${delmovie} where movie_id = ${id}`;
        pool.query(sql,(err,result)=>{
    if (err) { return res.status(500).json({ status: 500, error: err }); }
    if (result?.affectedRows > 0) {
        res.status(200).json({
            status: 200,
            message: `movie_img deleted successfully.`,
            deletedItems: result.affectedRows,
            deletedId: id,
        });
    } 
    else {
        res.status(200).json({
            status: 200,
            message: 'Could not delete please try again.',
            deletedItems: 0,
            deletedId: id,

        });
    }
        });

}