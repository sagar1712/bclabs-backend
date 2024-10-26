import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { PriceTrackerModule } from './modules/price-tracker/price-tracker.module'


export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder().setTitle('BCLABS BACKEND DOCUMENTATION').setVersion('8').addBearerAuth().build()

  const document = SwaggerModule.createDocument(app, options, {
    include: [PriceTrackerModule],
  })
  SwaggerModule.setup('documentation', app, document)
}
