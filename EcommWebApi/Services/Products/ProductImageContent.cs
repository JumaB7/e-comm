namespace EcommWebApi.Services.Products;

public sealed class ProductImageContent(Stream content, string contentType)
{
    public Stream Content { get; } = content;

    public string ContentType { get; } = contentType;
}
