const mongoose = require('mongoose');
const mockingoose = require('mockingoose').default;
const request = require('supertest');
const passport = require('passport');
const MockStrategy = require('passport-mock-strategy');
const app = require('../../app');
const Player = require('../../app/models/player');

describe('GET /api/players', () => {
    it('responds with json containing a list of players', (done) => {
        const body = {
            email: 'user@spinny.com',
            password: 'password',
        };
        const player = Player(body);
        mockingoose(Player).toReturn([player], 'find');

        request(app)
            .get('/api/players')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                const { data, errors } = res.body;
                const obj = data[0];
                expect(data.length).toBe(1);
                expect(obj._id).toBe(player.id);
                expect(obj.email).toBe(player.email);
                expect(obj.rating).toBe(player.rating);
                // expect(obj.created_at).toBe(player.created_at);
                expect(errors.length).toBe(0);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an internal error', (done) => {
        mockingoose(Player).toReturn(new Error(), 'find');

        request(app)
            .get('/api/players')
            .expect('Content-Type', /json/)
            .expect(500)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('Something went wrong.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});

describe('GET /api/players/:id', () => {
    it('responds with json containing a player', (done) => {
        const body = {
            email: 'user@spinny.com',
            password: 'password',
        };
        const player = Player(body);
        mockingoose(Player).toReturn(player, 'findOne');

        request(app)
            .get(`/api/players/${player.id}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                const { data, errors } = res.body;
                expect(data._id).toBe(player.id);
                expect(data.email).toBe(player.email);
                expect(data.rating).toBe(player.rating);
                // expect(data.created_at).toBe(player.created_at);
                expect(errors.length).toBe(0);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an error when player is not found', (done) => {
        const id = new mongoose.Types.ObjectId().toHexString();
        mockingoose(Player).toReturn(null, 'findOne');

        request(app)
            .get(`/api/players/${id}`)
            .expect('Content-Type', /json/)
            .expect(404)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INVALID_PARAMETER');
                expect(err.message).toBe('Player not found.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an internal error', (done) => {
        const id = new mongoose.Types.ObjectId().toHexString();
        mockingoose(Player).toReturn(new Error(), 'findOne');

        request(app)
            .get(`/api/players/${id}`)
            .expect('Content-Type', /json/)
            .expect(500)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('Something went wrong.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});

describe('GET /api/players/me', () => {
    it('responds with json containing user\'s profile', (done) => {
        const body = {
            email: 'user@spinny.com',
            password: 'password',
        };
        const player = Player(body);
        mockingoose(Player).toReturn(player, 'findOne');

        passport.use(new MockStrategy({
            name: 'jwt',
            user: { id: player.id },
            passReqToCallback: true,
        }, (req, user, cb) => {
            cb(null, user);
        }));

        request(app)
            .get('/api/players/me')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                const { data, errors } = res.body;
                expect(data._id).toBe(player.id);
                expect(data.email).toBe(player.email);
                expect(data.rating).toBe(player.rating);
                // expect(data.created_at).toBe(player.created_at);
                expect(errors.length).toBe(0);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an unauthorized error when token is not valid', (done) => {
        const body = {
            email: 'user@spinny.com',
            password: 'password',
        };
        const player = Player(body);

        passport.use(new MockStrategy({
            name: 'jwt',
            user: { id: player.id },
            passReqToCallback: true,
        }, (req, user, cb) => {
            cb(null, false);
        }));

        request(app)
            .get('/api/players/me')
            .expect('Content-Type', /json/)
            .expect(401)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('UNAUTHORIZED');
                expect(err.message).toBe('User is not authorized.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an error when login fails', (done) => {
        const body = {
            email: 'user@spinny.com',
            password: 'password',
        };
        const player = Player(body);

        passport.use(new MockStrategy({
            name: 'jwt',
            user: { id: player.id },
            passReqToCallback: true,
        }, (req, user, cb) => {
            req.login = (loggedInUser, options, callback) => callback(new Error());
            cb(null, user);
        }));

        request(app)
            .get('/api/players/me')
            .expect('Content-Type', /json/)
            .expect(500)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('Something went wrong.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an internal error when authentication fails', (done) => {
        const body = {
            email: 'user@spinny.com',
            password: 'password',
        };
        const player = Player(body);

        passport.use(new MockStrategy({
            name: 'jwt',
            user: { id: player.id },
            passReqToCallback: true,
        }, (req, user, cb) => {
            cb(new Error(), false);
        }));

        request(app)
            .get('/api/players/me')
            .expect('Content-Type', /json/)
            .expect(500)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('Something went wrong.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an error when player is not found', (done) => {
        mockingoose(Player).toReturn(null, 'findOne');

        passport.use(new MockStrategy({
            name: 'jwt',
            passReqToCallback: true,
        }, (req, user, cb) => {
            cb(null, user);
        }));

        request(app)
            .get('/api/players/me')
            .expect('Content-Type', /json/)
            .expect(404)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INVALID_PARAMETER');
                expect(err.message).toBe('Player not found.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an internal error', (done) => {
        mockingoose(Player).toReturn(new Error(), 'findOne');

        passport.use(new MockStrategy({
            name: 'jwt',
            passReqToCallback: true,
        }, (req, user, cb) => {
            cb(null, user);
        }));

        request(app)
            .get('/api/players/me')
            .expect('Content-Type', /json/)
            .expect(500)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('Something went wrong.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});

describe('PUT /api/players/:id', () => {
    it('responds with json containing a player', (done) => {
        const id = new mongoose.Types.ObjectId().toHexString();
        const body = {
            email: 'newuser@spinny.com',
            password: 'password',
        };
        const player = Player(body);
        mockingoose(Player).toReturn(player, 'findOneAndUpdate');

        request(app)
            .put(`/api/players/${id}`)
            .send(body)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                const { data, errors } = res.body;
                expect(data._id).toBe(player.id);
                expect(data.email).toBe(player.email);
                expect(data.rating).toBe(player.rating);
                // expect(data.created_at).toBe(player.created_at);
                expect(errors.length).toBe(0);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an error when player is not found', (done) => {
        const id = new mongoose.Types.ObjectId().toHexString();
        mockingoose(Player).toReturn(null, 'findOneAndUpdate');

        request(app)
            .put(`/api/players/${id}`)
            .expect('Content-Type', /json/)
            .expect(404)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INVALID_PARAMETER');
                expect(err.message).toBe('Player not found.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('responds with json containing an internal error', (done) => {
        const id = new mongoose.Types.ObjectId().toHexString();
        const body = {
            email: 'user@spinny.com',
            password: 'password123',
        };
        mockingoose(Player).toReturn(new Error(), 'findOneAndUpdate');

        request(app)
            .put(`/api/players/${id}`)
            .send(body)
            .expect('Content-Type', /json/)
            .expect(500)
            .then((res) => {
                const { data, errors } = res.body;
                const err = errors[0];
                expect(data).toBeNull();
                expect(err.code).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('Something went wrong.');
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
