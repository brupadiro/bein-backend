'use strict';

/**
 * transaction controller
 */

const {
  createCoreController
} = require('@strapi/strapi').factories;
const crypto = require('crypto');
function generateUniqueCode(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex').substring(0, 8);
}
const axios = require('axios');

module.exports = createCoreController('api::transaction.transaction', ({
  strapi
}) => ({
    async create(ctx) {
        const { data } = ctx.request.body;
        const user = ctx.state.user;
        console.log(data)
        var transaction = await strapi.db.query('api::transaction.transaction').create({
          //generate the rest of the code
          data:{
            ...data,
            user:user.id
          }
        })
        data.tickets.forEach(async (ticket) => {
          for(let i = 0; i < ticket.quantity; i++) {
            const code = generateUniqueCode(`${ticket.ticket.id}-${transaction.id}-${transaction.status}-${i}`)
            const ticketCreated = await strapi.db.query('api::ticket.ticket').create({
              //generate the rest of the code
              data:{
                ticket_type:ticket.ticket.id,
                status:transaction.status,
                transaction:transaction.id,
                event:data.event,
                user:user.id,
                code: code,
              }
            })
            if(transaction.status == "success")
              await strapi.service('api::transaction.transaction').sendEmailWithTicket(user.email,code);
          }

        })
        return {
          data:transaction,
        };

    },
    async bamboo(ctx) {
      const {data} = ctx.request.body;
      var transaction = await strapi.db.query('api::transaction.transaction').create({
        data: {
          transaction_id:data.transaction_id,
          amount:data.amount,
          curency:data.currency,
          user:data.user.id,
          status: 'pending',
          producer: data.producer,
        },
      });
        const bambooResponse = await axios.post('https://api.stage.bamboopayment.com/v1/api/purchase', {
          TrxToken: data.transaction_id,
          Capture: true,
          Amount: data.amount,
          Currency: 'UYU',
          Order: transaction.id,
          TargetCountryISO: 'UY',
          Installments: 1,
          Customer: {
            Email: data.user.email,
            FirstName: data.user.name,
            LastName: data.user.LastName,
          },
          AntifraudData:{
            AntifraudFingerprintId:data.fingerprint
          },
          CustomerIP:data.CustomerIP, 
          DataUY: {
            IsFinalConsumer: 'true',
            Invoice: '1000',
            TaxableAmount: 0,
          },
        }, {
          headers: {
            'Authorization': 'Basic CqklteGyZDsicfHJVqfA204z5Ou11KCGW8lIcQ9MQwxoLVi_CKGysw__' 
          }
        });
        const estadoTransaccion = bambooResponse.data.Response.Transaction.Status;
        let nuevoEstado = 'pending';
        if (estadoTransaccion === 'Approved') {
          nuevoEstado = 'success';
        } else if (estadoTransaccion === 'Rejected') {
          nuevoEstado = 'error';
        }
        console.log(estadoTransaccion)
        transaction = await strapi.db.query('api::transaction.transaction').update({
          where:{
            id:transaction.id
          },
          data:{
            status: nuevoEstado
          }
        });
      
        if (nuevoEstado === 'success') {
          // Crear tickets
          data.tickets.forEach(async (ticket) => {
            for(let i = 0; i < ticket.quantity; i++) {
              const code = generateUniqueCode(`${ticket.ticket.id}-${transaction.id}-${nuevoEstado}-${i}`);
              await strapi.db.query('api::ticket.ticket').create({
                data: {
                  ticket_type: ticket.ticket.id,
                  status: nuevoEstado,
                  transaction: transaction.id,
                  event: data.event,
                  user: data.user.id,
                  code: code,
                },
              });
              if(nuevoEstado == "success")
                await strapi.service('api::transaction.transaction').sendEmailWithTicket(data.user.email,code);
            }
          });
        }
      
        return {
          data:transaction,
        };
    }



    

}));
