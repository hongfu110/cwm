import fetch from 'node-fetch';
import YAML from 'yaml';
export const backimg = 'https://t.alcy.cc/ycy';
export const subapi = 'https://url.v1.mk';
export const mihomo_top = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/Config/Mihomo_lite.yaml';
export const singbox_1_11 = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/refs/heads/main/Config/singbox_1.11.X.json';
export const singbox_1_12 = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/refs/heads/main/Config/singbox-1.12.X.json';
export const singbox_1_12_alpha = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/refs/heads/main/Config/singbox-1.12.X.alpha.json';
export const beiantext = base64DecodeUtf8('6JCMSUNQ5aSHMjAyNTAwMDHlj7c=');
export const beiandizi = atob('aHR0cHM6Ly90Lm1lL01hcmlzYV9rcmlzdGk=');
export function base64DecodeUtf8(base64) {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
}
// 订阅链接
export function buildApiUrl(rawUrl, BASE_API, ua) {
    const params = new URLSearchParams({
        target: ua,
        url: rawUrl,
        emoji: 'true',
        list: 'true',
        new_name: 'true'
    });
    return `${BASE_API}/sub?${params}`;
}
// 处理请求
export async function fetchResponse(url, userAgent) {
    if (!userAgent) {
        userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
    }
    let response;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': userAgent
            }
        });
    } catch {
        return true
    }
    // 直接使用 Object.fromEntries 转换 headers
    const headersObj = Object.fromEntries(response.headers.entries());
    // 替换非法 Content-Disposition 字段Add commentMore actions
    const sanitizedCD = sanitizeContentDisposition(response.headers);
    if (sanitizedCD) {
        headersObj["content-disposition"] = sanitizedCD;
    }
    // 获取响应体的文本内容
    const textData = await response.text();

    let jsonData;
    try {
        jsonData = YAML.parse(textData, { maxAliasCount: -1, merge: true });
    } catch (e) {

        try {
            jsonData = JSON.parse(textData);
        } catch (yamlError) {
            // 若YAML解析也失败，保留原始文本
            jsonData = textData;
        }
    }
    return {
        status: response.status,
        headers: headersObj,
        data: jsonData
    }
}
// 将订阅链接和代理地址分离
export function splitUrlsAndProxies(urls) {
    const result = [];
    let proxyText = '';

    for (const url of urls) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            result.push(url);
        } else {
            if (proxyText) {
                proxyText += '|';
            }
            proxyText += url;
        }
    }
    if (proxyText) {
        result.push(proxyText);
    }
    return result;
}
/**
 * 获取模板数据
 * @param {string} top - 模板文件地址
 * @returns {Promise<Object|null>} - 返回模板数据对象，或没有模板时返回 null
 */
export async function Top_Data(top) {
    return await fetchResponse(top);
}
/**
 * 获取基础配置数据，若未提供则使用默认配置地址
 * @param {string} rule - 配置文件地址
 * @returns {Promise<Object>} - 返回配置数据对象
 */
export async function Rule_Data(rule) {
    if (!rule) {
        throw new Error(`缺少规则模板`);
    }
    return await fetchResponse(rule);
}

