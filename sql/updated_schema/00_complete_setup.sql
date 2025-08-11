-- =====================================================
-- COMPLETE SCHEMA SETUP
-- =====================================================
-- Master file to execute all schema files in correct order
-- =====================================================

-- This file includes all the individual schema files in the correct execution order
-- Execute this file to set up the complete database schema

-- Note: This is a reference file. In practice, you should execute the individual
-- files in the order specified in the README.md file for better control and debugging.

-- Execution Order:
-- 1. 00_storage.sql
-- 2. 00_functions.sql  
-- 3. 00_triggers.sql
-- 4. 00_views.sql
-- 5. 00_initial_data.sql
-- 6. 01_profiles.sql through 25_removed_background_logs.sql

-- For production deployment, execute files individually in the specified order
-- to ensure proper setup and easier troubleshooting.

-- See README.md for complete installation instructions and file descriptions. 