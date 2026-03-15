import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    upstash_url: process.env.UPSTASH_REDIS_REST_URL ? 'set' : 'missing',
    upstash_token: process.env.UPSTASH_REDIS_REST_TOKEN ? 'set' : 'missing',
    kv_url: process.env.KV_REST_API_URL ? 'set' : 'missing',
    kv_token: process.env.KV_REST_API_TOKEN ? 'set' : 'missing',
  });
}
