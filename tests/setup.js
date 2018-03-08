const db = require('../app/db');

beforeEach('clean database', () => db.none('TRUNCATE TABLE products'));
after('close database', db.$pool.end);