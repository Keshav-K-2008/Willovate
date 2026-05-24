# Use the official Microsoft .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["backend/SmartOffer.Api/SmartOffer.Api.csproj", "backend/SmartOffer.Api/"]
RUN dotnet restore "backend/SmartOffer.Api/SmartOffer.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/backend/SmartOffer.Api"
RUN dotnet build "SmartOffer.Api.csproj" -c Release -o /app/build

# Publish the build
FROM build AS publish
RUN dotnet publish "SmartOffer.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "SmartOffer.Api.dll"]
