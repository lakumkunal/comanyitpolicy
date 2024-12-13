# Use the appropriate Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Disable proxy settings (if any)
RUN npm config set proxy null

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Copy utils folder from the project root directory
COPY ../utils ./utils  

# Expose the port
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]
