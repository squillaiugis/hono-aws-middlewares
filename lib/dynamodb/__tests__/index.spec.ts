import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import { Env, dynamoDBMiddleware } from '../index';

describe('dynamoDBMiddleware', () => {
  let app: Hono<Env>;

  beforeEach(() => {
    app = new Hono<Env>();
  });

  describe('Normal cases', () => {
    it('should set DynamoDB and DynamoDBClient in context', async () => {
      // Arrange
      app.use('*', dynamoDBMiddleware());
      app.get('/test', c => {
        const dynamoDB = c.get('DynamoDB');
        const dynamoDBClient = c.get('DynamoDBClient');

        return c.json({
          hasDynamoDB: dynamoDB instanceof DynamoDB,
          hasDynamoDBClient: dynamoDBClient instanceof DynamoDBClient,
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.hasDynamoDB).toBe(true);
      expect(body.hasDynamoDBClient).toBe(true);
    });

    it('should work with custom configuration', async () => {
      // Arrange
      const config = {
        region: 'ap-northeast-1',
        endpoint: 'http://localhost:8000',
      };

      app.use('*', dynamoDBMiddleware(config));
      app.get('/test', async c => {
        const dynamoDB = c.get('DynamoDB');
        const dynamoDBClient = c.get('DynamoDBClient');

        return c.json({
          dynamoDBConfigRegion: await dynamoDB.config.region(),
          dynamoDBClientConfigRegion: await dynamoDBClient.config.region(),
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.dynamoDBConfigRegion).toBe('ap-northeast-1');
      expect(body.dynamoDBClientConfigRegion).toBe('ap-northeast-1');
    });

    it('should allow access to DynamoDB methods', async () => {
      // Arrange
      app.use('*', dynamoDBMiddleware());
      app.get('/users/:id', async c => {
        const dynamoDB = c.get('DynamoDB');

        // Verify that DynamoDB instance methods are available
        const hasGetItemMethod = typeof dynamoDB.getItem === 'function';
        const hasPutItemMethod = typeof dynamoDB.putItem === 'function';

        return c.json({
          userId: c.req.param('id'),
          hasGetItemMethod,
          hasPutItemMethod,
        });
      });

      // Act
      const res = await app.request('/users/123');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe('123');
      expect(body.hasGetItemMethod).toBe(true);
      expect(body.hasPutItemMethod).toBe(true);
    });

    it('should work with multiple routes', async () => {
      // Arrange
      app.use('*', dynamoDBMiddleware());

      app.get('/route1', c => {
        const dynamoDB = c.get('DynamoDB');
        return c.json({ route: 'route1', hasDynamoDB: !!dynamoDB });
      });

      app.post('/route2', c => {
        const dynamoDBClient = c.get('DynamoDBClient');
        return c.json({ route: 'route2', hasDynamoDBClient: !!dynamoDBClient });
      });

      // Act
      const res1 = await app.request('/route1');
      const res2 = await app.request('/route2', { method: 'POST' });

      // Assert
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const body1 = await res1.json();
      const body2 = await res2.json();

      expect(body1.hasDynamoDB).toBe(true);
      expect(body2.hasDynamoDBClient).toBe(true);
    });
  });

  describe('Configuration tests', () => {
    it('should work without configuration', async () => {
      // Arrange
      app.use('*', dynamoDBMiddleware());
      app.get('/test', c => {
        return c.text('OK');
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('OK');
    });

    it('should work with empty configuration object', async () => {
      // Arrange
      app.use('*', dynamoDBMiddleware({}));
      app.get('/test', c => {
        return c.text('OK');
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('OK');
    });
  });

  describe('Type safety tests', () => {
    it('should provide correct types for DynamoDB instances', async () => {
      // Arrange
      app.use('*', dynamoDBMiddleware());
      app.get('/test', c => {
        const dynamoDB = c.get('DynamoDB');
        const dynamoDBClient = c.get('DynamoDBClient');

        // Verify that TypeScript type checking works correctly
        const isDynamoDBInstance = dynamoDB instanceof DynamoDB;
        const isDynamoDBClientInstance = dynamoDBClient instanceof DynamoDBClient;

        return c.json({
          isDynamoDBInstance,
          isDynamoDBClientInstance,
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isDynamoDBInstance).toBe(true);
      expect(body.isDynamoDBClientInstance).toBe(true);
    });
  });
});
