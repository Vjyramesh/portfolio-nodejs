export const uploadTypeDefs = /* GraphQL */ `
  scalar Upload

  type Query {
    _empty: Boolean
  }

  type Mutation {
    uploadImage(file: Upload!): String!
    deleteImage(url: String!): Boolean!
    updateImage(oldUrl: String!, file: Upload!): String!
  }
`;
