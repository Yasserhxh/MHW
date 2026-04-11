FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["src/backend/Host/MoroccanWallet.Host/MoroccanWallet.Host.csproj", "Host/MoroccanWallet.Host/"]
COPY ["src/backend/Shared/MoroccanWallet.Shared.Kernel/MoroccanWallet.Shared.Kernel.csproj", "Shared/MoroccanWallet.Shared.Kernel/"]
COPY ["src/backend/Shared/MoroccanWallet.Shared.Infrastructure/MoroccanWallet.Shared.Infrastructure.csproj", "Shared/MoroccanWallet.Shared.Infrastructure/"]
COPY ["src/backend/Modules/Identity/MoroccanWallet.Modules.Identity/MoroccanWallet.Modules.Identity.csproj", "Modules/Identity/MoroccanWallet.Modules.Identity/"]
COPY ["src/backend/Modules/Users/MoroccanWallet.Modules.Users/MoroccanWallet.Modules.Users.csproj", "Modules/Users/MoroccanWallet.Modules.Users/"]
COPY ["src/backend/Modules/HouseholdBudget/MoroccanWallet.Modules.HouseholdBudget/MoroccanWallet.Modules.HouseholdBudget.csproj", "Modules/HouseholdBudget/MoroccanWallet.Modules.HouseholdBudget/"]
COPY ["src/backend/Modules/SharedExpenses/MoroccanWallet.Modules.SharedExpenses/MoroccanWallet.Modules.SharedExpenses.csproj", "Modules/SharedExpenses/MoroccanWallet.Modules.SharedExpenses/"]
COPY ["src/backend/Modules/GroceryPrices/MoroccanWallet.Modules.GroceryPrices/MoroccanWallet.Modules.GroceryPrices.csproj", "Modules/GroceryPrices/MoroccanWallet.Modules.GroceryPrices/"]
COPY ["src/backend/Modules/Reminders/MoroccanWallet.Modules.Reminders/MoroccanWallet.Modules.Reminders.csproj", "Modules/Reminders/MoroccanWallet.Modules.Reminders/"]
COPY ["src/backend/Modules/Notifications/MoroccanWallet.Modules.Notifications/MoroccanWallet.Modules.Notifications.csproj", "Modules/Notifications/MoroccanWallet.Modules.Notifications/"]
COPY ["src/backend/Modules/ReferenceData/MoroccanWallet.Modules.ReferenceData/MoroccanWallet.Modules.ReferenceData.csproj", "Modules/ReferenceData/MoroccanWallet.Modules.ReferenceData/"]
COPY ["src/backend/Modules/Administration/MoroccanWallet.Modules.Administration/MoroccanWallet.Modules.Administration.csproj", "Modules/Administration/MoroccanWallet.Modules.Administration/"]

RUN dotnet restore "Host/MoroccanWallet.Host/MoroccanWallet.Host.csproj"

COPY src/backend/ .
RUN dotnet build "Host/MoroccanWallet.Host/MoroccanWallet.Host.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
RUN dotnet publish "Host/MoroccanWallet.Host/MoroccanWallet.Host.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MoroccanWallet.Host.dll"]
