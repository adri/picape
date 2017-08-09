const prod = process.env.NODE_ENV === 'production';

module.exports = {
  'BACKEND_URL': prod ? 'https://picape-beta.herokuapp.com' : 'http://localhost:4000'
};
