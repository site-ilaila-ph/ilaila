import z from "zod";

export default z.object({
  email: z.email("Maglagay ng wastong email."),
  password: z.string().min(1, "Kailangan ang password."),
});