const GameController = require('../controllers/game');

exports.create = (req, res) => {
    GameController.create(req.body)
        .then((game) => {
            res.json({
                data: game,
            });
        })
        .catch(() => {
            res.status(500).json({
                error: {
                    status: 500,
                    message: 'Request could not be completed.',
                },
            });
        });
};

exports.deleteById = (req, res) => {
    GameController.deleteById(req.params.id)
        .then(() => {
            res
                .status(204)
                .end();
        })
        .catch(() => {
            res.status(500).json({
                error: {
                    status: 500,
                    message: 'Request could not be completed.',
                },
            });
        });
};

exports.getAll = (req, res) => {
    GameController.getAll()
        .then((games) => {
            res.json({
                data: games,
            });
        })
        .catch(() => {
            res.status(500).json({
                error: {
                    status: 500,
                    message: 'Request could not be completed.',
                },
            });
        });
};
