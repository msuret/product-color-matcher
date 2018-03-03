# product-color-matcher
An API to match similar color products

## Migration

Run this comand to install [PostgreSQL's cube extension](https://www.postgresql.org/docs/10/static/cube.html) and create the `products` table:
```bash
DATABASE_URL=postgres://postgres:password@localhost:5432/database npm run migrate -- up
```
Arguments are passed straight to [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate), so `down`, `unlock` and `redo` commands are also available.
