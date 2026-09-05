import z from "zod";

export default z
  .object({
    userName: z
      .string()
      .min(3, "Dapat ay hindi bababa sa 3 karakter ang pangalan.")
      .max(255, "Dapat ay hindi lalampas sa 255 karakter ang pangalan."),
    email: z.email({ error: "Hindi wastong email address." }),
    password: z
      .string()
      .min(8, "Masyadong maikli ang password.")
      .max(20, "Masyadong mahaba ang password."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "Hindi magkatugma ang mga password.",
    path: ["confirmPassword"],
  });
