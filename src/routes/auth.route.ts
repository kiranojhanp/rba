import { Router } from "express"
import { admin, login, register } from "../controllers/auth.controller"
import { verifyAuthentication as authenticate, verifyAuthorization as allow } from "../middlewares/auth.middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/admin", authenticate, allow(["admin", "super-admin"]), admin)

export default router
