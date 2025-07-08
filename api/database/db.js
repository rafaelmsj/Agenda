import knex from 'knex'

const DB_NAME = process.env.DBNAME
const DB_USER = process.env.DBUSER
const DB_PASSWORD = process.env.DBPASSWORD
const DB_HOST = process.env.DBHOST

const db = knex({
    client: 'mysql2',
    connection: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
    }
});

export default db;