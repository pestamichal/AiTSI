namespace backend
{
    public class AppSettings
    {
        private static IConfiguration _configuration;
        public static string environment { get; set; }
        public static string postgresDatabase { get; set; }
        public static string postgresUsername { get; set; }
        public static string postgresServer { get; set; }
        public static string postgresPort { get; set; }
        public static string postgresPassword { get; set; }
        public static string storageServiceUrl { get; set; }
        public static string storageAccessKey { get; set; }
        public static string storageSecretKey { get; set; }
        public static string storageBucketName { get; set; }
        public static string databaseConnectionString { get; set; }
        /// <summary>Google OAuth 2.0 client ID (used as expected JWT audience for Google ID tokens).</summary>
        public static string googleOAuthClientId { get; set; }

        private static string GetEnvironmentVariable(string key)
        {
            var env = System.Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);

            if (env == null)
            {
                // TODO: Handle Null
                return env;
            }
            else
            {
                return env;
            }
        }

        private static string GetConfigValue(string key)
        {
            return _configuration[key];
        }

        public static void Initialize(IConfiguration configuration)
        {
            _configuration = configuration;

            environment = GetConfigValue("AppSettings:Environment") ?? GetEnvironmentVariable("ENVIRONMENT");

            postgresDatabase = GetConfigValue("AppSettings:postgresDatabase") ?? GetEnvironmentVariable("postgresDatabase");
            postgresUsername = GetConfigValue("AppSettings:postgresUsername") ?? GetEnvironmentVariable("postgresUsername");
            postgresServer = GetConfigValue("AppSettings:postgresServer") ?? GetEnvironmentVariable("postgresServer");
            postgresPort = GetConfigValue("AppSettings:postgresPort") ?? GetEnvironmentVariable("postgresPort");
            postgresPassword = GetConfigValue("AppSettings:postgresPassword") ?? GetEnvironmentVariable("postgresPassword");
            storageServiceUrl = GetConfigValue("AppSettings:storageServiceUrl") ?? GetEnvironmentVariable("storageServiceUrl");
            storageAccessKey = GetConfigValue("AppSettings:storageAccessKey") ?? GetEnvironmentVariable("storageAccessKey");
            storageSecretKey = GetConfigValue("AppSettings:storageSecretKey") ?? GetEnvironmentVariable("storageSecretKey");
            storageBucketName = GetConfigValue("AppSettings:storageBucketName") ?? GetEnvironmentVariable("storageBucketName");
            googleOAuthClientId = GetConfigValue("AppSettings:GoogleOAuthClientId") ?? GetEnvironmentVariable("GOOGLE_OAUTH_CLIENT_ID");

            databaseConnectionString = $"Host={postgresServer};Port={postgresPort};Database={postgresDatabase};Username={postgresUsername};Password={postgresPassword}";
        }

        private static bool SafeParseBool(string? value, bool defaultValue = false)
        {
            if (bool.TryParse(value, out var result))
                return result;
            return defaultValue;
        }

        private static int SafeParseInt(string? value, int defaultValue = 0)
        {
            if(int.TryParse(value, out var result)) return result;
            return defaultValue;
        }
    }
}

