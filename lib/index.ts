import { Env as DynamoDBEnv, dynamoDBMiddleware } from './dynamodb';
import { Env as S3Env, s3Middleware } from './s3';
import { Env as SecretsManagerEnv, secretsManagerMiddleware } from './secrets-manager';

export { dynamoDBMiddleware, s3Middleware, secretsManagerMiddleware };

/**
 * Type definition for Hono environment variables containing AWS services instances
 *
 * @public
 */
export type Env = DynamoDBEnv & SecretsManagerEnv & S3Env;
