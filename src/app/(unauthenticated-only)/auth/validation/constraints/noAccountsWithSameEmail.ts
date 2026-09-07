import z from "zod";
import signUpSchema from "../schemas/sign-up";

export default async function noDuplicateUser(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params: z.infer<typeof signUpSchema>
) {
    
}