FROM node:14-slim AS builder
WORKDIR /root
RUN apt-get update
RUN apt install -y gcc g++ make python
# Bundle APP files
COPY . .
# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production
# Show current folder structure in logs
RUN ls -al -R


FROM node:14-slim AS executor
WORKDIR /root
RUN npm install pm2 -g
COPY --from=builder /root ./

EXPOSE 3000
CMD [ "pm2-runtime", "start", "pm2.json" ]
