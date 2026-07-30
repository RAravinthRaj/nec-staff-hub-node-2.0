/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import express, { type Express } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { resolvers, typeDefs } from './graphql/graphql.schema';
import router from './routes/rest.route';
import { config } from './config/config';
import logger from './utils/logger';
import { sequelize } from './config/database';
import { authenticateJWT } from './middlewares/authenticateJwt.middleware';
import { bodySizeLimit, helmetMiddleware, httpsRedirect, rate_limiter } from './middlewares';
import './models'; // Import models to ensure associations are registered before sync

const restApp = express();
const graphqlApp = express();

let dbConnection: mysql.Connection;

async function connectMySQL() {
  try {
    dbConnection = await mysql.createConnection({
      host: config.mySqlHost,
      port: config.mySqlPort,
      user: config.mySqlUser,
      password: config.mySqlPassword,
      database: config.mySqlDatabaseName,

      ssl: config.mySqlCertificate
        ? {
            ca: config.mySqlCertificate?.replace(/\\n/g, '\n'),
            rejectUnauthorized: true,
          }
        : undefined,
    });

    logger.info('🚀 MySQL Database connected successfully');
    return dbConnection;
  } catch (err: any) {
    logger.error(`MySQL connection error: ${err}`);
    process.exit(1);
  }
}

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('🚀 Sequelize authenticated successfully');

    // Automatically sync models & create tables if they do not exist
    await sequelize.sync();
    logger.info('🚀 Database tables synced successfully');
  } catch (error) {
    logger.error('❌ Sequelize sync error:', error);
    process.exit(1);
  }
}

function applyCommonMiddleware(app: Express) {
  const jsonBodyParser = express.json({ limit: config.requestBodyLimit });
  const bodyParserJson = bodyParser.json({ limit: config.requestBodyLimit });
  const urlEncodedBodyParser = express.urlencoded({
    extended: true,
    limit: config.requestBodyLimit,
  });

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  app.use(jsonBodyParser);
  app.use(bodyParserJson);
  app.use(urlEncodedBodyParser);

  app.use(rate_limiter);
  app.use(bodySizeLimit);
  app.use(httpsRedirect);
  app.use(helmetMiddleware);
}

async function startServer() {
  const graphqlServer = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    introspection: config.nodeEnv === 'development',
    plugins: [
      config.nodeEnv === 'development'
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageDisabled(),
    ],
    formatError: (formattedError) => ({
      message: formattedError.message,
      path: formattedError.path,
      locations: formattedError.locations,
      extensions: { code: formattedError.extensions?.code },
    }),
  });

  await graphqlServer.start();

  applyCommonMiddleware(restApp);
  applyCommonMiddleware(graphqlApp);

  restApp.use('/rest', router);

  graphqlApp.use(
    '/graphql',
    authenticateJWT,
    expressMiddleware(graphqlServer, {
      context: async ({ req }) => ({ req }),
    }),
  );

  restApp.listen(config.restPort, '0.0.0.0', () => {
    logger.info(`🚀 REST available at http://localhost:${config.restPort}/rest`);
  });

  graphqlApp.listen(config.graphqlPort, '0.0.0.0', () => {
    logger.info(`🚀 GRAPHQL available at http://localhost:${config.graphqlPort}/graphql`);
  });
}

(async function bootstrap() {
  await connectMySQL();
  await syncDatabase();
  await startServer();
})();
