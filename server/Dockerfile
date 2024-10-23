# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Bundle app source
COPY . .

# Compile TypeScript
RUN npm run build

# Set environment variables
# ENV OPENAI_API_KEY=""
# ENV MONGO_ATLAS_URI="""

# Expose the port your app runs on
EXPOSE 8000

# Command to run your app using node
CMD ["node", "dist/index.js"]