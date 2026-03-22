"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.hasNotebookLMConfig = hasNotebookLMConfig;
exports.hasGeminiConfig = hasGeminiConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    supabase: {
        url: process.env.SUPABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    notebooklm: {
        projectNumber: process.env.GCP_PROJECT_NUMBER || '',
        location: process.env.GCP_LOCATION || 'us',
        baseUrl: process.env.NOTEBOOKLM_BASE_URL || 'https://us-discoveryengine.googleapis.com/v1alpha',
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
    },
};
function hasNotebookLMConfig() {
    return !!(exports.config.notebooklm.projectNumber && exports.config.supabase.url && exports.config.supabase.serviceRoleKey);
}
function hasGeminiConfig() {
    return !!exports.config.gemini.apiKey;
}
