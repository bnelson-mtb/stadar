# Stage 1: build the React client (npm workspace: client + packages/shared)
FROM node:22-alpine AS client-build
WORKDIR /src
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY packages/shared/package.json packages/shared/
RUN npm ci
COPY packages/shared/ packages/shared/
COPY client/ client/
RUN npm run build -w client

# Stage 2: build the API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src
COPY Api/Api.csproj Api/
RUN dotnet restore Api/Api.csproj
COPY Api/ Api/
RUN dotnet publish Api/Api.csproj -c Release -o /app/publish

# Stage 3: runtime — API serves the built client from wwwroot
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=api-build /app/publish .
COPY --from=client-build /src/client/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]
