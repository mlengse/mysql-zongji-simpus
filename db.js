const ZongJi = require('zongji')

const config = require('./config')

let zongji = new ZongJi({
  host     : config.MYSQL_HOST,
  user     : config.MYSQL_USER,
  password : config.MYSQL_PWD,
  database : config.MYSQL_DB
})

zongji.on('binlog', function(evt) {
  let name = evt.getEventName()
  if(name !== 'tablemap') {
    // console.log(evt.getEventName(), evt.tableMap[evt.tableId].tableName)
    if(evt.rows.length){
      evt.rows.map(ro => {
        let row = Object.assign({}, ro)
        if( row.after ){
          row = row.after
        } 
        Object.keys(row).map( key => {
          if(key === 'json_response' /*.includes('response')*/ && row[key] && typeof row[key] === 'string') {
            console.log(name, evt.tableMap[evt.tableId].tableName, '------')
            // evt.dump();
            // console.log(JSON.stringify(row[key]))
            // row[key] = JSON.parse(row[key])
            console.log(JSON.parse(row[key]))
            // console.log(JSON.parse(JSON.stringify(row[key]).split('\\"').join('"')))
            // row[key] = JSON.parse(JSON.stringify(row[key]).split("'").join(''))
            // console.log(JSON.parse(JSON.parse(JSON.stringify(JSON.parse(JSON.stringify(row[key]))))))
          } else if(key.includes('response') && row[key] && typeof row[key] === 'string'){
            console.log(name, evt.tableMap[evt.tableId].tableName, key)
            console.log(JSON.parse(row[key]))
            // console.log(JSON.stringify(row[key]))
            // evt.dump();
          }
        })
        // console.log(row)
      })
    }
    // evt.dump();
  }
});
 
// Binlog must be started, optionally pass in filters
zongji.start({
  includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows']
});

process.on('SIGINT', function() {
  console.log('Got SIGINT.');
  zongji.stop();
  process.exit();
});

