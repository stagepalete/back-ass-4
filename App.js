// Including dependencies
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const bodyParser = require('body-parser');
const connectToDatabase = require('./config/database');
const i18n = require("./config/i18n");
const cookieParser = require("cookie-parser");

// Including routes
var UserRoutes = require('./routes/user_routes');
var ApiRoutes = require('./routes/api_routes');
var AdminRoutes = require('./routes/admin_routes');
var AdminApiRoutes = require('./routes/admin_api_routes');

var app = express();
app.use(cookieParser());
app.use(i18n.init);
app.use((req, res, next) => {
  const locale = req.cookies.lang || "en";
  req.setLocale(locale);
  next();
});


app.get("/lang/:lang", (req, res) => {
    const lang = req.params.lang || "en";
    res.cookie("lang", lang);
    req.setLocale(lang);
    res.redirect('back');
  });



// configs
const port = 3000;
const mongo_db_uri = 'mongodb+srv://admin:GBxMIni3B2r13jcq@louisvuitton.h0htcgr.mongodb.net/';
// const mongo_db_uri = 'mongodb://localhost:27017/';
const store = new MongoDBStore({
    uri: mongo_db_uri,
    collection: 'sessions'
});

// Setting Middlewares

app.use(bodyParser.text({type: '/'}));
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