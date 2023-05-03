import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from 'pactum';
import { AuthDto } from "../src/auth/dto";
import { BookMarkDto, EditBookmarkDto } from "src/bookmark/dto";

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  })
  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@gmail.com',
      password: '123'
    }
    describe('signup', () => {
      it('throws an error if email is empty', () => {
        return pactum.spec().post('/auth/signup').withJson({ password: dto.password }).expectStatus(400).toss();
      })
      it('throws an error if password is empty', () => {
        return pactum.spec().post('/auth/signup').withJson({ email: dto.email }).expectStatus(400).toss();
      })
      it('throws an error is empty', () => {
        return pactum.spec().post('/auth/signup').withJson({}).expectStatus(400).toss();
      })
      it('should create a new user', () => {
        return pactum.spec().post('/auth/signup').withJson(dto).expectStatus(201).toss();
      })
    })

    describe('signin', () => {
      it('throws an error if email is empty', () => {
        return pactum.spec().post('/auth/signin').withJson({ password: dto.password }).expectStatus(400).toss();
      })
      it('throws an error if password is empty', () => {
        return pactum.spec().post('/auth/signin').withJson({ email: dto.email }).expectStatus(400).toss();
      })
      it('throws an error is empty', () => {
        return pactum.spec().post('/auth/signin').withJson({}).expectStatus(400).toss();
      })
      it('should return a token', async () => {
        return pactum.spec().post('/auth/signin').withJson(dto).expectStatus(200).stores('userAt', 'access_token');
      })
    })
  })

  describe('User', () => {

    describe('get', () => {
      it('should unauthorized', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      })
      it('should authorized', () => {
        return pactum.spec().get('/users/me').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200);
      })
      it('should edit user', () => {
        const dto = { 'lastName': 'test', 'email': 'test3@gmail.com' }
        return pactum.spec().patch('/users').withHeaders({ Authorization: 'Bearer $S{userAt}' }).withBody(dto).expectStatus(200).expectBodyContains(dto.lastName).expectBodyContains(dto.email);
      })
    })

    describe('update', () => { })
  })

  describe('Bookmark', () => {

    describe('get empty bookmark', () => {
      it('get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200).expectBody([]);
      })
    })

    describe('create', () => {
      const dto: BookMarkDto = {
        title: 'test',
        link: 'https://test.com',
      }
      it('should create a new bookmark', () => {
        return pactum.spec().post('/bookmarks').withHeaders({ Authorization: 'Bearer $S{userAt}' }).withBody(dto).expectStatus(201).stores('bookmarkId', 'id');
      })
    })

    describe('get bookmark', () => {
      it('get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200);
      })
    })

    describe('get by id', () => {
      it('get bookmarks', () => {
        return pactum.spec().get('/bookmarks/{id}').withPathParams('id', '$S{bookmarkId}').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200).expectBodyContains('$S{bookmarkId}');
      })
    })

    describe('update', () => {
      const dto: EditBookmarkDto = {
        title: 'test2'
      }
      it('edit bookmarks', () => {
        return pactum.spec().patch('/bookmarks/{id}').withPathParams('id', '$S{bookmarkId}').withHeaders({ Authorization: 'Bearer $S{userAt}' }).withBody(dto).expectStatus(200).expectBodyContains(dto.title);
      })
    })

    describe('delete', () => { 
      it('delete bookmarks', () => {
        return pactum.spec().delete('/bookmarks/{id}').withPathParams('id', '$S{bookmarkId}').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(204);
      })
      it('get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200).expectBody([]);
      })
    })
  })
})