# Coding Challenge (Minesweeper)

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
`/mines/dev` path and place them into `.env`. The `.env.sample` file includes
the names of environment variables expected in all packages. The environment
variables specific to the `@mines/nest` package are listed below.

- _API_JWT_SECRET_ is used by `LocalStrategy` and `JwtModule` (via
  `JwtConfigService`). It is the symmetric secret used to sign JWTs generated
  and verified by the API.
- _API_PORT_ is where the API will be served.

### Database

The `@mines/nest` server uses a database to store data about the games it is
serving. The database schema is managed through a set of database migrations
using [flyway][flyway] community edition. The migrations are kept in
[`migrations/versions`](./migrations/versions), the configuration stored in
[`migrations/config/flyway.conf`](./migrations/config/flyway.conf) points at a
local postgres database, an appropriate configuration can be started using
`docker-compose.yml` via `docker-compose up -d db`. To run the migrations from
the project root:

    flyway -configFiles=migrations/config/flyway.conf migrate

The above requires the `flyway` command to be accessible on the `$PATH`.

[flyway]: https://flywaydb.org/documentation/

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
`/mines/dev` path and place them into `.env`. The `.env.sample` file includes
the names of environment variables expected in all packages. The environment
variables specific to the `@mines/ui` package are listed below.

- _UI_BASE_API_URL_ is base URL including scheme (and port if needed) of the
  API server.

## @mines/uirs

The `@mines/uirs` package in [`ui-rs`](./ui-rs) defines a web UI with
[yew-rs][yewrs] and [mogwai][mogwai]. This is an experiment in building UI with
WebAssembly.

http://www.sheshbabu.com/posts/rust-wasm-yew-single-page-application/

[yewrs]: https://yew.rs
[mogwai]: https://github.com/schell/mogwai

The rust based UI is being built with `make` in order to have more direct
control over how `wasm-pack` is invoked. This can increase the feedback loop
while developing the rust user interface. An alternative would be to use the
[`@wasm-tool/wasm-pack-plugin`][@wasm-tool] with webpack, though this works the
plugin is shelling out to `wasm-pack` under the hood. By invoking `wasm-pack`
directly as needed it is possible to avoid _lots_ of CPU intensive rust
compilation cycles.

    # Build the packaged distribution
    make ui-rs/dist/index.html
    # Build only the wasm files
    make wasm
    # Start the development server
    yarn workspace @mines/uirs start

[@wasm-tool]: https://github.com/wasm-tool/wasm-pack-plugin#readme

### Environment Variables

The [`Makefile`](./Makefile) will pull parameters defined in AWS SSM under the
`/mines/dev` path and place them into `.env`. The `.env.sample` file includes
the names of environment variables expected in all packages. The environment
variables specific to the `@mines/uirs` package are listed below.

- _UI_BASE_API_URL_ is base URL including scheme (and port if needed) of the
  API server.

### Running in Development

The [`.watchman`](.watchman) directory contains configuration files for
compiling the WASM files when Rust or Cargo files change in the `@mines/uirs`
project. To use these files [watchman][watchman] needs to be installed. From
the project root directory:

    # Watch files in the project
    watchman watch .
    # Start rebuilding on changes
    watchman -j < .watchman/mines-uirs-crates.json
    # To tail the watchman log (which will include results of builds)
    tail -f $(watchman get-sockname | jq --raw-output '.sockname' | sed 's/sock$/log/' | tr -d '\n')

The watchman configuration, paired with `yarn workspace @mines/uirs start`,
will approximate the functionality of the `@wasm-tool/wasm-pack-plugin` but
using the build defined in the [`Makefile`](./Makefile).

The `.watchman/mines-uirs-query.json` contains the watchman query command to
list the files watchman is tracking.

[watchman]: https://facebook.github.io/watchman/

## docker-compose

The [`docker-compose.yml`](./docker-compose.yml) defines a
[localstack][localstack] and [event store][eventstore] container. These were
meant to be starting points for different types of databases. As well as an
[elasticsearch and kibana stack][elk] for experimentation.

[localstack]: https://github.com/localstack/localstack
[eventstore]: https://eventstore.com/
[elk]: https://www.elastic.co/what-is/elk-stack
