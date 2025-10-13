import { Router } from "express";

import { handleListNotifications, handleNotificationStream } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const notificationRouter = Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: List notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of notifications to return (default 50)
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserNotification'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
notificationRouter.get("/notifications", authenticate, handleListNotifications);

/**
 * @openapi
 * /api/notifications/stream:
 *   get:
 *     summary: Stream realtime notification updates (Server-Sent Events)
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification event stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "event: init\ndata: [{\"id\":\"...\",\"event\":\"contract:checkin\",\"payload\":{}}]\n\n"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
notificationRouter.get("/notifications/stream", authenticate, handleNotificationStream);

export default notificationRouter;
