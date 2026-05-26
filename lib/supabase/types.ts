export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: "regular" | "admin";
          department_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          role?: "regular" | "admin";
          department_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      departments: {
        Row: { id: string; slug: string; name: string };
        Insert: { id?: string; slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["departments"]["Insert"]>;
      };
      hashtags: {
        Row: { id: string; slug: string; label: string };
        Insert: { id?: string; slug: string; label: string };
        Update: Partial<Database["public"]["Tables"]["hashtags"]["Insert"]>;
      };
      kudos: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["kudos"]["Insert"]>;
      };
      kudos_hashtags: {
        Row: { kudos_id: string; hashtag_id: string };
        Insert: { kudos_id: string; hashtag_id: string };
        Update: Partial<Database["public"]["Tables"]["kudos_hashtags"]["Insert"]>;
      };
      kudos_likes: {
        Row: { kudos_id: string; user_id: string; weight: number; created_at: string };
        Insert: { kudos_id: string; user_id: string; weight?: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["kudos_likes"]["Insert"]>;
      };
      awards: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          display_order: number;
          prize_count: number | null;
          unit_label: string | null;
          prize_value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          display_order?: number;
          prize_count?: number | null;
          unit_label?: string | null;
          prize_value?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["awards"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
