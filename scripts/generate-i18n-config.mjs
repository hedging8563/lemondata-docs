#!/usr/bin/env node

/**
 * Generate Mintlify i18n configuration
 *
 * Converts tabs-based navigation to languages array with groups
 * for multi-language support.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const DOCS_DIR = path.join(import.meta.dirname, '..');

// 读取原始配置（从 git 获取干净版本）
function getOriginalConfig() {
  // 首先尝试读取备份文件
  const backupPath = path.join(DOCS_DIR, 'docs.original.json');
  if (fs.existsSync(backupPath)) {
    return JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  }
  // 否则读取当前配置
  return JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'docs.json'), 'utf-8'));
}

const docsJson = getOriginalConfig();

// 定义语言配置
const languages = [
  { code: 'en', default: true },
  { code: 'zh' },
  { code: 'zh-TW' },
  { code: 'ja' },
  { code: 'ko' },
  { code: 'de' },
  { code: 'fr' },
  { code: 'es' },
  { code: 'pt' },
  { code: 'ar' },
  { code: 'vi' },
  { code: 'id' },
  { code: 'tr' },
];

// 保存原始 tabs 配置
const originalTabs = docsJson.navigation.tabs;
const globalConfig = docsJson.navigation.global || {};

// 为每个页面路径添加语言前缀
function prefixPages(pages, langCode) {
  if (langCode === 'en') return pages;
  return pages.map(page => `${langCode}/${page}`);
}

// 将 tabs 转换为扁平的 groups（Mintlify 多语言格式）
function tabsToGroups(tabs, langCode) {
  const groups = [];
  for (const tab of tabs) {
    for (const group of tab.groups) {
      groups.push({
        group: group.group,
        pages: prefixPages(group.pages, langCode)
      });
    }
  }
  return groups;
}

// 生成 languages 配置
const languagesConfig = languages.map(lang => {
  const config = {
    language: lang.code,
    groups: tabsToGroups(originalTabs, lang.code)
  };
  return config;
});

// 构建新的 navigation 配置
docsJson.navigation = {
  global: {
    anchors: globalConfig.anchors || []
  },
  languages: languagesConfig
};

// 删除旧的 i18n 配置（如果存在）
delete docsJson.i18n;

fs.writeFileSync(path.join(DOCS_DIR, 'docs.json'), JSON.stringify(docsJson, null, 2) + '\n', 'utf-8');
console.log('✅ Multi-language navigation generated');
console.log('   Languages:', languages.map(l => l.code).join(', '));
