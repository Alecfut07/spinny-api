const express = require('express');
const passport = require('passport');
const AuthRoutes = require('../app/routes/auth');
const PlayersController = require('../app/controllers/players');
const PlayerRoutes = require('../app/routes/player');
const Player = require('../app/models/player');
const GameRoutes = require('../app/routes/game');
const ClubsController = require('../app/controllers/clubs');
const ClubRoutes = require('../app/routes/club');
const Club = require('../app/models/club');

require('../app/helpers/passport');

const indexRouter = express.Router();
const authRouter = express.Router();

const playersController = new PlayersController(Player);
const playerRoutes = new PlayerRoutes(playersController);
const playerRouter = express.Router();

const gameRouter = express.Router();

const clubsController = new ClubsController(Club);
const clubRoutes = new ClubRoutes(clubsController);
const clubRouter = express.Router();

indexRouter.get('/', (req, res) => {
    res.send('Hello World!');
});

authRouter.post('/sign_up', AuthRoutes.signUp);
authRouter.post('/sign_in', AuthRoutes.signIn);

playerRouter
    .get('/', (req, res) => playerRoutes.getAll(req, res))
    .get('/me', passport.authenticate('jwt', { session: false }), (req, res) => playerRoutes.getProfile(req, res))
    .get('/:id', (req, res) => playerRoutes.getById(req, res));

gameRouter
    .get('/', GameRoutes.getAll)
    .post('/', GameRoutes.create)
    .delete('/:id', GameRoutes.deleteById);

clubRouter
    .get('/', (req, res) => clubRoutes.getAll(req, res))
    .post('/', (req, res) => clubRoutes.create(req, res))
    .put('/:id/players', (req, res) => clubRoutes.addPlayer(req, res));

module.exports = {
    '/': indexRouter,
    '/auth': authRouter,
    '/players': playerRouter,
    '/games': gameRouter,
    '/clubs': clubRouter,
};
