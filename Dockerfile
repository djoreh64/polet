FROM node:20 AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

ARG VITE_API_URL
ARG VITE_TON_ADDRESS
ARG VITE_DEV

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TON_ADDRESS=${VITE_TON_ADDRESS}
ENV VITE_DEV=${VITE_DEV}

COPY . .

RUN pnpm add -D esbuild@0.25.0

RUN pnpm build

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "preview", "--host"]
