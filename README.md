# product-color-matcher
An API to match similar color products


## Configuration

You can either create a new file named `local.yaml` in the `config` folder, or use environment variables.You

### Database

If no configuration is provided, the application wil attempt to connect a local database using [https://www.postgresql.org/docs/10/static/auth-methods.html#AUTH-PEER](peer authentication).

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
DB_MAX_POOL_SIZE=
```

## Migration

Run this comand to install [PostgreSQL's cube extension](https://www.postgresql.org/docs/10/static/cube.html) and create the `products` table:
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

Only `id` and `url` are compulsory.
Import is made with the following command:
```bash
npm run import -- path/to/file.csv
```

The file is streamed so memory consumption stays low even for large file. Rows are inserted by batches of 100 to limit round-trip delay time with the databaase.

