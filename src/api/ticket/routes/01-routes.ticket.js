module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'POST',
        path: '/tickets/validate', 
        handler: 'ticket.validate',
      }
    ]
  }
  
  
  