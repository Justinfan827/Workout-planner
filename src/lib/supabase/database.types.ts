export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      merchant_keys: {
        Row: {
          ansa_merchant_secret_key: string
          merchant_uuid: string
          uuid: string
        }
        Insert: {
          ansa_merchant_secret_key: string
          merchant_uuid: string
          uuid?: string
        }
        Update: {
          ansa_merchant_secret_key?: string
          merchant_uuid?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'merchant_keys_merchant_uuid_fkey'
            columns: ['merchant_uuid']
            referencedRelation: 'merchants'
            referencedColumns: ['uuid']
          },
        ]
      }
      merchants: {
        Row: {
          ansa_merchant_name: string
          ansa_merchant_uuid: string
          created_at: string
          uuid: string
        }
        Insert: {
          ansa_merchant_name: string
          ansa_merchant_uuid?: string
          created_at?: string
          uuid?: string
        }
        Update: {
          ansa_merchant_name?: string
          ansa_merchant_uuid?: string
          created_at?: string
          uuid?: string
        }
        Relationships: []
      }
      superadmin_merchants: {
        Row: {
          merchant_uuid: string
          user_uuid: string
          uuid: string
        }
        Insert: {
          merchant_uuid: string
          user_uuid: string
          uuid?: string
        }
        Update: {
          merchant_uuid?: string
          user_uuid?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'superadmin_merchants_merchant_uuid_fkey'
            columns: ['merchant_uuid']
            referencedRelation: 'merchants'
            referencedColumns: ['uuid']
          },
          {
            foreignKeyName: 'superadmin_merchants_user_uuid_fkey'
            columns: ['user_uuid']
            referencedRelation: 'users'
            referencedColumns: ['uuid']
          },
        ]
      }
      user_merchants: {
        Row: {
          merchant_uuid: string
          user_uuid: string
          uuid: string
        }
        Insert: {
          merchant_uuid: string
          user_uuid: string
          uuid?: string
        }
        Update: {
          merchant_uuid?: string
          user_uuid?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_merchants_merchant_uuid_fkey'
            columns: ['merchant_uuid']
            referencedRelation: 'merchants'
            referencedColumns: ['uuid']
          },
          {
            foreignKeyName: 'user_merchants_user_uuid_fkey'
            columns: ['user_uuid']
            referencedRelation: 'users'
            referencedColumns: ['uuid']
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          last_name: string | null
          uuid: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          uuid?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          uuid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: string
      }
      get_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: Json
      }
      get_claims: {
        Args: {
          uid: string
        }
        Returns: Json
      }
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_claim: {
        Args: {
          uid: string
          claim: string
          value: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
