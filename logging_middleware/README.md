# Logging Middleware

Shared, generic logging utility used by both the **frontend** and **backend** stacks.

## Installation

```bash
cd logging_middleware
npm install
```

## Usage

### In Frontend (React)

```js
import { createLogger } from '../../../logging_middleware/logger.js'

const Log = createLogger('http://your-api.com/service', 'your-token')
Log('frontend', 'info', 'page', 'App mounted')
```

### In Backend (Express)

```js
import { createLogger, requestLogger } from '../../logging_middleware/logger.js'

const Log = createLogger('http://your-api.com/service', 'your-token')

// Use as Express middleware for automatic request logging
app.use(requestLogger(Log))

// Or call directly
Log('backend', 'info', 'startup', 'Server started on port 3001')
```

## API

### `createLogger(baseUrl, token)`

Returns a `Log(stack, level, pkg, message)` function that POSTs log entries to `{baseUrl}/logs`.

| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| baseUrl   | string | Base URL of the evaluation service |
| token     | string | Bearer token for authentication    |

### `requestLogger(logFn)`

Returns Express middleware that logs each HTTP request on response finish.

| Parameter | Type     | Description                              |
|-----------|----------|------------------------------------------|
| logFn     | function | A `Log` function from `createLogger()`   |
