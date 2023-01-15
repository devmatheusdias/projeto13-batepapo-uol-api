import { nameSchema } from "./schemas/participants.schema.js";
import { messageSchema } from "./schemas/message.schema.js";
import { MongoClient } from "mongodb";
import dayjs from "dayjs";
import dotenv from 'dotenv'
import express from 'express';
import cors from 'cors';

const server = express();
server.use(cors());
server.use(express.json());

server.listen(5000, () => console.log(`Servidor rodando`))

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL)

export let db;


try {
    await mongoClient.connect();
    db = mongoClient.db("minhadb")
    console.log(`conectado ao banco de dados`)

} catch (error) {
    console.log('Erro ao conectar no banco de dados ')
}


function nameValidate(name, res) {

    const { error, value } = nameSchema.validate(name);

    if (error) res.sendStatus(422).send(error.details)
}

function messageValidate(message, res) {

    const { error, value } = messageSchema.validate(message);

    if (error) {
        return res.status(422).send(error.details)
    }
}

// function getTime() {
//     const date = dayjs(Date()).format('HH:mm:ss')
//     return date
// }


server.post("/participants", async (req, res) => {

    const { name } = req.body;
    const date = dayjs(Date()).format('HH:mm:ss')

    nameValidate(req.body, res);

    try {
        const userExists = await db.collection("participants").findOne({ name: name });

        if (userExists) {
            return res.status(409).send("");
        }

        await db.collection("participants").insert({ name: name, lastStatus: Date.now() })

        // await db.collection("messages").insertOne({
        //     from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: date
        // })

        return res.status(201).send("")

    } catch (error) {

        res.status(422)
    }

})

server.get("/participants", async (req, res) => {

    try {
        const participants = await db.collection("participants").find().toArray()
        res.send(participants)

    } catch (error) {
        console.log(error);
    }

})

server.post("/messages", async (req, res) => {

    const { to, text, type } = req.body;
    const user = req.headers.user;

    messageValidate(req.body, res)

    try {

        const userExists = await db.collection("participants").findOne({ name: user });
        console.log(user)

        if (!userExists) {
            return res.status(422).send("Este usuario nao existe!");
        }

        await db.collection("messages").insertOne({ from: user, to: to, text: text, type: type, time: getTime() })

        res.status(201)

    } catch (error) {
        res.send(error.details)
    }
})

server.get("/messages", async (req, res) => {
    const { limit } = req.query

    try {
        const messages = await db.collection("messages").find().toArray()

        if (limit < 1 || limit === undefined) {
            return res.send(messages)
        }

        const lastMessages = messages.slice(0, parseInt(limit));

        res.send(lastMessages)

    } catch (error) {
        res.send(error.details)
    }
})


server.post("/status", async (req, res) => {
    const user = req.headers.user;

    try {

        const userExists = await db.collection("participants").updateOne(
            { name: user }, { $set: { lastStatus: Date.now() } }
        )

        if (userExists.modifiedCount === 0) {
            return res.status(404).send("Esse usuario não existe!");
        }

        res.status(200).send("atualizado!")

    } catch (error) {
        res.send(error.details)
    }
})

