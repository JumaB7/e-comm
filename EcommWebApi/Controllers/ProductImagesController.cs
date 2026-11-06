using EcommWebApi.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/product-images")]
public class ProductImagesController(IProductImageStore images) : ControllerBase
{
    [HttpGet("{fileName}")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> Get(string fileName, CancellationToken cancellationToken)
    {
        var image = await images.FindPathByFileName(fileName, cancellationToken);
        return image is null ? NotFound() : File(image.Content, image.ContentType);
    }
}
