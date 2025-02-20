FROM node:20-alpine

WORKDIR /src

COPY package*.json .

RUN npm install && npm install typescript -g

COPY . . 

RUN npm run db:generate

RUN tsc -b 


EXPOSE 3000

CMD ["npm" , "run" ,"prod"]