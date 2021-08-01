import bcrypt from "bcrypt";

export async function isPasswordEqual(
    password: string,
    encrypted: string
): Promise<boolean> {
    return bcrypt.compare(password, encrypted);
}
