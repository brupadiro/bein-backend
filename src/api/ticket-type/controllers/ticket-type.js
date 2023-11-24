'use strict';

/**
 * ticket-type controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ticket-type.ticket-type', ({ strapi }) =>  ({
    // Method 1: Creating an entirely custom action
    async create(ctx) {
        const { id } = ctx.request.body.data;
        console.log(id)
        if (id) {
          return await strapi.entityService.update('api::ticket-type.ticket-type',id, {
            data: ctx.request.body.data,
          });
        } else {
          return  await strapi.entityService.create('api::ticket-type.ticket-type', {
            data: ctx.request.body.data,
          });
        }
      }
}))
