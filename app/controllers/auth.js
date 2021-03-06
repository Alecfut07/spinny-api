/* eslint-disable class-methods-use-this */
const config = require('config');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const APIError = require('../models/api-error');
const APIResponse = require('../models/api-response');
const logger = require('../helpers/logger');

const jwtConfig = config.get('jwt');

class AuthController {
    static authenticateUser(req, res, next, user) {
        req.login(user, { session: false }, (err) => {
            if (err) {
                logger.error(err);
                res.status(500).json(new APIResponse(null, [
                    new APIError('INTERNAL_ERROR', 'Something went wrong.'),
                ]));
            } else {
                next();
            }
        });
    }

    static authenticateUserAndExpediteToken(req, res, user) {
        req.login(user, { session: false }, (err) => {
            if (err) {
                logger.error(err);
                res.status(500).json(new APIResponse(null, [
                    new APIError('INTERNAL_ERROR', 'Something went wrong.'),
                ]));
            } else {
                // generate a signed son web token with the contents of user object and return it in the response
                const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                    expiresIn: jwtConfig.expiresIn,
                });
                res.json(new APIResponse({
                    user,
                    token,
                }));
            }
        });
    }

    static authenticate(req, res, next) {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                logger.error(err);
                res.status(500).json(new APIResponse(null, [
                    new APIError('INTERNAL_ERROR', 'Something went wrong.'),
                ]));
            } else if (!user) {
                res.status(401).json(new APIResponse(null, [
                    new APIError('UNAUTHORIZED', 'User is not authorized.'),
                ]));
            } else {
                AuthController.authenticateUser(req, res, next, user);
            }
        })(req, res, next);
    }

    signUp(req, res) {
        passport.authenticate('local-signup', { session: false }, (err, user) => {
            if (err || !user) {
                logger.error(err);
                res.status(400).json(new APIResponse(null, [
                    new APIError('INTERNAL_ERROR', 'Bad request.'),
                ]));
            } else {
                AuthController.authenticateUserAndExpediteToken(req, res, user);
            }
        })(req, res);
    }

    signIn(req, res) {
        passport.authenticate('local-login', { session: false }, (err, user, info) => {
            if (err || !user) {
                logger.error(err);
                res.status(400).json(new APIResponse(null, [
                    new APIError('INTERNAL_ERROR', 'Bad request.'),
                ]));
            } else {
                AuthController.authenticateUserAndExpediteToken(req, res, user);
            }
        })(req, res);
    }
}

module.exports = AuthController;
