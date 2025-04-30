export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      department: {
        Row: {
          deptcode: string
          deptname: string | null
        }
        Insert: {
          deptcode: string
          deptname?: string | null
        }
        Update: {
          deptcode?: string
          deptname?: string | null
        }
        Relationships: []
      }
      job: {
        Row: {
          jobcode: string
          jobdesc: string | null
        }
        Insert: {
          jobcode: string
          jobdesc?: string | null
        }
        Update: {
          jobcode?: string
          jobdesc?: string | null
        }
        Relationships: []
      }
      Job_history: {
        Row: {
          deptcode: string | null
          effdate: string | null
          empno: number
          jobcode: string | null
          salary: number | null
        }
        Insert: {
          deptcode?: string | null
          effdate?: string | null
          empno: number
          jobcode?: string | null
          salary?: number | null
        }
        Update: {
          deptcode?: string | null
          effdate?: string | null
          empno?: number
          jobcode?: string | null
          salary?: number | null
        }
        Relationships: []
      }
      Payment: {
        Row: {
          amount: number | null
          orno: string
          paydate: string | null
          transno: string | null
        }
        Insert: {
          amount?: number | null
          orno: string
          paydate?: string | null
          transno?: string | null
        }
        Update: {
          amount?: number | null
          orno?: string
          paydate?: string | null
          transno?: string | null
        }
        Relationships: []
      }
      pricehist: {
        Row: {
          effdate: string
          prodcode: string | null
          unitprice: number | null
        }
        Insert: {
          effdate: string
          prodcode?: string | null
          unitprice?: number | null
        }
        Update: {
          effdate?: string
          prodcode?: string | null
          unitprice?: number | null
        }
        Relationships: []
      }
      product_rows: {
        Row: {
          current_price: string | null
          description: string | null
          prodcode: string
          unit: string | null
        }
        Insert: {
          current_price?: string | null
          description?: string | null
          prodcode: string
          unit?: string | null
        }
        Update: {
          current_price?: string | null
          description?: string | null
          prodcode?: string
          unit?: string | null
        }
        Relationships: []
      }
      sales_rows: {
        Row: {
          custno: string | null
          empno: number | null
          salesdate: string | null
          transno: string
        }
        Insert: {
          custno?: string | null
          empno?: number | null
          salesdate?: string | null
          transno: string
        }
        Update: {
          custno?: string | null
          empno?: number | null
          salesdate?: string | null
          transno?: string
        }
        Relationships: []
      }
      salesdetail_rows: {
        Row: {
          prodcode: string | null
          quantity: number | null
          transno: string
        }
        Insert: {
          prodcode?: string | null
          quantity?: number | null
          transno: string
        }
        Update: {
          prodcode?: string | null
          quantity?: number | null
          transno?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
