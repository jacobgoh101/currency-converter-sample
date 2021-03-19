import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENV } from './config/env.config';
import { ExchangeRateModule } from './modules/exchange-rate/exchange-rate.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: ENV.DB_HOST,
      port: +ENV.DB_PORT,
      username: ENV.DB_USERNAME,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_NAME,
      entities: [],
      synchronize: true,
    }),
    ExchangeRateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
