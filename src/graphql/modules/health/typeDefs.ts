export const healthTypeDefs = /* GraphQL */ `
  type HealthStatus {
    status: String!
    environment: String!
    databaseConnected: Boolean!
  }

  type Query {
    health: HealthStatus!
  }
`;
