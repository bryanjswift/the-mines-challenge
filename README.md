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

### Testing

Unit tests are written with [Jest][jest] and are complemented with
[Stryker][stryker]. Test execution is done with the `test` or `test:*` scripts
defined in [`server-nest/package.json`](./server-nest/package.json).

- `yarn test` or `yarn workspace @mines/nest test` to execute tests once
- `yarn test:watch` or `yarn workspace @mines/nest test:watch` to execute tests
  related to recently changed files
- `yarn test:e2e` or `yarn workspace @mines/nest test:e2e` to execute "end to
  end" tests
- `yarn workspace @mines/nest exec stryker run` will execute the unit tests
  under the supervision of stryker in order to find places where changing the
  code doesn't break the tests

[jest]: https://jestjs.io
[stryker]: https://stryker-mutator.io

## @mines/ui

The `@mines/ui` package in [`ui`](./ui) defines the components for the web ui.
`Ui.Dockerfile` defines the Docker container for serving the web ui.
`Ui.Dockerfile` is defined in the repository root in order to take advantage of
Yarn workspaces. To build the web ui container locally execute:

    docker build --file=Ui.Dockerfile --tag=mines-ui:<version> .

To run the locally built Docker image:

    docker run --name=mines-ui --detach --publish=4000:3000 mines-ui:<version>

### Environment Variables

The [`Makefile`](./Makefile) will pull parameters defined in AWS SSM under the
`/mines/dev/ui` path and place them into `ui/.env`. The `ui/.env.sample` file
includes the names of environment variables the `@mines/ui` package expects.

- _API_BASE_URL_ is base URL including scheme (and port if needed) of the API
  server.

## docker-compose

The [`docker-compose.yml`](./docker-compose.yml) defines a
[localstack][localstack] and [event store][eventstore] container. These were
meant to be starting points for different types of databases. As well as an
[elasticsearch and kibana stack][elk] for experimentation.

[localstack]: https://github.com/localstack/localstack
[eventstore]: https://eventstore.com/
[elk]: https://www.elastic.co/what-is/elk-stack
