// The root provides a resolver function for each API endpoint
export default {
  Query: {
    me: (_, data, context) => {
      return context.user;
    },
    hello: () => {
      return 'Hello anyone!';
    },
    helloAuth: async (_, data, context) => {
      const user = context.user;
      if (user) {
        return `Hello, ${user.nickname}!`;
      } else {
        throw new Error('Unauthorized!');
      }
    }
  }
};
