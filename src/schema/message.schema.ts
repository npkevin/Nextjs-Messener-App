import { object, string, TypeOf } from 'zod'

export const createMessageSchema = object({
    // body: object({
    //     email: string({ required_error: "Email is required" }).email("Invalid email"),
    //     name: object({
    //         first: string({ required_error: 'First-name is required' }),
    //         middle: string(),
    //         last: string({ required_error: 'Last-name is required' })
    //     }),
    //     password: string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    //     passwordConfirmation: string({ required_error: "Please confirm your password" })
    // }).refine(
    //     data => data.password === data.passwordConfirmation,
    //     {
    //         message: "Password Confirmation does not match",
    //         path: ["passwordConfirmation"]
    //     }
    // )
})

export type CreateMessageInput = Omit<TypeOf<typeof createMessageSchema>, 'body.passwordConfirmation'>;