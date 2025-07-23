import useAppTheme from '@/hooks/useAppTheme';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const SVG_WIDTH = 728.08199;
const SVG_HEIGHT = 680.00102;
const ASPECT_RATIO = SVG_WIDTH / SVG_HEIGHT;

const CaregiverSvg = (props: SvgProps) => {
  const { colors } = useAppTheme();

  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondaryContainer, // #a0616a
    tertiary: colors.tertiaryContainer, // #ffb6b6
    background: colors.onPrimary, // #fff
    lightGrey: colors.background, // #f2f2f2
    grey: colors.surfaceVariant, //#e6e6e6
    semiGrey: colors.outlineVariant, //#ccc
    outline: colors.outline, // #3f3d56
    darkGrey: colors.onSurfaceVariant, // #2f2e41
  };

  return (
    <Svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      width="100%"
      style={{ aspectRatio: ASPECT_RATIO }}
      {...props}
    >
      <Path
        d="M790.76434,271.5935h-3.736v-102.354a59.24,59.24,0,0,0-59.24-59.24h-216.846a59.24,59.24,0,0,0-59.24,59.24v561.521a59.24,59.24,0,0,0,59.24,59.24h216.85a59.24,59.24,0,0,0,59.24-59.24v-386.31h3.732Z"
        transform="translate(-235.95901 -109.99949)"
        fill={colorMap.outline}
      />
      <Path
        d="M774.95435,165.27548v569.452a44.93,44.93,0,0,1-44.913,44.923h-221.306a44.937,44.937,0,0,1-44.941-44.928v-569.447a44.936,44.936,0,0,1,44.941-44.922h26.845a21.364,21.364,0,0,0,19.764,29.411h126.168a21.364,21.364,0,0,0,19.76-29.415h28.756a44.93,44.93,0,0,1,44.922,44.913Z"
        transform="translate(-235.95901 -109.99949)"
        fill={colorMap.grey}
      />
      <Path
        d="M751.37437,749.9252h-264a8.50951,8.50951,0,0,1-8.5-8.5v-555a8.50951,8.50951,0,0,1,8.5-8.5h264a8.50951,8.50951,0,0,1,8.5,8.5v555A8.50951,8.50951,0,0,1,751.37437,749.9252Z"
        transform="translate(-235.95901 -109.99949)"
        fill={colorMap.background}
      />
      <Circle cx="382.41532" cy="182.57071" r="72.736" fill={colorMap.grey} />
      <Circle cx="381.41537" cy="182.57071" r="62.889" fill={colorMap.background} />
      <Path
        d="M618.77435,256.9002a35.856,35.856,0,1,0,35.856,35.856,35.856,35.856,0,0,0-35.856-35.856Zm0,10.757a10.757,10.757,0,1,1-10.757,10.757,10.75695,10.75695,0,0,1,10.757-10.757Zm0,51.784a26.121,26.121,0,0,1-21.514-11.481c.172-7.171,14.342-11.119,21.514-11.119s21.341,3.948,21.514,11.119a26.164,26.164,0,0,1-21.514,11.484Z"
        transform="translate(-235.95901 -109.99949)"
        fill={colorMap.primary}
      />
      <Rect x="316.60535" y="279.74971" width="125.838" height="9.458" fill={colorMap.grey} />
      <Rect x="299.76837" y="304.32673" width="158.368" height="9.458" fill={colorMap.grey} />
      <Rect x="271.86835" y="374.92271" width="223.09399" height="223.09399" fill={colorMap.grey} />
      <Rect
        x="275.41534"
        y="379.64271"
        width="213.655"
        height="213.655"
        fill={colorMap.background}
      />
    </Svg>
  );
};

export default CaregiverSvg;
