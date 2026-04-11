using MediatR;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Shared.Kernel.Application;

public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }

public interface IQueryHandler<TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse> { }
