import cors from "cors"
import express, { Application, ErrorRequestHandler } from "express"
import helmet from "helmet"
import createError from "http-errors"
import morgan from "morgan"
import responseTime from "response-time"
import "./helpers/init_db"
import AuthRoute from "./routes/auth.route"

const app: Application = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(responseTime())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", async (req, res) => {
    res.send("Hello World")
})

app.use("/auth", AuthRoute)

// error handlers
app.use(async (req, res, next) => {
    next(new createError.NotFound())
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    })
}

app.use(errorHandler)

export default app
