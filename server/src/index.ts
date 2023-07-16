import createServer from "./createServer";

const port = 5000;

const serverProtocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const { server } = createServer(serverProtocol);

server?.listen(port, () => {
  return console.log(`Express is listening at ${serverProtocol}://localhost:${port}`);
});