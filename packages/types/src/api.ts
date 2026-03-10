import { Script } from "./script";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateScriptRequest {
  title: string;
  description?: string;
  rawContent: string;
}

export type UpdateScriptRequest = Partial<CreateScriptRequest>;
