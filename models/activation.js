import email from "infra/email";
import database from "infra/database";
import webserver from "infra/webserver";

const EXPIRATION_TIME_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT
          1
      `,
      values: [userId],
    });

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
  findOneByUserId,
  create,
  sendEmailToUser,
};

export default activation;
