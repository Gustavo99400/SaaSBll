import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';

// Instanciamos el servidor de Express
const expressServer = express();

// Habilitamos CORS de forma global en Express para Cloud Functions
expressServer.use(cors({ origin: true, credentials: true }));

// Función para inicializar NestJS en Express
const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors();
  await app.init();
};

// Inicializamos NestJS sobre Express
createNestServer(expressServer);

// Exportamos la Cloud Function para producción
export const api = onRequest({ cors: true, memory: '512MiB' }, expressServer);

// Soporte para desarrollo local (nest start)
async function bootstrap() {
  if (!process.env.FIREBASE_CONFIG && !process.env.FUNCTIONS_EMULATOR) {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Servidor local corriendo en: http://localhost:3000`);
  }
}
bootstrap();
