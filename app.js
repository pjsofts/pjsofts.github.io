document.getElementById('notify').onclick = () => {
  fetch('/notify');
}

document.getElementById('getPermission').onclick = () => {
  askPermission();
}

function askPermission() {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  })
    .then(function (permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error('We weren\'t granted permission.');
      }
    });
}



document.getElementById('sendSubscription').onclick = () => {
  console.log('sending subscription');
  navigator.serviceWorker.ready.then(reg => {
    reg.pushManager.getSubscription().then(sub => {
      fetch('/sendSub', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ subscription: sub })
      })
    });
  })
}



navigator.serviceWorker.register('service-worker.js').then(() => {

  console.log("service worker registered");
});

navigator.serviceWorker.ready.then(reg => {
  return reg.pushManager.getSubscription().then(async (sub) => {
    if (sub) {
      return sub;
    }
    const response = await fetch('./vapidPublicKey');
    const vapidPublicKey = await response.text();

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertedVapidKey });
  }).then(sub => {
    fetch('./register', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ subscription: sub })
    })

    document.getElementById('doIt').onclick = function () {
      console.log("Do it clicked!");
      const payload = document.getElementById('notification-payload').value;
      const delay = document.getElementById('notification-delay').value;
      const ttl = document.getElementById('notification-ttl').value;

      fetch('./sendNotification', {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          subscription: sub,
          payload: payload,
          delay: delay,
          ttl: ttl
        })
      })
    }
  })
})


function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}