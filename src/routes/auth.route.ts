import { Router } from "express"
import { admin, login, register } from "../controllers/auth.controller"
import { verifyAuthentication, verifyAuthorization } from "../middlewares/auth.middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/admin", verifyAuthentication, verifyAuthorization(["admin", "super-admin"]), admin)

export default router
