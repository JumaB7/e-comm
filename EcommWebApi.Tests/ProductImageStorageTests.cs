using EcommWebApi.Services.Products;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace EcommWebApi.Tests;

public class ProductImageStorageTests
{
    [Fact]
    public void Missing_service_uri_fails_startup()
    {
        var configuration = new ConfigurationBuilder().Build();

        var development = Assert.Throws<InvalidOperationException>(() =>
            ProductImageStorage.CreateService(configuration, new TestHost("Development")));
        var production = Assert.Throws<InvalidOperationException>(() =>
            ProductImageStorage.CreateService(configuration, new TestHost("Production")));

        Assert.Contains("AzureStorage:ServiceUri", development.Message, StringComparison.Ordinal);
        Assert.Contains("AzureStorage__ServiceUri", production.Message, StringComparison.Ordinal);
        Assert.Contains("managed identity", production.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Service_uri_must_be_https()
    {
        var configuration = Config("http://veldsupplyimages.blob.core.windows.net", "product-images");

        Assert.Throws<InvalidOperationException>(() =>
            ProductImageStorage.CreateService(configuration, new TestHost("Production")));
    }

    [Theory]
    [InlineData("Development")]
    [InlineData("Production")]
    public void Service_client_uses_the_configured_private_container(string environment)
    {
        var configuration = Config("https://veldsupplyimages.blob.core.windows.net", "product-images");

        var service = ProductImageStorage.CreateService(configuration, new TestHost(environment));
        var container = service.GetBlobContainerClient(ProductImageStorage.ReadContainerName(configuration));

        Assert.Equal("https://veldsupplyimages.blob.core.windows.net/", service.Uri.AbsoluteUri);
        Assert.Equal("https://veldsupplyimages.blob.core.windows.net/product-images", container.Uri.AbsoluteUri.TrimEnd('/'));
    }

    [Fact]
    public void Container_name_defaults_to_product_images()
    {
        var configuration = Config("https://veldsupplyimages.blob.core.windows.net", "");

        Assert.Equal("product-images", ProductImageStorage.ReadContainerName(configuration));
    }

    private static IConfiguration Config(string serviceUri, string containerName) =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["AzureStorage:ServiceUri"] = serviceUri,
            ["AzureStorage:ContainerName"] = containerName,
        }).Build();

    private sealed class TestHost(string environmentName) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;

        public string ApplicationName { get; set; } = "EcommWebApi.Tests";

        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;

        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
