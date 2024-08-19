import {Request, Response, NextFunction} from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { userModel } from "../models/User"
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization
    const tokenSig = token!.split(" ")[1]
    const verified = jwt.verify(tokenSig, process.env.JWT_SECRET as string)
    res.locals.verified = verified
    next()
}

export const getUserFromToken = async (token: string) => {
    const tokenSig = token.split(" ")[1]
    const verified = jwt.verify(tokenSig, process.env.JWT_SECRET as string)
    const {email} = verified as JwtPayload
    const currUser = await userModel.findOne({email})
    return currUser
}