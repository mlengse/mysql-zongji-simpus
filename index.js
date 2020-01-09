const redis = require('redis')

const {
  handleDisconnect,
  MySQLEvents
} = require('./instance')

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

        // publisher.publish('simpus', JSON.stringify(Object.assign({}, {
        //   simpusSubs: JSON.parse(pub)
        // })), function(){
        //   // console.log(pub)
        //   // process.exit(0);
        //  });

        publisher.publish('simpus', pub, function(){
          // console.log(pub)
          // process.exit(0);
         });
        // console.log(event.type, event.table, getTanggal(event.timestamp));
        // console.log(row)
      })
    }
  },
}

handleDisconnect(trigger)