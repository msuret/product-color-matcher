const db = require('../app/db');

after('close database', db.$pool.end);