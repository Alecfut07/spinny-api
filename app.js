const express = require('express');
const database = require('./db');
const app = express();

const middlewares = require('./middlewares');
for (const key in middlewares) {
    app.use(middlewares[key]);
}

const routes = require('./config/routes');
for (const path in routes) {
    app.use(path, routes[path]);
}

database.connect().catch(err => {
    if (err) {
        process.exit(1);
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error', { title: 'error' });
});

module.exports = app;