import { IsNotEmpty, IsIn } from 'class-validator';
import { CURRENCY } from './exchange-rate.constants';

export class GetExchangeRateQuery {
  @IsNotEmpty()
  @IsIn(Object.values(CURRENCY))
  from: string;

  @IsNotEmpty()
  @IsIn(Object.values(CURRENCY))
  to: string;
}
