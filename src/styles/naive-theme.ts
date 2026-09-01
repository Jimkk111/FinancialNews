import type { GlobalThemeOverrides } from 'naive-ui'

// Notion 风格字体栈，中文补齐 PingFang / 微软雅黑
const fontFamily =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, ' +
  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", ' +
  'Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'

const fontFamilyMono =
  '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", "Courier New", monospace'

const sharedCommon = {
  fontFamily,
  fontFamilyMono,
  fontSize: '14px',
  fontSizeSmall: '13px',
  fontSizeMedium: '14px',
  fontSizeLarge: '15px',
  lineHeight: '1.5',
  borderRadius: '6px',
  borderRadiusSmall: '3px',
  borderRadiusMedium: '6px',
  borderRadiusLarge: '10px',
} as const

/** 浅色主题覆盖 —— 与 styles/tokens.scss 的 :root 保持一致 */
export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    ...sharedCommon,
    bodyColor: '#ffffff',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    tableColor: '#ffffff',
    tableHeaderColor: '#f7f7f5',
    inputColor: '#fbfbfa',
    inputColorDisabled: '#f7f7f5',
    actionColor: '#f7f7f5',

    textColorBase: '#37352f',
    textColor1: '#37352f',
    textColor2: '#787774',
    textColor3: '#9b9a97',
    textColorDisabled: '#c4c4c1',
    placeholderColor: '#9b9a97',

    borderColor: 'rgba(55, 53, 47, 0.09)',
    dividerColor: 'rgba(55, 53, 47, 0.09)',
    hoverColor: 'rgba(55, 53, 47, 0.06)',

    primaryColor: '#d92e2e',
    primaryColorHover: '#c02727',
    primaryColorPressed: '#ad2323',
    primaryColorSuppl: '#c02727',

    successColor: '#0f7b6c',
    successColorHover: '#0e6e61',
    successColorPressed: '#0c5f53',
    successColorSuppl: '#0e6e61',

    warningColor: '#cb912f',
    warningColorHover: '#b8822a',
    warningColorPressed: '#a0721f',
    warningColorSuppl: '#b8822a',

    errorColor: '#d44c47',
    errorColorHover: '#c04440',
    errorColorPressed: '#a63c38',
    errorColorSuppl: '#c04440',

    infoColor: '#2383e2',
    infoColorHover: '#1f76cc',
    infoColorPressed: '#1a68b5',
    infoColorSuppl: '#1f76cc',

    boxShadow1: '0 1px 2px rgba(15, 15, 15, 0.05)',
    boxShadow2:
      'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
    boxShadow3:
      'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px',
  },
}

/** 深色主题覆盖 —— 与 styles/tokens.scss 的 .dark 保持一致 */
export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    ...sharedCommon,
    bodyColor: '#191919',
    cardColor: '#202020',
    modalColor: '#202020',
    popoverColor: '#252525',
    tableColor: '#202020',
    tableHeaderColor: '#2a2a2a',
    inputColor: '#252525',
    inputColorDisabled: '#202020',
    actionColor: '#2a2a2a',

    textColorBase: 'rgba(255, 255, 255, 0.81)',
    textColor1: 'rgba(255, 255, 255, 0.81)',
    textColor2: 'rgba(255, 255, 255, 0.55)',
    textColor3: 'rgba(255, 255, 255, 0.36)',
    textColorDisabled: 'rgba(255, 255, 255, 0.25)',
    placeholderColor: 'rgba(255, 255, 255, 0.36)',

    borderColor: 'rgba(255, 255, 255, 0.094)',
    dividerColor: 'rgba(255, 255, 255, 0.094)',
    hoverColor: 'rgba(255, 255, 255, 0.055)',

    primaryColor: '#e5484d',
    primaryColorHover: '#ec5d62',
    primaryColorPressed: '#dc3d43',
    primaryColorSuppl: '#ec5d62',

    successColor: '#30a46c',
    successColorHover: '#3cb77d',
    successColorPressed: '#278f5c',
    successColorSuppl: '#3cb77d',

    warningColor: '#daa94a',
    warningColorHover: '#e2b65f',
    warningColorPressed: '#c9993b',
    warningColorSuppl: '#e2b65f',

    errorColor: '#e5484d',
    errorColorHover: '#ec5d62',
    errorColorPressed: '#dc3d43',
    errorColorSuppl: '#ec5d62',

    infoColor: '#3e97eb',
    infoColorHover: '#58a6f5',
    infoColorPressed: '#2f86d8',
    infoColorSuppl: '#58a6f5',

    boxShadow1: '0 1px 2px rgba(0, 0, 0, 0.3)',
    boxShadow2:
      'rgba(0, 0, 0, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.25) 0px 3px 6px',
    boxShadow3:
      'rgba(0, 0, 0, 0.2) 0px 0px 0px 1px, rgba(0, 0, 0, 0.3) 0px 3px 6px, rgba(0, 0, 0, 0.4) 0px 9px 24px',
  },
}
