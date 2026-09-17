import { singleton } from "../singleton";
import { type StorageManager, createStorageManager } from "./common";
import { supabaseStorage } from "./supabase";


export function acquireStorageManager(): StorageManager {
    return singleton('storage', () => createStorageManager([supabaseStorage()]));
}
