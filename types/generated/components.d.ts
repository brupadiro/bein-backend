import type { Schema, Attribute } from '@strapi/strapi';

export interface ProducersUsers extends Schema.Component {
  collectionName: 'components_producers_users';
  info: {
    displayName: 'users';
  };
  attributes: {
    user: Attribute.Relation<
      'producers.users',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    type: Attribute.Enumeration<['admin', 'editor']>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'producers.users': ProducersUsers;
    }
  }
}
