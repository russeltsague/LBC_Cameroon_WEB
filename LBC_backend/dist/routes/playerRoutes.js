"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playerController_1 = require("../controllers/playerController");
const router = express_1.default.Router();
router.get('/team/:teamId', playerController_1.getPlayersByTeam);
router.post('/', playerController_1.createPlayer);
router.put('/:id', playerController_1.updatePlayer);
router.delete('/:id', playerController_1.deletePlayer);
exports.default = router;
