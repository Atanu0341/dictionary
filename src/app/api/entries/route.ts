import axios from 'axios';
import Redis from 'ioredis';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

// PostgreSQL Client Setup
const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Redis Client 
const redis = new Redis(process.env.REDIS_URL!, {
  tls: {}, // Enable TLS for Upstash Redis
});

// Connect to PostgreSQL and Redis
client.connect();

// Handle GET request for searching a word
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Word query parameter is required' }, { status: 400 });
  }

  try {
    // Check if the word exists in Redis cache
    const cachedResult = await redis.get(word);

    if (cachedResult) {
      // If found in cache, return it
      console.log('Returning from Redis cache');
      return NextResponse.json(JSON.parse(cachedResult));
    }

    // Otherwise, check if the word exists in the PostgreSQL database
    const result = await client.query('SELECT * FROM entries WHERE word = $1', [word]);
    if (result.rows.length > 0) {
      // If found in the database, store it in Redis cache
      await redis.set(word, JSON.stringify(result.rows[0]), 'EX', 3600); // Cache for 1 hour
      return NextResponse.json(result.rows[0]);
    }

    // Fetch from external API if not found in the database
    const apiResponse = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    // console.log(apiResponse.data);
    if (apiResponse.data && apiResponse.data[0]) {
      const { word: fetchedWord, meanings } = apiResponse.data[0];
      const partOfSpeech = meanings[0].partOfSpeech || 'unknown';
      const definition = meanings[0].definitions[0].definition || 'No definition available';

      // Insert the fetched word into the database
      await client.query('INSERT INTO entries (word, definition, part_of_speech) VALUES ($1, $2, $3)', [fetchedWord, definition, partOfSpeech]);

      // Cache the result in Redis
      await redis.set(fetchedWord, JSON.stringify({ word: fetchedWord, definition, part_of_speech: partOfSpeech }), 'EX', 3600); // Cache for 1 hour

      return NextResponse.json({ word: fetchedWord, definition, part_of_speech: partOfSpeech });
    }

    return NextResponse.json({ error: 'Word not found in external API' }, { status: 404 });
  } catch (error) {
    console.error('Error running query', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// Handle POST request to insert a new word entry
export async function POST(req: Request) {
  const { word, definition, part_of_speech } = await req.json();

  if (!word || !definition || !part_of_speech) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    await client.query(
      'INSERT INTO entries (word, definition, part_of_speech) VALUES ($1, $2, $3)',
      [word, definition, part_of_speech]
    );
    return NextResponse.json({ message: 'Word added successfully' });
  } catch (error) {
    console.error('Error running query', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
