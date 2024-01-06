import express from 'express'
import { verifyToken } from '../middlewares/verifyToken'
import { createPlan, getPlans, updatePlanStatus } from '../controllers/planController'

const planRoutes = express.Router()

planRoutes.post('/create-plan', verifyToken, createPlan)
planRoutes.get('/get-plans', verifyToken, getPlans)
planRoutes.patch('/update-plan-status', verifyToken, updatePlanStatus)

export default planRoutes