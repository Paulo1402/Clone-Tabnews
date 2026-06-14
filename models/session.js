import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function findOneValidByToken(sessionToken) {
  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
      `,
      values: [sessionToken],
    });

    if (results.rowCount == 0) {
      throw new UnauthorizedError({
        message: "Invalid session token.",
        action: "Please log in to obtain a valid session token.",
      });
    }

    return results.rows[0];
  }

  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;
}

async function create(userId) {
  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
      INSERT INTO
        sessions (token, user_id, expires_at)
      VALUES 
        ($1, $2, $3)
      RETURNING 
        *
        `,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }

  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;
}

async function renew(sessionId) {
  async function runUpdateQuery(sessionId, expiresAt) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [sessionId, expiresAt],
    });

    if (results.rowCount == 0) {
      throw new UnauthorizedError({
        message: "Invalid session token.",
        action: "Please log in to obtain a valid session token.",
      });
    }

    return results.rows[0];
  }
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);
  return renewedSessionObject;
}

async function expireById(sessionId) {
  async function runUpdateQuery(sessionId) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = expires_at - interval '1 year',
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [sessionId],
    });

    return results.rows[0];
  }

  const expiredSession = await runUpdateQuery(sessionId);
  return expiredSession;
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
