module.exports = {
  verbose: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/functions'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/functions/**/*\\.ts'
  ]
};
