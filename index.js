const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

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

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`))