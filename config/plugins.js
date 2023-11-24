module.exports = ({
  env
}) => ({



  email: {
    config: {
      provider: 'strapi-provider-email-brevo',
      providerOptions: {
        apiKey: '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',
      },
      settings: {
        defaultSenderEmail: 'contacto@bein.uy',
        defaultSenderName: 'No Reply',
        defaultReplyTo: 'contacto@bein.uy',
      },
    },
  },

  transformer: {
    enabled: true,
    config: {
      prefix: '/api/',
      responseTransforms: {
        removeAttributesKey: true,
        removeDataKey: true,
      }
    }
  },
});
