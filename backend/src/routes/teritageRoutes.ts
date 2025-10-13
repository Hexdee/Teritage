import { Router } from "express";

import {
  handleCreateTeritage,
  handleGetLatestCheckIn,
  handleGetTeritage,
  handleListActivities,
  handleListCheckIns,
  handleRecordCheckIn,
  handleUpdateTeritage
} from "../controllers/teritageController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/teritages:
 *   post:
 *     summary: Create a Teritage plan
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerAddress
 *               - inheritors
 *               - tokens
 *               - checkInIntervalSeconds
 *             properties:
 *               ownerAddress:
 *                 type: string
 *                 description: Blockchain address that owns the on-chain inheritance plan
 *               inheritors:
 *                 type: array
 *                 description: List of inheritors and their allocation percentages (must sum to 100)
 *                 items:
 *                   $ref: '#/components/schemas/TeritageInheritor'
 *               tokens:
 *                 type: array
 *                 description: Tokens tracked by the inheritance plan
 *                 items:
 *                   $ref: '#/components/schemas/TeritageToken'
 *               checkInIntervalSeconds:
 *                 type: integer
 *                 description: Required owner check-in cadence in seconds
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               notifyBeneficiary:
 *                 type: boolean
 *                 description: Whether inheritors should be notified automatically when the plan is claimed
 *     responses:
 *       201:
 *         description: Teritage plan created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritagePlanResponse'
 *       400:
 *         description: Creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.post("/teritages", authenticate, handleCreateTeritage);

/**
 * @openapi
 * /api/teritages:
 *   get:
 *     summary: Get the authenticated user's Teritage plan
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     responses:
 *       200:
 *         description: Teritage plan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritagePlanWithStatusResponse'
 *       404:
 *         description: Plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.get("/teritages", authenticate, handleGetTeritage);

/**
 * @openapi
 * /api/teritages:
 *   patch:
 *     summary: Update the authenticated user's Teritage plan
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeritagePlanRequest'
 *     responses:
 *       200:
 *         description: Teritage plan updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritagePlanResponse'
 *       400:
 *         description: Update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       404:
 *         description: Plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.patch("/teritages", authenticate, handleUpdateTeritage);

/**
 * @openapi
 * /api/teritages/activities:
 *   get:
 *     summary: List plan activities
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     responses:
 *       200:
 *         description: Activities retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritageActivitiesResponse'
 */
router.get("/teritages/activities", authenticate, handleListActivities);

/**
 * @openapi
 * /api/teritages/checkins:
 *   get:
 *     summary: List check-ins
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     responses:
 *       200:
 *         description: Check-ins retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritageCheckInsResponse'
 */
router.get("/teritages/checkins", authenticate, handleListCheckIns);

/**
 * @openapi
 * /api/teritages/checkins/latest:
 *   get:
 *     summary: Get latest check-in
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     responses:
 *       200:
 *         description: Latest check-in returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritageLatestCheckInResponse'
 *       404:
 *         description: No check-ins present
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.get("/teritages/checkins/latest", authenticate, handleGetLatestCheckIn);

/**
 * @openapi
 * /api/teritages/checkins:
 *   post:
 *     summary: Record a check-in activity
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               triggeredBy:
 *                 type: string
 *               note:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Check-in recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritagePlanWithStatusResponse'
 *       400:
 *         description: Failed to record check-in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.post("/teritages/checkins", authenticate, handleRecordCheckIn);

export default router;
