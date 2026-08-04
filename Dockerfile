FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3040

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]