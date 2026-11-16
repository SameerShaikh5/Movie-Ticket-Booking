import { Screen } from "../models/screen.model.js";
export const seedScreen = async () => {
    const screen = await Screen.create({});
};
