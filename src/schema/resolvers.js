// The root provides a resolver function for each API endpoint
export default {
  Query: {
    user(_, data, context) {
      return context.user;
    },
    async helloAuth(_, data, context) {
      const user = context.user;
      if (user) {
        return `Hello, ${user.nickname}!`;
      } else {
        throw new Error('Unauthorized!');
      }
    }
  }
};
