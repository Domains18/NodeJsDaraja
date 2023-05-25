import NextAuth from "next-auth";
import { authOptions } from "y/server/auth";

export default NextAuth(authOptions);
