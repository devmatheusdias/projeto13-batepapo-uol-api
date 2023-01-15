import { MongoClient } from "mongodb";
import dotenv from 'dotenv'

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL)

export let db;

const database = "minhadb";

try {
    await mongoClient.connect();
    db = mongoClient.db(database)
    console.log(`conectado ao banco de dados ${database}`)

} catch (error) {
    console.log('Erro ao conectar no banco de dados ')
}


setInterval(async () => {
    const participants = await db.collection("participants").find().toArray();

    participants.map(async (participant) => {
        if (Date.now() - participant.lastStatus >= 14000) {

            try {
                await db.collection("participants").deleteOne({ name: participant.name })

                console.log(
                    `${participant.name} inativo a mais de 10 segundos removido do banco de dados!`
                );
            } catch (error) {

                console.log('erro ao deleter usuario do banco de dados');
            }
        }
    })
}, 1000);
