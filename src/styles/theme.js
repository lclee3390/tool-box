export const theme = {
  colors: {
    bg: "var(--app-bg)",
    bgAccent: "var(--app-bg-accent)",
    surface: "var(--app-surface)",
    surfaceMuted: "var(--app-surface-muted)",
    border: "var(--app-border)",
    borderStrong: "var(--app-border-strong)",
    text: "var(--app-text)",
    textMuted: "var(--app-text-muted)",
    primary: "var(--app-primary)",
    primaryHover: "var(--app-primary-strong)",
    success: "var(--app-success)",
    successHover: "var(--app-success-strong)",
    danger: "var(--app-danger)",
    dangerHover: "var(--app-danger-strong)",
    warning: "var(--app-warning)",
    info: "var(--app-info)",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    pill: "999px",
  },
  shadow: {
    card: "var(--app-shadow-card)",
    soft: "var(--app-shadow-soft)",
  },
};

export const ui = {
  appHeader: {
    background: "var(--app-header-bg)",
    color: "white",
    textAlign: "center",
    padding: "14px 0",
    boxShadow: "var(--app-header-shadow)",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(6px)",
  },
  appMain: {
    padding: "20px",
    maxWidth: "980px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.card,
  },
  toolContainer: {
    padding: "20px",
    maxWidth: "100%",
    margin: "0 auto",
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.card,
  },
  toolTitle: {
    margin: "0 0 16px 0",
    textAlign: "center",
    color: theme.colors.text,
    fontSize: "24px",
    fontWeight: "700",
  },
  input: {
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  buttonBase: {
    border: "none",
    borderRadius: theme.radius.sm,
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.2s ease, transform 0.12s ease",
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    color: "white",
  },
  buttonSuccess: {
    backgroundColor: theme.colors.success,
    color: "white",
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger,
    color: "white",
  },
  buttonSecondary: {
    backgroundColor: "var(--app-button-secondary)",
    color: "white",
  },
};

