# Use the official Node.js image to build the app
FROM node:16 AS build

# Set working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the React app
RUN npm run build

# Use a simple web server to serve the static files
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 3001 for serving the app
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
