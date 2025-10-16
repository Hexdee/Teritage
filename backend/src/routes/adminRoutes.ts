import { Router } from "express";

import { handleClearDatabase } from "../controllers/adminController.js";

const adminRouter = Router();

/**
 * @openapi
 * /api/admin/database/clear:
 *   post:
 *     summary: Clear all collections from the database
 *     description: Permanently deletes all stored data. Requires the clearance code.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClearDatabaseRequest'
 *     responses:
 *       200:
 *         description: Database cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       403:
 *         description: Invalid clearance code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       500:
 *         description: Failed to clear database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
adminRouter.post("/admin/database/clear", handleClearDatabase);

export default adminRouter;
