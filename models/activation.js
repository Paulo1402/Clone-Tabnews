import email from "infra/email";
import database from "infra/database";
import webserver from "infra/webserver";
import user from "models/user";
import { NotFoundError } from "infra/errors";

const EXPIRATION_TIME_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);
  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      `,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Activation token not found or expired",
        action:
          "Please request a new activation token to activate your account",
      });
    }

    return results.rows[0];
  }
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_TIME_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [activationTokenId],
    });

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, ["create:session"]);
  return activatedUser;
}

async function sendEmailToUser(user, activationToken) {
  const msg = `
Hi ${user.username}, click the link below to activate your account:


${webserver.origin}/activate/${activationToken.id}


If you did not create an account, please ignore this email. This link will expire in 15 minutes.


Best regards,
The Tabnews Team
`;

  await email.send({
    from: "<contato@tabnews.com>",
    to: user.email,
    subject: "Activate your account",
    text: msg.trim(),
  });
}

const activation = {
  findOneValidById,
  create,
  markTokenAsUsed,
  activateUserByUserId,
  sendEmailToUser,
};

export default activation;
