import { Role } from "@prisma/client";
import { Router } from "express";
import { approve, listPending, reject } from "../controllers/adminLabour.controller";
import { requireAuth, requirePermission, requireRole } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Every route here is admin-only.
router.use(requireAuth, requireRole(Role.ADMIN));

// Additionally gated by the specific ADMIN_PERMISSIONS entry each action
// corresponds to (constants/adminPermissions.ts) — an ADMIN account only
// gets access here once a SUPER_ADMIN has explicitly granted it via
// assignPermissions (adminManagement.service.ts). See requirePermission's
// doc comment in auth.middleware.ts for why this was previously a gap.
router.get("/pending", requirePermission("LABOUR_VERIFICATION_VIEW"), asyncHandler(listPending));
router.patch(
  "/:id/approve",
  requirePermission("LABOUR_VERIFICATION_APPROVE"),
  asyncHandler(approve)
);
router.patch(
  "/:id/reject",
  requirePermission("LABOUR_VERIFICATION_REJECT"),
  asyncHandler(reject)
);

export default router;
