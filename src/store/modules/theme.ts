import { defineStore } from 'pinia';
import { theme } from 'ant-design-vue';
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import { useLocalStorage } from '@vueuse/core';
const { defaultAlgorithm, darkAlgorithm, defaultSeed } = theme;

export const useThemeStore = defineStore('theme', () => {
  // 持久化主题模式
  const themeMode = useLocalStorage<'light' | 'dark'>('theme-mode', 'light');

  // 持久化主色调
  const primaryColor = useLocalStorage('primary-color', '#4d6bfe');

  // 计算主题配置
  const themeConfig = computed<ThemeConfig>(() => ({
    algorithm: themeMode.value === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: primaryColor.value,
      borderRadius: 4,
    },
  }));

  // 生成 CSS 变量对象
  const cssVars = computed(() => {
    const mapToken =
      themeMode.value === 'dark' ? darkAlgorithm(defaultSeed) : defaultAlgorithm(defaultSeed);
    const excludeUnits = ['zIndex', 'fontWeight', 'opacity', 'scale'];
    const vars: Record<string, string> = {};
    Object.entries(mapToken).forEach(([key, value]) => {
      const varName = `--${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
      let varValue = value;
      if (typeof value === 'number' && !excludeUnits.some((k) => key.includes(k))) {
        varValue = `${value}px`;
      }

      vars[varName] = String(varValue);
    });

    // 添加额外变量
    vars['--primary-color'] = primaryColor.value;
    vars['--theme-mode'] = themeMode.value;

    return vars;
  });

  const applyTheme = () => {
    const root = document.documentElement;
    Object.entries(cssVars.value).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  // 切换主题模式
  const toggleTheme = (mode?: 'light' | 'dark') => {
    themeMode.value = mode || (themeMode.value === 'light' ? 'dark' : 'light');
    applyTheme();
  };

  // 设置主色
  const setPrimaryColor = (color: string) => {
    primaryColor.value = color;
    applyTheme();
  };

  applyTheme();

  return {
    themeMode: themeMode as ComputedRef<'light' | 'dark'>,
    primaryColor: primaryColor as ComputedRef<string>,
    themeConfig,
    toggleTheme,
    setPrimaryColor,
  };
});

export class themeMode {}
