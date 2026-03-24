namespace backend.Storage.Models
{
    public class StorageManagerResponse
    {
        public bool IsSuccess { get; set; }

        public string Error { get; set; }
        public StorageManagerBlob Blob { get; set; }
        public List<StorageManagerBlob> Blobs { get; set; }

        public StorageManagerResponse()
        {
            IsSuccess = false;
            Error = "";
            Blob = null;
            Blobs = new List<StorageManagerBlob>();
        }

        public StorageManagerResponse(bool success, string error) : base()
        {
            IsSuccess = success;
            Error = error;
        }

        public StorageManagerResponse(bool success, string error, StorageManagerBlob blob) : base()
        {
            IsSuccess = success;
            Error = error;
            Blob = blob;
        }

        public StorageManagerResponse(bool success, string error, List<StorageManagerBlob> blobs) : base()
        {
            IsSuccess = success;
            Error = error;
            Blobs = blobs;
        }
    }
}
