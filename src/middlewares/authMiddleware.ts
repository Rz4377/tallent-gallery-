import { Request, Response , NextFunction } from "express";
import { adminAuth } from "../config/firebaseAdmin";

export default async function authenticationMiddleware(req:Request, res:Response, next:NextFunction){
    const authHeader = req.headers.authorization;
    if(authHeader && typeof authHeader === "string"){
        const idToken = authHeader.split(" ")[1];
        try{
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            const uid = decodedToken.uid;
            // uid generated at backend

            req.body.uid = uid;
            return next();
        }
        catch(error){
            return res.status(401).json({
                msg : "Unauthorized , invalid token"
            })
        }
    }
    res.status(401).json({
        msg : "unauthorized , invalid token"
    })
}