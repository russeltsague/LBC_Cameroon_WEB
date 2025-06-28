"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classificationController_1 = require("../controllers/classificationController");
const router = express_1.default.Router();
// Get all classifications or filter by category
router.get('/', classificationController_1.getClassification);
// Update classification after a match
router.post('/update', classificationController_1.updateClassification);
exports.default = router;
