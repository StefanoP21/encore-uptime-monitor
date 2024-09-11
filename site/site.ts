import { api } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import knex from 'knex';

export interface Site {
  id: number;
  url: string;
}

export interface AddParams {
  url: string;
}

// Add a new site to the list of monitored websites.
export const add = api(
  { expose: true, method: 'POST', path: '/site' },
  async (params: AddParams): Promise<Site> => {
    const site = (await Sites().insert({ url: params.url }, '*'))[0];
    return site;
  }
);

// Get a site by id.
export const get = api(
  { expose: true, method: 'GET', path: '/site/:id', auth: false },
  async ({ id }: { id: number }): Promise<Site> => {
    const site = await Sites().where('id', id).first();
    return site ?? Promise.reject(new Error('site not found'));
  }
);

// Delete a site by id.
export const del = api(
  { expose: true, method: 'DELETE', path: '/site/:id' },
  async ({ id }: { id: number }): Promise<void> => {
    await Sites().where('id', id).delete();
  }
);

export interface ListResponse {
  sites: Site[];
}

// Lists the monitored websites.
export const list = api(
  { expose: true, method: 'GET', path: '/site' },
  async (): Promise<ListResponse> => {
    const sites = await Sites().select();
    return { sites };
  }
);

// Define a database named 'site', using the database migrations
// in the "./migrations" folder. Encore automatically provisions,
// migrates, and connects to the database.
const SiteDB = new SQLDatabase('site', {
  migrations: './migrations',
});

const orm = knex({
  client: 'pg',
  connection: SiteDB.connectionString,
});

const Sites = () => orm<Site>('site');
