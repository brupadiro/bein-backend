'use strict';

/**
 * earning service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::earning.earning');
