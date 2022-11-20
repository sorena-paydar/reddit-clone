import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule, PrismaModule, UserModule, SubredditModule } from './app';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'media'),
      serveRoot: '/static',
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    SubredditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
