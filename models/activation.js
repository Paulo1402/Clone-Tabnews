import email from "infra/email";

async function sendEmailToUser(user) {
  await email.send({
    from: "<contato@tabnews.com>",
    to: user.email,
    subject: "Activate your account",
    text: `${user.username}, click the link below to activate your account:\n\nhttp://localhost:3000/activate/${user.activationToken}`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
