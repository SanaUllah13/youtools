import { LRUCache } from 'lru-cache';

export const cache = new LRUCache<string, any>({ max: 800, ttl: 1000*60*10 }); // 10m

export const getC = (k:string) => cache.get(k);

export const setC = (k:string, v:any, ttl=600000) => cache.set(k, v, {ttl});