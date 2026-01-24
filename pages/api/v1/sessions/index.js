import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import { UnauthorizedError } from "infra/errors";
import password from "models/password";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  try {
    const storedUser = await user.findOneByEmail(userInputValues.email);
    const correctPasswordMatch = await password.compare(
      userInputValues.password,
      storedUser.password,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Invalid password",
        action: "Check your credentials and try again",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Invalid email or password",
      action: "Check your credentials and try again",
    });
  }

  return response.status(201).json({});
}
