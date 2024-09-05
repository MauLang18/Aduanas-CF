# Etapa de desarrollo - Instalación de dependencias
FROM node:22.3.0 AS dev-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm cache clean --force
RUN npm i --force

# Etapa de construcción - Compilación de la aplicación
FROM dev-deps AS builder
COPY . .
RUN npm run build --prod

# Etapa de producción - Servidor Nginx
FROM nginx:1.23.3
EXPOSE 80
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/ /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]