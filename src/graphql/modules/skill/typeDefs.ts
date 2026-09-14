export const skillTypeDefs = /* GraphQL */ `
  type Skill {
    id: ID!
    name: String!
    category: String!
    level: String!
    proficiency: Int!
    yearsOfExperience: Int!
  }

  type Query {
    skills: [Skill!]!
  }

  type Mutation {
    addSkill(
      name: String!
      category: String!
      level: String!
      proficiency: Int!
      yearsOfExperience: Int!
    ): Skill!

    updateSkill(
      id: ID!
      name: String
      category: String
      level: String
      proficiency: Int
      yearsOfExperience: Int
    ): Skill!

    deleteSkill(id: ID!): Skill!
  }
`;
