import { server, serverProtocol } from "./app";

const port = 5000;

server.listen(port, () => {
  return console.log(`Express is listening at ${serverProtocol}://localhost:${port}`);
});