FROM node:16-alpine
WORKDIR /usr/src/app

# install packages
COPY package*.json ./
RUN npm ci

# copy everything
COPY . .

# start the server
EXPOSE 8080
CMD [ "npm", "start" ]
# CMD [ "npm", "run", "dev" ]
