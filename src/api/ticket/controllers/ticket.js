'use strict';

/**
 * ticket controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ticket.ticket', ({
    strapi
  }) => ({
      async validate(ctx) {
        const { event, code } = ctx.request.body.data;
        const ticket = await strapi.db.query('api::ticket.ticket').findOne({ 
            where:{
                event:event,
                code:code
            }
        });
        console.log(ticket)
        
        if (!ticket) {
          return "Error"
        } else if (ticket.status === 'Inactive') {
          return "Rejected"
        } else if (ticket.status === 'Active' || ticket.status === 'success') {
          await strapi.db.query('api::ticket.ticket').update({
            where:{
                id: ticket.id,
            },
            data: {
              status: 'Inactive'
            }
          });
          return "Success"
        } else {
            return "Error"
        }
      }
    })
)