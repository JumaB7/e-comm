using EcommWebApi.Contracts;
using EcommWebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

static class ShopResults
{
    public static ActionResult<T> From<T>(ShopOutcome<T> outcome)
    {
        if (outcome.Succeeded)
        {
            return new OkObjectResult(outcome.Value);
        }
        if (outcome.Message is null)
        {
            return new StatusCodeResult(outcome.Status);
        }
        return new ObjectResult(new MessageModel(outcome.Message)) { StatusCode = outcome.Status };
    }
}
