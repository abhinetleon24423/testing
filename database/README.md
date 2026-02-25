# Database – MongoDB + MySQL

Use **one** or **both**. Only databases with env config are connected.

## Config (.env)

- **MongoDB only:** set `MONGODB_URI`. Do not set any `MYSQL_*`.
- **MySQL only:** set `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_DATABASE` (and optionally `MYSQL_PASSWORD`, `MYSQL_PORT`). Do not set `MONGODB_URI`.
- **Both:** set both groups.

## Use in project

### MongoDB (existing way)

Use Mongoose models as now. They use the default connection.

```js
const User = require('../Models/User');  // uses mongoose
const users = await User.find();
```

Or get mongoose from connection:

```js
const { getMongo } = require('../database/connection');
const mongoose = getMongo();
```

### MySQL (raw queries)

Get the pool and run queries. Use in Services, not directly in Controllers.

```js
const { getMysql } = require('../database/connection');

const db = getMysql();
if (!db) throw new Error('MySQL not configured');

const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
const [result] = await db.query('INSERT INTO logs (message) VALUES (?)', [msg]);
```

### Using both in one request

```js
const User = require('../Models/User');           // MongoDB
const { getMysql } = require('../database/connection');

const user = await User.findById(userId);       // MongoDB
const db = getMysql();
const [orders] = db ? await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]) : [[]];
```
