const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const cors = require('cors');
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'postgres',
    database : 'smartbrain'
  }
});


const app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res)=> {
  res.send(database.users);
})

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
    if (isValid) {
      return db.select('*').from('users')
        .where('email', '=', req.body.email)
        .then(user => {
          res.json(user[0])
        })
        .catch(err => res.status(400).json('cannot get user'))
    } else {
      res.status(400).json('recheck info')
    }
  })
  .catch(err => res.status(400).json('wrong creadentails'))
})

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  let salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
        .into('login')
        .returning('email')
        .then(loginEmail => {
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date()
            })
            .then(user => {
              res.json(user[0])
            })
        })
      .then(trx.commit)
      .catch(trx.rollback)
    })
      .catch(err => res.status(400).json('cannot register'))
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users')
    .where({
      id: id
    })
    .then(user => {
      if (user.length){
        res.json(user[0])
      } else {
        res.status(400).json('not found users')
      }
  })
})


app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0])
    })
    .catch(err => res.status(400).json('cannot get entries'))
})

app.listen(3000, ()=> {
  console.log('app is running on port 3000');
})
