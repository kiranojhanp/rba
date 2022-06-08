import { connect, connection } from "mongoose"
const { MONGO_URI, DB_NAME } = process.env as { [key: string]: string }

connect(MONGO_URI, { dbName: DB_NAME })
    .then(() => {
        console.log("mongodb connected.")
    })
    .catch((err) => console.log(err.message))

connection.on("connected", () => {
    console.log("Mongoose connected to db")
})

connection.on("error", (err) => {
    console.log(err.message)
})

connection.on("disconnected", () => {
    console.log("Mongoose connection is disconnected.")
})

process.on("SIGINT", async () => {
    await connection.close()
    process.exit(0)
})
