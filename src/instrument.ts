import "dotenv/config";
import { startTelemetry } from "./shared/observability/telemetry";

startTelemetry("users-service");
