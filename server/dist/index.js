"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const notebook_routes_1 = __importDefault(require("./routes/notebook.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/notebook', notebook_routes_1.default);
app.get('/health', (_, res) => {
    res.json({ ok: true });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
