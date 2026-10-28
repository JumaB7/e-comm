namespace EcommWebApi.Services;

public sealed class ShopOutcome<T>
{
    public T? Value { get; }
    public int Status { get; }
    public string? Message { get; }
    public bool Succeeded { get; }

    private ShopOutcome(T? value, int status, string? message, bool succeeded)
    {
        Value = value;
        Status = status;
        Message = message;
        Succeeded = succeeded;
    }

    public static ShopOutcome<T> Ok(T value) => new(value, 200, null, true);

    public static ShopOutcome<T> BadRequest(string message) => new(default, 400, message, false);

    public static ShopOutcome<T> Unauthorized(string message) => new(default, 401, message, false);

    public static ShopOutcome<T> NotFound(string? message = null) => new(default, 404, message, false);

    public static ShopOutcome<T> Conflict(string message) => new(default, 409, message, false);
}
