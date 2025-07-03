import { fetchResponse, splitUrlsAndProxies, buildApiUrl, Top_Data, Rule_Data } from './utils.js';
export async function getmihomo_config(urls, rule, top, userAgent, subapi) {
    if (!/meta|clash.meta|clash|clashverge|mihomo/i.test(userAgent)) {
        throw new Error('不支持的客户端');
    }
    urls = splitUrlsAndProxies(urls);
    const [Mihomo_Top_Data, Mihomo_Rule_Data, Mihomo_Proxies_Data] = await Promise.all([
        Top_Data(top),
        Rule_Data(rule),
        getMihomo_Proxies_Data(urls, userAgent, subapi)
    ]);
    if (!Mihomo_Proxies_Data?.data?.proxies || Mihomo_Proxies_Data?.data?.proxies?.length === 0) throw new Error('节点为空');
    Mihomo_Rule_Data.data.proxies = [...(Mihomo_Rule_Data?.data?.proxies || []), ...Mihomo_Proxies_Data?.data?.proxies];
    Mihomo_Top_Data.data['proxy-providers'] = Mihomo_Proxies_Data?.data?.providers;
    applyTemplate(Mihomo_Top_Data.data, Mihomo_Rule_Data.data);
    return {
        status: Mihomo_Proxies_Data.status,
        headers: Mihomo_Proxies_Data.headers,
        data: JSON.stringify(Mihomo_Top_Data.data, null, 4)
    };
}
/**
 * 随机从多个订阅 URL 中获取其响应头中的 subscription-userinfo 信息
 * 如果只有一个 URL，直接返回其 subscription-userinfo
 * @param {string[]} urls - 订阅地址列表
 * @param {string} userAgent - 请求头中的 User-Agent 字段
 * @returns {Promise<{status: number, headers: Object, data: any}>} - 包含状态码、响应头和 subscription-userinfo 字符串
 */
export async function getMihomo_Proxies_Data(urls, userAgent, subapi) {
    let res
    if (urls.length === 1) {
        res = await fetchResponse(urls[0], userAgent);
        if (res?.data?.proxies && Array.isArray(res?.data?.proxies) && res?.data?.proxies?.length > 0) {
            res.data.proxies.forEach((p) => {
                p.udp = true; // 默认开启UDP
            });
            return {
                status: res.status,
                headers: res.headers,
                data: res.data
            };
        } else {
            const apiurl = buildApiUrl(urls[0], subapi, 'clash');
            res = await fetchResponse(apiurl, userAgent);
            if (res?.data?.proxies && Array.isArray(res?.data?.proxies) && res?.data?.proxies?.length > 0) {
                res.data.proxies.forEach((p) => {
                    p.udp = true; // 默认开启UDP
                });
                return {
                    status: res.status,
                    headers: res.headers,
                    data: res.data
                };
            }
        }
    } else {
        const proxies_list = [];
        const hesList = [];
        for (let i = 0; i < urls.length; i++) {
            let res = await fetchResponse(urls[i], userAgent);
            if (res?.data && Array.isArray(res?.data?.proxies)) {
                res.data.proxies.forEach((p) => {
                    p.name = `${p.name} [${i + 1}]`;
                    p.udp = true; // 默认开启UDP
                });
                hesList.push({
                    status: res.status,
                    headers: res.headers,
                });
                proxies_list.push(...res.data.proxies);
            } else {
                const apiurl = buildApiUrl(urls[i], subapi, 'clash');
                res = await fetchResponse(apiurl, userAgent);
                if (res?.data?.proxies && Array.isArray(res?.data?.proxies)) {
                    res.data.proxies.forEach((p) => {
                        p.name = `${p.name} [${i + 1}]`;
                        p.udp = true; // 默认开启UDP
                    });
                    hesList.push({
                        status: res.status,
                        headers: res.headers,
                    });
                    proxies_list.push(...res.data.proxies);
                }
            }
        }
        const randomIndex = Math.floor(Math.random() * hesList.length);
        const hes = hesList[randomIndex];
        const data = { providers: {}, proxies: proxies_list };
        return {
            status: hes.status,
            headers: hes.headers,
            data: data
        };
    }
}
/**
 * 将模板中的 proxies、proxy-groups、rules 等字段合并到目标配置对象
 * @param {Object} target - 目标配置对象（基础配置）
 * @param {Object} template - 模板配置对象
 */
export function applyTemplate(top, rule) {
    top.proxies = rule.proxies || [];
    top['proxy-groups'] = rule['proxy-groups'] || [];
    top.rules = rule.rules || [];
    top['sub-rules'] = rule['sub-rules'] || {};
    top['rule-providers'] = { ...(top['rule-providers'] || {}), ...(rule['rule-providers'] || {}) };
}