FROM node:14.17.4-alpine

COPY . .

# ENV UV_THREADPOOL_SIZE 1

CMD ["node", "./overload.js"]