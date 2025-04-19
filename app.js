import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lesson.js";
import examRoutes from "./routes/exam.js";
import paymentRoutes from "./routes/payment.js";
import { globalErrorHandling } from "./src/utils/errorHandling.js";
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT;

// Connect to the Database
const connectDB = async () => {
    return await mongoose
        .connect(process.env.DB_LOCAL)
        .then((result) => {
            console.log("Database connection Success.");
        })
        .catch((err) => {
            console.error("Mongo Connection Error", err);
        });
};
connectDB();

// Enable CORS middleware here
// var whitelist = ['http://localhost:5173']   // Frontend Links

// app.use(async (req,res,next)=>{
//     if(!whitelist.includes(req.header('origin'))){
//         return next (new Error('Not Allowed By CORS',{status: 403}))
//     }
//     for (const origin of whitelist){
//         if(req.header('origin')==origin){
//             await res.header('Access-Control-Allow-Origin', origin);
//             break;
//         }
//     }
//     await res.header('Access-Control-Allow-Headers', '*')
//     await res.header('Access-Control-Allow-Private-Network', 'true')
//     await res.header('Access-Control-Allow-Methods', '*')
//     console.log("Origin Work");
//     next();
// })

const corsOptions = {
    origin: ["http://localhost:5173", "https://www.ahmedhodeab.com", "https://dashboard.ahmedhodeab.com"], // Frontend URL
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Has to be above the routes

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/users", authRoutes);
app.use("/courses", courseRoutes);
app.use("/lessons", lessonRoutes);
app.use("/exams", examRoutes);
app.use("/payments", paymentRoutes);

// Health check route
app.get("/ping", (req, res) => {
    return res.send({ error: false, message: "Server is healthy" });
});

// Test route
app.get("/test", (req, res) => {
    res.json({ message: "Test route works" });
});

// Global error handling middleware
app.use(globalErrorHandling);

app.use("*", (req, res, next) => {
    return res.status(404).json("In-Valid Routing");
});

// Catch-all route for unmatched routes
app.use((req, res) => {
    console.log(`Unmatched route: ${req.method} ${req.url}`);

    res.status(404).send("Not Found");
});

// Start the server
app.listen(port);
