export type IntuitEnvironment = "sandbox" | "production";

export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: IntuitEnvironment;
  apiBaseUrl: string;
  apiMinorVersion: number;
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required for the QuickBooks integration.`);
  }

  return value;
}

function readEnvironment(): IntuitEnvironment {
  const value = requireEnvironmentVariable("INTUIT_ENVIRONMENT");

  if (value !== "sandbox" && value !== "production") {
    throw new Error(
      'INTUIT_ENVIRONMENT must be either "sandbox" or "production".',
    );
  }

  return value;
}

function readMinorVersion(): number {
  const rawValue = process.env.INTUIT_API_MINOR_VERSION?.trim() || "75";
  const minorVersion = Number(rawValue);

  if (!Number.isInteger(minorVersion) || minorVersion < 75) {
    throw new Error(
      "INTUIT_API_MINOR_VERSION must be an integer greater than or equal to 75.",
    );
  }

  return minorVersion;
}

export function getQuickBooksConfig(): QuickBooksConfig {
  const environment = readEnvironment();

  return {
    clientId: requireEnvironmentVariable("INTUIT_CLIENT_ID"),
    clientSecret: requireEnvironmentVariable("INTUIT_CLIENT_SECRET"),
    redirectUri: requireEnvironmentVariable("INTUIT_REDIRECT_URI"),
    environment,
    apiBaseUrl:
      environment === "sandbox"
        ? "https://sandbox-quickbooks.api.intuit.com/v3"
        : "https://quickbooks.api.intuit.com/v3",
    apiMinorVersion: readMinorVersion(),
  };
}

export function getSandboxQuickBooksConfig(): QuickBooksConfig {
  const config = getQuickBooksConfig();

  if (config.environment !== "sandbox") {
    throw new Error(
      "Production QuickBooks access is disabled until application authentication and authorization are implemented.",
    );
  }

  return config;
}
