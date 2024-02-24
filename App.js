// Including dependencies
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const bodyParser = require('body-parser');
const connectToDatabase = require('./config/database');

// Including routes
var UserRoutes = require('./routes/user_routes');
var ApiRoutes = require('./routes/api_routes');
var AdminRoutes = require('./routes/admin_routes');
var AdminApiRoutes = require('./routes/admin_api_routes');



var app = express();

// configs
const port = 8052;
const mongo_db_uri = 'mongodb+srv://admin:GBxMIni3B2r13jcq@louisvuitton.h0htcgr.mongodb.net/';
const store = new MongoDBStore({
    uri: mongo_db_uri,
    collection: 'sessions'
});

// Setting Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'EJFKNLMwekflmq,1-3298jf2940[ncwmepk-kpmq23kfmm',
    resave: false,
    saveUninitialized: true,
    store: store
}));

// Setting view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', UserRoutes);
app.use('/api', ApiRoutes);
app.use('/admin', AdminRoutes);
app.use('/admin', AdminApiRoutes);
// Connecting to mongodb
connectToDatabase(mongo_db_uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error(err);
    });

// Running app
app.listen(port, () => {
    console.log(`Server is running on  http://localhost:${port}`);
});