const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const session = require('express-session')
const SessionStore = require('connect-session-knex')(session);

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
const authRouter = require('./auth/auth-router.js');

const server = express();
const sessionConfig = {
    name: 'monkey',
    secret: 'super secret string',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
        secure: false,
        httpOnly: true
    },
    store: new SessionStore({
        knex: require('./database/dbConfig'),
        tablename: 'users',
        sidfieldname: 'id',
        createtable: true,
        clearInterval: 60 * 60 * 1000,
    }),
}

server.use(session(sessionConfig))
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use('/api/auth', authRouter);


server.get('/', (req, res) => {
    res.send('its alive!');
});

server.post('/api/register', (req, res) => {
    let user = req.body;

    if(user.password.length < 8) {
        return res.status(400).json({ message: 'Password is too short' })
    }

    const hash = bcrypt.hashSync(user.password, 12);
    user.password = hash

    Users.add(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(401).json({ message: 'Invalid Credentials' })
    }
  
    Users.findBy({ username })
      .first()
      .then(user => {
        
        if (user && bcrypt.compareSync(password, user.password)) {
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });
  
  
  function authorize(req, res, next) {
    const username = req.username;
    const password = req.password;
    
    Users.findBy({ username })
    .first()
    .then(user => {
      
      if (user && bcrypt.compareSync(password, user.password)) {
        next()
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
  }
  
  server.get('/api/users',  (req, res) => {
    Users.find()
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send({ err: 'error getting users' }));
  });

  const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`))