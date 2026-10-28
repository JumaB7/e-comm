using EcommWebApi.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/product-images")]
public class ProductImagesController(ProductImageStore images) : ControllerBase
{
    [HttpGet("{fileName}")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
    public IActionResult Get(string fileName)
    {
        var path = images.FindPathByFileName(fileName);
        return path is null ? NotFound() : PhysicalFile(path, ProductImageStore.ContentType(path));
    }
}
