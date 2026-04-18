FROM node:24-alpine

# Update system, install PM2 globally, and other required tools
RUN apk add --no-cache net-tools && npm install pm2 -g

# Copy the application files to the container
COPY ./ /NODE_BOILERPLATE

# Set the working directory
WORKDIR /NODE_BOILERPLATE

ENV NODE_ENV=production


RUN npm install --omit=dev
# Run the application commands inline (merged from entrypoint.sh)
CMD ["pm2-runtime", "src/index.js"]
