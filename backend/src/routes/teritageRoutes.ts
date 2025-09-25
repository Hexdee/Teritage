import { Router } from "express";

import {
  handleCreateTeritage,
  handleGetLatestCheckIn,
  handleGetTeritage,
  handleListActivities,
  handleListCheckIns,
  handleRecordCheckIn,
  handleRecordClaim,
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
 *               - user
 *               - inheritors
 *               - tokens
 *               - checkInIntervalSeconds
 *             properties:
 *               ownerAddress:
 *                 type: string
 *               user:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   notes:
 *                     type: string
 *               inheritors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                     sharePercentage:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 100
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     notes:
 *                       type: string
 *               tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *               checkInIntervalSeconds:
 *                 type: integer
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               notifyBeneficiary:
 *                 type: boolean
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
 * /api/teritages/{ownerAddress}:
 *   get:
 *     summary: Get Teritage plan details
 *     tags: [Teritage]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
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
router.get("/teritages/:ownerAddress", handleGetTeritage);

/**
 * @openapi
 * /api/teritages/{ownerAddress}:
 *   put:
 *     summary: Update a Teritage plan
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/components/schemas/TeritageUser'
 *               inheritors:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TeritageInheritor'
 *               tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *               checkInIntervalSeconds:
 *                 type: integer
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               notifyBeneficiary:
 *                 type: boolean
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
router.put("/teritages/:ownerAddress", authenticate, handleUpdateTeritage);

/**
 * @openapi
 * /api/teritages/{ownerAddress}/activities:
  *   get:
 *     summary: List plan activities
 *     tags: [Teritage]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activities retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritageActivitiesResponse'
 */
router.get("/teritages/:ownerAddress/activities", handleListActivities);

/**
 * @openapi
 * /api/teritages/{ownerAddress}/checkins:
 *   get:
 *     summary: List check-ins
 *     tags: [Teritage]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check-ins retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritageCheckInsResponse'
 */
router.get("/teritages/:ownerAddress/checkins", handleListCheckIns);

/**
 * @openapi
 * /api/teritages/{ownerAddress}/checkins/latest:
 *   get:
 *     summary: Get latest check-in
 *     tags: [Teritage]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
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
router.get("/teritages/:ownerAddress/checkins/latest", handleGetLatestCheckIn);

/**
 * @openapi
 * /api/teritages/{ownerAddress}/checkins:
 *   post:
 *     summary: Record a check-in activity
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
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
router.post("/teritages/:ownerAddress/checkins", authenticate, handleRecordCheckIn);

/**
 * @openapi
 * /api/teritages/{ownerAddress}/claims:
 *   post:
 *     summary: Record an inheritance claim
 *     security:
 *       - bearerAuth: []
 *     tags: [Teritage]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - initiatedBy
 *             properties:
 *               initiatedBy:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Claim recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeritagePlanWithStatusResponse'
 *       400:
 *         description: Failed to record claim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
router.post("/teritages/:ownerAddress/claims", authenticate, handleRecordClaim);

export default router;
