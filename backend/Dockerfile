FROM node:20-alpine

WORKDIR /app

# Déps
COPY package*.json ./
RUN npm ci

# Copier le schéma ET l'env avant prisma
COPY prisma ./prisma
COPY .env .          
RUN apk add --no-cache openssl libc6-compat
RUN npx prisma validate && npx prisma generate

# Code
COPY tsconfig.json ./
COPY src ./src

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "dev"]