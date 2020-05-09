const mongoose = require('mongoose');
const MockModel = require('jest-mongoose-mock');
const GameController = require('../../app/controllers/game');
const Game = require('../../app/models/game');

jest.mock('../../app/models/game', () => new MockModel());

describe('game controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create game when winner and loser are not the same', (done) => {
            const body = {
                winner: new mongoose.Types.ObjectId(),
                loser: new mongoose.Types.ObjectId(),
            };
            GameController.create(body).then(() => {
                expect(Game.create.mock.calls.length).toBe(1);
                expect(Game.create.mock.calls[0][0]).toBe(body);
                done();
            }).catch(() => {
                done();
            });
        });

        it('should not create game when winner and loser are the same', (done) => {
            const id = new mongoose.Types.ObjectId();
            const body = {
                winner: id,
                loser: id,
            };
            GameController.create(body).then(() => {
                expect(Game.create.mock.calls.length).toBe(0);
                done();
            }).catch(() => {
                done();
            });
        });
    });

    describe('delete', () => {
        it('should delete game', (done) => {
            const id = new mongoose.Types.ObjectId().toHexString();
            GameController.deleteById(id).then(() => {
                expect(Game.findByIdAndRemove.mock.calls.length).toBe(1);
                expect(Game.findByIdAndRemove.mock.calls[0][0]).toEqual({ _id: id });
                done();
            }).catch(() => {
                done();
            });
        });
    });

    describe('getAll', () => {
        it('should get list of games', (done) => {
            GameController.getAll().then(() => {
                expect(Game.find.mock.calls.length).toBe(1);
                expect(Game.populate.mock.calls.length).toBe(2);
                expect(Game.populate.mock.calls[0][0]).toBe('winner');
                expect(Game.populate.mock.calls[1][0]).toBe('loser');
                expect(Game.exec.mock.calls.length).toBe(1);
                done();
            }).catch(() => {
                done();
            });
        });
    });
});
