import { SecretsManager, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import { Env, secretsManagerMiddleware } from '../index';

describe('secretsManagerMiddleware', () => {
  let app: Hono<Env>;

  beforeEach(() => {
    app = new Hono<Env>();
  });

  describe('Normal cases', () => {
    it('should set SecretsManager and SecretsManagerClient in context', async () => {
      // Arrange
      app.use('*', secretsManagerMiddleware());
      app.get('/test', c => {
        const secretsManager = c.get('SecretsManager');
        const secretsManagerClient = c.get('SecretsManagerClient');

        return c.json({
          hasSecretsManager: secretsManager instanceof SecretsManager,
          hasSecretsManagerClient: secretsManagerClient instanceof SecretsManagerClient,
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.hasSecretsManager).toBe(true);
      expect(body.hasSecretsManagerClient).toBe(true);
    });

    it('should work with custom configuration', async () => {
      // Arrange
      const config = {
        region: 'ap-northeast-1',
        endpoint: 'http://localhost:4566',
      };

      app.use('*', secretsManagerMiddleware(config));
      app.get('/test', async c => {
        const secretsManager = c.get('SecretsManager');
        const secretsManagerClient = c.get('SecretsManagerClient');

        return c.json({
          secretsManagerConfigRegion: await secretsManager.config.region(),
          secretsManagerClientConfigRegion: await secretsManagerClient.config.region(),
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.secretsManagerConfigRegion).toBe('ap-northeast-1');
      expect(body.secretsManagerClientConfigRegion).toBe('ap-northeast-1');
    });

    it('should allow access to SecretsManager methods', async () => {
      // Arrange
      app.use('*', secretsManagerMiddleware());
      app.get('/secrets/:id', async c => {
        const secretsManager = c.get('SecretsManager');

        // Verify that SecretsManager instance methods are available
        const hasGetSecretValueMethod = typeof secretsManager.getSecretValue === 'function';
        const hasCreateSecretMethod = typeof secretsManager.createSecret === 'function';

        return c.json({
          secretId: c.req.param('id'),
          hasGetSecretValueMethod,
          hasCreateSecretMethod,
        });
      });

      // Act
      const res = await app.request('/secrets/123');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.secretId).toBe('123');
      expect(body.hasGetSecretValueMethod).toBe(true);
      expect(body.hasCreateSecretMethod).toBe(true);
    });

    it('should work with multiple routes', async () => {
      // Arrange
      app.use('*', secretsManagerMiddleware());

      app.get('/route1', c => {
        const secretsManager = c.get('SecretsManager');
        return c.json({ route: 'route1', hasSecretsManager: !!secretsManager });
      });

      app.post('/route2', c => {
        const secretsManagerClient = c.get('SecretsManagerClient');
        return c.json({ route: 'route2', hasSecretsManagerClient: !!secretsManagerClient });
      });

      // Act
      const res1 = await app.request('/route1');
      const res2 = await app.request('/route2', { method: 'POST' });

      // Assert
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const body1 = await res1.json();
      const body2 = await res2.json();

      expect(body1.hasSecretsManager).toBe(true);
      expect(body2.hasSecretsManagerClient).toBe(true);
    });
  });

  describe('Configuration tests', () => {
    it('should work without configuration', async () => {
      // Arrange
      app.use('*', secretsManagerMiddleware());
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
      app.use('*', secretsManagerMiddleware({}));
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
    it('should provide correct types for SecretsManager instances', async () => {
      // Arrange
      app.use('*', secretsManagerMiddleware());
      app.get('/test', c => {
        const secretsManager = c.get('SecretsManager');
        const secretsManagerClient = c.get('SecretsManagerClient');

        // Verify that TypeScript type checking works correctly
        const isSecretsManagerInstance = secretsManager instanceof SecretsManager;
        const isSecretsManagerClientInstance = secretsManagerClient instanceof SecretsManagerClient;

        return c.json({
          isSecretsManagerInstance,
          isSecretsManagerClientInstance,
        });
      });

      // Act
      const res = await app.request('/test');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isSecretsManagerInstance).toBe(true);
      expect(body.isSecretsManagerClientInstance).toBe(true);
    });
  });
});
