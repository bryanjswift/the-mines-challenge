# Coding Challenge (Minesweeper)

## @mines/express

The `@mines/express` package in [`server-express`](./server-express) defines a
server using [ExpressJS][expressjs] to act as an API server. The Express API
server is not as well defined as the NestJS API server but it uses
significantly fewer dependencies from the jump.

[expressjs]: https://docs.nestjs.com/

### Environment Variables

The [`Makefile`](./Makefile) will pull parameters defined in AWS SSM under the
`/mines/dev/express` path and place them into `server-express/.env`. The
`server-express/.env.sample` file includes the names of environment variables
the `@mines/express` package expects.

- _JWT_SECRET_ is not used anywhere in `server-express` but is used to
  demonstrate the SSM setup.

## @mines/nest

The `@mines/nest` package in [`server-nest`](./server-nest) defines a server
using [NestJS][nestjs] to act as an API server. The API server has a naive
authentication layer in
[`LocalStrategy`](./server-nest/src/auth/local.strategy.ts). The `/auth/login`
endpoint uses this strategy to provide a JWT.

[nestjs]: https://docs.nestjs.com/

The API server includes a GraphQL endpoint courtesy of the `@nestjs/graphql`
package. The [NestJS GraphQL docs][nestjs-graphql] provide more detail on using
the decorators which power the `@nestjs/graphql` setup.

[nestjs-graphql]: https://docs.nestjs.com/graphql/quick-start

### Environment Variables

The [`Makefile`](./Makefile) will pull parameters defined in AWS SSM under the
`/mines/dev/nest` path and place them into `server-nest/.env`. The
`server-nest/.env.sample` file includes the names of environment variables the
`@mines/nest` package expects.

- _APM_SERVICE_ENABLED_ identifies if the application should attempt to connect
  and send data to Elastic APM.
- _APM_SERVICE_URL_ is used by the `elastic-apm-node` library to know where to
  send application performance monitoring data.
- _APM_SERVICE_NAME_ is used by the `elastic-apm-node` library to identify data
  the service sends to Elastic APM.
- _APM_SERVICE_TOKEN_ is used by the `elastic-apm-node` library to authenticate
  against Elastic APM.
- _JWT_SECRET_ is used by `LocalStrategy` and `JwtModule` (via
  `JwtConfigService`). It is the symmetric secret used to sign JWTs generated
  and verified by the API.
- _PORT_ is where the API will be served.

## @mines/ui

The `@mines/ui` package in [`ui`](./ui) defines the components for the web ui.
`Ui.Dockerfile` defines the Docker container for serving the web ui.
`Ui.Dockerfile` is defined in the repository root in order to take advantage of
Yarn workspaces. To build the web ui container locally execute:

    docker build --file=Ui.Dockerfile --tag=mines-ui:<version> .

To run the locally built Docker image:

    docker run --name=mines-ui --detach --publish=8080:80 mines-ui:<version>

## docker-compose

The [`docker-compose.yml`](./docker-compose.yml) defines a
[localstack][localstack] and [event store][eventstore] container. These were
meant to be starting points for different types of databases. As well as an
[elasticsearch and kibana stack][elk] for experimentation.

[localstack]: https://github.com/localstack/localstack
[eventstore]: https://eventstore.com/
[elk]: https://www.elastic.co/what-is/elk-stack
