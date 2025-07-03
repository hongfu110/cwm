import { splitUrlsAndProxies, Top_Data, Rule_Data, fetchResponse, buildApiUrl } from './utils.js';
export async function getsingbox_config(urls, rule, top_default, userAgent, subapi) {
    let top, matched = false;
    if (/singbox|sing-box|sfa/i.test(userAgent)) {
        const alphaMatch = userAgent.match(/1\.12\.0\-alpha\.(\d{1,2})\b/);
        const betaMatch = userAgent.match(/1\.12\.0\-beta\.(\d{1,2})\b/);
        const v111Match = userAgent.match(/1\.11\.\d+/);
        const v112Match = userAgent.match(/1\.12\.(\d+)/);
        // 匹配 1.12 alpha 版本
        if (alphaMatch && !matched) {
            const num = parseInt(alphaMatch[1], 10);
            if (num >= 0 && num <= 23) {
                top = top_default.singbox_1_12_alpha;
                matched = true;
            }
        }
        // 匹配 1.11 中的 1.12 beta 版本
        if (betaMatch && !matched) {
            const num = parseInt(betaMatch[1], 10);
            if (num >= 0 && num <= 9) {
                top = top_default.singbox_1_11;
                matched = true;
            }
        }
        // 匹配 1.11.x 版本
        if (v111Match && !matched) {
            top = top_default.singbox_1_11;
            matched = true;
        }
        // 匹配 1.12.x 版本
        if (v112Match && !matched) {
            top = top_default.singbox_1_12;
            matched = true;
        }
        if (!matched) {
            throw new Error(`不支持的 Singbox 版本：${userAgent}`);
        }
    } else {
        throw new Error('不支持的客户端');
    }

    urls = splitUrlsAndProxies(urls)
    const [Singbox_Top_Data, Singbox_Rule_Data, Singbox_Outbounds_Data] = await Promise.all([
        Top_Data(top),
        Rule_Data(rule),
        getSingbox_Outbounds_Data(urls, subapi, userAgent)
    ]);

    if (!Singbox_Outbounds_Data?.data?.outbounds || Singbox_Outbounds_Data?.data?.outbounds?.length === 0 || typeof Singbox_Outbounds_Data?.data?.outbounds === 'object' && !Array.isArray(Singbox_Outbounds_Data?.data?.outbounds) && Object.keys(Singbox_Outbounds_Data?.data?.outbounds).length === 0) throw new Error(`节点为空，请使用有效订阅`);
    Singbox_Outbounds_Data.data.outbounds = outboundArrs(Singbox_Outbounds_Data.data);
    const ApiUrlname = [];
    Singbox_Outbounds_Data.data.outbounds.forEach((res) => {
        ApiUrlname.push(res.tag);
    });
    // 策略组处理
    Singbox_Rule_Data.data.outbounds = loadAndSetOutbounds(Singbox_Rule_Data.data.outbounds, ApiUrlname);
    // 合并 outbounds
    Singbox_Rule_Data.data.outbounds.push(...Singbox_Outbounds_Data.data.outbounds);
    // 应用模板
    applyTemplate(Singbox_Top_Data.data, Singbox_Rule_Data.data);

    return {
        status: Singbox_Outbounds_Data.status,
        headers: Singbox_Outbounds_Data.headers,
        data: JSON.stringify(Singbox_Top_Data.data, null, 4)
    };
}
/**
 * 加载多个配置 URL，对其 outbounds 进行合并处理。
 * 对第一个配置不添加 tag 后缀，其余的添加 `[序号]`。
 *
 * @param {string[]} urls - 配置地址数组
 * @param {string} sub - 用于构建备用 API 请求的参数
 * @param {string} userAgent - 用户代理字符串，用于请求头
 * @returns {Promise<Object>} 包含合并后的 outbounds、状态码与响应头
 */
