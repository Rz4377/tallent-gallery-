import zod from "zod";

export const signupSchmea = zod.object({ // zod gonna help in runtime checks -> typescript useless on runtime 
    name: zod.string().min(4),
    uid: zod.string().min(4),
    userId: zod.string().min(3),
    email: zod.string().email()
})

export const createPostSchema = zod.object({
    title: zod.string(),
    uid: zod.string(),
    description: zod.string(),
    github: zod.string().optional(),
    liveLink: zod.string().optional(),
    imageUrl: zod.string().optional(),
    videoUrl: zod.string().optional()
})

