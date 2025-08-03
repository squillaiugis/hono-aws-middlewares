import { DynamoDB, DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { Env as HonoEnv, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

/**
 * Type definition for Hono environment variables containing DynamoDB instances
 *
 * @public
 */
export interface Env extends HonoEnv {
  Variables: {
    /** AWS SDK v3 DynamoDB service instance */
    DynamoDB: DynamoDB;
    /** AWS SDK v3 DynamoDB client instance */
    DynamoDBClient: DynamoDBClient;
  };
}

/**
 * DynamoDB middleware for Hono
 *
 * Creates AWS SDK v3 DynamoDB and DynamoDBClient instances and sets them
 * in the Hono context to generate middleware.
 *
 * @param config - Configuration options for DynamoDB client
 * @returns Hono middleware that sets DynamoDB instances
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono';
 * import { dynamoDBMiddleware, Env } from '@squilla/hono-aws-middlewares';
 *
 * const app = new Hono<Env>();
 *
 * // Set up middleware
 * app.use('*', dynamoDBMiddleware({
 *   region: 'ap-northeast-1'
 * }));
 *
 * // Use DynamoDB
 * app.get('/users/:id', async (c) => {
 *   const dynamoDB = c.get('DynamoDB');
 *   const result = await dynamoDB.getItem({
 *     TableName: 'Users',
 *     Key: { id: { S: c.req.param('id') } }
 *   });
 *   return c.json(result.Item);
 * });
 * ```
 *
 * @typeParam E - Hono environment type that extends Env
 * @since 1.0.0
 */
export const dynamoDBMiddleware = <E extends Env>(
  config: DynamoDBClientConfig = {}
): MiddlewareHandler<E> => {
  return createMiddleware<E>(async (c, next) => {
    // Create Instances
    const dynamoDB = new DynamoDB(config);
    const dynamoDBClient = new DynamoDBClient(config);

    // Set Variables
    c.set('DynamoDB', dynamoDB);
    c.set('DynamoDBClient', dynamoDBClient);
    await next();
  });
};
