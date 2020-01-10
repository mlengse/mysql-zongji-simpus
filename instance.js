const redis = require('redis')
const mysql = require('mysql')
const MySQLEvents = require('@rodrigogs/mysql-events');
const config = require('./config')

const getTanggal = require('./tanggal')

const publisher = redis.createClient();

const trigger = {
  name: 'TEST',
  expression: '*',
  statement: MySQLEvents.STATEMENTS.ALL,
  onEvent: (event) => { // You will receive the events here
    if(event.affectedRows.length) {
      event.affectedRows.map( row => {
        if(row.after){
          row = row.after
        }
        if(!row.after && row.before){
          row = row.before
        }
        Object.keys(row).map( key => {
          if(row[key] === 5.877471754111438e-39) {
            row[key] = 0
          }
          if((key.includes('response') || key.includes('data')) && row[key] && typeof row[key] === 'string') {
            // console.log(key)
            let n = JSON.parse(JSON.stringify(JSON.parse(row[key])))
            if(n.response){
              n = Object.assign({}, n, n.response, {
                response: undefined
              })
            }
            delete row[key]
            row = Object.assign({}, row, n)
          }
        })
        row = JSON.parse(JSON.stringify(row))

        let pub = JSON.stringify(Object.assign({}, {
          simpus: {
            type: event.type,
            table: event.table,
            timestamp: event.timestamp,
            tanggal: getTanggal(event.timestamp), 
            row
          }
        }))

        publisher.publish('simpus', pub, function(){
        });
      })
    }
  },
}

function handleDisconnect() {
  
  const connection = mysql.createConnection({
    host     : config.MYSQL_HOST,
    user     : config.MYSQL_USER,
    password : config.MYSQL_PWD,
    database : config.MYSQL_DB
  });

  connection.connect();                                     
                                          
  connection.on('error', function(err) {
    if(err) {                                     
      console.error('connection.on(error):', new Date(), JSON.stringify(err));
      if(!!instance){
        instance.stop()
      }
      if(!!connection) {
        connection.end()
      }
      setTimeout(handleDisconnect, 2000)
    }   
  });

  const instance = new MySQLEvents(connection, {
    startAtEnd: true,
    excludedSchemas: {
      mysql: true,
    },
  });

  instance.start().then(() => {
    console.log('instance start')
    instance.addTrigger(trigger);

    // instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, (err) => {
    //   if(err) {                                     
    //     console.error('MySQLEvents.EVENTS.CONNECTION_ERROR: ', new Date(), JSON.stringify(err))
    //     if(!!instance){
    //       instance.stop()
    //     }
    //     if(!!connection) {
    //       connection.end()
    //     }
    //     setTimeout(handleDisconnect, 2000)
    //   }   
    // });
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, (err) => {
      if(err) {                                     
        console.error('MySQLEvents.EVENTS.ZONGJI_ERROR: ', new Date(), JSON.stringify(err))
        if(!!instance){
          instance.stop()
        }
        if(!!connection) {
          connection.end()
        }
        setTimeout(handleDisconnect, 2000)
      }   
    });
  })
}

module.exports = {
  handleDisconnect,
}