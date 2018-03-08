# product-color-matcher

An API to match products of similar colors.

This is a particular case of the [k-nearest neighbors](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) problem, which can be solved by different approaches:
1. Linear search: The color of the product is matched with all other products of the database, and only the best ones are kept. It would have `O(n)` complexity (`n` being the number of products in database), so it's clearly not a scalable solution.
2. Build a space partitioning tree of the product color space, which can easily be done with librairies such as [look-alike](https://www.npmjs.com/package/look-alike). This would result in a `log(n)` complexity, however all products would have to be loaded in memory at once to build the tree. So not a scalable solution either.
3. Use a database that supports spacial indexes. Same complexity as above, without the memory issue.
4. MapReduce: the mapper and reducer functions are rather easy to implement (eg. [att-hicks/MapReduce-KNN](https://github.com/matt-hicks/MapReduce-KNN)), and it can theoretically be `O(1)` if the cluster grows proportional with the number of articles. However for such simple case the same complexity can be achieved with much better response times by a mere query to a distributed database.

So I went for the 3rd solution.

But colors are 3D vectors, and many databases such as `MongoDB`, `RavenDB`, or `Neo4j` supports only up to 2 dimensional indexes. Some methods such as [Locality-sensitive hashing](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) allow reducing dimensionality of data, but they are optimized for a much higher number of dimensions.

Many other spatial database such as `SpatiaLite` or `AsterixDB` supports only geo coordinates (latitude & longitude).

Fortunately the [cube extension](https://www.postgresql.org/docs/10/static/cube.html) of PostgreSQL provides all the fonctionality we need ! [ElephantSQL](https://www.elephantsql.com) offers a free PostgreSQL hosting plan sufficient for testing this application (don't expect mind-blowing speeds though).

## Installation

Clone this repository and run `npm install`.

## Configuration

You can either create a new file named `local.yaml` in the `config` folder, or use environment variables.

### Database

If no configuration is provided, the application will attempt to connect a local database using [peer authentication](https://www.postgresql.org/docs/10/static/auth-methods.html#AUTH-PEER).

#### YAML

```yaml
db:
  host: example.com
  port: 5432 # optional
  database: product_matching
  user: postgres
  password: supersecretstuff
  max: 10 #max connection pool size, optional
```

#### Environment variables

```bash
DB_HOST=example.com
DB_PORT=5432
DB_NAME=product_matching
DB_USER=postgres
DB_PASSWORD=supersecretstuff
DB_MAX_POOL_SIZE=10
```
### Google Cloud Vision API

You need to provide google application credentials to detect the dominant color of each product. Refer to [Google Cloud Documentation](https://cloud.google.com/docs/authentication/getting-started) to get one.

#### YAML

```yaml
google-cloud:
  keyFile: /path/to/keyFile.json
```

#### Environment variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/keyFile.json
```

### Server

#### YAML

```yaml
server:  
  port: 10010
  # If true, the application will be clustered in a number of processes equals to the number of CPU cores
  clustering: true
```

#### Environment variables

```bash
SERVER_PORT=10010
SERVER_CLUSTERING=true
```

### Logging

Two loggers can be configured in the logging section:

* sql: logs the SQL queries before execution
* http: logs the HTTP requests via morgan

[Winston-config](https://github.com/triplem/winston-config) is used internally to configure logging. Please refer to the module documentation for the accepted configuration options.

#### YAML

```yaml
logging:
  sql:
    console:
      level: debug
      colorize: true
    file:
       level: error
       timestamp: true
       filename: logs/sql.log
       maxfiles: 5
       maxsize: 10485760
```

#### Environment variables

Logging configuration options are diverse, so you will have to pass them in json forrmat:

```bash
LOGGING='{"logging":{"sql":{"console":{"level":"warn","colorize":true},"file":{"level":"error","timestamp":true,"filename":"logs/sql.log,","maxfiles":5,"maxsize":10485760}}}}'
```

## Migration

Run this comand to install [PostgreSQL's cube extension](https://www.postgresql.org/docs/10/static/cube.html) and create the `products` table and the spatial index:
```bash
npm run migrate -- up
```
Arguments are passed straight to [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate), so `down`, `unlock` and `redo` commands are also available.


## Product file import

Products can be imported from a CSV file.
The supported columns are:
* `id`
* `title`
* `gender_id`
* `composition`
* `sleeve`
* `photo`
* `url`

Only `id` and `photo` are compulsory.
Columns must be separated by a semicolon.

Import is made with the following command:
```bash
npm run import -- path/to/file.csv
```

The file is streamed so memory consumption stays low even for large files. Rows are inserted by batches of 100 to limit round-trip delay time with the databaase.

## Color Detection

The following command detects the dominant color of each product and persists it in database:
```bash
npm run detect-colors
```

## API

Start the server by runnnig `npm start`.

- **List Products:** `GET /v1/products`
  This endpoints accepts `offset` and `limit` query parameters (defaults values are respectively 0 and 10)
- **Get product:** `GET /v1/products/{id}`
- **Get product closest neighbors**: `GET /v1/products/{id}/neighbors`
  This endpoints accepts a `limit` query parameter (default is 5).
  The closest neighbors are determined according to the euclidian distance between the dominant color of the products in the [Lab color space](https://en.wikipedia.org/wiki/Lab_color_space). 
  

## Testing

Tests use a real database, so make sure to configure a disposable database before running them.
You can also create a `test-development.yaml` file in the `config` folder and setup your test database there.

On the other hand, calls to Google Vision API are mocked during tests because they're expensive, so you don't need to configure valid credentials. 

Simply run the tests with `npm test`.
