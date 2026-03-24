namespace backend.Storage
{
    public class StorageManagerOptions
    {
        public string ServiceUrl { get; set; } = "";
        public string AccessKey { get; set; } = "";
        public string SecretKey { get; set; } = "";
        public string BucketName { get; set; } = "";
        public bool ForcePathStyle { get; set; } = true;
        public string Region { get; set; } = "us-east-1";
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(ServiceUrl))
                throw new ArgumentException("ServiceUrl is required.", nameof(ServiceUrl));
            if (string.IsNullOrWhiteSpace(AccessKey))
                throw new ArgumentException("AccessKey is required.", nameof(AccessKey));
            if (string.IsNullOrWhiteSpace(SecretKey))
                throw new ArgumentException("SecretKey is required.", nameof(SecretKey));
            if (string.IsNullOrWhiteSpace(BucketName))
                throw new ArgumentException("BucketName is required.", nameof(BucketName));
        }
    }
}
