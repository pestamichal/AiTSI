namespace backend.Storage.Models
{
    public class StorageManagerBlob
    {
        [System.Text.Json.Serialization.JsonPropertyName("identifier")]
        public String? Identifier { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("tags")]
        public Dictionary<string, string> Tags { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("data")]
        public byte[] Data { get; set; }

        public StorageManagerBlob()
        {
            Data = new byte[0];
            Identifier = null;
            Tags = new Dictionary<string, string>();
        }
        public StorageManagerBlob(string identifier, byte[] data)
        {
            Identifier = identifier;
            Data = data;
            Tags = new Dictionary<string, string>();
        }
        public StorageManagerBlob(string identifier, byte[] data, Dictionary<string, string> tags)
        {
            Identifier = identifier;
            Data = data;
            Tags = tags;
        }
    }
}
