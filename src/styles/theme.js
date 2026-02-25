export const theme = {
  colors: {
    bg: "#edf1ee",
    bgAccent: "#e6ece7",
    surface: "#f7f8f5",
    surfaceMuted: "#f1f4ef",
    border: "#d9e0d8",
    borderStrong: "#bcc7bd",
    text: "#233126",
    textMuted: "#627266",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    success: "#16a34a",
    successHover: "#15803d",
    danger: "#dc2626",
    dangerHover: "#b91c1c",
    warning: "#d97706",
    info: "#0ea5e9",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    pill: "999px",
  },
  shadow: {
    card: "0 10px 26px rgba(15, 23, 42, 0.055)",
    soft: "0 4px 12px rgba(15, 23, 42, 0.045)",
  },
};

export const ui = {
  appHeader: {
    background:
      "linear-gradient(135deg, rgba(58, 94, 150, 0.95), rgba(47, 130, 153, 0.9))",
    color: "white",
    textAlign: "center",
    padding: "14px 0",
    boxShadow: "0 8px 18px rgba(31, 59, 103, 0.16)",
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
    backgroundColor: "#5b6b62",
    color: "white",
  },
};

