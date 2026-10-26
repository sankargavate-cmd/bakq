import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsOrigins, isProduction } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import routes from "./routes";

export function createApp(): Application {
  const app = express();

  // This app is deployed on Render (see render.yaml), which always sits
  // in front of the Node process as a single reverse-proxy hop. Without
  // this, Express's `req.ip` (and `req.ips`) reflects the socket peer
  // address of that hop itself — the same for every request regardless
  // of who the real client is — rather than the client's actual address
  // from X-Forwarded-For. `authRateLimit` (middlewares/rateLimiter.ts)
  // keys its buckets by `req.ip`, so without this setting every visitor
  // effectively shares one IP component: a genuine attacker and a
  // legitimate farmer hammering /login from different homes would be
  // indistinguishable, and the limiter's own "keyed by IP" reasoning
  // would not hold in production. `1` trusts exactly one hop (Render's
  // edge), matching the actual deployment topology — not `true`, which
  // would trust the entire X-Forwarded-For chain including anything a
  // client itself prepends.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      // Reflects the request origin back only if it's in the allowed list
      // (supports the Vercel production URL plus preview-deployment URLs).
      origin(requestOrigin, callback) {
        if (!requestOrigin || corsOrigins.includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${requestOrigin} is not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );
  app.use(
    express.json({
      // Cashfree webhook signature verification (cashfree.service.ts)
      // must HMAC the exact raw bytes of the request body — parsing to
      // JSON and re-serializing can change whitespace/decimal formatting
      // and silently break the signature. Stashing the raw buffer here,
      // scoped to only the webhook path, avoids holding onto raw bytes
      // for every request in the app.
      verify: (req, _res, buf) => {
        if (req.originalUrl.startsWith("/api/v1/payments/cashfree/webhook")) {
          req.rawBody = Buffer.from(buf);
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(isProduction ? "combined" : "dev"));

  app.use("/api/v1", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
