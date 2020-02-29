# Coding Challenge (Minesweeper)

## @mines/nest

The `@mines/nest` package in [`server-nest`](./server-nest) defines a server
using [NestJS][nestjs].

[nestjs]: https://docs.nestjs.com/

## @mines/ui

The `@mines/ui` package in [`ui`](./ui) defines the components for the web ui.
`Ui.Dockerfile` defines the Docker container for serving the web ui.
`Ui.Dockerfile` is defined in the repository root in order to take advantage of
Yarn workspaces. To build the web ui container locally execute:

    docker build --file=Ui.Dockerfile --tag=mines-ui:<version> .

To run the locally built Docker image:

    docker run --name=mines-ui --detach --publish=8080:80 mines-ui:<version>
