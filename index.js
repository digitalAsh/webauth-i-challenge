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


const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`))