export async function getSingbox_Outbounds_Data(urls, subapi, userAgent) {
    let res;
    if (urls.length === 1) {
        res = await fetchResponse(urls[0], userAgent);
        if (res?.data?.outbounds && Array.isArray(res?.data?.outbounds) && res?.data?.outbounds?.length > 0) {
            return {
                status: res.status,
                headers: res.headers,
                data: res.data
            };
        } else {
            const apiurl = buildApiUrl(urls[0], subapi, 'singbox');
            res = await fetchResponse(apiurl, userAgent);
            return {
                status: res.status,
                headers: res.headers,
                data: res.data
            };
        }
    } else {
        const outbounds_list = [];
        const hesList = [];
        let res
        for (let i = 0; i < urls.length; i++) {
            res = await fetchResponse(urls[i], userAgent);
            if (res?.data && Array.isArray(res?.data?.outbounds)) {
                res.data.outbounds.forEach((p) => {
                    p.tag = `${p.tag} [${i + 1}]`;
                });
                hesList.push({
                    status: res.status,
                    headers: res.headers,
                });
                outbounds_list.push(res.data.outbounds);
            } else {
                const apiurl = buildApiUrl(urls[i], subapi, 'singbox');
                res = await fetchResponse(apiurl, userAgent);
                if (res?.data?.outbounds && Array.isArray(res?.data?.outbounds)) {
                    res.data.outbounds.forEach((p) => {
                        p.tag = `${p.tag} [${i + 1}]`;
                    });
                    hesList.push({
                        status: res.status,
                        headers: res.headers,
                    });
                    outbounds_list.push(res.data.outbounds);
                }
            }
        }
        const randomIndex = Math.floor(Math.random() * hesList.length);
        const hes = hesList[randomIndex];
        const data = { outbounds: outbounds_list.flat() };
        return {
            status: hes.status,
            headers: hes.headers,
            data: data
        };
    }
}
/**
 * 处理配置文件中的 outbounds 数组：
 * 1. 先排除特定类型（如 direct、dns 等）；
 * 2. 根据参数决定是否为 tag 添加序号后缀；
 *
 * @param {Object} data - 包含 outbounds 数组的配置对象
 * @returns {Array<Object>} 处理后的 outbounds 数组
 */
export function outboundArrs(data) {
    const excludedTypes = ['direct', 'block', 'dns', 'selector', 'urltest'];
    if (data && Array.isArray(data.outbounds)) {
        const filteredOutbounds = data.outbounds.filter(outbound => {
            if (excludedTypes.includes(outbound.type)) return false;
            if (outbound?.server === '') return false;
            if (outbound?.server_port < 1) return false;
            if (outbound?.password === '') return false;
            return true;
        });
        return filteredOutbounds;
    }
}
// 策略组处理
export function loadAndSetOutbounds(Outbounds, ApiUrlname) {
    Outbounds.forEach(res => {
        // 从完整 outbound 名称开始匹配
        let matchedOutbounds;
        let hasValidAction = false;
        res.filter?.forEach(ac => {
            // 转换为 RegExp 对象
            const keywordReg = new RegExp(ac.keywords) || '';
            if (ac.action === 'include') {
                // 只保留匹配的
                matchedOutbounds = ApiUrlname.filter(name => keywordReg.test(name));
                hasValidAction = true;
            } else if (ac.action === 'exclude') {
                // 移除匹配的
                matchedOutbounds = ApiUrlname.filter(name => !keywordReg.test(name));
                hasValidAction = true
            } else if (ac.action === 'all') {
                // 全部保留
                matchedOutbounds = ApiUrlname;
                hasValidAction = true;
            }
        });
        if (hasValidAction) {
            // 写入去重后的 outbounds
            res.outbounds = [...res.outbounds, ...new Set(matchedOutbounds)];
        } else if (res.outbounds !== null) {
            // 没有有效操作，但原始 outbounds 存在，保留原值
            matchedOutbounds = res.outbounds;
        } else {
            // 无有效操作，且原始 outbounds 不存在，删除该字段（不写入）
            delete res.outbounds;
        }
        // 删除 filter 字段
        delete res.filter;
        return res;
    });
    // 找出被删除的策略组 tags（即 outbounds 为空的 selector）
    const removedTags = Outbounds
        .filter(item => Array.isArray(item.outbounds) && item.outbounds.length === 0)
        .map(item => item.tag);
    // 过滤掉引用了已删除 tag 的其他 outbounds 项
    const cleanedOutbounds = Outbounds.map(item => {
        if (Array.isArray(item.outbounds)) {
            item.outbounds = item.outbounds.filter(tag => !removedTags.includes(tag));
        }
        return item;
    });

    // 再次过滤掉 outbounds 数组为空的策略组
    const filteredOutbounds = cleanedOutbounds.filter(item => {
        return !(Array.isArray(item.outbounds) && item.outbounds.length === 0);
    });
    return filteredOutbounds
}
export function applyTemplate(top, rule) {
    const existingSet = Array.isArray(top.route.rule_set) ? top.route.rule_set : [];
    const newSet = Array.isArray(rule.route.rule_set) ? rule.route.rule_set : [];
    const mergedMap = new Map();
    for (const item of existingSet) {
        if (item?.tag) mergedMap.set(item.tag, item);
    }
    for (const item of newSet) {
        if (item?.tag) mergedMap.set(item.tag, item);
    }
    top.inbounds = rule?.inbounds || top.inbounds;
    top.outbounds = [...(Array.isArray(top.outbounds) ? top.outbounds : []), ...(Array.isArray(rule?.outbounds) ? rule.outbounds : [])];
    top.route.final = rule?.route?.final || top.route.final;
    top.route.rules = [...(Array.isArray(top.route.rules) ? top.route.rules : []), ...(Array.isArray(rule?.route?.rules) ? rule.route.rules : [])];
    top.route.rule_set = Array.from(mergedMap.values());
}