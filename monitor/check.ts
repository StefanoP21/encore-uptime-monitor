import { api } from 'encore.dev/api';
import { site } from '~encore/clients';
import { ping } from './ping';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { Site } from '../site/site';
import { CronJob } from 'encore.dev/cron';

export const check = api(
  {
    expose: true,
    method: 'POST',
    path: '/check/:siteID',
  },
  async (p: { siteID: number }): Promise<{ up: boolean }> => {
    const s = await site.get({ id: p.siteID });
    return doCheck(s);
  }
);

async function doCheck(site: Site): Promise<{ up: boolean }> {
  const { up } = await ping({ url: site.url });
  await MonitorDB.exec`
    INSERT INTO checks (site_id, up, checked_at) 
    VALUES (${site.id}, ${up}, NOW())
  `;
  return { up };
}

export const checkAll = api(
  {
    expose: true,
    method: 'POST',
    path: '/check-all',
  },
  async (): Promise<void> => {
    const sites = await site.list();
    await Promise.all(sites.sites.map(doCheck));
  }
);

const cronJob = new CronJob('check-all', {
  title: 'Check all sites',
  every: '5m',
  endpoint: checkAll,
});

export const MonitorDB = new SQLDatabase('monitor', {
  migrations: './migrations',
});
