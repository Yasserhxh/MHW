using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Shared.Infrastructure.Extensions;

public static class ResultExtensions
{
    public static IResult ToHttpResult(this Result result) =>
        result.IsSuccess
            ? Results.NoContent()
            : MapError(result.Error);

    public static IResult ToHttpResult<T>(this Result<T> result) =>
        result.IsSuccess
            ? Results.Ok(result.Value)
            : MapError(result.Error);

    public static IResult ToCreatedResult<T>(this Result<T> result, string location) =>
        result.IsSuccess
            ? Results.Created(location, result.Value)
            : MapError(result.Error);

    public static IResult ToCreatedResult<T>(this Result<T> result, Func<T, string> locationFactory) =>
        result.IsSuccess
            ? Results.Created(locationFactory(result.Value), result.Value)
            : MapError(result.Error);

    private static IResult MapError(Error error)
    {
        var statusCode = error.Type switch
        {
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status422UnprocessableEntity,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = error.Type.ToString(),
            Detail = error.Description,
            Extensions = { ["errorCode"] = error.Code }
        };

        return Results.Problem(problem);
    }
}
