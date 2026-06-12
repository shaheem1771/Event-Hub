import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import eventsRouter from "./events";
import adminRouter from "./admin";
import studentsRouter from "./students";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(eventsRouter);
router.use(adminRouter);
router.use(studentsRouter);

export default router;
