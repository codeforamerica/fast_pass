pg = require('pg')

config = {
  host:     'localhost',
  database: 'zones'
}

function update_row(client, row) {
  id = row.id
  console.log("Updating: " + id)
  description = row.description
  description = description.replace(/((<div.*?>)|(<\/div>)|(^\s+|\s+$))/g, '')
  client.query("UPDATE zones SET description = '"+description+"' WHERE id = "+id, function (err, result) { console.log("updating...") })
}

pg.connect(config, function (err, client) {
  client.query("SELECT id, description FROM zones WHERE description LIKE '%div%'", function (err, result) {
    for (var i = 0; i < result.rows.length; i++) {
      update_row(client, result.rows[i])
    } 
    return true
  })
})
