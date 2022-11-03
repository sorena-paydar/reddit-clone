import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule, PrismaModule, UserModule, SubredditModule } from './app';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UserModule,
    SubredditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
