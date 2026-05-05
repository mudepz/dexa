import { HttpException, HttpStatus, Logger, LogLevel, ValidationError, ValidationPipe } from "@nestjs/common";
import { NestApplication, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { ConstService } from "./infra/const/const.service";
import { CustomLoggerService } from "./infra/logger/logger.service";
import { AppModule } from "./app/app.module";

declare global {
    interface BigInt {
        toJSON(): number;
    }
}

BigInt.prototype.toJSON = function (): number {
    return Number(this);
};

async function bootstrap() {
    let app: NestApplication
    try {
        app = await NestFactory.create(AppModule);
        Logger.log('app created successfully.')
    } catch (error) {
        Logger.error('Error during app creation:', error);
        process.exit(1);
    }

    const loggerService = app.get(CustomLoggerService);
    app.useLogger(loggerService);
    const constService = app.get(ConstService);
    const logLevels: LogLevel[] = constService.config.debug
        ? ['log', 'error', 'warn', 'debug', 'verbose']
        : ['log', 'error', 'warn'];
    app.useLogger(logLevels);
    app.enableCors({
        origin: constService.config.cors.domains,
        methods: constService.config.cors.methods,
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
        exceptionFactory: (errors) => {
            const extractErrorMessages = (error: ValidationError): string[] => {
                if (error.constraints) {
                    return Object.values(error.constraints);
                }

                // Handle nested children errors
                if (error.children?.length) {
                    return error.children.flatMap((childError) =>
                        extractErrorMessages(childError).map((msg: any) => `${error.property}.${msg}`)
                    );
                }

                return [`Validation failed for ${error.property}`];
            };

            const errorMessages = errors.flatMap((error) => extractErrorMessages(error));

            // Log the error messages
            Logger.error('Validation failed', errorMessages);

            // Throw an HttpException so NestJS formats it properly
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: errorMessages.length ? errorMessages : ['Unknown validation error'],
                    error: 'Bad Request',
                },
                HttpStatus.BAD_REQUEST,
            );
        },
    }))
    app.use(bodyParser.json({ limit: '100mb' }))
    app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

    if (constService.config.debug) {
        const options = new DocumentBuilder()
            .setTitle('API Documentation')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, options);
        const totalApi = Object.values(document.paths)
            .reduce((sum, path) => sum + Object.keys(path).length, 0);
        const title = `Dexa Api Docs (${totalApi} endpoints)`
        document.info.description = title
        SwaggerModule.setup('swagger', app, document, {
            jsonDocumentUrl: '/swagger/json',
            customSiteTitle: title
        });
    }

    Logger.log('server started successfully.');
    await app.listen(constService.config.port || 4015, '0.0.0.0')
}

dotenv.config()
bootstrap().then(() => {
})