const webPush = require('web-push');
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY");
  console.log(webPush.generateVAPIDKeys());
  return;
}

webPush.setVapidDetails(
  'http://localhost:8000',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const payloads = {};

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.use(express.static('.'))
app.use(bodyParser.json());

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
