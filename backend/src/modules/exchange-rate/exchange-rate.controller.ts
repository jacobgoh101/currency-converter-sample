import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { GetExchangeRateQuery } from './exchange-rate.dto';
import { ExchangeRateService } from './exchange-rate.service';

@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  getExchangeRate(
    @Query(new ValidationPipe()) { from, to }: GetExchangeRateQuery,
  ) {
    return this.exchangeRateService.getExchangeRate({ from, to });
  }
}
