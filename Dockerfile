FROM keymetrics/pm2:14-alpine AS builder
WORKDIR /root
RUN apk add build-base
RUN apk add python
# Bundle APP files
COPY . .
# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production
# Show current folder structure in logs
RUN ls -al -R


FROM keymetrics/pm2:14-alpine AS executor
WORKDIR /root
COPY --from=builder /root ./

CMD [ "pm2-runtime", "start", "pm2.json" ]
