/**
 * ZEN Fintech — Typography System
 * Scale ratio: 1.25 | Base: 13px
 * Font: Inter (variable)
 */

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

/** Reusable type styles — apply via spread: { ...typography.display } */
export const typography = {
  /** Hero balance figure — $25 431.30 */
  display: {
    fontFamily: fonts.bold,
    fontSize: 46,
    fontWeight: '700' as const,
    letterSpacing: -2.2, // Tight tracking
    lineHeight: 52,
    color: '#111111',
  },

  /** Section titles — "Transactions" */
  headingLarge: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -1.5, // Tight tracking
    lineHeight: 28,
    color: '#111111',
  },

  /** Card and sub-section titles — "Invest", "Shared" */
  headingMedium: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.4, // Tight tracking
    lineHeight: 20,
    color: '#111111',
  },

  /** Primary body — transaction names */
  bodyLarge: {
    fontFamily: fonts.medium,
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: -0.3, // Tight tracking
    lineHeight: 22,
    color: '#111111',
  },

  /** Standard body */
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: -0.2, // Tight tracking
    lineHeight: 20,
    color: '#111111',
  },

  /** Secondary metadata — dates, descriptions */
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: '#8E8E93',
  },

  /** Very small helper / labels */
  caption: {
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 14,
    color: '#B0B0B0',
  },

  /** Stat card values — $70 850 */
  statAmount: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.6, // Tight tracking
    lineHeight: 22,
    color: '#111111',
  },

  /** Stat card labels */
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: -0.1, // Tight tracking
    lineHeight: 16,
    color: '#8E8E93',
  },

  /** Action belt buttons — Send, Receive, Add */
  actionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: -0.2, // Tight tracking
    lineHeight: 18,
    color: '#FFFFFF',
  },

  /** Transaction title */
  txTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.5, // Tight tracking
    lineHeight: 20,
    color: '#111111',
  },

  /** Transaction subtitle */
  txSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: -0.2, // Tight tracking
    lineHeight: 16,
    color: '#8E8E93',
  },

  /** Positive transaction amount */
  amountPositive: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.6, // Tight tracking
    lineHeight: 20,
    color: '#16A34A',
  },

  /** Negative / neutral transaction amount */
  amountNegative: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.6, // Tight tracking
    lineHeight: 20,
    color: '#FF3B30',
  },

  /** "Balance" label */
  balanceLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: -0.2, // Tight tracking
    lineHeight: 18,
    color: '#8E8E93',
  },

  /** Filter pill text (inactive) */
  filterInactive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: -0.3, // Tight tracking
    lineHeight: 18,
    color: '#636366',
  },

  /** Filter pill text (active) */
  filterActive: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: -0.3, // Tight tracking
    lineHeight: 18,
    color: '#B94FB0',
  },

  /** "View all" link */
  link: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: -0.2, // Tight tracking
    lineHeight: 18,
    color: '#8E8E93',
  },

  /** Logo wordmark */
  logo: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: -1.2, // Tight logo tracking
    color: '#111111',
  },
};

export default typography;