// 获取伪装页面
export async function getFakePage(image, button_url, button_text, configdata, subapi) {
    return `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20id='Partition-Auto--Streamline-Carbon'%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20height='16'%20width='16'%3E%3Cdesc%3EPartition%20Auto%20Streamline%20Icon%3A%20https%3A//streamlinehq.com%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Cpath%20d='M13%209.5c-1.1028%200%20-2%200.8972%20-2%202%200%200.3418%200.0941%200.6587%200.24585%200.94045C10.30775%2013.12675%209.17285%2013.5%208%2013.5%204.9673%2013.5%202.5%2011.0327%202.5%208H1.5c0%203.584%202.9159%206.5%206.5%206.5%201.42275%200%202.79615%20-0.468%203.92165%20-1.3208C12.2334%2013.38015%2012.6023%2013.5%2013%2013.5c1.1028%200%202%20-0.8972%202%20-2s-0.8972%20-2%20-2%20-2Zm0%203c-0.5514%200%20-1%20-0.44875%20-1%20-1s0.4486%20-1%201%20-1%201%200.44875%201%201%20-0.4486%201%20-1%201Z'%20fill='%23000000'%20stroke-width='0.5'/%3E%3Cpath%20d='M8%201.5c-1.42275%200%20-2.79615%200.468%20-3.92165%201.3208C3.7666%202.61985%203.3977%202.5%203%202.5%201.8972%202.5%201%203.3972%201%204.5s0.8972%202%202%202%202%20-0.8972%202%20-2c0%20-0.3418%20-0.0941%20-0.6587%20-0.24585%20-0.94045C5.69225%202.87325%206.82715%202.5%208%202.5c3.0327%200%205.5%202.4673%205.5%205.5h1c0%20-3.584%20-2.9159%20-6.5%20-6.5%20-6.5ZM3%205.5c-0.5514%200%20-1%20-0.44875%20-1%20-1s0.4486%20-1%201%20-1%201%200.44875%201%201%20-0.4486%201%20-1%201Z'%20fill='%23000000'%20stroke-width='0.5'/%3E%3Cpath%20id='_Transparent_Rectangle_'%20d='M0%200h16v16H0Z'%20fill='none'%20stroke-width='0.5'/%3E%3C/svg%3E">
    <title>mihomo/singbox汇聚（订阅转换）工具</title>
    <style>
        :root {
            --primary-color: #4361ee;
            --hover-color: #3b4fd3;
            --bg-color: #f5f6fa;
            --card-bg: #ffffff;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-image: url(${image});
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-color: var(--bg-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            padding: 60px 0;
            align-items: center;
        }

        .container {
            position: relative;
            /* 使用rgba设置半透明背景 */
            background: rgba(255, 255, 255, 0.7);
            /* 添加磨砂玻璃效果 */
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            /* Safari兼容 */
            max-width: 600px;
            margin: 0;
            width: 90%;
            height: 90%;
            padding: 2rem;
            border-radius: 20px;
            /* 调整阴影效果增加通透感 */
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease;
        }

        /* 调整hover效果 */
        .container:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1),
                inset 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        h1 {
            text-align: center;
            color: var(--primary-color);
            margin-bottom: 2rem;
            font-size: 1.8rem;
        }

        .input-group {
            margin-bottom: 1.5rem;
        }

        .link-input {
            flex: 1; /* 占据剩余空间 */
            min-width: 0; /* 防止内容溢出 */
            margin-top: 0;
            padding: 12px;
            border: 2px solid rgba(0, 0, 0, 0.15);
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        .link-row {
            display: flex;
            align-items: center;
            position: relative;
            margin-bottom: 8px;
            gap: 10px;
        }

        /* 圆形添加按钮样式 */
        .add-btn {
            flex-shrink: 0; /* 防止按钮被压缩 */
            width: 40px;
            height: 40px;
            background-color: #f8f9fa;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .add-btn:hover {
            background-color: #ddd;
            /* 鼠标悬停效果 */
        }


        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }

        input {
            width: 100%;
            padding: 12px;
            /* 修改边框颜色从 #eee 到更深的颜色 */
            border: 2px solid rgba(0, 0, 0, 0.15);
            /* 使用rgba实现更自然的深度 */
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            /* 添加轻微的内阴影增强边框效果 */
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        input:focus {
            outline: none;
            border-color: var(--primary-color);
            /* 增强focus状态下的阴影效果 */
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15),
                inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 1.5rem;
        }

        button:hover {
            background-color: var(--hover-color);
            transform: translateY(-2px);
        }

        button:active {
            transform: translateY(0);
        }

        #result {
            background-color: #f8f9fa;
            font-family: monospace;
            word-break: break-all;
        }

        .github-corner svg {
            fill: var(--primary-color);
            color: var(--card-bg);
            position: absolute;
            top: 0;
            right: 0;
            border: 0;
            width: 80px;
            height: 80px;
        }

        .github-corner:hover .octo-arm {
            animation: octocat-wave 560ms ease-in-out;
        }

        @keyframes octocat-wave {

            0%,
            100% {
                transform: rotate(0)
            }

            20%,
            60% {
                transform: rotate(-25deg)
            }

            40%,
            80% {
                transform: rotate(10deg)
            }
        }

        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .logo-title {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2rem;
        }

        .logo-title img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            position: relative;
            z-index: 1;
            background: var(--card-bg);
            box-shadow: 0 0 15px rgba(67, 97, 238, 0.1);
        }


        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .logo-title h1 {
            margin-bottom: 0;
            text-align: center;
        }

        @media (max-width: 480px) {
            .container {
                padding: 1.5rem;
            }

            h1 {
                font-size: 1.5rem;
            }

            .github-corner:hover .octo-arm {
                animation: none;
            }

            .github-corner .octo-arm {
                animation: octocat-wave 560ms ease-in-out;
            }
        }

        .beian-info {
            text-align: center;
            font-size: 13px;
        }

        .beian-info a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px dashed var(--primary-color);
            padding-bottom: 2px;
        }

        .beian-info a:hover {
            border-bottom-style: solid;
        }

        #qrcode {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
        }
        
        /* 新增模板选择器样式 - 单展开面板版本 */
        .template-selector {
            position: relative;
            margin-bottom: 1.5rem;
        }
        
        .template-toggle {
            padding: 12px 15px;
            background-color: rgba(67, 97, 238, 0.1);
            font-weight: bold;
            cursor: pointer;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.2s;
        }
        
        .template-toggle:hover {
            background-color: rgba(67, 97, 238, 0.2);
        }
        
        .template-toggle:after {
            content: "▶"; /* 改为向右箭头 */
            font-size: 12px;
            transition: transform 0.3s;
            margin-left: 8px; /* 增加间距 */
        }
        
        .template-toggle.collapsed:after {
            transform: rotate(90deg);
        }
        
        .template-options {
            position: absolute;
            top: 100%; /* 紧贴 toggle 下面 */
            left: 0;
            width: 100%;
            z-index: 10;
            background-color: white;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: none;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .template-options.show {
            display: block;
        }
        
        .template-option {
            padding: 10px 20px;
            cursor: pointer;
            transition: all 0.2s;
            border-bottom: 1px solid #eee;
        }
        
        .template-option:last-child {
            border-bottom: none;
        }
        
        .template-option:hover {
            background-color: rgba(67, 97, 238, 0.1);
        }
        
        .template-option.selected {
            background-color: rgba(67, 97, 238, 0.2);
            font-weight: bold;
        }
        
        // .template-url {
        //     width: 100%;
        //     padding: 12px;
        //     border: 2px solid rgba(0, 0, 0, 0.15);
        //     border-radius: 10px;
        //     font-size: 1rem;
        //     background-color: #f8f9fa;
        //     color: #666;
        //     cursor: not-allowed;
        //     margin-top: 10px;
        // }
        /* Add new styles for the toggle switch */
        .config-toggle {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            background: rgba(67, 97, 238, 0.1);
            border-radius: 10px;
            padding: 8px;
        }

        .toggle-option {
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            text-align: center;
            flex: 1;
        }

        .toggle-option.active {
            background-color: #4361ee;
            color: white;
        }

        .toggle-option:not(.active):hover {
            background-color: rgba(67, 97, 238, 0.2);
        }

        .singbox-options {
            display: none;
        }

        .singbox-mode .singbox-options {
            display: block;
        }

        .singbox-mode .mihomo-options {
            display: none;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>

<body>
    <a href="${atob('aHR0cHM6Ly9naXRodWIuY29tL0t3aXNtYS9jZi13b3JrZXItbWlob21v')}" target="_blank" class="github-corner"
        aria-label="View source on Github">
        <svg viewBox="0 0 250 250" aria-hidden="true">
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
            <path
                d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
                fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
            <path
                d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
                fill="currentColor" class="octo-body"></path>
        </svg>
    </a>
    <div class="container">
        <div class="logo-title">
            <h1>mihomo/singbox汇聚（订阅转换）工具</h1>
        </div>
        <div class="config-toggle">
            <div class="toggle-option active" data-mode="mihomo">Clash (mihomo)</div>
            <div class="toggle-option" data-mode="singbox">Singbox</div>
        </div>
        <div class="mihomo-options">
            <div class="template-selector">
                <div class="template-toggle collapsed">选择配置模板（未选择）</div>
                <div class="template-options">
                    <!-- 模板选项将通过JavaScript填充 -->
                </div>
            </div>

            <div class="input-group">
                <label for="link">订阅链接</label>
                <div id="link-container">
                    <div class="link-row">
                        <input type="text" class="link-input"/>
                        <div class="add-btn" onclick="addLinkInput(this)">➕</div>
                    </div>
                </div>
            </div>

            <button onclick="generateLink()">生成mihomo配置</button>
        </div>

        <div class="singbox-options">
            <div class="template-selector">
                <div class="template-toggle collapsed">选择配置模板（未选择）</div>
                <div class="template-options">
                    <!-- 模板选项将通过JavaScript填充 -->
                </div>
            </div>
            <div class="input-group">
                <label for="link">订阅链接</label>
                <div id="link-container-singbox">
                    <div class="link-row">
                        <input type="text" class="link-input"/>
                        <div class="add-btn" onclick="addLinkInput(this, 'singbox')">➕</div>
                    </div>
                </div>
            </div>

            <button onclick="generateSingboxLink()">生成Singbox配置</button>
        </div>


        <div class="input-group">
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <span>转换后端：${subapi}</span>
                <label for="result">订阅地址：</label>
            </div>
            <input type="text" id="result" readonly onclick="copyToClipboard()">
            <label id="qrcode" style="margin: 15px 10px -15px 10px;"></label>
        </div>
        <div class="beian-info" style="text-align: center; font-size: 13px;">
            <a href='${button_url}'>${button_text}</a>
        </div>
    </div>

    <script>
        function copyToClipboard() {
            const resultInput = document.getElementById('result');
            if (!resultInput.value) {
                return;
            }

            resultInput.select();
            navigator.clipboard.writeText(resultInput.value).then(() => {
                const tooltip = document.createElement('div');
                tooltip.style.position = 'fixed';
                tooltip.style.left = '50%';
                tooltip.style.top = '20px';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.padding = '8px 16px';
                tooltip.style.background = '#4361ee';
                tooltip.style.color = 'white';
                tooltip.style.borderRadius = '4px';
                tooltip.style.zIndex = '1000';
                tooltip.textContent = '已复制到剪贴板';

                document.body.appendChild(tooltip);

                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 2000);
            }).catch(err => {
                alert('复制失败，请手动复制');
            });
        }

        // 动态设置输入框的placeholder，根据当前模式
        function setPlaceholderForMode(input, mode = 'mihomo') {
            input.placeholder = mode === 'singbox' 
                ? '请输入singbox订阅地址url，支持单节点' 
                : '请输入clash订阅地址url，支持单节点';
        }

        // 初始化所有输入框的placeholder
        function initializePlaceholders(mode) {
            const selector = mode === 'singbox' 
                ? '.singbox-options .link-input' 
                : '.mihomo-options .link-input';
    
            document.querySelectorAll(selector).forEach(input => {
                setPlaceholderForMode(input, mode);
            });
        }
        // 修改addLinkInput以支持singbox容器
        function addLinkInput(button, mode = 'mihomo') {
            const containerId = mode === 'singbox' ? 'link-container-singbox' : 'link-container';
            const container = document.getElementById(containerId);
            const row = document.createElement('div');
            row.className = 'link-row';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'link-input';
            setPlaceholderForMode(input, mode);

            button.style.display = 'none';
            row.appendChild(input);
            container.appendChild(row);

            const btn = document.createElement('div');
            btn.className = 'add-btn';
            btn.textContent = '➕';
            btn.onclick = function () {
                addLinkInput(btn, mode);
            };

            row.appendChild(btn);
        }

        // 在mihomo和singbox模式之间切换
        document.addEventListener('DOMContentLoaded', function () {
            const toggleOptions = document.querySelectorAll('.toggle-option');
            const container = document.querySelector('.container');

            // 设置默认模式为mihomo
            const defaultMode = 'mihomo';
            document.querySelector(\`.toggle-option[data-mode="\${defaultMode}"]\`).classList.add('active');
            initializePlaceholders(defaultMode);
            toggleOptions.forEach(option => {
                option.addEventListener('click', function () {
                    // 设置活动状态
                    toggleOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                    // 切换模式
                    const newMode = this.dataset.mode;
                    if (this.dataset.mode === 'singbox') {
                        container.classList.add('singbox-mode');
                    } else {
                        container.classList.remove('singbox-mode');
                    }
                   // 初始化新模式的placeholder
                   initializePlaceholders(newMode);
                });
            });

            // 初始化模板选择器
            initTemplateSelector('mihomo');
            initTemplateSelector('singbox');
        });
        // 初始化模板选择器
        function initTemplateSelector(mode = 'mihomo') {
            const selectorClass = mode === 'singbox' ? '.singbox-options .template-selector' : '.mihomo-options .template-selector';
            const templateToggle = document.querySelector(\`\${selectorClass} .template-toggle\`);
            const optionsContainer = document.querySelector(\`\${selectorClass} .template-options\`);
            const configs = ${configdata}
            // 生成所有模板选项
            configs[mode].forEach(group => {
                // 添加分组标签
                const groupLabel = document.createElement('div');
                groupLabel.style.padding = '10px 20px';
                groupLabel.style.fontWeight = 'bold';
                groupLabel.style.color = '#555';
                groupLabel.style.backgroundColor = '#f5f5f5';
                groupLabel.textContent = group.label;
                optionsContainer.appendChild(groupLabel);

                // 添加选项
                group.options.forEach(option => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'template-option';
                    optionElement.textContent = option.label;
                    optionElement.dataset.value = option.value;
                    optionElement.dataset.group = group.label;

                    optionElement.addEventListener('click', function () {
                        // 移除之前选中的样式
                        document.querySelectorAll(\`\${selectorClass} .template-option.selected\`).forEach(item => {
                            item.classList.remove('selected');
                        });

                        // 更新显示文本
                        templateToggle.textContent = \`\${group.label}-\${option.label}\`;

                        // 添加选中样式
                        this.classList.add('selected');

                        // 点击后自动折叠选项面板
                        templateToggle.classList.add('collapsed');
                        optionsContainer.classList.remove('show');
                    });

                    optionsContainer.appendChild(optionElement);
                });
            });

            // 默认选择第一个选项
            const firstOption = document.querySelector(\`\${selectorClass} .template-option\`);
            if (firstOption) {
                firstOption.classList.add('selected');
                const groupLabel = firstOption.dataset.group;
                const optionLabel = firstOption.textContent;
                templateToggle.textContent = \`请选择配置模板（默认-\${groupLabel}）\`;
                // templateToggle.textContent = \`请选择配置模板（\${groupLabel}-\${firstOption.textContent}）\`;
            }

            // 点击切换按钮展开/折叠选项
            templateToggle.addEventListener('click', function () {
                this.classList.toggle('collapsed');
                optionsContainer.classList.toggle('show');
            });

            // 点击页面其他区域关闭选项面板
            document.addEventListener('click', function (event) {
                if (!templateToggle.contains(event.target) && !optionsContainer.contains(event.target)) {
                    templateToggle.classList.add('collapsed');
                    optionsContainer.classList.remove('show');
                }
            });
        }

        // 生成mihomo链接
        function generateLink() {
            const inputs = document.querySelectorAll('.mihomo-options .link-input');
            const selectedOption = document.querySelector('.template-option.selected');

            const subscriptionLinks = Array.from(inputs)
                .map(input => input.value.trim())
                .filter(val => val !== '');

            const templateLink = selectedOption ? selectedOption.dataset.value : '';

            if (subscriptionLinks.length === 0 && templateLink) {
                alert('请输入至少一个订阅链接');
                return;
            }

            const allLinks = [];
            if (templateLink) {
                allLinks.push(\`template=\${encodeURIComponent(templateLink)}\`);
            }

            subscriptionLinks.forEach(link => {
                allLinks.push(\`url=\${encodeURIComponent(link)}\`);
            });

            const origin = window.location.origin;
            const urlLink = \`\${origin}/?\${allLinks.join('&')}\`;
            updateResult(urlLink);
        }
        // 生成singbox链接
        function generateSingboxLink() {
            const inputs = document.querySelectorAll('.singbox-options .link-input');
            const selectedOption = document.querySelector('.singbox-options .template-option.selected');
            const subscriptionLinks = Array.from(inputs)
                .map(input => input.value.trim())
                .filter(val => val !== '');

            const templateLink = selectedOption ? selectedOption.dataset.value : '';

            if (subscriptionLinks.length === 0 && templateLink) {
                alert('请输入至少一个订阅链接');
                return;
            }

            const allLinks = [];
            if (templateLink) {
                allLinks.push(\`template=\${encodeURIComponent(templateLink)}\`);
            }

            subscriptionLinks.forEach(link => {
                allLinks.push(\`url=\${encodeURIComponent(link)}\`);
            });

            const origin = window.location.origin;
            const urlLink = \`\${origin}/?\${allLinks.join('&')}&singbox=true\`;
            updateResult(urlLink);
        }
        // 更新结果和二维码
        function updateResult(urlLink) {
            document.getElementById('result').value = urlLink;

            // 生成二维码
            const qrcodeDiv = document.getElementById('qrcode');
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: urlLink,
                width: 220,
                height: 220,
                colorDark: "#4a60ea",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L,
                scale: 1
            });
        }
    </script>
</body>

</html>    `;
}

