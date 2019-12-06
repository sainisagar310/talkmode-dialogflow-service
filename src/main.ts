import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from './config/config.service';
import * as bodyParser from 'body-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService: ConfigService = app.get('ConfigService');

	app.use(bodyParser.json({ limit: '50mb' }));
	app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

	app.enableCors({
		methods: ['GET', 'POST', 'DELETE', 'PUT'],
		allowedHeaders: ['Content-Type', 'Accept', 'authorization'],
		origin: configService.get('allow_origins').split(','),
	});

	if (configService.get('swagger') !== 'false') {
		const options = new DocumentBuilder()
			.setTitle(configService.get('app_name'))
			.setDescription('Apis for Dialogflow')
			.setVersion('1.0')
			.setSchemes('http', 'https')
			.build();
		const document = SwaggerModule.createDocument(app, options);
		SwaggerModule.setup('swagger', app, document);
	}

	await app.listen(process.env.PORT || 3001);
}
bootstrap();
