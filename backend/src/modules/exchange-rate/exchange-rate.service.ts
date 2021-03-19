import {
  HttpService,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { isEqual } from 'lodash';
import { In, Repository } from 'typeorm';
import { ENV } from '../../config/env.config';
import { CURRENCY } from './exchange-rate.constants';
import { GetExchangeRateQuery } from './exchange-rate.dto';
import { ExchangeRate } from './exchange-rate.entity';

@Injectable()
export class ExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepo: Repository<ExchangeRate>,
    private readonly httpService: HttpService,
  ) {}

  async getExchangeRate({ from, to }: GetExchangeRateQuery) {
    try {
      /* 
        SELECT DISTINCT ON ("from", "to") * FROM "exchange_rates" "er" WHERE "from" IN ($1, $2) OR "to" IN ($3, $4) ORDER BY "from" ASC, "to" ASC, id DESC -- PARAMETERS: ["EUR","MYR","EUR","MYR"]
      */
      const exchangeRates: ExchangeRate[] = await this.exchangeRateRepo
        .createQueryBuilder('er')
        .select(`DISTINCT ON ("from", "to") *`)
        .where(`"from" IN (:...values)`, { values: [from, to] })
        .orWhere(`"to" IN (:...values)`, { values: [from, to] })
        .orderBy(`"from"`)
        .addOrderBy(`"to"`)
        .addOrderBy('id', 'DESC')
        .execute();
      const usdBasedRatesMap = this.getUsdBasedRatesMap(exchangeRates);
      if (!usdBasedRatesMap[to] || !usdBasedRatesMap[from])
        throw new Error('No Match Found');
      const rate = usdBasedRatesMap[to] / usdBasedRatesMap[from];
      return { from, to, rate };
    } catch (error) {
      Logger.error(error, 'getExchangeRate');
      throw new ServiceUnavailableException(
        'Rate Not Found. Please try again later.',
      );
    }
  }

  private getUsdBasedRatesMap(exchangeRates: ExchangeRate[]) {
    const usdBasedRatesMap = {};
    usdBasedRatesMap[CURRENCY.USD] = 1;
    exchangeRates.forEach((r) => {
      if (r.from === CURRENCY.USD) {
        usdBasedRatesMap[r.to] = r.rate;
      } else if (r.to === CURRENCY.USD) {
        usdBasedRatesMap[r.from] = 1 / r.rate;
      }
    });
    return usdBasedRatesMap;
  }

  @Cron('0 0 */12 * * *')
  // @Interval(3000)
  async updateExchangeRate(): Promise<void> {
    Logger.log('Updating Exchange Rate');
    try {
      const { data } = await this.getLatestRateFromCurrConv();
      await Promise.all(
        this.processCurrConvResp(data).map(({ from, to, rate }) =>
          this.exchangeRateRepo.insert({ from, to, rate }),
        ),
      );
    } catch (error) {
      Logger.error(error, 'updateExchangeRate');
      throw error;
    }
  }

  private processCurrConvResp(data: Record<string, number>) {
    return Object.entries(data).map(([q, rate]) => {
      const [from, to] = q.split('_') as CURRENCY[];
      return { from, to, rate };
    });
  }

  private async getLatestRateFromCurrConv() {
    const query = [
      CURRENCY.USD + '_' + CURRENCY.EUR,
      CURRENCY.USD + '_' + CURRENCY.MYR,
    ].join(',');
    const resp = await this.httpService
      .get<Record<string, number>>(
        `https://free.currconv.com/api/v7/convert?q=${query}&compact=ultra&apiKey=${ENV.CURRCONV_API_KEY}`,
      )
      .toPromise();
    return resp;
  }
}
