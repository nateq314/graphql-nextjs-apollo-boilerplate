FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN apk add bash git vim tmux
RUN yarn install
EXPOSE 3000
ENV PS1="\[\e[1;32m\]\u\[\e[m\] \[\e[1;34m\]\w\[\e[m\] \[\e[1;32m\]\$\[\e[m\] " \
  NODE_ENV="development"
CMD ["yarn", "dev"]