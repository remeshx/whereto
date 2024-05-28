import { Router } from "express";
import express, {Response, Request} from "express";
import { getFlights

 } from "./controller/flights";
const router = Router();

router.get('/flights', getFlights)

export default router;