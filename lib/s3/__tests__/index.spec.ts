import { S3, S3Client } from '@aws-sdk/client-s3';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import { Env, s3Middleware } from '../index';

describe('s3Middleware', () => {
  let app: Hono<Env>;

  beforeEach(() => {
    app = new Hono<Env>();
  });

  describe('Normal cases', () => {
    it('should set S3 and S3Client in context', async () => {
      // Arrange
      app.use('*', s3Middleware());
      app.get('/test', c => {
        const s3 = c.get('S3');
        const s3Client = c.get('S3Client');

        return c.json({
          hasS3: s3 instanceof S3,
          hasS3Client: s3Client instanceof S3Client,
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.hasS3).toBe(true);
      expect(body.hasS3Client).toBe(true);
    });

    it('should work with custom configuration', async () => {
      // Arrange
      const config = {
        region: 'ap-northeast-1',
        endpoint: 'http://localhost:4566',
      };

      app.use('*', s3Middleware(config));
      app.get('/test', async c => {
        const s3 = c.get('S3');
        const s3Client = c.get('S3Client');

        return c.json({
          s3ConfigRegion: await s3.config.region(),
          s3ClientConfigRegion: await s3Client.config.region(),
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.s3ConfigRegion).toBe('ap-northeast-1');
      expect(body.s3ClientConfigRegion).toBe('ap-northeast-1');
    });

    it('should allow access to S3 methods', async () => {
      // Arrange
      app.use('*', s3Middleware());
      app.get('/objects/:bucket/:key', async c => {
        const s3 = c.get('S3');

        // Verify that S3 instance methods are available
        const hasGetObjectMethod = typeof s3.getObject === 'function';
        const hasPutObjectMethod = typeof s3.putObject === 'function';
        const hasDeleteObjectMethod = typeof s3.deleteObject === 'function';

        return c.json({
          bucket: c.req.param('bucket'),
          key: c.req.param('key'),
          hasGetObjectMethod,
          hasPutObjectMethod,
          hasDeleteObjectMethod,
        });
      });

      // Act
      const res = await app.request('/objects/my-bucket/my-key');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.bucket).toBe('my-bucket');
      expect(body.key).toBe('my-key');
      expect(body.hasGetObjectMethod).toBe(true);
      expect(body.hasPutObjectMethod).toBe(true);
      expect(body.hasDeleteObjectMethod).toBe(true);
    });

    it('should work with multiple routes', async () => {
      // Arrange
      app.use('*', s3Middleware());

      app.get('/route1', c => {
        const s3 = c.get('S3');
        return c.json({ route: 'route1', hasS3: !!s3 });
      });

      app.post('/route2', c => {
        const s3Client = c.get('S3Client');
        return c.json({ route: 'route2', hasS3Client: !!s3Client });
      });

      // Act
      const res1 = await app.request('/route1');
      const res2 = await app.request('/route2', { method: 'POST' });

      // Assert
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const body1 = await res1.json();
      const body2 = await res2.json();

      expect(body1.hasS3).toBe(true);
      expect(body2.hasS3Client).toBe(true);
    });
  });

  describe('Configuration tests', () => {
    it('should work without configuration', async () => {
      // Arrange
      app.use('*', s3Middleware());
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
      app.use('*', s3Middleware({}));
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
    it('should provide correct types for S3 instances', async () => {
      // Arrange
      app.use('*', s3Middleware());
      app.get('/test', c => {
        const s3 = c.get('S3');
        const s3Client = c.get('S3Client');

        // Verify that TypeScript type checking works correctly
        const isS3Instance = s3 instanceof S3;
        const isS3ClientInstance = s3Client instanceof S3Client;

        return c.json({
          isS3Instance,
          isS3ClientInstance,
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isS3Instance).toBe(true);
      expect(body.isS3ClientInstance).toBe(true);
    });
  });
});
