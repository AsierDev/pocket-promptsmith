export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          plan: 'free' | 'pro';
          prompt_quota_used: number;
          improvements_used_today: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          plan?: 'free' | 'pro';
          prompt_quota_used?: number;
          improvements_used_today?: number;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: 'Escritura' | 'Código' | 'Marketing' | 'Análisis' | 'Creatividad' | 'Educación' | 'Otros';
          tags: string[];
          is_favorite: boolean;
          created_at: string;
          updated_at: string | null;
          use_count: number;
          thumbnail_url: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category: Database['public']['Tables']['prompts']['Row']['category'];
          tags?: string[];
          is_favorite?: boolean;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          use_count?: number;
        };
        Update: Partial<Database['public']['Tables']['prompts']['Insert']>;
      };
      prompt_improvements: {
        Row: {
          id: string;
          prompt_id: string;
          user_id: string;
          original_content: string;
          improved_content: string;
          diff_json: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          user_id: string;
          original_content: string;
          improved_content: string;
          diff_json: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['prompt_improvements']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PromptRow = Database['public']['Tables']['prompts']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
