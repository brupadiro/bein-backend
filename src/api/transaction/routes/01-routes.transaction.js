module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'POST',
        path: '/transactions/bamboo', 
        handler: 'transaction.bamboo',
      }
    ]
  }
  
  
  