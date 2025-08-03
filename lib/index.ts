import { Env as DynamoDBEnv, dynamoDBMiddleware } from './dynamodb';
import { Env as SecretsManagerEnv, secretsManagerMiddleware } from './secrets-manager';

export { dynamoDBMiddleware, secretsManagerMiddleware };
export type Env = DynamoDBEnv & SecretsManagerEnv;
