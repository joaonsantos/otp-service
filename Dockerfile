FROM node:erbium-alpine3.10

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=prod

# If building code for production
# RUN npm ci --only=production

# Bundle app source
COPY . ./

EXPOSE 3030
CMD [ "npm", "run", "main" ]
