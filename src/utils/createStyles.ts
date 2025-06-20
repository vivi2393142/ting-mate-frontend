import { type ImageStyle, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import type { Theme } from '@/theme';

// Automatically infer the style type
export type InferStyleType<T extends object> = T extends { fontSize?: number; fontWeight?: string }
  ? TextStyle
  : T extends { resizeMode?: string }
    ? ImageStyle
    : ViewStyle;

// Support static values or functions
export type StylePropValue<V, P> = V | ((theme: Theme, params: P) => V);

// Support each key to specify the style type (ViewStyle/TextStyle/ImageStyle)
export type StyleObject<
  S extends { [key: string]: ViewStyle | TextStyle | ImageStyle },
  P = unknown,
> = {
  [K in keyof S]: {
    [Prop in keyof S[K]]?: StylePropValue<S[K][Prop], P>;
  };
};

// Return type: key corresponds to style type
export type ExtractedStyleType<T extends StyleObject<P>, P = unknown> = {
  [K in keyof T]: [InferStyleType<T[K]>, InferStyleType<T[K]>];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StyleValueType<V> = V extends (...args: any[]) => infer R ? R : V;
export type InferStyleProps<T> = { [K in keyof T]: StyleValueType<T[K]> };
export type InferAllStyles<T> = { [K in keyof T]: InferStyleProps<T[K]> };

function isFunction(val: unknown): val is (...args: unknown[]) => unknown {
  return typeof val === 'function';
}

export function createStyles<
  S extends { [key: string]: ViewStyle | TextStyle | ImageStyle },
  P = unknown,
>(styles: StyleObject<S, P>) {
  // Separate static and dynamic styles
  const staticStylesObj: Record<string, object> = {};
  const dynamicStylesFn: Record<string, (theme: Theme, params: P) => object> = {};

  Object.entries(styles).forEach(([key, style]) => {
    const staticStyle: Record<string, unknown> = {};
    const dynamicStyle: Record<string, (theme: Theme, params: P) => unknown> = {};

    Object.entries(style).forEach(([prop, value]) => {
      if (isFunction(value)) {
        dynamicStyle[prop] = value as (theme: Theme, params: P) => unknown;
      } else {
        staticStyle[prop] = value;
      }
    });

    if (Object.keys(staticStyle).length > 0) {
      staticStylesObj[key] = staticStyle;
    }
    if (Object.keys(dynamicStyle).length > 0) {
      dynamicStylesFn[key] = (theme, params) =>
        Object.entries(dynamicStyle).reduce(
          (acc: Record<string, unknown>, [p, fn]) => ({
            ...acc,
            [p]: fn(theme, params),
          }),
          {} as Record<string, unknown>,
        );
    }
  });

  const staticStyles = StyleSheet.create(staticStylesObj);

  // getStyles returns InferAllStyles<typeof styles>
  function getStyles(theme: Theme, params: P = {} as P): InferAllStyles<typeof styles> {
    const result = {} as InferAllStyles<typeof styles>;
    (Object.keys(styles) as (keyof typeof styles)[]).forEach((key) => {
      const staticStyle = staticStyles[key as string] || {};
      const dynamicStyle = dynamicStylesFn[key as string]?.(theme, params) || {};
      (result as InferAllStyles<typeof styles>)[key] = {
        ...staticStyle,
        ...dynamicStyle,
      } as InferStyleProps<(typeof styles)[typeof key]>;
    });
    return result;
  }

  return getStyles;
}
