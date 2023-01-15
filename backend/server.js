import express from 'express';
import cors from 'cors';
const server = express();
server.use(cors());
server.use(express.json());

const PORT = 5000

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))

export default server;