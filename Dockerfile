FROM node:18-alpine AS build
WORKDIR /app

# Copiar package.json y package-lock.json primero
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el resto de los archivos
COPY . .

# Ahora sí hacer el build
RUN npm run build

# Limpiar devDependencies después del build
RUN npm prune --production

FROM node:18-alpine

ENV NODE_ENV=production
WORKDIR /app

# Copiar solo lo necesario desde el build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Render asigna el puerto dinámicamente
EXPOSE ${PORT:-3000}

CMD ["node", "dist/main.js"]