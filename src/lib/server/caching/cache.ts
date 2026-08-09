import { ICache } from "./ICache";
import InMemoryCache from "./InMemoryCache";
import UpstashRedisCache from "./UpstashRedisCache";

const cache: ICache = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new UpstashRedisCache()
  : new InMemoryCache();

export default cache;