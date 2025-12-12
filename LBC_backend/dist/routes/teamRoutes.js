"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamController_1 = require("../controllers/teamController");
const router = express_1.default.Router();
// Bulk import routes (must come before /:id routes)
router.post('/bulk-import', teamController_1.bulkImportTeams);
router.get('/bulk-import/template', teamController_1.getBulkImportTemplate);
// Standard CRUD routes
router.get('/', teamController_1.getTeams);
router.get('/:id', teamController_1.getTeam);
router.post('/', teamController_1.createTeam);
router.put('/:id', teamController_1.updateTeam);
router.delete('/:id', teamController_1.deleteTeam);
exports.default = router;
