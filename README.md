# Hono AWS Middlewares

[![npm version](https://badge.fury.io/js/@squilla%2Fhono-aws-middlewares.svg)](https://www.npmjs.com/package/@squilla/hono-aws-middlewares)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Middleware library for using AWS services with Hono.

## Overview

This library is a middleware collection designed to easily use AWS SDK v3 within Hono applications. It automatically creates AWS service client instances and sets them in the Hono context, enabling consistent AWS service usage throughout your application.

## Features

- ⚡ **Hono Integration**: Complete integration with the Hono framework
- 🏗️ **TypeScript**: Full type safety
- 🔧 **AWS SDK v3**: Support for the latest AWS SDK
- 📦 **Lightweight**: Selective importing of only needed features
- 🧪 **Well-tested**: Comprehensive test coverage

## Supported Services

Currently supports the following AWS services:

- **DynamoDB**: NoSQL database service
- **Secrets Manager**: Secret management service

Additional AWS services will be supported progressively.

## Installation

```bash
npm install @squilla/hono-aws-middlewares
```

### Peer Dependencies

Install the following packages according to the AWS services you plan to use:

```bash
# For DynamoDB
npm install @aws-sdk/client-dynamodb

# For Secrets Manager
npm install @aws-sdk/client-secrets-manager

# Hono (required)
npm install hono
```

## Usage

### DynamoDB Middleware

Sets DynamoDB client instances in the Hono context.

```typescript
import { Hono } from 'hono';
import { dynamoDBMiddleware, Env } from '@squilla/hono-aws-middlewares';

const app = new Hono<Env>();

// Configure middleware
app.use('*', dynamoDBMiddleware({
  region: 'ap-northeast-1'
}));

// Use DynamoDB
app.get('/users/:id', async (c) => {
  const dynamoDB = c.get('DynamoDB');
  const result = await dynamoDB.getItem({
    TableName: 'Users',
    Key: { id: { S: c.req.param('id') } }
  });
  return c.json(result.Item);
});

app.post('/users', async (c) => {
  const dynamoDBClient = c.get('DynamoDBClient');
  const body = await c.req.json();
  
  await dynamoDBClient.putItem({
    TableName: 'Users',
    Item: {
      id: { S: body.id },
      name: { S: body.name },
      email: { S: body.email }
    }
  });
  
  return c.json({ success: true });
});
```

### Secrets Manager Middleware

Sets Secrets Manager client instances in the Hono context.

```typescript
import { Hono } from 'hono';
import { secretsManagerMiddleware, Env } from '@squilla/hono-aws-middlewares';

const app = new Hono<Env>();

// Configure middleware
app.use('*', secretsManagerMiddleware({
  region: 'ap-northeast-1'
}));

// Use Secrets Manager
app.get('/config', async (c) => {
  const secretsManager = c.get('SecretsManager');
  const result = await secretsManager.getSecretValue({
    SecretId: 'prod/myapp/config'
  });
  return c.json({ config: result.SecretString });
});
```

### Combining Multiple Middlewares

When using multiple AWS services simultaneously:

```typescript
import { Hono } from 'hono';
import { 
  dynamoDBMiddleware, 
  secretsManagerMiddleware, 
  Env 
} from '@squilla/hono-aws-middlewares';

const app = new Hono<Env>();

// Configure multiple middlewares
app.use('*', dynamoDBMiddleware({ region: 'ap-northeast-1' }));
app.use('*', secretsManagerMiddleware({ region: 'ap-northeast-1' }));

app.get('/secure-data/:id', async (c) => {
  // Get configuration from Secrets Manager
  const secretsManager = c.get('SecretsManager');
  const config = await secretsManager.getSecretValue({
    SecretId: 'prod/myapp/config'
  });
  
  // Get data from DynamoDB
  const dynamoDB = c.get('DynamoDB');
  const result = await dynamoDB.getItem({
    TableName: 'SecureData',
    Key: { id: { S: c.req.param('id') } }
  });
  
  return c.json({
    data: result.Item,
    config: JSON.parse(config.SecretString || '{}')
  });
});
```

### Individual Imports

You can import only the middlewares you need:

```typescript
// DynamoDB only
import { dynamoDBMiddleware } from '@squilla/hono-aws-middlewares/dynamodb';

// Secrets Manager only
import { secretsManagerMiddleware } from '@squilla/hono-aws-middlewares/secrets-manager';
```

## API Reference

### DynamoDB

#### `dynamoDBMiddleware(config?: DynamoDBClientConfig)`

Middleware that creates DynamoDB client instances and sets them in the Hono context.

**Parameters:**
- `config` (optional): Configuration options for the DynamoDB client

**Variables set in context:**
- `DynamoDB`: AWS SDK v3 DynamoDB service instance
- `DynamoDBClient`: AWS SDK v3 DynamoDBClient instance

### Secrets Manager

#### `secretsManagerMiddleware(config?: SecretsManagerClientConfig)`

Middleware that creates Secrets Manager client instances and sets them in the Hono context.

**Parameters:**
- `config` (optional): Configuration options for the Secrets Manager client

**Variables set in context:**
- `SecretsManager`: AWS SDK v3 SecretsManager service instance
- `SecretsManagerClient`: AWS SDK v3 SecretsManagerClient instance

## Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0 or higher (when using TypeScript)
- Hono 4.x
- AWS SDK v3

## Configuration Options

Each middleware accepts the same configuration options as the corresponding AWS SDK.

### Common Configuration Example

```typescript
const awsConfig = {
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key'
  }
};

app.use('*', dynamoDBMiddleware(awsConfig));
app.use('*', secretsManagerMiddleware(awsConfig));
```

### Usage in Lambda Environment

In AWS Lambda environments, credential configuration is usually unnecessary:

```typescript
app.use('*', dynamoDBMiddleware({
  region: process.env.AWS_REGION
}));
```

## Development

### Project Structure

```
lib/
├── dynamodb/               # DynamoDB middleware
│   ├── __tests__/         # Test files
│   └── index.ts           # Main implementation
├── secrets-manager/       # Secrets Manager middleware
│   ├── __tests__/         # Test files
│   └── index.ts           # Main implementation
└── index.ts               # Entry point
```

### Available Scripts

```bash
# Build
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Generate documentation
npm run docs
```

### Testing

Includes a comprehensive test suite:

```bash
# Run tests
npm run test

# Generate coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Contributing

Pull requests and issue reports are welcome. Feel free to request support for new AWS services.

### Adding New AWS Services

1. Create a new folder for the service in the `lib/` directory
2. Add middleware implementation and tests
3. Add exports to `lib/index.ts`
4. Add a new entry to `exports` in `package.json`

## License

[MIT License](LICENSE)

## Author

**Squilla** - [r-shrimp@outlook.jp](mailto:r-shrimp@outlook.jp)

## Links

- [GitHub Repository](https://github.com/squillaiugis/hono-aws-middlewares)
- [npm Package](https://www.npmjs.com/package/@squilla/hono-aws-middlewares)
- [Documentation](https://squillaiugis.github.io/hono-aws-middlewares/)
- [Hono](https://hono.dev/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
