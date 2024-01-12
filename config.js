import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  DEBUG: false,
  RICH_LOG_ENABLED: false,
  DISABLE_SERVE_STATIC: true,

  CUSTOM_PLUGINS_PATH: __dirname + "/plugins",

  baseAppUrl: "http://localhost",
  port: 3000,
};
