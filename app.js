const express = require('express')
const app = express();
var exphs = require('express-handlebars');
const {
  analyzeProcess
} = require('./incoming-record-data');

//set default engine
app.set('view engine', 'handlebars');
app.engine('handlebars', exphs());

//get index route
app.get('/', async function (req, res) {

  analyzeProcess()
    .then(response => {
      if (response) {
        res.render('findings', {
          filteredData: response
        });
      } else {
        res.render('findings');
      }
    })
    .catch(error => console.log(error));


});

app.listen(3000, (error) => {
  if (error) console.log(error);
  else console.log('Listining on port 3000...');
});

module.exports = app;