
const VAPID_PUBLIC_KEY = 'BJIh4x6z36QonVjSDgMHBJLG6gDJVGok0FRDFrAfGGw9QFHgBeo8W7ag9V81GVCR_hyJCxv9DKeldxSBGdHXKsM';
const VAPID_PRIVATE_KEY = 'kI7ZFD-uqkfeG3FvHwfIxEugqCa0RgQAyHNyrsAhtZY';

const webPush = require('web-push');


webPush.setVapidDetails(
  'http://localhost:8000',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

const payloads = {};

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.use(express.static('.'))
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/vapidPublicKey', (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY)
});

app.post('/register', (req, res) => {
  res.sendStatus(201);
})


app.post('/sendNotification', (req, res) => {
  const subscription = req.body.subscription;
  const payload = req.body.payload;
  const options = {
    TTL: req.body.ttl
  };

  setTimeout(function () {
    payloads[req.body.subscription.endpoint] = payload;
    webPush.sendNotification(subscription, null, options)
      .then(function () {
        res.sendStatus(201);
      })
      .catch((error) => {
        res.sendStatus(500);
        console.log(error);
      });
  }, req.body.delay * 1000);
});

const subs = [];

app.post('/sendSub', (req, res) => {
  const subscription = req.body.subscription;
  console.log("send sub called", subscription);
  subs.push(subscription);
})

app.get('/subs', (req, res) => {
  res.send(subs);
})



app.get('/getPayLoad', (req, res) => {
  res.send(payloads[req.query.endpoint]);
})


app.get('/notify', (req, res) => {
  subs.map(sub => {
    webPush.sendNotification(sub)
      .then(function () {
        res.sendStatus(201);
      })
      .catch((error) => {
        res.sendStatus(500);
        console.log(error);
      });
  });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
})
