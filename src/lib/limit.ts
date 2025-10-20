import {RateLimiterMemory} from 'rate-limiter-flexible';

export const limiter = new RateLimiterMemory({ points: 120, duration: 300 }); // 120 req / 5 min / IP

export async function guard(ip:string) {
  try { 
    await limiter.consume(ip); 
    return null; 
  }
  catch { 
    return { error: 'Too many requests', status: 429 }; 
  }
}