require('dotenv').config()

module.exports = {
    PORT : 3001,
    DB : process.env.DB_URI,
}