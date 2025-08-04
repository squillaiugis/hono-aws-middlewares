import { S3, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Env as HonoEnv, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

/**
 * Type definition for Hono environment variables containing S3 instances
 *
 * @public
 */
export interface Env extends HonoEnv {
  Variables: {
    /** AWS SDK v3 S3 service instance */
    S3: S3;
    /** AWS SDK v3 S3 client instance */
    S3Client: S3Client;
  };
}

/**
 * S3 middleware for Hono
 *
 * Creates AWS SDK v3 S3 and S3Client instances and sets them
 * in the Hono context to generate middleware.
 *
 * @param config - Configuration options for S3 client
 * @returns Hono middleware that sets S3 instances
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono';
 * import { s3Middleware, Env } from '@squilla/hono-aws-middlewares';
 *
 * const app = new Hono<Env>();
 *
 * // Set up middleware
 * app.use('*', s3Middleware({
 *   region: 'ap-northeast-1'
 * }));
 *
 * // Use S3
 * app.get('/config', async (c) => {
 *   const s3 = c.get('S3');
 *   const result = await s3.getObject({
 *     Bucket: 'my-bucket',
 *     Key: 'my-key'
 *   });
 *   return c.json({ config: result.Body });
 * });
 * ```
 *
 * @typeParam E - Hono environment type that extends Env
 * @since 1.1.0
 */
export const s3Middleware = <E extends Env>(config: S3ClientConfig = {}): MiddlewareHandler<E> => {
  return createMiddleware<E>(async (c, next) => {
    // Create Instances
    const s3 = new S3(config);
    const s3Client = new S3Client(config);

    // Set Variables
    c.set('S3', s3);
    c.set('S3Client', s3Client);

    // Call next
    await next();

    // Destroy Instances
    s3.destroy();
    s3Client.destroy();
  });
};
