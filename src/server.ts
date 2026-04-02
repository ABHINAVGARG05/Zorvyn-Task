import app from "./app";
import { env } from "./constants/constant";
import logger from "./utils/logger";

app.listen(env.PORT, () => {
  logger.info(`App running on port ${env.PORT}`);
});
