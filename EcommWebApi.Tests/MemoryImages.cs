using Azure;
using Azure.Core;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace EcommWebApi.Tests;

internal sealed class MemoryImages : BlobContainerClient
{
    private readonly Dictionary<string, byte[]> blobs = new(StringComparer.Ordinal);

    public MemoryImages()
        : base(new Uri("https://unit.test/product-images"))
    {
    }

    public HashSet<string> FailUploads { get; } = new(StringComparer.Ordinal);

    public HashSet<string> FailDeletes { get; } = new(StringComparer.Ordinal);

    public bool Contains(string name) => blobs.ContainsKey(name);

    public byte[]? Read(string name) => blobs.TryGetValue(name, out var bytes) ? bytes : null;

    public override BlobClient GetBlobClient(string blobName) => new MemoryBlob(this, blobName);

    internal bool TryGet(string name, out byte[] bytes) => blobs.TryGetValue(name, out bytes!);

    internal void Put(string name, byte[] bytes) => blobs[name] = bytes;

    internal bool RemoveBlob(string name) => blobs.Remove(name);
}

internal sealed class MemoryBlob : BlobClient
{
    private readonly MemoryImages images;
    private readonly string name;

    public MemoryBlob(MemoryImages images, string name)
        : base(new Uri($"https://unit.test/product-images/{name}"))
    {
        this.images = images;
        this.name = name;
    }

    public override Task<Response<bool>> ExistsAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(Response.FromValue(images.Contains(name), new EmptyResponse()));

    public override Task<Stream> OpenReadAsync(BlobOpenReadOptions options, CancellationToken cancellationToken = default)
    {
        if (!images.TryGet(name, out var bytes))
        {
            throw new RequestFailedException(404, "The blob does not exist.");
        }

        return Task.FromResult<Stream>(new MemoryStream(bytes, writable: false));
    }

    public override async Task<Response<BlobContentInfo>> UploadAsync(
        Stream content,
        BlobUploadOptions options,
        CancellationToken cancellationToken = default)
    {
        if (images.FailUploads.Contains(name))
        {
            throw new RequestFailedException(500, "The blob upload failed.");
        }

        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, cancellationToken);
        images.Put(name, buffer.ToArray());
        var info = BlobsModelFactory.BlobContentInfo(new ETag("\"1\""), DateTimeOffset.UtcNow, [], "0", 0);
        return Response.FromValue(info, new EmptyResponse());
    }

    public override Task<Response<bool>> DeleteIfExistsAsync(
        DeleteSnapshotsOption snapshotsOption = DeleteSnapshotsOption.None,
        BlobRequestConditions? conditions = null,
        CancellationToken cancellationToken = default)
    {
        if (images.FailDeletes.Contains(name))
        {
            throw new RequestFailedException(500, "The blob delete failed.");
        }

        return Task.FromResult(Response.FromValue(images.RemoveBlob(name), new EmptyResponse()));
    }
}

internal sealed class EmptyResponse : Response
{
    public override int Status => 200;

    public override string ReasonPhrase => "OK";

    public override Stream? ContentStream { get; set; }

    public override string ClientRequestId { get; set; } = "tests";

    public override void Dispose()
    {
    }

    protected override bool ContainsHeader(string name) => false;

    protected override IEnumerable<HttpHeader> EnumerateHeaders() => [];

    protected override bool TryGetHeader(string name, out string value)
    {
        value = "";
        return false;
    }

    protected override bool TryGetHeaderValues(string name, out IEnumerable<string> values)
    {
        values = [];
        return false;
    }
}
