import {
  SecretsManager,
  SecretsManagerClient,
  SecretsManagerClientConfig,
} from '@aws-sdk/client-secrets-manager';
import { Env as HonoEnv, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

/**
 * Type definition for Hono environment variables containing Secrets Manager instances
 *
 * @public
 */
export interface Env extends HonoEnv {
  Variables: {
    /** AWS SDK v3 Secrets Manager service instance */
    SecretsManager: SecretsManager;
    /** AWS SDK v3 Secrets Manager client instance */
    SecretsManagerClient: SecretsManagerClient;
  };
}

/**
 * Secrets Manager middleware for Hono
 *
 * Creates AWS SDK v3 SecretsManager and SecretsManagerClient instances and sets them
 * in the Hono context to generate middleware.
 *
 * @param config - Configuration options for Secrets Manager client
 * @returns Hono middleware that sets Secrets Manager instances
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono';
 * import { secretsManagerMiddleware, Env } from '@squilla/hono-aws-middlewares';
 *
 * const app = new Hono<Env>();
 *
 * // Set up middleware
 * app.use('*', secretsManagerMiddleware({
 *   region: 'ap-northeast-1'
 * }));
 *
 * // Use Secrets Manager
 * app.get('/config', async (c) => {
 *   const secretsManager = c.get('SecretsManager');
 *   const result = await secretsManager.getSecretValue({
 *     SecretId: 'prod/myapp/config'
 *   });
 *   return c.json({ config: result.SecretString });
 * });
 * ```
 *
 * @typeParam E - Hono environment type that extends Env
 * @since 1.0.0
 */
export const secretsManagerMiddleware = <E extends Env>(
  config: SecretsManagerClientConfig = {}
): MiddlewareHandler<E> => {
  return createMiddleware<E>(async (c, next) => {
    // Create Instances
    const secretsManager = new SecretsManager(config);
    const secretsManagerClient = new SecretsManagerClient(config);

    // Set Variables
    c.set('SecretsManager', secretsManager);
    c.set('SecretsManagerClient', secretsManagerClient);

    // Call next
    await next();

    // Destroy Instances
    secretsManager.destroy();
    secretsManagerClient.destroy();
  });
};
