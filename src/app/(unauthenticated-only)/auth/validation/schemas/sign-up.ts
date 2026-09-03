import z from "zod";

export default z
  .object({
    userName: z
      .string()
      .min(3, "Name must be 3 or more characters.")
      .max(255, "Name must be 255 or less characters."),
    email: z.email({ error: "Invalid email address." }),
    password: z
      .string()
      .min(8, "Password is too short.")
      .max(20, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "Passwords does not match.",
    path: ["confirmPassword"],
  });
