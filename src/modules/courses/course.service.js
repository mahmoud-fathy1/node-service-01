import courseModel from "./course.model.js";

// Define the character set (lowercase letters and numbers)
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

// Function to generate a random code of specified length
const generateRandomCode = (length) => {
    let code = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * ALPHABET.length);
        code += ALPHABET[randomIndex];
    }
    return code;
};

export const generateBatchOfUniqueCodes = async (courseId, count) => {
    const course = await courseModel.findById(courseId);
    if (!course) throw new Error("Course not found");

    // Extract existing codes from the course to avoid duplicates
    const existingCodesSet = new Set(course.purchaseCodes.map((pc) => pc.code));
    const newCodesSet = new Set();

    // Generate `count` unique codes
    while (newCodesSet.size < count) {
        const newCode = generateRandomCode(6); // Use the custom code generation function
        if (!existingCodesSet.has(newCode) && !newCodesSet.has(newCode)) {
            newCodesSet.add(newCode);
        }
    }

    // Add the new codes to the course's purchaseCodes array with `createdAt`
    const newCodesArray = Array.from(newCodesSet).map((code) => ({
        code,
        createdAt: new Date(),
    }));
    course.purchaseCodes.push(...newCodesArray);

    // Save the course only once after all codes are added
    await course.save();

    // Return the generated codes along with their creation date
    return newCodesArray;
};
