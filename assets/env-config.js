const prod = process.env.NODE_ENV === 'production';

module.exports = {
  'BACKEND_URL': prod ? 'https://' + process.env.HOST : 'http://localhost:4000'
};
