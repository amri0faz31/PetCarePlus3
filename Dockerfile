# -------------------------------
# Stage 1: Build backend
# -------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

# Copy solution + csproj
COPY PetCarePlus3.sln .
COPY backend/PetCarePlus3.Api/PetCarePlus3.Api.csproj ./backend/PetCarePlus3.Api/

# Restore dependencies
RUN dotnet restore PetCarePlus3.sln

# Copy backend source
COPY backend/PetCarePlus3.Api ./backend/PetCarePlus3.Api

# Build & publish backend
RUN dotnet publish backend/PetCarePlus3.Api -c Release -o /app/publish

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

# Build frontend (make sure VITE_API_BASE points to /api)
RUN echo "VITE_API_BASE=/api" > .env.production
RUN npx vite build --mode production

# -------------------------------
# Stage 3: Final image
# -------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/publish .

# Copy frontend build output into wwwroot
COPY --from=frontend-build /src/frontend/dist ./wwwroot

# Expose port 80
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Start backend
ENTRYPOINT ["dotnet", "PetCarePlus3.Api.dll"]
