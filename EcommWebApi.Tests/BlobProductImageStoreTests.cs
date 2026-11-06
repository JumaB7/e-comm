using EcommWebApi.Services.Products;
using Microsoft.AspNetCore.Http;

namespace EcommWebApi.Tests;

public class BlobProductImageStoreTests
{
    private static readonly byte[] Jpeg = [0xFF, 0xD8, 0xFF, 0xD9];
    private static readonly byte[] Png =
    [
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00,
    ];
    private static readonly byte[] WebP =
    [
        (byte)'R', (byte)'I', (byte)'F', (byte)'F', 0, 0, 0, 0, (byte)'W', (byte)'E', (byte)'B', (byte)'P',
    ];

    [Fact]
    public async Task Save_jpg_stores_a_private_api_path()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);

        var path = await store.Save("VS-OPT-1042", FileOf("glass.jpeg", Jpeg));

        Assert.Equal("/api/product-images/VS-OPT-1042.jpg", path);
        Assert.DoesNotContain("blob", path, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("http", path, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(Jpeg, images.Read("VS-OPT-1042.jpg"));
    }

    [Fact]
    public async Task Save_png_and_webp()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);

        var png = await store.Save("VS-APP-220", FileOf("shirt.PNG", Png));
        var webp = await store.Save("VS-KNF-018", FileOf("knife.webp", WebP));

        Assert.Equal("/api/product-images/VS-APP-220.png", png);
        Assert.Equal("image/png", (await store.FindPathByFileName("VS-APP-220.png"))!.ContentType);
        Assert.Equal("/api/product-images/VS-KNF-018.webp", webp);
        Assert.Equal("image/webp", (await store.FindPathByFileName("VS-KNF-018.webp"))!.ContentType);
    }

    [Fact]
    public async Task Save_rejects_an_unsupported_extension()
    {
        var store = new BlobProductImageStore(new MemoryImages());

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() => store.Save("VS-OPT-1042", FileOf("glass.gif", Jpeg)));

        Assert.Equal("Use a JPG, PNG, or WebP image.", error.Message);
    }

    [Fact]
    public async Task Save_rejects_a_file_over_2_5_mb()
    {
        var store = new BlobProductImageStore(new MemoryImages());
        var file = FileOf("glass.jpg", Jpeg, ProductImageNames.MaxBytes + 1);

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() => store.Save("VS-OPT-1042", file));

        Assert.Equal("Keep the image under 2.5 MB.", error.Message);
    }

    [Fact]
    public async Task Save_rejects_a_stream_that_exceeds_2_5_mb()
    {
        var store = new BlobProductImageStore(new MemoryImages());

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() => store.Save("VS-OPT-1042", new OversizedJpeg()));

        Assert.Equal("Keep the image under 2.5 MB.", error.Message);
    }

    [Fact]
    public async Task Save_rejects_bytes_that_are_not_an_image()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            store.Save("VS-OPT-1042", FileOf("glass.jpg", "not an image"u8.ToArray())));

        Assert.Equal("That file is not a valid JPG, PNG, or WebP image.", error.Message);
        Assert.False(images.Contains("VS-OPT-1042.jpg"));
    }

    [Fact]
    public async Task Save_rejects_a_png_renamed_to_jpg()
    {
        var store = new BlobProductImageStore(new MemoryImages());

        await Assert.ThrowsAsync<InvalidOperationException>(() => store.Save("VS-OPT-1042", FileOf("glass.jpg", Png)));
    }

    [Fact]
    public async Task Find_returns_the_image_and_404_when_it_is_missing()
    {
        var store = new BlobProductImageStore(new MemoryImages());
        await store.Save("VS-OPT-1042", FileOf("glass.jpg", Jpeg));

        var found = await store.FindPathByFileName("VS-OPT-1042.jpg");
        Assert.NotNull(found);
        Assert.Equal("image/jpeg", found.ContentType);
        using var buffer = new MemoryStream();
        await found.Content.CopyToAsync(buffer);
        Assert.Equal(Jpeg, buffer.ToArray());

        Assert.Null(await store.FindPathByFileName("VS-MISSING-1.jpg"));
        Assert.Null(await store.FindPathByFileName("../VS-OPT-1042.jpg"));
        Assert.Null(await store.FindPathByFileName("VS-OPT-1042.jpg/../../web.config"));
        Assert.Equal("/api/product-images/VS-OPT-1042.jpg", await store.FindPath("VS-OPT-1042"));
    }

    [Fact]
    public async Task Save_replaces_the_previous_image_for_the_sku()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);
        await store.Save("VS-OPT-1042", FileOf("glass.jpg", Jpeg));

        var path = await store.Save("VS-OPT-1042", FileOf("glass.png", Png));

        Assert.Equal("/api/product-images/VS-OPT-1042.png", path);
        Assert.False(images.Contains("VS-OPT-1042.jpg"));
        Assert.Equal(Png, images.Read("VS-OPT-1042.png"));
    }

    [Fact]
    public async Task Remove_deletes_the_blob_and_ignores_a_missing_one()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);
        await store.Save("VS-CMP-014", FileOf("blind.jpg", Jpeg));

        await store.Remove("VS-CMP-014");
        await store.Remove("VS-CMP-014");

        Assert.False(images.Contains("VS-CMP-014.jpg"));
        Assert.Null(await store.FindPath("VS-CMP-014"));
    }

    [Fact]
    public async Task Rename_copies_then_deletes_the_original()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);
        await store.Save("VS-APP-220", FileOf("shirt.png", Png));

        var path = await store.Rename("VS-APP-220", "VS-APP-221");

        Assert.Equal("/api/product-images/VS-APP-221.png", path);
        Assert.False(images.Contains("VS-APP-220.png"));
        Assert.Equal(Png, images.Read("VS-APP-221.png"));
    }

    [Fact]
    public async Task Rename_keeps_the_original_when_the_copy_fails()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);
        await store.Save("VS-APP-220", FileOf("shirt.png", Png));
        images.FailUploads.Add("VS-APP-221.png");

        await Assert.ThrowsAsync<Azure.RequestFailedException>(() => store.Rename("VS-APP-220", "VS-APP-221"));

        Assert.Equal(Png, images.Read("VS-APP-220.png"));
        Assert.False(images.Contains("VS-APP-221.png"));
    }

    [Fact]
    public async Task Rename_keeps_both_copies_when_deleting_the_original_fails()
    {
        var images = new MemoryImages();
        var store = new BlobProductImageStore(images);
        await store.Save("VS-APP-220", FileOf("shirt.jpg", Jpeg));
        images.FailDeletes.Add("VS-APP-220.jpg");

        await Assert.ThrowsAsync<Azure.RequestFailedException>(() => store.Rename("VS-APP-220", "VS-APP-221"));

        Assert.Equal(Jpeg, images.Read("VS-APP-220.jpg"));
        Assert.Equal(Jpeg, images.Read("VS-APP-221.jpg"));
    }

    [Fact]
    public async Task Save_reports_a_storage_failure()
    {
        var images = new MemoryImages();
        images.FailUploads.Add("VS-OPT-1042.jpg");
        var store = new BlobProductImageStore(images);

        await Assert.ThrowsAsync<Azure.RequestFailedException>(() => store.Save("VS-OPT-1042", FileOf("glass.jpg", Jpeg)));
        Assert.False(images.Contains("VS-OPT-1042.jpg"));
    }

    [Fact]
    public async Task Save_rejects_an_unsafe_sku()
    {
        var store = new BlobProductImageStore(new MemoryImages());

        await Assert.ThrowsAsync<InvalidOperationException>(() => store.Save("../VS-OPT-1042", FileOf("glass.jpg", Jpeg)));
    }

    private static FormFile FileOf(string fileName, byte[] bytes, long? length = null)
    {
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, length ?? bytes.Length, "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/octet-stream",
        };
    }

    private sealed class OversizedJpeg : IFormFile
    {
        public string ContentType => "image/jpeg";

        public string ContentDisposition => "";

        public IHeaderDictionary Headers { get; } = new HeaderDictionary();

        public long Length => 100;

        public string Name => "file";

        public string FileName => "glass.jpg";

        public Stream OpenReadStream()
        {
            var bytes = new byte[ProductImageNames.MaxBytes + 1];
            bytes[0] = 0xFF;
            bytes[1] = 0xD8;
            bytes[2] = 0xFF;
            return new MemoryStream(bytes);
        }

        public void CopyTo(Stream target) => OpenReadStream().CopyTo(target);

        public Task CopyToAsync(Stream target, CancellationToken cancellationToken = default) =>
            OpenReadStream().CopyToAsync(target, cancellationToken);
    }
}
