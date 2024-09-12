import { api } from 'encore.dev/api';
import { secret } from 'encore.dev/config';
import log from 'encore.dev/log';
import { Subscription } from 'encore.dev/pubsub';
import { TransitionTopic } from '../monitor/check';

export interface NotifyParams {
  text: string;
}

export const notify = api<NotifyParams>({}, async ({ text }) => {
  const url = webhookURL();
  if (!url) {
    log.info('no discord webhook url configured, skipping notification');
    return;
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: text }),
  });
  if (resp.status >= 400) {
    const body = await resp.text();
    throw new Error(
      `failed to send discord notification: ${resp.status}: ${body}`
    );
  }
});

const _ = new Subscription(TransitionTopic, 'discord-notification', {
  handler: async (event) => {
    const text = `*${event.site.url} is ${event.up ? 'back up.' : 'down!'}*`;
    await notify({ text });
  },
});

const webhookURL = secret('DiscordWebhookURL');
