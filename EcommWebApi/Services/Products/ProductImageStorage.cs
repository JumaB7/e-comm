using Azure.Core;
using Azure.Identity;
using Azure.Storage.Blobs;

namespace EcommWebApi.Services.Products;

public static class ProductImageStorage
{
    public const string ServiceUriKey = "AzureStorage:ServiceUri";
    public const string ContainerNameKey = "AzureStorage:ContainerName";
    public const string DefaultContainer = "product-images";

    public static BlobServiceClient CreateService(IConfiguration configuration, IHostEnvironment environment)
    {
        var serviceUri = configuration[ServiceUriKey];
        if (string.IsNullOrWhiteSpace(serviceUri))
        {
            throw new InvalidOperationException(
                "AzureStorage:ServiceUri is not set. Set AzureStorage__ServiceUri to the blob endpoint. " +
                "Locally, sign in with Azure CLI. In App Service, the system-assigned managed identity is used.");
        }

        if (!Uri.TryCreate(serviceUri, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
        {
            throw new InvalidOperationException(
                "AzureStorage:ServiceUri must be the https blob endpoint, for example https://veldsupplyimages.blob.core.windows.net.");
        }

        return new BlobServiceClient(uri, CreateCredential(environment));
    }

    public static string ReadContainerName(IConfiguration configuration)
    {
        var containerName = configuration[ContainerNameKey];
        if (string.IsNullOrWhiteSpace(containerName))
        {
            containerName = DefaultContainer;
        }

        if (!IsContainerName(containerName))
        {
            throw new InvalidOperationException(
                "AzureStorage:ContainerName must be a blob container name such as product-images.");
        }

        return containerName;
    }

    private static TokenCredential CreateCredential(IHostEnvironment environment)
    {
        if (environment.IsDevelopment())
        {
            return new AzureCliCredential();
        }

        return new DefaultAzureCredential(new DefaultAzureCredentialOptions
        {
            ExcludeInteractiveBrowserCredential = true,
            ExcludeAzurePowerShellCredential = true,
            ExcludeVisualStudioCredential = true,
            ExcludeVisualStudioCodeCredential = true,
            ExcludeAzureCliCredential = true,
            ExcludeAzureDeveloperCliCredential = true,
        });
    }

    private static bool IsContainerName(string name)
    {
        if (name.Length is < 3 or > 63 || name.Contains("--", StringComparison.Ordinal))
        {
            return false;
        }

        if (name[0] == '-' || name[^1] == '-')
        {
            return false;
        }

        foreach (var character in name)
        {
            if (character is not ((>= 'a' and <= 'z') or (>= '0' and <= '9') or '-'))
            {
                return false;
            }
        }

        return true;
    }
}
