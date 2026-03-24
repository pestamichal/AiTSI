using backend.DatabaseContext;
using backend.Logic;
using backend.Storage;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Abstract{
     public abstract class BaseController : ControllerBase
    {
        protected readonly ILogger<BaseController> _logger;
        protected readonly DatabaseManager _databaseManager;
        protected readonly ApiHelper _helper;
        protected readonly JwtHelper _jwtHelper;
        protected readonly StorageManager _storageManager;
        public BaseController(ILogger<BaseController> logger, DatabaseManager databaseManager, ApiHelper apiHelper, JwtHelper jwtHelper, StorageManager storageManager)
        {
            _logger = logger;
            _databaseManager = databaseManager;
            _helper = apiHelper;
            _jwtHelper = jwtHelper;
            _storageManager = storageManager;
        }
    }
}