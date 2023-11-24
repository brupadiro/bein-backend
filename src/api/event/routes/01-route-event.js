module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'POST',
        path: '/events/prometeoWebhook', 
        handler: 'event.prometeoWebhook',
      }
    ]
  }
  
  
  