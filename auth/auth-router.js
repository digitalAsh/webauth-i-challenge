const router = require('express').Router();
const bcrypt = require('bcryptjs');
const restricted = require('./restricted-middleware')

const Users = require('../users/users-model.js')

router.post('/register', (req, res) => {
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

router.post('/login', (req, res) => {
    let { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(401).json({ message: 'Invalid Credentials' })
    }
  
    Users.findBy({ username })
      .first()
      .then(user => {
        
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;

            res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });
  
  
//   function authorize(req, res, next) {
//     const username = req.username;
//     const password = req.password;
    
//     Users.findBy({ username })
//     .first()
//     .then(user => {
      
//       if (user && bcrypt.compareSync(password, user.password)) {
//         next()
//       } else {
//         res.status(401).json({ message: 'Invalid Credentials' });
//       }
//     })
//     .catch(error => {
//       res.status(500).json(error);
//     });
//   }
  
  router.get('/users', (req, res) => {
    Users.find()
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send({ err: 'error getting users' }));
  });

  router.get('/logout', restricted, (req, res) => {
    if(req.session) {
      req.session.destroy((err) => {
          if(err) {
              console.log(err);
              return res.status(500).json({ message: 'There was an error' })
          }
          res.end();
      })
    }
  })

  module.exports = router;