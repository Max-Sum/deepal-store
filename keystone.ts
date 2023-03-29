import { config } from '@keystone-6/core';
import dotenv from 'dotenv'
import { lists } from './schema'
import { withAuth, session } from './auth';
import router from './api';

dotenv.config();

const {
    // The base URL to serve assets from
    ASSET_BASE_URL: baseUrl = 'http://localhost:3000',
    DB_HOST: dbHost = 'localhost',
    DB_PORT: dbPort = 5432,
    DB_USERNAME: dbUsername = 'postgres',
    DB_PASSWORD: dbPassword = 'postgres',
    DB_DATABASE: dbName = 'deepal-store',
    EXTERNAL_IP: externalIP = '127.0.0.1'
} = process.env;

export default withAuth(
  config({
    db: {
      provider: 'postgresql',
      url: `postgres://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`,
      idField: { kind: "autoincrement" }
    },
    lists,
    session,
    storage: {
      imgs: {
        kind: 'local',
        type: 'image',
        generateUrl: path => `${baseUrl}/public/imgs${path}`,
        serverRoute: {
          path: '/public/imgs',
        },
        storagePath: 'public/imgs',
      },
      apps: {
        kind: 'local',
        type: 'file',
        generateUrl: path => `${baseUrl}/public/apps${path}`,
        serverRoute: {
          path: '/public/apps',
        },
        storagePath: 'public/apps',
      },
    },
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    server: {
      extendExpressApp: (app, context) => {
        app.use('/api/1/appstore', (req, res, next) => {
          res.locals.context = context
          router(req, res, next)
        })
        app.get('/hosts', (req, res) => {
          res.send(`${externalIP} tsp.changan.x-tetris.com`)
        })
      }
    }
  })
);