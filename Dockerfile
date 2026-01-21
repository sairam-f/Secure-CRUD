FROM node:20-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install dependencies
COPY src/package.json /app/package.json
RUN npm install --omit=dev

# Copy source
COPY src/ /app/

# Drop privileges
USER appuser

EXPOSE 5000
CMD ["npm", "start"]
