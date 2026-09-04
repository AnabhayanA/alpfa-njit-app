import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // Detect device type
  const isTablet = width >= 600;
  const isLargeTablet = width >= 900;
  const isSmallPhone = width < 350;
  const isLargePhone = width >= 400;

  // Detect orientation
  const isLandscape = width > height;

  // Calculate responsive values
  const horizontalPadding = isSmallPhone ? 12 : isTablet ? 24 : 16;
  const verticalPadding = isSmallPhone ? 12 : 16;
  const safeWidth = Math.max(width - horizontalPadding * 2, 0);

  // Card and content dimensions
  const cardWidth = isLargeTablet
    ? Math.min(safeWidth, 600)
    : safeWidth;

  const twoColumnCardWidth = isTablet
    ? (width - horizontalPadding * 2 - 12) / 2
    : cardWidth;

  const threeColumnCardWidth = isLargeTablet
    ? (width - horizontalPadding * 2 - 24) / 3
    : twoColumnCardWidth;

  // Max width for centered content
  const maxContentWidth = isLargeTablet ? 1200 : isTablet ? 800 : '100%';

  // Spacing scale
  const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  };

  // Responsive spacing (scales on larger devices)
  const responsiveSpacing = {
    xs: isSmallPhone ? 4 : 4,
    sm: isSmallPhone ? 6 : 8,
    md: isSmallPhone ? 10 : isTablet ? 14 : 12,
    lg: isSmallPhone ? 14 : isTablet ? 18 : 16,
    xl: isSmallPhone ? 16 : isTablet ? 22 : 20,
    xxl: isSmallPhone ? 18 : isTablet ? 26 : 24,
    xxxl: isSmallPhone ? 24 : isTablet ? 36 : 32,
  };

  // Font sizes (capped to prevent oversizing)
  const fontSizes = {
    xs: clamp(11 * (width / 375), 10, 12),
    sm: clamp(13 * (width / 375), 11, 14),
    base: clamp(16 * (width / 375), 14, 18),
    lg: clamp(18 * (width / 375), 16, 20),
    xl: clamp(20 * (width / 375), 18, 22),
    xxl: clamp(24 * (width / 375), 20, 28),
    xxxl: clamp(32 * (width / 375), 24, 36),
  };

  // Border radius scale
  const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  };

  // Icon sizes
  const iconSizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  };

  // Button dimensions
  const buttonHeight = isSmallPhone ? 44 : 48;
  const buttonPaddingHorizontal = isSmallPhone ? 12 : 16;

  // Grid and layout
  const gridColumns = isLargeTablet ? 3 : isTablet ? 2 : 1;
  const gridGap = responsiveSpacing.md;

  const compactLayout = width < 360;
  const contentMaxWidth = isLargeTablet ? 1200 : isTablet ? 800 : undefined;

  // Bottom nav safe area padding (for collapsing nav)
  const bottomNavCollapsedHeight = 20;
  const bottomNavExpandedHeight = isSmallPhone ? 70 : 80;

  return {
    // Dimensions
    width,
    height,
    isTablet,
    isLargeTablet,
    isSmallPhone,
    isLargePhone,
    isLandscape,

    // Padding/Margins
    horizontalPadding,
    verticalPadding,

    // Content sizing
    cardWidth,
    twoColumnCardWidth,
    threeColumnCardWidth,
    maxContentWidth,

    // Spacing
    spacing,
    responsiveSpacing,

    // Typography
    fontSizes,

    // Border radius
    borderRadius,

    // Icons
    iconSizes,

    // Buttons
    buttonHeight,
    buttonPaddingHorizontal,

    // Layout
    gridColumns,
    gridGap,
    compactLayout,
    contentMaxWidth,
    safeWidth,

    // Navigation
    bottomNavCollapsedHeight,
    bottomNavExpandedHeight,
  };
};

export default useResponsive;
