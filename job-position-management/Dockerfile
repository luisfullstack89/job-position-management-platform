
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install crypto-browserify stream-browserify

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
