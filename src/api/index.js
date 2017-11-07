import fetch from 'node-fetch';

export default {
  token: undefined,
  hasToken() {
    return this.token != undefined;
  },
  isTokenExpired() {
    return Date.now() - this.token.retrievedAt >= this.token.expires_in;
  },
  async getTotalUsers() {
    if (!this.hasToken() || this.isTokenExpired()) {
      await this.setToken();
    }
    const request = await fetch(
      `https://${process.env
        .AUTH0_DOMAIN}/api/v2/users?fields=total&include_fields=true&include_totals=true`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${this.token.access_token}`
        }
      }
    );
    const result = await request.json();
    return result.total;
  },
  async getUser(userId) {
    if (!this.hasToken() || this.isTokenExpired()) {
      await this.setToken();
    }

    try {
      const profileRequest = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
          userId
        )}?include_fields=false`,
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${this.token.access_token}`
          }
        }
      );
      const profile = await profileRequest.json();
      return {
        ...profile,
        id: profile.user_id,
        age: (profile.user_metadata && profile.user_metadata.age) || undefined
      };
    } catch (error) {
      console.error(error);
    }
    return null;
  },
  async setToken() {
    try {
      const body = JSON.stringify({
        client_id: `${process.env.AUTH0_ID}`,
        client_secret: `${process.env.AUTH0_SECRET}`,
        audience: `${process.env.AUTH0_AUDIENCE}`,
        grant_type: 'client_credentials'
      });
      const tokenRequest = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          headers: {
            'content-type': 'application/json'
          },
          method: 'POST',
          body
        }
      );
      const token = await tokenRequest.json();
      this.token = token;
    } catch (error) {
      console.error(error);
    }
  }
};
