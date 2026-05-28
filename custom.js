/**
 * TokenLab Docs - Custom Auth Input Injection
 * 在 Mintlify Playground 上方注入 Authorization 输入框
 */
(function() {
  'use strict';

  const AUTH_STORAGE_KEY = 'tokenlab-api-key';
  const DOC_LOCALES = new Set([
    'en', 'zh', 'zh-Hant', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ar', 'vi', 'id', 'tr'
  ]);
  const RTL_LOCALES = new Set(['ar']);

  function syncDocumentLang() {
    const path = window.location.pathname.replace(/^\/+/, '');
    const locale = path.split('/')[0];
    const resolvedLocale = DOC_LOCALES.has(locale) ? locale : 'en';
    document.documentElement.lang = resolvedLocale;
    document.documentElement.dir = RTL_LOCALES.has(resolvedLocale) ? 'rtl' : 'ltr';
  }

  function redirectApiShadowPaths() {
    const { pathname, search, hash } = window.location;
    if (
      pathname === '/v1' ||
      pathname.startsWith('/v1/') ||
      pathname === '/v1beta' ||
      pathname.startsWith('/v1beta/')
    ) {
      window.location.replace(`https://api.tokenlab.sh${pathname}${search}${hash}`);
      return true;
    }
    return false;
  }

  function attachRouteObservers() {
    const wrapHistory = (methodName) => {
      const original = history[methodName];
      history[methodName] = function(...args) {
        const result = original.apply(this, args);
        setTimeout(() => {
          if (!redirectApiShadowPaths()) {
            syncDocumentLang();
          }
        }, 0);
        return result;
      };
    };

    wrapHistory('pushState');
    wrapHistory('replaceState');
    window.addEventListener('popstate', () => {
      if (!redirectApiShadowPaths()) {
        syncDocumentLang();
      }
    });
  }

  if (redirectApiShadowPaths()) {
    return;
  }

  syncDocumentLang();
  attachRouteObservers();

  // 从 localStorage 读取保存的 API Key
  function getSavedApiKey() {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  // 保存 API Key 到 localStorage
  function saveApiKey(key) {
    try {
      if (key) {
        localStorage.setItem(AUTH_STORAGE_KEY, key);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      // ignore
    }
  }

  // 使用安全的 DOM 方法创建元素
  function createElement(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.setAttribute(key, value);
        }
      });
    }
    if (children) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child) {
          el.appendChild(child);
        }
      });
    }
    return el;
  }

  // 创建 Auth 输入框
  function createAuthInput() {
    const savedKey = getSavedApiKey();

    // 容器
    const container = createElement('div', { id: 'tokenlab-auth-input' });

    // 内部包装
    const wrapper = createElement('div', {
      style: {
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        marginBottom: '16px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }
    });

    // 标题行
    const titleRow = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }
    }, [
      createElement('span', { style: { fontSize: '16px' } }, ['🔑']),
      createElement('label', {
        style: { fontWeight: '600', fontSize: '14px', color: '#495057' }
      }, ['Authorization']),
      createElement('span', {
        style: {
          fontSize: '11px',
          background: '#dc3545',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: '500'
        }
      }, ['required'])
    ]);

    // 输入行
    const inputRow = createElement('div', {
      style: { display: 'flex', gap: '8px' }
    });

    // API Key 输入框
    const input = createElement('input', {
      type: 'password',
      id: 'tokenlab-api-key-input',
      placeholder: 'sk-your-api-key',
      value: savedKey,
      style: {
        flex: '1',
        padding: '10px 12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: "'Monaco', 'Menlo', monospace",
        outline: 'none'
      },
      onfocus: function() {
        this.style.borderColor = '#7C3AED';
        this.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
      },
      onblur: function() {
        this.style.borderColor = '#ced4da';
        this.style.boxShadow = 'none';
      },
      oninput: function(e) {
        saveApiKey(e.target.value);
      }
    });

    // 显示/隐藏按钮
    const toggleBtn = createElement('button', {
      id: 'tokenlab-toggle-visibility',
      title: 'Show/Hide API Key',
      style: {
        padding: '10px 12px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px'
      },
      onmouseover: function() { this.style.background = '#5a6268'; },
      onmouseout: function() { this.style.background = '#6c757d'; },
      onclick: function() {
        if (input.type === 'password') {
          input.type = 'text';
          this.textContent = '🙈';
        } else {
          input.type = 'password';
          this.textContent = '👁';
        }
      }
    }, ['👁']);

    inputRow.appendChild(input);
    inputRow.appendChild(toggleBtn);

    // 底部提示
    const footer = createElement('div', {
      style: { marginTop: '8px', fontSize: '12px', color: '#6c757d' }
    }, [
      'Get your API key from ',
      createElement('a', {
        href: 'https://tokenlab.sh/dashboard',
        target: '_blank',
        style: { color: '#7C3AED', textDecoration: 'none' }
      }, ['Dashboard →']),
      createElement('span', { style: { marginLeft: '12px' } }, ['💾 Auto-saved in browser'])
    ]);

    wrapper.appendChild(titleRow);
    wrapper.appendChild(inputRow);
    wrapper.appendChild(footer);
    container.appendChild(wrapper);

    return container;
  }

  // 注入 Auth 输入框到 Playground
  function injectAuthInput() {
    // 检查是否已注入
    if (document.getElementById('tokenlab-auth-input')) {
      return;
    }

    // 查找 Playground 容器 - 尝试多种选择器
    const selectors = [
      '[data-testid="playground"]',
      '[class*="PlaygroundContainer"]',
      '[class*="playground-container"]',
      '[class*="Playground_"]',
    ];

    let playground = null;
    for (const selector of selectors) {
      playground = document.querySelector(selector);
      if (playground) break;
    }

    // 备选：查找包含 "Send" 按钮的容器
    if (!playground) {
      const sendButton = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent && btn.textContent.trim() === 'Send'
      );
      if (sendButton) {
        // 向上查找合适的容器
        playground = sendButton.closest('[class*="playground"]') ||
                     sendButton.closest('[class*="Playground"]') ||
                     sendButton.parentElement;
        // 继续向上找到更合适的容器
        let parent = playground;
        for (let i = 0; i < 5 && parent; i++) {
          if (parent.querySelector('input') || parent.querySelector('button')) {
            playground = parent;
          }
          parent = parent.parentElement;
        }
      }
    }

    if (playground) {
      const authInput = createAuthInput();

      // 在 playground 顶部插入
      const firstChild = playground.firstElementChild;
      if (firstChild) {
        playground.insertBefore(authInput, firstChild);
      } else {
        playground.prepend(authInput);
      }

      // 拦截请求
      interceptPlaygroundRequests();
      console.log('[TokenLab] Auth input injected successfully');
    }
  }

  // 拦截 Playground 的 fetch 请求，注入 Authorization header
  function interceptPlaygroundRequests() {
    if (window._tokenlabFetchIntercepted) return;
    window._tokenlabFetchIntercepted = true;

    const originalFetch = window.fetch;

    window.fetch = function(url, options) {
      options = options || {};
      const apiKey = document.getElementById('tokenlab-api-key-input');
      const apiKeyValue = apiKey ? apiKey.value : '';

      // 检查是否是发往 TokenLab API 的请求
      if (apiKeyValue && typeof url === 'string' &&
          (url.includes('api.tokenlab.sh') || url.includes('api.lemondata.cc'))) {

        // 确保 headers 是普通对象
        let headers = options.headers || {};
        if (headers instanceof Headers) {
          const headersObj = {};
          headers.forEach(function(value, key) {
            headersObj[key] = value;
          });
          headers = headersObj;
        }

        // 注入 Authorization header
        if (!headers['Authorization'] && !headers['authorization']) {
          headers['Authorization'] = 'Bearer ' + apiKeyValue;
          options.headers = headers;
          console.log('[TokenLab] Authorization header injected');
        }
      }

      return originalFetch.call(this, url, options);
    };
  }

  // 使用 MutationObserver 监听 DOM 变化
  function observeDOM() {
    const observer = new MutationObserver(function() {
      // 检查是否在 API Reference 页面
      if (window.location.pathname.includes('api-reference')) {
        injectAuthInput();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 初始检查
    if (document.readyState === 'complete') {
      setTimeout(injectAuthInput, 500);
    } else {
      window.addEventListener('load', function() {
        setTimeout(injectAuthInput, 500);
      });
    }
  }

  // 页面导航时重新注入（SPA 支持）
  function handleNavigation() {
    let lastPath = window.location.pathname;

    setInterval(function() {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        // 移除旧的注入
        const oldInput = document.getElementById('tokenlab-auth-input');
        if (oldInput) oldInput.remove();
        // 延迟重新注入
        setTimeout(injectAuthInput, 500);
      }
    }, 500);
  }

  // 启动
  observeDOM();
  handleNavigation();

  console.log('[TokenLab] Custom auth script loaded');
})();
