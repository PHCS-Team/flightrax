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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_requests: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id_document_content_type: string | null
          id_document_path: string | null
          id_document_size_bytes: number | null
          id_document_uploaded_at: string | null
          id_number: string | null
          profile_id: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          request_type: Database["public"]["Enums"]["app_role"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id_document_content_type?: string | null
          id_document_path?: string | null
          id_document_size_bytes?: number | null
          id_document_uploaded_at?: string | null
          id_number?: string | null
          profile_id: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_type: Database["public"]["Enums"]["app_role"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id_document_content_type?: string | null
          id_document_path?: string | null
          id_document_size_bytes?: number | null
          id_document_uploaded_at?: string | null
          id_number?: string | null
          profile_id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_type?: Database["public"]["Enums"]["app_role"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_requests_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["admin_department"]
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["admin_department"]
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["admin_department"]
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_type_baggage_areas: {
        Row: {
          aircraft_type_key: string
          arm: number
          created_at: string
          id: string
          position: number
          updated_at: string
        }
        Insert: {
          aircraft_type_key: string
          arm: number
          created_at?: string
          id?: string
          position: number
          updated_at?: string
        }
        Update: {
          aircraft_type_key?: string
          arm?: number
          created_at?: string
          id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_type_baggage_areas_aircraft_type_key_fkey"
            columns: ["aircraft_type_key"]
            isOneToOne: false
            referencedRelation: "aircraft_types"
            referencedColumns: ["type_key"]
          },
        ]
      }
      aircraft_types: {
        Row: {
          baggage_area_max_weight: number
          created_at: string
          fi_and_student_arm: number | null
          maximum_takeoff_weight: number | null
          type: string
          type_key: string
          updated_at: string
          usable_fuel_arm: number | null
        }
        Insert: {
          baggage_area_max_weight?: number
          created_at?: string
          fi_and_student_arm?: number | null
          maximum_takeoff_weight?: number | null
          type: string
          type_key: string
          updated_at?: string
          usable_fuel_arm?: number | null
        }
        Update: {
          baggage_area_max_weight?: number
          created_at?: string
          fi_and_student_arm?: number | null
          maximum_takeoff_weight?: number | null
          type?: string
          type_key?: string
          updated_at?: string
          usable_fuel_arm?: number | null
        }
        Relationships: []
      }
      aircraft_weight_balance_configs: {
        Row: {
          aircraft_id: string
          basic_empty_weight: number
          basic_empty_weight_arm: number
          basic_empty_weight_moment: number
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          aircraft_id: string
          basic_empty_weight: number
          basic_empty_weight_arm: number
          basic_empty_weight_moment: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          aircraft_id?: string
          basic_empty_weight?: number
          basic_empty_weight_arm?: number
          basic_empty_weight_moment?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_weight_balance_configs_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: true
            referencedRelation: "aircrafts"
            referencedColumns: ["id"]
          },
        ]
      }
      aircrafts: {
        Row: {
          aircraft_identification: string
          aircraft_type: string
          color_markings: string
          created_at: string
          id: string
          model: string
          photo_content_type: string | null
          photo_path: string | null
          photo_size_bytes: number | null
          photo_uploaded_at: string | null
          remarks: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["aircraft_status"]
          updated_at: string
        }
        Insert: {
          aircraft_identification: string
          aircraft_type: string
          color_markings: string
          created_at?: string
          id?: string
          model: string
          photo_content_type?: string | null
          photo_path?: string | null
          photo_size_bytes?: number | null
          photo_uploaded_at?: string | null
          remarks?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["aircraft_status"]
          updated_at?: string
        }
        Update: {
          aircraft_identification?: string
          aircraft_type?: string
          color_markings?: string
          created_at?: string
          id?: string
          model?: string
          photo_content_type?: string | null
          photo_path?: string | null
          photo_size_bytes?: number | null
          photo_uploaded_at?: string | null
          remarks?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["aircraft_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircrafts_aircraft_type_fkey"
            columns: ["aircraft_type"]
            isOneToOne: false
            referencedRelation: "aircraft_types"
            referencedColumns: ["type_key"]
          },
        ]
      }
      certificates: {
        Row: {
          created_at: string
          description: string | null
          expiry_date: string | null
          has_no_expiry: boolean
          id: string
          image_content_type: string | null
          image_path: string | null
          image_size_bytes: number | null
          image_uploaded_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          has_no_expiry?: boolean
          id?: string
          image_content_type?: string | null
          image_path?: string | null
          image_size_bytes?: number | null
          image_uploaded_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          has_no_expiry?: boolean
          id?: string
          image_content_type?: string | null
          image_path?: string | null
          image_size_bytes?: number | null
          image_uploaded_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_journeys: {
        Row: {
          aircraft_id: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          commenced_at: string | null
          commenced_by: string | null
          created_at: string
          dof_date: string | null
          flight_request_id: string
          id: string
          status: Database["public"]["Enums"]["journey_status"]
          terminated_at: string | null
          terminated_by: string | null
          updated_at: string
        }
        Insert: {
          aircraft_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commenced_at?: string | null
          commenced_by?: string | null
          created_at?: string
          dof_date?: string | null
          flight_request_id: string
          id?: string
          status?: Database["public"]["Enums"]["journey_status"]
          terminated_at?: string | null
          terminated_by?: string | null
          updated_at?: string
        }
        Update: {
          aircraft_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commenced_at?: string | null
          commenced_by?: string | null
          created_at?: string
          dof_date?: string | null
          flight_request_id?: string
          id?: string
          status?: Database["public"]["Enums"]["journey_status"]
          terminated_at?: string | null
          terminated_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_journeys_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircrafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_journeys_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_journeys_commenced_by_fkey"
            columns: ["commenced_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_journeys_flight_request_id_fkey"
            columns: ["flight_request_id"]
            isOneToOne: true
            referencedRelation: "flight_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_journeys_terminated_by_fkey"
            columns: ["terminated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_plans: {
        Row: {
          addressee: string | null
          aircraft_color_and_marking: string
          aircraft_id: string | null
          aircraft_identification: string
          authorized_representative_id: string | null
          authorized_representative_licenses: Json | null
          authorized_representative_name: string | null
          authorized_representative_signature: string | null
          com_nav_equipment: string
          created_at: string
          created_by: string
          cruising_level: string
          cruising_speed: string
          departure_aerodrome: string
          departure_time_raw: string
          departure_time_resolved: string
          destination_aerodrome: string
          dinghies_capacity: number | null
          dinghies_color: string | null
          dinghies_covered: boolean
          dinghies_has_dinghy: boolean
          dinghies_number: number | null
          dof_raw: string
          dof_resolved: string
          emergency_radio_elt: boolean
          emergency_radio_uhf: boolean
          emergency_radio_vhf: boolean
          endurance: string | null
          filed_by_id: string
          first_alternate_aerodrome: string | null
          flight_rules: string
          id: string
          jacket_fluorescent: boolean
          jacket_light: boolean
          jacket_uhf: boolean
          jacket_vhf: boolean
          message_type: string
          number_of_aircraft: number
          originator: string | null
          other_remarks: string | null
          persons_on_board: string
          pilot_in_command_id: string | null
          pilot_in_command_name: string | null
          pilot_licenses: Json
          pilot_name: string
          pilot_signature: string | null
          plan_code: string
          remarks: string | null
          route: string[]
          second_alternate_aerodrome: string | null
          surveillance_equipment: string
          survival_desert: boolean
          survival_jungle: boolean
          survival_maritime: boolean
          survival_polar: boolean
          total_eet: string
          type_of_aircraft: string
          type_of_flight: string
          updated_at: string
          wake_turbulence_category: string
        }
        Insert: {
          addressee?: string | null
          aircraft_color_and_marking: string
          aircraft_id?: string | null
          aircraft_identification: string
          authorized_representative_id?: string | null
          authorized_representative_licenses?: Json | null
          authorized_representative_name?: string | null
          authorized_representative_signature?: string | null
          com_nav_equipment?: string
          created_at?: string
          created_by: string
          cruising_level: string
          cruising_speed: string
          departure_aerodrome?: string
          departure_time_raw: string
          departure_time_resolved: string
          destination_aerodrome?: string
          dinghies_capacity?: number | null
          dinghies_color?: string | null
          dinghies_covered?: boolean
          dinghies_has_dinghy?: boolean
          dinghies_number?: number | null
          dof_raw: string
          dof_resolved: string
          emergency_radio_elt?: boolean
          emergency_radio_uhf?: boolean
          emergency_radio_vhf?: boolean
          endurance?: string | null
          filed_by_id: string
          first_alternate_aerodrome?: string | null
          flight_rules: string
          id?: string
          jacket_fluorescent?: boolean
          jacket_light?: boolean
          jacket_uhf?: boolean
          jacket_vhf?: boolean
          message_type?: string
          number_of_aircraft?: number
          originator?: string | null
          other_remarks?: string | null
          persons_on_board?: string
          pilot_in_command_id?: string | null
          pilot_in_command_name?: string | null
          pilot_licenses?: Json
          pilot_name: string
          pilot_signature?: string | null
          plan_code: string
          remarks?: string | null
          route?: string[]
          second_alternate_aerodrome?: string | null
          surveillance_equipment?: string
          survival_desert?: boolean
          survival_jungle?: boolean
          survival_maritime?: boolean
          survival_polar?: boolean
          total_eet: string
          type_of_aircraft: string
          type_of_flight: string
          updated_at?: string
          wake_turbulence_category: string
        }
        Update: {
          addressee?: string | null
          aircraft_color_and_marking?: string
          aircraft_id?: string | null
          aircraft_identification?: string
          authorized_representative_id?: string | null
          authorized_representative_licenses?: Json | null
          authorized_representative_name?: string | null
          authorized_representative_signature?: string | null
          com_nav_equipment?: string
          created_at?: string
          created_by?: string
          cruising_level?: string
          cruising_speed?: string
          departure_aerodrome?: string
          departure_time_raw?: string
          departure_time_resolved?: string
          destination_aerodrome?: string
          dinghies_capacity?: number | null
          dinghies_color?: string | null
          dinghies_covered?: boolean
          dinghies_has_dinghy?: boolean
          dinghies_number?: number | null
          dof_raw?: string
          dof_resolved?: string
          emergency_radio_elt?: boolean
          emergency_radio_uhf?: boolean
          emergency_radio_vhf?: boolean
          endurance?: string | null
          filed_by_id?: string
          first_alternate_aerodrome?: string | null
          flight_rules?: string
          id?: string
          jacket_fluorescent?: boolean
          jacket_light?: boolean
          jacket_uhf?: boolean
          jacket_vhf?: boolean
          message_type?: string
          number_of_aircraft?: number
          originator?: string | null
          other_remarks?: string | null
          persons_on_board?: string
          pilot_in_command_id?: string | null
          pilot_in_command_name?: string | null
          pilot_licenses?: Json
          pilot_name?: string
          pilot_signature?: string | null
          plan_code?: string
          remarks?: string | null
          route?: string[]
          second_alternate_aerodrome?: string | null
          surveillance_equipment?: string
          survival_desert?: boolean
          survival_jungle?: boolean
          survival_maritime?: boolean
          survival_polar?: boolean
          total_eet?: string
          type_of_aircraft?: string
          type_of_flight?: string
          updated_at?: string
          wake_turbulence_category?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_plans_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircrafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_plans_authorized_representative_id_fkey"
            columns: ["authorized_representative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_plans_filed_by_id_fkey"
            columns: ["filed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_plans_pilot_in_command_id_fkey"
            columns: ["pilot_in_command_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          flight_plan_id: string
          id: string
          rejected_reason: string | null
          requested_by: string
          status: string
          updated_at: string
          weight_balance_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          flight_plan_id: string
          id?: string
          rejected_reason?: string | null
          requested_by: string
          status?: string
          updated_at?: string
          weight_balance_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          flight_plan_id?: string
          id?: string
          rejected_reason?: string | null
          requested_by?: string
          status?: string
          updated_at?: string
          weight_balance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_requests_flight_plan_id_fkey"
            columns: ["flight_plan_id"]
            isOneToOne: true
            referencedRelation: "flight_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_requests_weight_balance_id_fkey"
            columns: ["weight_balance_id"]
            isOneToOne: true
            referencedRelation: "weight_balances"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_profiles: {
        Row: {
          created_at: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_unavailabilities: {
        Row: {
          created_at: string
          created_by: string
          ends_on: string
          id: string
          instructor_profile_id: string
          starts_on: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          ends_on: string
          id?: string
          instructor_profile_id: string
          starts_on: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          ends_on?: string
          id?: string
          instructor_profile_id?: string
          starts_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_unavailabilities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_unavailabilities_instructor_profile_id_fkey"
            columns: ["instructor_profile_id"]
            isOneToOne: false
            referencedRelation: "instructor_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string
          expiry_date: string | null
          has_no_expiry: boolean
          id: string
          id_back_content_type: string | null
          id_back_path: string | null
          id_back_size_bytes: number | null
          id_back_uploaded_at: string | null
          id_front_content_type: string | null
          id_front_path: string | null
          id_front_size_bytes: number | null
          id_front_uploaded_at: string | null
          license_number: string
          license_type: string
          ratings: string[]
          status: Database["public"]["Enums"]["license_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          has_no_expiry?: boolean
          id?: string
          id_back_content_type?: string | null
          id_back_path?: string | null
          id_back_size_bytes?: number | null
          id_back_uploaded_at?: string | null
          id_front_content_type?: string | null
          id_front_path?: string | null
          id_front_size_bytes?: number | null
          id_front_uploaded_at?: string | null
          license_number: string
          license_type: string
          ratings?: string[]
          status?: Database["public"]["Enums"]["license_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          has_no_expiry?: boolean
          id?: string
          id_back_content_type?: string | null
          id_back_path?: string | null
          id_back_size_bytes?: number | null
          id_back_uploaded_at?: string | null
          id_front_content_type?: string | null
          id_front_path?: string | null
          id_front_size_bytes?: number | null
          id_front_uploaded_at?: string | null
          license_number?: string
          license_type?: string
          ratings?: string[]
          status?: Database["public"]["Enums"]["license_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notams: {
        Row: {
          category: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          severity?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          passcode_hash: string | null
          profile_photo_content_type: string | null
          profile_photo_path: string | null
          profile_photo_size_bytes: number | null
          profile_photo_uploaded_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          signature_svg: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          passcode_hash?: string | null
          profile_photo_content_type?: string | null
          profile_photo_path?: string | null
          profile_photo_size_bytes?: number | null
          profile_photo_uploaded_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          signature_svg?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          passcode_hash?: string | null
          profile_photo_content_type?: string | null
          profile_photo_path?: string | null
          profile_photo_size_bytes?: number | null
          profile_photo_uploaded_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          signature_svg?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_balance_baggage_entries: {
        Row: {
          arm: number | null
          created_at: string
          id: string
          moment: number | null
          position: number
          updated_at: string
          weight: number
          weight_balance_id: string
        }
        Insert: {
          arm?: number | null
          created_at?: string
          id?: string
          moment?: number | null
          position: number
          updated_at?: string
          weight?: number
          weight_balance_id: string
        }
        Update: {
          arm?: number | null
          created_at?: string
          id?: string
          moment?: number | null
          position?: number
          updated_at?: string
          weight?: number
          weight_balance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weight_balance_baggage_entries_weight_balance_id_fkey"
            columns: ["weight_balance_id"]
            isOneToOne: false
            referencedRelation: "weight_balances"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_balances: {
        Row: {
          aircraft_id: string | null
          balance_status: string | null
          basic_empty_weight: number | null
          basic_empty_weight_arm: number | null
          basic_empty_weight_moment: number | null
          created_at: string
          created_by: string
          fi_and_student_arm: number | null
          fi_and_student_moment: number | null
          fi_and_student_weight: number | null
          id: string
          max_baggage_weight: number
          maximum_takeoff_weight: number | null
          prepared_by_id: string
          prepared_by_name: string
          prepared_by_signature: string | null
          total_cg: number | null
          total_moment: number | null
          total_weight: number | null
          updated_at: string
          usable_fuel_arm: number | null
          usable_fuel_moment: number | null
          usable_fuel_weight: number | null
          verified_by_id: string | null
          verified_by_name: string | null
          verified_by_signature: string | null
          weight_status: string | null
        }
        Insert: {
          aircraft_id?: string | null
          balance_status?: string | null
          basic_empty_weight?: number | null
          basic_empty_weight_arm?: number | null
          basic_empty_weight_moment?: number | null
          created_at?: string
          created_by: string
          fi_and_student_arm?: number | null
          fi_and_student_moment?: number | null
          fi_and_student_weight?: number | null
          id?: string
          max_baggage_weight?: number
          maximum_takeoff_weight?: number | null
          prepared_by_id: string
          prepared_by_name: string
          prepared_by_signature?: string | null
          total_cg?: number | null
          total_moment?: number | null
          total_weight?: number | null
          updated_at?: string
          usable_fuel_arm?: number | null
          usable_fuel_moment?: number | null
          usable_fuel_weight?: number | null
          verified_by_id?: string | null
          verified_by_name?: string | null
          verified_by_signature?: string | null
          weight_status?: string | null
        }
        Update: {
          aircraft_id?: string | null
          balance_status?: string | null
          basic_empty_weight?: number | null
          basic_empty_weight_arm?: number | null
          basic_empty_weight_moment?: number | null
          created_at?: string
          created_by?: string
          fi_and_student_arm?: number | null
          fi_and_student_moment?: number | null
          fi_and_student_weight?: number | null
          id?: string
          max_baggage_weight?: number
          maximum_takeoff_weight?: number | null
          prepared_by_id?: string
          prepared_by_name?: string
          prepared_by_signature?: string | null
          total_cg?: number | null
          total_moment?: number | null
          total_weight?: number | null
          updated_at?: string
          usable_fuel_arm?: number | null
          usable_fuel_moment?: number | null
          usable_fuel_weight?: number | null
          verified_by_id?: string | null
          verified_by_name?: string | null
          verified_by_signature?: string | null
          weight_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weight_balances_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircrafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_balances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_balances_prepared_by_id_fkey"
            columns: ["prepared_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_balances_verified_by_id_fkey"
            columns: ["verified_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_flight_status: {
        Args: {
          p_include_on_ground?: boolean
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          aircraft_identification: string
          aircraft_status: Database["public"]["Enums"]["aircraft_status"]
          commenced_at: string
          cruising_level: string
          cruising_speed: string
          departure_aerodrome: string
          departure_time_raw: string
          destination_aerodrome: string
          id: string
          journey_id: string
          journey_status: Database["public"]["Enums"]["journey_status"]
          model: string
          photo_path: string
          pilot_in_command_name: string
          terminated_at: string
          total_count: number
          total_eet: string
          trainee_name: string
          type_key: string
          type_name: string
        }[]
      }
      get_flight_plan_aircraft_options: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_type_key?: string
        }
        Returns: {
          aircraft_identification: string
          color_markings: string
          has_active_flight: boolean
          has_type_specs: boolean
          has_wb_config: boolean
          id: string
          is_available: boolean
          model: string
          photo_path: string
          total_count: number
          type_key: string
          type_name: string
        }[]
      }
      get_todays_flights: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_requested_by?: string
          p_search?: string
        }
        Returns: {
          aircraft_identification: string
          commenced_at: string
          departure_aerodrome: string
          departure_time_raw: string
          destination_aerodrome: string
          flight_plan_id: string
          flight_request_id: string
          journey_id: string
          journey_status: Database["public"]["Enums"]["journey_status"]
          pilot_in_command_name: string
          requested_by: string
          total_count: number
          trainee_name: string
        }[]
      }
    }
    Enums: {
      admin_department:
        | "flight_operations_personnel"
        | "air_traffic_controller"
        | "safety_personnel"
      aircraft_status: "active" | "maintenance" | "grounded" | "retired"
      app_role: "student" | "instructor" | "admin" | "superadmin"
      approval_status: "pending" | "approved" | "rejected"
      journey_status:
        | "scheduled"
        | "active"
        | "arrived"
        | "standby"
        | "cancelled"
      license_status: "active" | "expired"
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
      admin_department: [
        "flight_operations_personnel",
        "air_traffic_controller",
        "safety_personnel",
      ],
      aircraft_status: ["active", "maintenance", "grounded", "retired"],
      app_role: ["student", "instructor", "admin", "superadmin"],
      approval_status: ["pending", "approved", "rejected"],
      journey_status: [
        "scheduled",
        "active",
        "arrived",
        "standby",
        "cancelled",
      ],
      license_status: ["active", "expired"],
    },
  },
} as const
