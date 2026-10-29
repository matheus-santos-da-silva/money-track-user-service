import "dotenv/config";
import { startTracing } from "./shared/observability/tracing";

startTracing("users-service");
