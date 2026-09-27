# Multi-stage Dockerfile for All-in-One Studio Management System
# 1. Build Frontend (React + Vite)
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. Build Backend (.NET 8 VB.NET API)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /backend
COPY backend/StudioAPI.vbproj ./
RUN dotnet restore
COPY backend/ ./
# Copy built frontend assets into backend wwwroot so .NET can serve them
COPY --from=frontend-build /frontend/dist ./wwwroot
RUN dotnet publish -c Release -o /app/publish

# 3. Final Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .

# Default environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "StudioAPI.dll"]
