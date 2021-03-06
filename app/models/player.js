const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 8;
const { Schema } = mongoose;

const playerSchema = new Schema({
    first_name: String,
    last_name: String,
    image_url: String,
    phone: String,
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
    },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    rating: { type: Number, default: 1000 },
});

playerSchema.pre('save', function save(next) {
    const player = this;

    if (!player.isNew && !player.isModified('password')) {
        next();
    }

    player.generateHash(player.password)
        .then((hash) => {
            player.password = hash;
            next();
        })
        .catch((err) => {
            next(err);
        });
});

playerSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
    },
});

playerSchema.methods.generateHash = (password) => bcrypt.genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt));

playerSchema.methods.generateHashSync = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    bcrypt.hashSync(password, salt);
};

playerSchema.methods.validPassword = function validPassword(password) {
    return bcrypt.compareSync(password, this.password);
};

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
