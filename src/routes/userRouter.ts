import express, { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import { createPostSchema, signupSchmea } from "../validation/zodValidation"; // Ensure correct import path
import authenticationMiddleware from "../middlewares/authMiddleware"; // Ensure correct import path
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";


dotenv.config();

if(!process.env.AWS_REGION){
    throw Error("aws credentials not init")
}
if(!process.env.AWS_ACCESS_KEY_ID){
    throw Error("aws credentials not init")
}
if(!process.env.AWS_SECRET_ACCESS_KEY){
    throw Error("aws credentials not init")
}

const s3ClientInfo = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  

const bucketName = process.env.AWS_BUCKET_NAME || 'user-storage-bucket';

const prisma = new PrismaClient()

const userRouter = express();

userRouter.post("/userId", async (req, res) => {
    const { userId } = req.body;
    try {
        let foundUserId = await prisma.user.findUnique({
            where: {
                userId: userId, 
            },
        });

        if (foundUserId) {
            return res.status(200).json({ message: "User ID already exists", exists: true });
        } else {
            return res.status(200).json({ message: "User ID is available", exists: false });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});

userRouter.post("/signup", async (req, res) => { 

    const { name, userId, uid, email } = req.body;
    const zod_result = signupSchmea.safeParse(req.body);
    if (!zod_result.success) {
        res.status(400).json({
            message: "Invalid input",
            zod_error: zod_result.error
        });
        return;
    }

    try {
        // Check if userId already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User ID already exists"
            });
        }

        // Proceed to create the user
        await prisma.user.create({
            data: {
                name,
                userId,
                uid, 
                email
            }
        });
        res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {

        res.status(500).json({
            error: "Internal server error"
        });
    }
});


const storage = multerS3({
    s3: s3ClientInfo,
    bucket: bucketName,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB file size limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'video/mp4', 'video/webm'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PNG, JPEG, MP4, and WebM are allowed.'));
        }
    }
});

userRouter.post(
    "/createPosts",
    upload.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'videoFile', maxCount: 1 }]),
    authenticationMiddleware,
    async (req: any, res) => {

        // Initialize URLs as null
        let imageUrl = null;
        let videoUrl = null;

        // Check and assign if image file is uploaded
        if (req.files && req.files['imageFile']) {
            imageUrl = req.files['imageFile'][0]?.location;
        }

        // Check and assign if video file is uploaded
        if (req.files && req.files['videoFile']) {
            videoUrl = req.files['videoFile'][0]?.location;
        }

        const { uid, title, github, liveLink, description } = req.body;

        // Validate the complete object including the URLs
        const zodResult = createPostSchema.safeParse(req.body);
        if (!zodResult.success) {
            return res.status(400).json({
                message: "Invalid input",
                errors: zodResult.error.issues.map(issue => issue.message).join(", ")
            });
        }

        try {
            const post = await prisma.post.create({
                data: {
                    projectTitle: title,
                    uid: uid,
                    projectDesc: {
                        create: {
                            githubLink: github,
                            liveLink: liveLink,
                            postImage: imageUrl,  // Can be null if not uploaded
                            postVideo: videoUrl,  // Can be null if not uploaded
                            description: description
                        }
                    }
                }
            });

            return res.status(201).json({
                message: "Post created successfully",
                post
            });
        } catch (error) {

            return res.status(500).json({
                message: "Internal server error",
                error: error
            });
        }
    }
);

userRouter.delete("/deletePost/:projectId", authenticationMiddleware, async (req, res) => {
    const { projectId } = req.params;
    const uid = req.body.uid; // Assuming authenticationMiddleware attaches user to req.user
  
    try {
      // Check if the post exists and belongs to the user
      const existingPost = await prisma.post.findUnique({
        where: { projectId },
      });
  
      if (!existingPost || existingPost.uid !== uid) {

        return res.status(404).json({ message: "Post not found or unauthorized" });
      }
  
      // Delete the post
      await prisma.post.delete({
        where: { projectId },
      });

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {

      res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.put("/updatePost/:projectId", authenticationMiddleware, async (req, res) => {
    const { projectId } = req.params;
    const { projectTitle, projectDesc } = req.body;
    const uid = req.body.uid;
  
    try {
      // Check if the post exists and belongs to the user
      const existingPost = await prisma.post.findUnique({
        where: { projectId },
        include: { projectDesc: true },
      });
  
      if (!existingPost || existingPost.uid !== uid) {
        return res.status(404).json({ message: "Post not found or unauthorized" });
      }
  
      // Update the post
      await prisma.post.update({
        where: { projectId },
        data: {
          projectTitle,
          projectDesc: {
            upsert: {
              create: {
                description: projectDesc.description,
                liveLink: projectDesc.liveLink,
                githubLink: projectDesc.githubLink,
                postImage: projectDesc.postImage,
                postVideo: projectDesc.postVideo,
              },
              update: {
                description: projectDesc.description,
                liveLink: projectDesc.liveLink,
                githubLink: projectDesc.githubLink,
                postImage: projectDesc.postImage,
                postVideo: projectDesc.postVideo,
              },
            },
          },
        },
      });

      res.status(200).json({ message: "Post updated successfully" });
    } catch (error) {

      res.status(500).json({ error: "Internal server error" });
    }
  });


userRouter.get("/feed", async (req, res) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
  
    const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
    const limitNumber = Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 10;
  
    const skip = (pageNumber - 1) * limitNumber;
  
    try {
        const totalPosts = await prisma.post.count();
    
        const postWithDetails = await prisma.post.findMany({
            skip: skip,
            take: limitNumber,
            include: {
            projectDesc: {
                select: {
                description: true,
                liveLink: true,
                githubLink: true,
                postImage: true,
                postVideo: true,
                },
            },
            user: {
                select: {
                name: true,
                },
            },
            },
            orderBy: {
            createdAt: 'desc',
            },
        });

        const postData = postWithDetails.map(post => ({
            projectId: post.projectId,
            projectTitle: post.projectTitle,
            createdAt: post.createdAt,
            description: post.projectDesc?.description || null,
            liveLink: post.projectDesc?.liveLink || null,
            githubLink: post.projectDesc?.githubLink || null,
            postImage: post.projectDesc?.postImage || null,
            postVideo: post.projectDesc?.postVideo || null,
            userName: post.user?.name || null
        }));

        res.status(200).json({
            success: true,
            data: postData,
            totalPosts,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalPosts / limitNumber),
          });
        } 
        catch (error) {

          res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});

userRouter.post("/userPost",authenticationMiddleware,async(req,res)=>{

    const userUid = req.body.uid;
    try{
        let response = await prisma.post.findMany({
            where:{
                uid:userUid
            },
            select: {
                projectId: true,        
                projectTitle: true,
                projectDesc: {         
                    select: {
                        description: true,
                        liveLink: true,
                        githubLink: true,
                        postImage: true,
                        postVideo: true
                    },
                },
            },
        });

        return res.status(200).json({
            response
        })
    }
    catch(error){

        return res.status(400).json({
            error:"request failed"
        })
    }


})

export default userRouter;
