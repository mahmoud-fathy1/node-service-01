import mongoose from "mongoose";
import userModel from "./user.model.js";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import SendMail from "../../utils/Mailer.js";
export const forgetPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		const user = await userModel.findOne({
			email,
		});
		if (!user) {
			return next(
				new Error("Invalid Email", {
					cause: 400,
				})
			);
		}
		const hashId = new mongoose.Types.ObjectId().toString();
		const Hash = bycrypt.hashSync(hashId, parseInt(process.env.SALT_ROUND));
		const token = jwt.sign(
			{
				email,
				Hash,
			},
			process.env.RESET_SIG,
			{
				expiresIn: 60 * 10,
			}
		);
		const ResetLink = `${req.protocol}://${req.headers.host}/user/reset/${token}`;
		const html = `<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
        <style type="text/css">
        body{background-color: #88BDBF;margin: 0px;}
        </style>
        <body style="margin:70px;"> 
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #E5E5E5; border:1px solid #6828CE;">
        <tr>
        <td>
        <table border="0" width="100%">
        <tr>
        <td>
        <h1 style="padding-top:25px; color:#6828CE">
         أ/احمد هديب    
        </h1>
        </td>
        <td>
        <p style="text-align: right;"><a href="http://147.79.101.30:5000/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
        <tr>
        <td style="background-color:#6828CE;height:100px;font-size:50px;color:#fff;">
        <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
        </td>
        </tr>
        <tr>
        <td>
        <h1 style="padding-top:25px; color:#6828CE">Password Reset</h1>
        </td>
        </tr>
        <tr>
        <td>
        <p style="padding:0px 100px;">
        </p>
        </td>
        </tr>
        <tr>
        <td>
            <form id="form1" action="${ResetLink}" method="post"> 
                <input type="submit" name="Reset" value="Reset" style="margin:10px 0px 30px 0px; border-radius:4px; padding:10px 20px; border:0; color:#E5E5E5;background-color:#6828CE;font-size: larger;">
            </form>      
         </td>
        </tr>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <tr>
        <td>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
        <tr>
        <td>
        <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
        </td>
        </tr>
        <tr>
        <td>
        <div style="margin-top:20px;">

        <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
        
        <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
        </a>
        
        <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
        </a>

        </div>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </table>
        </body>
        </html>`;
		const isEmailSent = await SendMail({
			to: email,
			subject: "Reset Password Email",
			html,
		});
		if (!isEmailSent) {
			return next(
				new Error("Failed to send", {
					cause: 400,
				})
			);
		}
		const UserUpdate = await userModel.findOneAndUpdate(
			{
				email,
			},
			{
				frogetPass: Hash,
			},
			{
				new: true,
			}
		);
		res.status(200).json({
			message: "Done",
			UserUpdate,
		});
	} catch (error) {
		return res.json({
			message: "Catch error",
			err: error?.message,
		});
	}
};
export const ResetPassword = async (req, res, next) => {
	try {
		const { token } = req.params;
		const decoded = jwt.verify(token, process.env.RESET_SIG);
		const user = await userModel.findOne({
			email: decoded.email,
			frogetPass: decoded.hashId,
		});
		if (!user) {
			return next(
				new Error("You have Already Reset Your Pass", {
					cause: 400,
				})
			);
		}
		const { newPassword, CPassword } = req.body;
		if (newPassword != CPassword) {
			return new Error("Please make Sure to confirm The Password ", {
				cause: 400,
			});
		}
		const hashPassword = bycrypt.hashSync(newPassword, parseInt(process.env.SALT_ROUND));
		user.password = hashPassword;
		user.frogetPass = null;
		user.changePasswordTime = Date.now();
		await user.save();
		res.status(200).json({
			message: "Done",
			user,
		});
	} catch (error) {
		return res.json({
			message: "Catch error",
			err: error?.message,
		});
	}
};
