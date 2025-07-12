// Google Maps Style Colors
export const MAP_COLORS = {
  // Light theme colors
  LANDSCAPE: '#F2F2F2',
  LANDSCAPE_FILL: '#FFFFFF',
  MAN_MADE_FILL: '#FFFFFF',
  ROAD_FILL: '#EEEEEE',
  ROAD_TEXT: '#7B7B7B',
  ROAD_STROKE: '#FFFFFF',
  WATER: '#46BCEC',
  WATER_FILL: '#C8D7D4',
  WATER_TEXT: '#070707',
  WATER_STROKE: '#FFFFFF',
  OUTLINE: '#9C9C9C',
} as const;

// Google Maps Style Configuration
export const googleMapStyles = [
  {
    featureType: 'all',
    elementType: 'geometry.fill',
    stylers: [
      {
        weight: '2.00',
      },
    ],
  },
  {
    featureType: 'all',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: MAP_COLORS.OUTLINE,
      },
    ],
  },
  {
    featureType: 'all',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [
      {
        color: MAP_COLORS.LANDSCAPE,
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: MAP_COLORS.LANDSCAPE_FILL,
      },
    ],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: MAP_COLORS.MAN_MADE_FILL,
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [
      {
        saturation: -100,
      },
      {
        lightness: 45,
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: MAP_COLORS.ROAD_FILL,
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: MAP_COLORS.ROAD_TEXT,
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: MAP_COLORS.ROAD_STROKE,
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'all',
    stylers: [
      {
        visibility: 'simplified',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [
      {
        color: MAP_COLORS.WATER,
      },
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: MAP_COLORS.WATER_FILL,
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: MAP_COLORS.WATER_TEXT,
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: MAP_COLORS.WATER_STROKE,
      },
    ],
  },
];
