import z from "zod";

export default z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});