export function configs() {
    const data = {
        mihomo: [
            {
                label: "通用",
                options: [
                    {
                        label: "默认（精简版）（仅国内外分流）[秋风_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default.yaml"
                    },
                    {
                        label: "默认（精简版）（仅国内外分流）[Dustinwin_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_Ads_Dustinwin.yaml"
                    },
                    {
                        label: "默认（精简版）（无去广告）",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_NoAds.yaml"
                    },
                    {
                        label: "默认（全分组）[秋风_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_full.yaml"
                    },
                    {
                        label: "默认（全分组）[Dustinwin_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_full_Ads_Dustinwin.yaml"
                    },
                    {
                        label: "默认（全分组）（无去广告）",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_full_NoAds.yaml"
                    }
                ]
            },
            {
                label: "Mihomo-Party-ACL4SSR",
                options: [
                    {
                        label: "ACL4SSR_Online_Full 全包重度用户使用（与Github同步）",
                        value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full.yaml"
                    },
                    {
                        label: "ACL4SSR_Online_Full_AdblockPlus 全包重度用户使用更多去广告（与Github同步）",
                        value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_AdblockPlus.yaml"
                    },
                    {
                        label: "ACL4SSR_Online_Full_Tiktok 全包重度用户使用抖音全量（与Github同步）",
                        value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_Tiktok.yaml"
                    },
                    {
                        label: "ACL4SSR_Online_Full_WithIcon 全包重度用户使用（与Github同步）（无图标）",
                        value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_WithIcon.yaml"
                    },
                    {
                        label: "ACL4SSR_Online_Mini_MultiMode 专业版自动测速、故障转移、负载均衡（与Github同步）",
                        value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Mini_MultiMode.yaml"
                    },
                    {
                        label: "极简分流规则",
                        value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/极简分流规则.yaml"
                    }
                ]
            },
            {
                label: "网络收集",
                options: [
                    {
                        label: "布丁狗的订阅转换 (与Github同步)",
                        value: "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/%E5%B8%83%E4%B8%81%E7%8B%97%E7%9A%84%E8%AE%A2%E9%98%85%E8%BD%AC%E6%8D%A2.yaml"
                    },
                    {
                        label: "6D 自用模板 ",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_6D_自用模板.yaml"
                    },
                    {
                        label: "ACL4SSR_Online_Full 全分组版 (与Github同步)",
                        value: "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/ACL4SSR_Online_Full.yaml"
                    },
                    {
                        label: "ACL4SSR_Online_Full_WithIcon 全分组版 (与Github同步) (无图标)",
                        value: "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/ACL4SSR_Online_Full_WithIcon.yaml"
                    },
                ]
            },
            {
                label: "Lanlan13-14",
                options: [
                    {
                        label: "configfull 全分组版 (与Github同步)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull.yaml"
                    },
                    {
                        label: "configfull_NoAd 全分组版 (与Github同步) (无去广告)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd.yaml"
                    },
                    {
                        label: "configfull_NoAd_Stash 全分组版 (与Github同步) (无去广告) (Stash)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd_Stash.yaml"
                    },
                    {
                        label: "configfull_NoAd_Stash_lite 全分组版 (与Github同步) (无去广告) (精简版) (Stash)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd_Stash_lite.yaml"
                    },
                    {
                        label: "configfull_NoAd_lite 全分组版 (与Github同步) (无去广告) (精简版)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd_lite.yaml"
                    },
                    {
                        label: "configfull_Stash 全分组版 (与Github同步) (Stash)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_Stash.yaml"
                    },
                    {
                        label: "configfull_Stash_lite 全分组版 (与Github同步) (精简版) (Stash)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_Stash_lite.yaml"
                    },
                    {
                        label: "configfull_lite 全分组版 (与Github同步) (精简版)",
                        value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_lite.yaml"
                    },
                ]
            },
        ],
        singbox: [
            {
                label: "通用",
                options: [
                    {
                        label: "默认（精简版）[秋风_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_default.yaml"
                    },
                    {
                        label: "默认（mini版）[geo_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_default_mini.yaml"
                    },
                    {
                        label: "默认（mini版）[DustinWin_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_default_mini_Ads_DustinWin.yaml"
                    },
                    {
                        label: "默认（全分组）[秋风_ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_default_full.yaml"
                    },
                    {
                        label: "DustinWin 全分组版[ads]",
                        value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_DustinWin_full.yaml"
                    }
                ]
            }
        ]
    }
    return JSON.stringify(data)
}

export function sanitizeContentDisposition(headers) {
    const contentDisposition = headers.get("Content-Disposition") || headers.get("content-disposition");

    if (!contentDisposition) return null;

    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

    if (!filenameMatch) return null;

    const originalFilename = filenameMatch[1];

    // 检查是否含中文（或非 ASCII）
    const isNonAscii = /[^\x00-\x7F]/.test(originalFilename);
    if (!isNonAscii) return contentDisposition; // 不含中文，保持原样

    // 使用 fallback ASCII 名 + filename*=UTF-8''xxx 形式替换
    const fallback = "download.json";
    const encoded = encodeURIComponent(originalFilename);

    return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
