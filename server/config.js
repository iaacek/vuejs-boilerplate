// main config file

const env = process.env.NODE_ENV || 'development'; // 'development' or 'production'

// Generic config for both dev and prod
const jwtSecret = 'MoreSecretThanACatInTheBag'; // make sure to replace this with your own phrase
const mailConfig = {
    host: '<email_provider>',
        port: 587,
        secure: false,
        auth: {
            user: '<account_name>',
            pass: '<password>'
    }
};
const timeZone = 'America/Edmonton';

// Dev
const development = {
    env: env,
    app: {
        port: 3000,
        allowOrigin: 'http://localhost:8080',
    },
    auth: {
        jwtSecret: jwtSecret,
    },
    db: {
        user: '<dev_db_user>',
        password: '<dev_db_user_pwd>',
        server: "<server_ip>\\<instance>",
        port: 1433,
        database: '<dev_db_name>',
        pool: {
            max: 100,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: false,
            enableArithAbort: true,

        }
    },
    mail: mailConfig,
    timeZone: timeZone,
};

// prod
const production = {
    env: env,
    app: {
        port: 3001,
        allowOrigin: '<server_FQDN>',
    },
    auth: {
        jwtSecret: jwtSecret,
    },
    db: {
        user: '<db_user>',
        password: '<db_user_pwd>',
        server: "<server_ip>\\<instance>",
        port: 1433,
        database: '<db_name>',
        pool: {
            max: 100,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: false,
            enableArithAbort: true,

        }
    },
    mail: mailConfig,
    timeZone: timeZone,
};

const config = {
    development,
    production
};

module.exports = config[env];