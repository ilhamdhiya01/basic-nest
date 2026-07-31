import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should say hello', async () => {
    const result = await request(app.getHttpServer()).get(
      '/api/user/hello/John',
    );
    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello John');
  });

  it('should show first name and last name', async () => {
    const result = await request(app.getHttpServer())
      .get('/api/user/hello')
      .query({
        first_name: 'John',
        last_name: 'Doe',
      });
    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello John Doe');
  });

  afterEach(async () => {
    await app.close();
  });
});
