'use strict';

/**
 * event controller
 */

const {
  createCoreController
} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::event.event', ({
  strapi
}) => ({
  // wrap a core action, leaving core logic in place
  async findOne(ctx) {
    // some custom logic here
    const {id} = ctx.params
    const {
      data,
      meta
    } = await super.findOne(ctx);

    // some more custom logi

      const totalTickets = await strapi.db.query('api::ticket.ticket').findMany({
        where: {
          event: id
        },
        populate:{
            ticket_type:true
        }
      });

      let agrupadosPorTipo = [];
      let totalUYU = 0;
      let totalUSD = 0;

      totalTickets.forEach(ticket => {
        let index = agrupadosPorTipo.findIndex(item => item.name === ticket.ticket_type.name);
        if (index === -1) {
          agrupadosPorTipo.push({
            buyed: 1,
            total: ticket.ticket_type.cant,
            price: ticket.ticket_type.price,
            name: ticket.ticket_type.name,
            currency:ticket.ticket_type.currency
          });
          if(ticket.ticket_type.currency == "UYU") {
            totalUYU=ticket.ticket_type.price
        } else {
            totalUSD=ticket.ticket_type.price
        }

        } else {
            if(ticket.ticket_type.currency == "UYU") {
                totalUYU+=ticket.ticket_type.price
            } else {
                totalUSD+=ticket.ticket_type.price
            }
          agrupadosPorTipo[index].buyed++;
        }
      });



      const totalEarnings = [
        { currency: 'UYU', total: totalUYU ?? 0 },
        { currency: 'USD', total: totalUSD ?? 0 }
      ];


      data.attributes.ticketsPerType = agrupadosPorTipo;

      data.attributes.tickets = totalTickets.length
      data.attributes.earnings = totalEarnings

    return {
      data,
      meta
    };
  },
  async find(ctx) {
    // some custom logic here
    const {
      data,
      meta
    } = await super.find(ctx);
   // some more custom logi
        const evts = await Promise.all(data.map(async(evt) => {
            const totalTickets = await strapi.db.query('api::ticket.ticket').findMany({
                where: {
                  event: evt.id
                },
                populate: {
                    ticket_type: true
                }
            });
        
            let agrupadosPorTipo = [];
            let totalUYU = 0;
            let totalUSD = 0;
        
            totalTickets.forEach(ticket => {
                const index = agrupadosPorTipo.findIndex(item => item.name === ticket.ticket_type.name);
                if (index === -1) {
                    agrupadosPorTipo.push({
                        buyed: 1,
                        total: ticket.ticket_type.cant,
                        price: ticket.ticket_type.price,
                        name: ticket.ticket_type.name,
                        currency: ticket.ticket_type.currency
                    });
                    if(ticket.ticket_type.currency === "UYU") {
                        totalUYU = ticket.ticket_type.price;
                    } else {
                        totalUSD = ticket.ticket_type.price;
                    }
                } else {
                    if(ticket.ticket_type.currency === "UYU") {
                        totalUYU += ticket.ticket_type.price;
                    } else {
                        totalUSD += ticket.ticket_type.price;
                    }
                    agrupadosPorTipo[index].buyed++;
                }
            });
        
            const totalEarnings = [
                { currency: 'UYU', total: totalUYU ?? 0 },
                { currency: 'USD', total: totalUSD ?? 0 }
            ];
        
            evt.attributes.ticketsPerType = agrupadosPorTipo;
            evt.attributes.tickets = totalTickets.length;
            evt.attributes.earnings = totalEarnings;
            return  evt
        }));
    return {
        data:evts,
      meta
    };
  },
  async prometeoWebhook(ctx) {
    const { verify_token, events } = ctx.request.body;

    // Comprueba el token de verificación
    if (verify_token !== 'TU_TOKEN_DE_VERIFICACION') {
      return ctx.throw(403, 'Token de verificación incorrecto');
    }

    // Procesa los eventos
    events.forEach(async event => {
      var dataTransaction = {}
      // Aquí puedes manejar cada tipo de evento de manera diferente
      switch (event.event_type) {
        case 'payment.success':
          dataTransaction = {
            transaction_id: event.request_id,
            amount: event.amount,
            producer: event.producer,
            status: 'success',
            payment_method: 'Prometeo'
          }
          // Maneja el pago exitoso
          break;
        case 'payment.error':
          dataTransaction = {
            transaction_id: event.request_id,
            amount: event.amount,
            producer: event.producer,
            status: 'error',
            payment_method: 'Prometeo'
          }
         // Maneja el error de pago
          break;
        // Agrega más casos según sea necesario
      }
      await strapi.db.query('api::transaction.transaction').update({
        where: { transaction_id: event.request_id },
        data: dataTransaction
      });


      
    });

    // Responde con un código 200 para indicar que la notificación fue recibida correctamente
    ctx.send({ message: 'Notificación recibida' });
  },

}));
