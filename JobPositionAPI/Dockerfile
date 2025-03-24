
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["JobPositionAPI/JobPositionAPI.csproj", "JobPositionAPI/"]
RUN dotnet restore "JobPositionAPI/JobPositionAPI.csproj"

COPY . .

WORKDIR "/src/JobPositionAPI"
RUN dotnet publish "JobPositionAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5235

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "JobPositionAPI.dll"]
