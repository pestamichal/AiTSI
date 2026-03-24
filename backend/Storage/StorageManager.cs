using Amazon.S3;
using Amazon.S3.Model;
using backend.Storage.Models;
using System.Text.RegularExpressions;
using Serilog;

namespace backend.Storage
{
    public class StorageManager
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly StorageManagerOptions _options;

        public StorageManager(StorageManagerOptions options)
        {
            _options = options ?? throw new ArgumentNullException(nameof(options));
            options.Validate();
            _bucketName = options.BucketName;

            var config = new AmazonS3Config
            {
                ServiceURL = options.ServiceUrl.TrimEnd('/'),
                ForcePathStyle = options.ForcePathStyle,
                AuthenticationRegion = options.Region
            };

            _s3Client = new AmazonS3Client(options.AccessKey, options.SecretKey, config);
        }

        private static bool IsValidKey(string key)
        {
            return !string.IsNullOrEmpty(key) && key.Length <= 1024;
        }

        private async Task EnsureBucketExistsAsync()
        {
            try
            {
                await _s3Client.PutBucketAsync(new PutBucketRequest { BucketName = _bucketName }).ConfigureAwait(false);
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                // Bucket already exists
            }
        }

        private static Dictionary<string, string> TaggingToDictionary(List<Tag> tagging)
        {
            var d = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            if (tagging != null)
                foreach (var t in tagging)
                    d[t.Key] = t.Value;
            return d;
        }

        private static List<Tag> DictionaryToTagging(Dictionary<string, string> tags)
        {
            if (tags == null || tags.Count == 0) return null;
            return tags.Select(kv => new Tag { Key = kv.Key, Value = kv.Value }).ToList();
        }

        public async Task<StorageManagerResponse> CreateBlobAsync(string fileName, byte[] data, Dictionary<string, string> tags, bool overwrite = false)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return new StorageManagerResponse(false, "blob file name cannot be empty or null.");
            if (!IsValidKey(fileName))
                return new StorageManagerResponse(false, "blob file name is invalid.");

            try
            {
                await EnsureBucketExistsAsync().ConfigureAwait(false);

                if (!overwrite)
                {
                    var exists = await BlobExistsAsync(fileName).ConfigureAwait(false);
                    if (exists)
                        return new StorageManagerResponse(false, $"{fileName} already exists");
                }

                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = fileName,
                    InputStream = new MemoryStream(data ?? Array.Empty<byte>()),
                    TagSet = DictionaryToTagging(tags)
                };
                var response = await _s3Client.PutObjectAsync(request).ConfigureAwait(false);
                Log.Information("Blob uploaded: {ETag}", response.ETag);
                return new StorageManagerResponse(true, "");
            }
            catch (Exception e)
            {
                return new StorageManagerResponse(false, e.Message);
            }
        }


        public async Task<StorageManagerResponse> UpdateBlobAsync(string fileName, byte[] data, Dictionary<string, string> tags)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return new StorageManagerResponse(false, "blob file name cannot be empty or null.");

            try
            {
                var exists = await BlobExistsAsync(fileName).ConfigureAwait(false);
                if (!exists)
                    return new StorageManagerResponse(false, $"{fileName} does not exist");

                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = fileName,
                    InputStream = new MemoryStream(data ?? Array.Empty<byte>()),
                    TagSet = DictionaryToTagging(tags)
                };
                await _s3Client.PutObjectAsync(request).ConfigureAwait(false);
                return new StorageManagerResponse(true, "");
            }
            catch (Exception e)
            {
                return new StorageManagerResponse(false, e.Message);
            }
        }

        public async Task<StorageManagerResponse> GetBlobAsync(string fileName)
        {
            try
            {
                var exists = await BlobExistsAsync(fileName).ConfigureAwait(false);
                if (!exists)
                    return new StorageManagerResponse(false, "Blob does not exist");

                var getRequest = new GetObjectRequest { BucketName = _bucketName, Key = fileName };
                using var response = await _s3Client.GetObjectAsync(getRequest).ConfigureAwait(false);
                using var ms = new MemoryStream();
                await response.ResponseStream.CopyToAsync(ms).ConfigureAwait(false);
                var data = ms.ToArray();

                var tags = await GetBlobTagsAsync(fileName).ConfigureAwait(false) ?? new Dictionary<string, string>();
                var blob = new StorageManagerBlob { Identifier = fileName, Data = data, Tags = tags };
                return new StorageManagerResponse(true, "", blob);
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new StorageManagerResponse(false, "Blob does not exist");
            }
            catch (Exception e)
            {
                return new StorageManagerResponse(false, e.Message);
            }
        }

        public async Task<StorageManagerResponse> DeleteBlobAsync(string fileName)
        {
            try
            {
                var request = new DeleteObjectRequest { BucketName = _bucketName, Key = fileName };
                await _s3Client.DeleteObjectAsync(request).ConfigureAwait(false);
                return new StorageManagerResponse(true, "");
            }
            catch (Exception e)
            {
                return new StorageManagerResponse(false, e.Message);
            }
        }

        public async Task<Dictionary<string, string>?> GetBlobTagsAsync(string fileName)
        {
            try
            {
                var exists = await BlobExistsAsync(fileName).ConfigureAwait(false);
                if (!exists)
                {
                    Log.Error("GetBlobTags: Blob does not exist: {FileName}", fileName);
                    return null;
                }

                var request = new GetObjectTaggingRequest { BucketName = _bucketName, Key = fileName };
                var response = await _s3Client.GetObjectTaggingAsync(request).ConfigureAwait(false);
                return TaggingToDictionary(response.Tagging);
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
            catch (Exception e)
            {
                Log.Error(e, "GetBlobTags: Exception getting tags for {FileName}", fileName);
                return null;
            }
        }

        public async Task<bool> BlobExistsAsync(string fileName)
        {
            try
            {
                if (!IsValidKey(fileName)) return false;
                var request = new GetObjectMetadataRequest { BucketName = _bucketName, Key = fileName };
                await _s3Client.GetObjectMetadataAsync(request).ConfigureAwait(false);
                return true;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}