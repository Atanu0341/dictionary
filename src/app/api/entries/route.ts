import axios from 'axios';
import Redis from 'ioredis';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prisma Client Setup
const prisma = new PrismaClient();

// Redis Client Setup
const redis = new Redis(process.env.REDIS_URL!, {
  tls: {}, // Enable TLS for Upstash Redis
});

// Handle GET request for searching a word
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get('word')?.toLowerCase(); // Normalize the word to lowercase

  if (!word) {
    return NextResponse.json({ error: 'Word query parameter is required' }, { status: 400 });
  }

  try {
    // Track word usage in Redis
    const usageKey = `word_usage:${word}`; // Use normalized word for the key
    const usageCount = await redis.incr(usageKey);

    // Define cache expiry based on usage frequency
    let cacheExpiry = 86400; // Default to 1 day (86400 seconds)
    if (usageCount > 10) {
      cacheExpiry = 2592000; // Set cache expiry to 30 days (2592000 seconds) for high-traffic words
    } else if (usageCount > 5) {
      cacheExpiry = 604800; // Set cache expiry to 7 days (604800 seconds) for medium-traffic words
    }

    // Check if the word exists in Redis cache
    const cachedResult = await redis.get(word); // Use normalized word for Redis operations
    if (cachedResult) {
      console.log('Returning from Redis cache:', cachedResult);
      const parsedResult = JSON.parse(cachedResult);
      return NextResponse.json(parsedResult);
    }

    // Otherwise, check if the word exists in the PostgreSQL database using Prisma
    const result = await prisma.entry.findUnique({
      where: { word: word },
    });

    if (result) {
      console.log('Returning from database:', result);
      await redis.set(word, JSON.stringify(result), 'EX', cacheExpiry);
      return NextResponse.json(result);
    }

    // Fetch from external API if not found in the database
    const apiResponse = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    console.log('API response data:', apiResponse.data);

    if (apiResponse.data && apiResponse.data.length > 0) {
      const { word: fetchedWord, meanings } = apiResponse.data[0];
      const partOfSpeech = meanings[0]?.partOfSpeech || 'unknown';
      const definition = meanings[0]?.definitions[0]?.definition || 'No definition available';

      // Check if the word already exists in the database before inserting
      const existingWord = await prisma.entry.findUnique({
        where: { word: fetchedWord },
      });

      if (existingWord) {
        console.log('Word exists in the database, fetching:', existingWord);
        // Cache the existing word with all the necessary fields
        await redis.set(fetchedWord, JSON.stringify(existingWord), 'EX', cacheExpiry);
        return NextResponse.json(existingWord);
      }

      // Insert the fetched word into the database using Prisma
      const newWord = await prisma.entry.create({
        data: {
          word: fetchedWord,
          definition: definition,
          partOfSpeech: partOfSpeech,
        },
      });

      // Cache the result in Redis with the correct field names
      await redis.set(fetchedWord, JSON.stringify({
        word: fetchedWord,
        definition: definition,
        partOfSpeech: partOfSpeech, // Store as camelCase
      }), 'EX', cacheExpiry);

      console.log('Returning newly inserted word:', newWord);
      return NextResponse.json({
        word: newWord.word,
        definition: newWord.definition,
        partOfSpeech: newWord.partOfSpeech,
      });
    }

    return NextResponse.json({ error: 'Word not found in external API' }, { status: 404 });
  } catch (error) {
    console.error('Error running query:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
