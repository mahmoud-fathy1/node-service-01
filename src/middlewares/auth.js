import { verifyToken } from "../utils/GenerateAndVerifyToken.js";
import userModel from "../modules/users/user.model.js";
export const roles = {
	Admin: "Admin",
	User: "User",
};
export const isAuth = (accessRoles = []) => {
	return async (req, res, next) => {
		try {
			const { authorization } = req.headers;
			if (!authorization) {
				return next(
					new Error("Please login first", {
						cause: 400,
					})
				);
			}
			if (!authorization?.startsWith("Bearer ")) {
				return next(
					new Error("Invalid Bearer Key", {
						cause: 400,
					})
				);
			}
			const token = authorization.split("Bearer ")[1];
			if (!token) {
				return next(
					new Error("In-valid token", {
						cause: 400,
					})
				);
			}
			const decoded = verifyToken({
				token,
			});
			if (!decoded?.id) {
				return next(
					new Error("In-valid token payload", {
						cause: 400,
					})
				);
			}
			const user = await userModel.findById(decoded.id).select("fName phoneNumber role changePasswordTime");
			if (!user) {
				return next(
					new Error("Not registered user", {
						cause: 401,
					})
				);
			}
			if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
				return next(
					new Error("Expired token ", {
						cause: 400,
					})
				);
			}
			if (!accessRoles.includes(user.role)) {
				return next(
					new Error("Not authorized user", {
						cause: 403,
					})
				);
			}
			req.user = user;
			return next();
		} catch (error) {
			return res.json({
				message: "Catch error",
				err: error?.message,
			});
		}
	};
};
