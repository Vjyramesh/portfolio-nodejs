export const workTypeDefs = /* GraphQL */ `
  type Work {
    id: ID!
    title: String!
    description: String!
    shortDescription: String!
    image: String!
    link: String!
    github: String!
    technologies: [String!]!
    startDate: String!
    endDate: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    works: [Work!]!
  }

  type Mutation {
    addWork(
      title: String!
      description: String!
      shortDescription: String!
      image: String!
      link: String!
      github: String!
      technologies: [String!]!
      startDate: String!
      endDate: String
    ): Work!

    updateWork(
      id: ID!
      title: String
      description: String
      shortDescription: String
      image: String
      link: String
      github: String
      technologies: [String!]
      startDate: String
      endDate: String
    ): Work!

    deleteWork(id: ID!): Work!
  }
`;
