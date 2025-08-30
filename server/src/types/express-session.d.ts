import "express-session";

declare module "express-session" {
  interface SessionData {
    loggedIn?: {
      id: string;
      email: string;
      role: {
        nama: string;
      };
    };
  }
}
