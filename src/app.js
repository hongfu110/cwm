import { getFakePage, configs, backimg, subapi, mihomo_top, singbox_1_11, singbox_1_12, singbox_1_12_alpha, beiantext, beiandizi } from './utils.js';
import { getmihomo_config } from './mihomo.js';
import { getsingbox_config } from './singbox.js';
import Koa from 'koa';
import Router from '@koa/router';
const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  const url = new URL(ctx.request.href);
  const userAgent = ctx.request.headers['user-agent'];
  const templateUrl = url.searchParams.get("template");
  const singbox = url.searchParams.get("singbox");
  const IMG = process.env.IMG || backimg;
  const sub = process.env.SUB || subapi;
  const Mihomo_default = process.env.MIHOMO || mihomo_top;
  const Singbox_default = {
    singbox_1_11: process.env.SINGBOX_1_11 || singbox_1_11,
    singbox_1_12: process.env.SINGBOX_1_12 || singbox_1_12,
    singbox_1_12_alpha: process.env.SINGBOX_1_12_ALPHA || singbox_1_12_alpha
  };
  const beian = process.env.BEIAN || beiantext;
  const beianurl = process.env.BEIANURL || beiandizi;

  // Handle URL parameters
  let urls = url.searchParams.getAll("url");

  if (urls.length === 1 && urls[0].includes(",")) {
    urls = urls[0].split(",").map(u => u.trim()); // Split and trim spaces
  }

  if (urls.length === 0 || urls[0] === "") {
    ctx.body = await getFakePage(IMG, beianurl, beian, configs(), sub);
    ctx.type = 'html';
    return;
  }

  try {
    let res;
    if (singbox) {
      res = await getsingbox_config(urls, templateUrl, Singbox_default, userAgent, sub);
    } else {
      res = await getmihomo_config(urls, templateUrl, Mihomo_default, userAgent, sub);
    }
    // 过滤 headers 中的不安全字段，并转为普通对象
    const rawHeaders = res.headers || {};
    const headersToIgnore = ['transfer-encoding', 'content-length', 'content-encoding', 'connection'];

    const safeHeaders = {};
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (!headersToIgnore.includes(key.toLowerCase())) {
        safeHeaders[key] = value;
      }
    }
    safeHeaders['Content-Type'] = 'application/json; charset=utf-8';

    ctx.body = res.data;
    ctx.status = res.status;
    ctx.set(safeHeaders);
  } catch (err) {
    ctx.body = err.message;
    ctx.status = 400;
    ctx.type = 'json';
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

export default app.callback();