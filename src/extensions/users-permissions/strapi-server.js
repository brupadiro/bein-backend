const utils = require('@strapi/utils');
const {
  sanitize
} = utils;

module.exports = (plugin) => {
  const me = plugin.controllers.user.me;
  const extraDataByType = async function (user) {
      var extraData = {}
      if (user.type == 'producer') {
        extraData = await strapi.db.query('api::producer.producer').findOne({
          where: {
            users: user.id
          }
        });
      } 
      console.log(extraData)
      return extraData

  }
  plugin.controllers.user.me = async (ctx) => {
    var user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }


    user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      ctx.state.user.id, {
        populate:'*'
      }
    );

    user.data = await extraDataByType(user);


    ctx.body = user

  };

  return plugin;
};
