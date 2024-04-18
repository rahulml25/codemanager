declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly MONGO_MAIN_SERVER_URL: string;
      readonly MONGO_BACKUP_SERVER_URL: string;
    }
  }
}
