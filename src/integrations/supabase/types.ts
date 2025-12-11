export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          approval_date: string | null
          client_email: string | null
          client_name: string | null
          created_at: string
          draft_date: string | null
          id: string
          negotiation_date: string | null
          notes: string | null
          probability_to_close: number | null
          project_id: string | null
          review_date: string | null
          revision_date: string | null
          sent_date: string | null
          signed_date: string | null
          stage: Database["public"]["Enums"]["proposal_stage"] | null
          title: string
          updated_at: string
          user_id: string | null
          value: number | null
        }
        Insert: {
          approval_date?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          draft_date?: string | null
          id?: string
          negotiation_date?: string | null
          notes?: string | null
          probability_to_close?: number | null
          project_id?: string | null
          review_date?: string | null
          revision_date?: string | null
          sent_date?: string | null
          signed_date?: string | null
          stage?: Database["public"]["Enums"]["proposal_stage"] | null
          title: string
          updated_at?: string
          user_id?: string | null
          value?: number | null
        }
        Update: {
          approval_date?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          draft_date?: string | null
          id?: string
          negotiation_date?: string | null
          notes?: string | null
          probability_to_close?: number | null
          project_id?: string | null
          review_date?: string | null
          revision_date?: string | null
          sent_date?: string | null
          signed_date?: string | null
          stage?: Database["public"]["Enums"]["proposal_stage"] | null
          title?: string
          updated_at?: string
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author: string | null
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          tag_id: string
          task_id: string
        }
        Insert: {
          tag_id: string
          task_id: string
        }
        Update: {
          tag_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_tags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          depends_on: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          position: number | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          depends_on?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          depends_on?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_depends_on_fkey"
            columns: ["depends_on"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      proposal_stage:
        | "draft"
        | "sent_to_client"
        | "client_review"
        | "negotiation"
        | "revision"
        | "approved"
        | "contract_signed"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status:
        | "not_started"
        | "in_progress"
        | "on_hold"
        | "review"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      proposal_stage: [
        "draft",
        "sent_to_client",
        "client_review",
        "negotiation",
        "revision",
        "approved",
        "contract_signed",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: [
        "not_started",
        "in_progress",
        "on_hold",
        "review",
        "completed",
      ],
    },
  },
} as const
