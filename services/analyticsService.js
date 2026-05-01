import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize BigQuery using your Google Cloud credentials
const bigquery = new BigQuery({
  keyFilename: path.join(__dirname, '../google-key.json'),
  projectId: 'flowstate-e6622' 
});

const datasetId = 'civicsync_analytics';
const tableId = 'user_queries';

/**
 * Logs user interaction data to BigQuery for election analytics
 * This is a NAMED EXPORT to match your server.js import
 */
export async function logToBigQuery(userQuery, category, responseSource) {
  const rows = [{
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    query_text: userQuery,
    category: category || 'General',
    response_source: responseSource || 'Gemini AI'
  }];

  try {
    // Stream data to BigQuery
    await bigquery.dataset(datasetId).table(tableId).insert(rows);
    console.log('📊 Analytics: Data streamed to BigQuery.');
  } catch (error) {
    if (error.code === 404) {
      console.error('❌ BigQuery Error: Dataset or Table not found. Ensure "civicsync_analytics.user_queries" exists.');
    } else {
      console.error('❌ BigQuery Insert Error:', error.message);
      // Detailed error logging for debugging in production[cite: 8]
      if (error.errors) {
        console.error('Detailed Errors:', JSON.stringify(error.errors));
      }
    }
  }
}