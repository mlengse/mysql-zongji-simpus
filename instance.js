const mysql = require('mysql')
const MySQLEvents = require('@rodrigogs/mysql-events');
const config = require('./config')

let instance 
let connection

function handleDisconnect( trigger ) {
  connection = null
  instance = null
  connection = mysql.createConnection({
    host     : config.MYSQL_HOST,
    user     : config.MYSQL_USER,
    password : config.MYSQL_PWD,
    database : config.MYSQL_DB
  });
  
  // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function(err) {              
    if(err) {                                     
      // The server is either down
      // or restarting (takes a while sometimes).
      console.error('error when connecting to db:', new Date(), err);
      setTimeout(handleDisconnect, 2000); 
      // We introduce a delay before attempting to reconnect,
      // to avoid a hot loop, and to allow our node script to
      // process asynchronous requests in the meantime.
    }                                     
  });                                     
                                          
  // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.error('db error', new Date(), err);
    // if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      // Connection to the MySQL server is usually
      // lost due to either server restart, or a
      // connnection idle timeout (the wait_timeout
      // server variable configures this)
      setTimeout(handleDisconnect, 2000); 
      // handleDisconnect();                         
    // } else {                                      
      // throw err;                                  
    // }
  });

  setInterval(function () {
    connection.query('SELECT 1');
  }, 5000);

  instance = new MySQLEvents(connection, {
    startAtEnd: true,
    excludedSchemas: {
      mysql: true,
    },
  });

  instance.start().then(()=> {
    console.log('instance start')
    instance.addTrigger(trigger);

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, (err) => console.error('Connection error', new Date(), err));
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, (err) => console.error('ZongJi error', new Date(), err));

    // instance.on('binlog', evt => {
    //   console.log(evt)
    // })
  
  })

}

module.exports = {
  handleDisconnect,
  MySQLEvents
}