using backend.DatabaseContext;
using backend.Storage;

namespace backend.Logic{
    public class ApiHelper{
        private readonly ILogger<ApiHelper> _logger;
        private readonly StorageManager _storageManager;
        private readonly DatabaseManager _databaseManager;

        public ApiHelper(ILogger<ApiHelper> logger, StorageManager storageManager, DatabaseManager databaseManager)
        {
            _logger = logger;
            _storageManager = storageManager;
            _databaseManager = databaseManager;
        }

        public string GetAuthorizationHeaderValue(HttpRequest req)
        {
            if (req.Headers.ContainsKey("Authorization"))
            {
                return req.Headers["Authorization"].ToString();
            }
            else
            {
                _logger.LogError("Authorization header is missing");
                throw new ArgumentException("Authorization header is missing");
            }
        }

    }
}