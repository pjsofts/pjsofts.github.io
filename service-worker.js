function getEndPoint() {
  return self.registration.pushManager.getSubscription()
    .then((sub) => {
      if (sub) {
        return sub.endpoint;
      }

      throw new Error('User not subscribed');
    })
}

self.addEventListener('push', (event) => {
  event.waitUntil(
    getEndPoint()
      .then((endpoint) => {
        return fetch('./getPayload?endpoint=' + endpoint);
      })
      .then((response) => { return response.text() })
      .then((payload) => { self.registration.showNotification('Pouria Notif', { body: payload }) })
  )
})