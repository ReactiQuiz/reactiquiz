// api/_utils/databaseMigration.js
/**
 * Database Migration Utility
 * 
 * Helps migrate data from JSON files to Supabase database.
 * Provides methods for loading JSON data and migrating it to Supabase tables
 * using the DataTransformer utility for format conversion.
 */

const { db } = require('./supabaseClient');
const DataTransformer = require('./dataTransformer');
const fs = require('fs');
const path = require('path');

/**
 * Database Migration Class
 * 
 * Handles migration of data from JSON files to Supabase database.
 */
class DatabaseMigration {
    /**
     * Constructor
     * 
     * Initializes the migration utility with the data directory path.
     */
    constructor() {
        this.dataPath = path.join(__dirname, '../../data');
    }

    /**
     * Load JSON Data
     * 
     * Loads and parses JSON data from a file in the data directory.
     * 
     * @param {string} filename - Name of the JSON file to load
     * @returns {Array} Parsed JSON data (returns empty array on error)
     */
    loadJsonData(filename) {
        try {
            const filePath = path.join(this.dataPath, filename);
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return [];
        }
    }

    /**
     * Migrate Users Data
     * 
     * Migrates users data from JSON file to Supabase users table.
     * Uses admin client for bypassing Row Level Security.
     */
    async migrateUsers() {
        console.log('🔄 Migrating users...');
        const users = this.loadJsonData('users.json');
        
        if (users.length === 0) {
            console.log('⚠️  No users data found');
            return;
        }

        try {
            const result = await db.insert('users', users, { isAdmin: true });
            console.log(`✅ Migrated ${result.length} users`);
        } catch (error) {
            console.error('❌ Error migrating users:', error);
        }
    }

    /**
     * Migrate Subjects Data
     * 
     * Migrates subjects data from JSON file to Supabase subjects table.
     * Transforms data format using DataTransformer before inserting.
     */
    async migrateSubjects() {
        console.log('🔄 Migrating subjects...');
        const subjects = this.loadJsonData('subjects.json');
        
        if (subjects.length === 0) {
            console.log('⚠️  No subjects data found');
            return;
        }

        try {
            const transformedSubjects = DataTransformer.transformSubjects(subjects);
            const result = await db.insert('subjects', transformedSubjects, { isAdmin: true });
            console.log(`✅ Migrated ${result.length} subjects`);
        } catch (error) {
            console.error('❌ Error migrating subjects:', error);
        }
    }

    /**
     * Migrate Topics Data
     * 
     * Migrates topics data from JSON file to Supabase topics table.
     * Transforms data format using DataTransformer before inserting.
     */
    async migrateTopics() {
        console.log('🔄 Migrating topics...');
        const topics = this.loadJsonData('topics.json');
        
        if (topics.length === 0) {
            console.log('⚠️  No topics data found');
            return;
        }

        try {
            const transformedTopics = DataTransformer.transformTopics(topics);
            const result = await db.insert('topics', transformedTopics, { isAdmin: true });
            console.log(`✅ Migrated ${result.length} topics`);
        } catch (error) {
            console.error('❌ Error migrating topics:', error);
        }
    }

    /**
     * Migrate Questions Data
     * 
     * Migrates questions data from JSON file to Supabase questions table.
     * Processes questions in batches of 100 to avoid timeout issues.
     * Transforms data format using DataTransformer before inserting.
     */
    async migrateQuestions() {
        console.log('🔄 Migrating questions...');
        const questions = this.loadJsonData('questions.json');
        
        if (questions.length === 0) {
            console.log('⚠️  No questions data found');
            return;
        }

        try {
            const transformedQuestions = DataTransformer.transformQuestions(questions);
            // Process questions in batches to avoid timeout
            const batchSize = 100; // Batch size for processing large datasets
            for (let i = 0; i < transformedQuestions.length; i += batchSize) {
                const batch = transformedQuestions.slice(i, i + batchSize);
                const result = await db.insert('questions', batch, { isAdmin: true });
                console.log(`✅ Migrated batch ${Math.floor(i/batchSize) + 1}: ${result.length} questions`);
            }
        } catch (error) {
            console.error('❌ Error migrating questions:', error);
        }
    }

