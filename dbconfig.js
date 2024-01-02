const mariadb = require('mariadb/callback');
const pool = mariadb.createPool({ host: 'localhost', user: 'root',password:"", database:"tactical_edge_ai_api",port:3306});
pool.getConnection((err, conn) => {
  if (err) { 
    console.log("not connected due to error: " + err);
  } else {
    console.log("connected ! connection id is " + conn.threadId);
    conn.end(); //release to pool
  }
});



module.exports = pool;