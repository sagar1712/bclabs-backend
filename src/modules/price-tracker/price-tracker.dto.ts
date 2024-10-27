import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNumber, Min } from 'class-validator';
import { ChainNameEnum } from './price-tracker.interface';

export class CreateAlertDto {
  @ApiProperty({
    description:
      'The chain for which the alert is being set (e.g., Ethereum = 1027, Polygon=3890)',
    example: 'Ethereum',
  })
  @IsEnum(ChainNameEnum)
  chain: ChainNameEnum;

  @ApiProperty({
    description: 'The price threshold that triggers the alert',
    example: 2500,
  })
  @IsNumber()
  @Min(0)
  targetPrice: number;

  @ApiProperty({
    description: 'The email address where the alert should be sent',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}

export class SwapRateDto {
  @ApiProperty({
    description:
      'The amount of ETH for which the swap rate has to be determined',
    example: 2000, // Example as a number
  })
  @Type(() => Number) // This ensures the value is transformed to a number
  @IsNumber()
  @Min(0)
  ethAmount: number;
}
