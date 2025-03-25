
# Project Title

Job position management platform


## Contributing

FE - React 

BE - .NET

Both FE and BE are dockerized.

## Backend Testing Modifications
To prepare the backend for testing, please apply the following changes:

- In JobPositionAPI/controller/PositionsController.cs:

  Uncomment line 26.

  Comment out line 27.

- In JobPositionAPI/services/RabbitMqConsumerService.cs:

  Uncomment line 19.

  Comment out line 20.

## Frontend Testing Modifications
To prepare the frontend for testing, please apply the following changes:

- In services/api.ts:

  Uncomment line 3.

  Comment out line 4.

- In services/signalRservice.ts:

  For testing purposes, use the following URL in line 7:
  https://localhost:7154/positionHub.

## Demo

How to run the project using docker

cmds : 
docker-compose -p jobposition up --build




