# -------------------------------
# Stage 1: Build backend
# -------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

# Copy solution & props
COPY backend/PetCare.sln ./backend/
COPY backend/Directory.Build.props ./backend/

# Copy backend project files for restore caching
COPY backend/src/PetCare.Api/PetCare.Api.csproj ./backend/src/PetCare.Api/
COPY backend/src/PetCare.Application/PetCare.Application.csproj ./backend/src/PetCare.Application/
COPY backend/src/PetCare.Domain/PetCare.Domain.csproj ./backend/src/PetCare.Domain/
COPY backend/src/PetCare.Infrastructure/PetCare.Infrastructure.csproj ./backend/src/PetCare.Infrastructure/
COPY backend/tests ./backend/tests

# Restore dependencies
RUN dotnet restore ./backend/PetCare.sln

# Copy backend source code
COPY backend ./backend

# Build & publish backend
RUN dotnet publish ./backend/src/PetCare.Api -c Release -o /app/publish

# -------------------------------
# Stage 2: Build frontend
# -------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /src/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Create production environment file
RUN echo "VITE_API_BASE_URL=/" > .env.production

# Build frontend
RUN npm run build

# -------------------------------
# Stage 3: Final image
# -------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy backend published output
COPY --from=backend-build /app/publish .

# Copy frontend build output into ASP.NET wwwroot
COPY --from=frontend-build /src/frontend/dist ./wwwroot

# Expose port for Azure
EXPOSE 80

# Start backend (serves frontend from wwwroot)
ENTRYPOINT ["dotnet", "PetCare.Api.dll"]
