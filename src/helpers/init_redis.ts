import * as redis from "redis"
const { REDIS_HOST, REDIS_PORT } = process.env as { [key: string]: string }

export const client = redis.createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` })

const run = async () => {
    client.on("connect", () => console.log("Client connected to redis..."))
    client.on("ready", async () => console.log("Client connected to redis and ready to use..."))
    client.on("error", (err) => console.log(err.message))
    client.on("end", () => console.log("Client disconnected from redis"))
    process.on("SIGINT", () => client.quit())
    await client.connect()
    await client.ping()
}

run()

export default client
