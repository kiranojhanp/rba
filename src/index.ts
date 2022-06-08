require("./helpers/init_config")
import http from "http"
import app from "./app"

const server = http.createServer(app)

const { API_PORT } = process.env
const port = API_PORT || 3000

// server listening
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
