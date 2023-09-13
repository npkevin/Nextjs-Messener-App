import { object, string, TypeOf } from "zod";

// Validates request
const bodySchema = object({
    email: string({ required_error: "Email is required" }).email("Invalid email"),
    name: object({
        first: string({ required_error: "First-name is required" }).regex(
            /^[a-zA-Z]+$/,
            "First Name: Only characters a-Z allowed",
        ),
        middle: string().regex(
            /^[a - zA - Z]*$/,
            "Middle Name: Only characters a-Z allowed, middle name is optional",
        ),
        last: string({ required_error: "Last-name is required" }).regex(
            /^[a-zA-Z]+$/,
            "Last Name: Only characters a-Z allowed",
        ),
    }),
    password: string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(30, "Password must be at less than 30 characters"),
    passwordConfirmation: string({ required_error: "Please confirm your password" }),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Password Confirmation does not match",
    path: ["passwordConfirmation"],
});

export const createUserSchema = object({ body: bodySchema });
export type CreateUserInput = Omit<TypeOf<typeof bodySchema>, "passwordConfirmation">;
