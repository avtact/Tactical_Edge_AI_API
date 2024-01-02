const jwt = require('jsonwebtoken');


module.exports = {
    checkTcken: (req, res, next) => {
        let token = req.get('authorization');
        if (token) {
            token = token.slice(7);
            jwt.verify(token,process.env.JWT_KEY,(err,decoded)=>{
                if(err){
                   res.status(401).json({
                    status:401,
                    success:false,
                    message:'Invalid Token'
                   })
                }else{
                    next();
                }
            });
        } else {
            res.status(400).json({
                status:400,
                success: false,
                message: 'Access denied! unauthorized user '
            })
        }
    }
}