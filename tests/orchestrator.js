import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";
import activation from "models/activation";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  async function waitForWebServer() {
    return retry(fetchStatusPage, { retries: 100, maxTimeout: 1000 });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw new Error(`Status page returned ${response.status}`);
      }
    }
  }

  async function waitForEmailServer() {
    async function fetchEmailStatus() {
      const response = await fetch(emailHttpUrl);

      if (response.status !== 200) {
        throw new Error(`Email server returned ${response.status}`);
      }
    }

    return retry(fetchEmailStatus, { retries: 100, maxTimeout: 1000 });
  }

  await waitForWebServer();
  await waitForEmailServer();
}

async function clearDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "123456",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop();

  if (!lastEmailItem) {
    return null;
  }

  // Get the email text content from the email service
  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();
  lastEmailItem.text = emailTextBody;

  return lastEmailItem;
}

function extractUUID(text) {
  const match = text.match(/[0-9a-fA-F-]{36}/);
  return match ? match[0] : null;
}

async function activateUser(userId) {
  const activatedUser = await activation.activateUserByUserId(userId);
  return activatedUser;
}

async function addFeaturesToUser(userId, features) {
  const updatedUser = await user.addFeatures(userId, features);
  return updatedUser;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
  activateUser,
  addFeaturesToUser,
};

export default orchestrator;
