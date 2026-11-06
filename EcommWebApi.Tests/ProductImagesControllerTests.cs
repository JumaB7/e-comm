using EcommWebApi.Controllers;
using EcommWebApi.Services.Products;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Tests;

public class ProductImagesControllerTests
{
    [Fact]
    public async Task Get_streams_a_private_blob_without_a_storage_url()
    {
        var store = new BlobProductImageStore(new MemoryImages());
        var path = await store.Save("VS-OPT-1042", new FormFile(new MemoryStream([0xFF, 0xD8, 0xFF, 0xD9]), 0, 4, "file", "glass.jpg")
        {
            Headers = new HeaderDictionary(),
        });
        var controller = new ProductImagesController(store);

        var result = await controller.Get("VS-OPT-1042.jpg", CancellationToken.None);

        var file = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("image/jpeg", file.ContentType);
        Assert.StartsWith("/api/product-images/", path);
        Assert.DoesNotContain("blob.core.windows.net", path, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("http", path, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Get_returns_404_when_the_image_is_missing()
    {
        var controller = new ProductImagesController(new BlobProductImageStore(new MemoryImages()));

        var missing = await controller.Get("VS-MISSING-1.jpg", CancellationToken.None);
        var traversal = await controller.Get("../secret.jpg", CancellationToken.None);

        Assert.IsType<NotFoundResult>(missing);
        Assert.IsType<NotFoundResult>(traversal);
    }
}
