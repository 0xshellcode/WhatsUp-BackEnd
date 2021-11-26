FROM node:latest

WORKDIR /var/www/app

COPY *.json ./

RUN npm install 

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]