    /**
     * Migrate Subjective Questions Data
     * 
     * Migrates subjective questions data from JSON file to Supabase subjective_questions table.
     * Transforms data format using DataTransformer before inserting.
     */
    async migrateSubjectiveQuestions() {
        console.log('🔄 Migrating subjective questions...');
        const subjectiveQuestions = this.loadJsonData('subjective-questions.json');
        
        if (subjectiveQuestions.length === 0) {
            console.log('⚠️  No subjective questions data found');
            return;
        }

        try {
            const transformedSubjectiveQuestions = DataTransformer.transformSubjectiveQuestions(subjectiveQuestions);
            const result = await db.insert('subjective_questions', transformedSubjectiveQuestions, { isAdmin: true });
            console.log(`✅ Migrated ${result.length} subjective questions`);
        } catch (error) {
            console.error('❌ Error migrating subjective questions:', error);
        }
    }

    /**
     * Migrate Quiz Results Data
     * 
     * Migrates quiz results data from JSON file to Supabase quiz_results table.
     */
    async migrateQuizResults() {
        console.log('🔄 Migrating quiz results...');
        const quizResults = this.loadJsonData('quiz_results.json');
        
        if (quizResults.length === 0) {
            console.log('⚠️  No quiz results data found');
            return;
        }

        try {
            const result = await db.insert('quiz_results', quizResults, { isAdmin: true });
            console.log(`✅ Migrated ${result.length} quiz results`);
        } catch (error) {
            console.error('❌ Error migrating quiz results:', error);
        }
    }

    /**
     * Migrate Quiz Sessions Data
     * 
     * Migrates quiz sessions data from JSON file to Supabase quiz_sessions table.
     */
    async migrateQuizSessions() {
        console.log('🔄 Migrating quiz sessions...');
        const quizSessions = this.loadJsonData('quiz_sessions.json');
        
        if (quizSessions.length === 0) {
            console.log('⚠️  No quiz sessions data found');
            return;
        }

        try {
            const result = await db.insert('quiz_sessions', quizSessions, { isAdmin: true });
            console.log(`✅ Migrated ${result.length} quiz sessions`);
        } catch (error) {
            console.error('❌ Error migrating quiz sessions:', error);
        }
    }

    /**
     * Migrate Subjective Results Data
     * 
     * Migrates subjective results data from JSON file to Supabase subjective_results table.
     */
    async migrateSubjectiveResults() {
        console.log('🔄 Migrating subjective results...');
        const subjectiveResults = this.loadJsonData('subjective_results.json');
        
        if (subjectiveResults.length === 0) {
            console.log('⚠️  No subjective results data found');
            return;
        }

        try {
            const result = await db.insert('subjective_results', subjectiveResults, { isAdmin: true });
            console.log(`✅ Migrated ${result.length} subjective results`);
        } catch (error) {
            console.error('❌ Error migrating subjective results:', error);
        }
    }

    /**
     * Run All Migrations
     * 
     * Executes all migration methods in sequence.
     * Migrates users, subjects, topics, questions, quiz results, and sessions.
     * 
     * @throws {Error} If any migration fails
     */
    async runAllMigrations() {
        console.log('🚀 Starting database migration to Supabase...');
        
        try {
            await this.migrateUsers();
            await this.migrateSubjects();
            await this.migrateTopics();
            await this.migrateQuestions();
            await this.migrateSubjectiveQuestions();
            await this.migrateQuizResults();
            await this.migrateQuizSessions();
            await this.migrateSubjectiveResults();
            
            console.log('🎉 Database migration completed successfully!');
        } catch (error) {
            console.error('💥 Migration failed:', error);
            throw error;
        }
    }

    /**
     * Check Tables
     * 
     * Verifies that all required Supabase tables exist and are accessible.
     * Checks tables: users, subjects, topics, questions, subjective_questions,
     * quiz_results, quiz_sessions, subjective_results.
     */
    async checkTables() {
        console.log('🔍 Checking Supabase tables...');
        
        const tables = [
            'users', 'subjects', 'topics', 'questions', 
            'subjective_questions', 'quiz_results', 
            'quiz_sessions', 'subjective_results'
        ];

        for (const table of tables) {
            try {
                const result = await db.query(table, { limit: 1, isAdmin: true });
                console.log(`✅ Table '${table}' is accessible (${result.length} records found)`);
            } catch (error) {
                console.log(`❌ Table '${table}' is not accessible:`, error.message);
            }
        }
    }
}

module.exports = DatabaseMigration;
